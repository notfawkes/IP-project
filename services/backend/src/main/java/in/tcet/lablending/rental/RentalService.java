package in.tcet.lablending.rental;

import in.tcet.lablending.audit.AuditLogService;
import in.tcet.lablending.damage.DamageCategory;
import in.tcet.lablending.damage.DamageReport;
import in.tcet.lablending.damage.DamageReportRepository;
import in.tcet.lablending.damage.DamageStatus;
import in.tcet.lablending.equipment.Equipment;
import in.tcet.lablending.equipment.EquipmentCondition;
import in.tcet.lablending.equipment.EquipmentRepository;
import in.tcet.lablending.equipment.MaintenanceStatus;
import in.tcet.lablending.exception.BadRequestException;
import in.tcet.lablending.exception.ResourceNotFoundException;
import in.tcet.lablending.rental.dto.RecordReturnRequest;
import in.tcet.lablending.rental.dto.RentalDTO;
import in.tcet.lablending.rental.dto.ReturnRecordDTO;
import in.tcet.lablending.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ReturnRecordRepository returnRecordRepository;
    private final EquipmentRepository equipmentRepository;
    private final DamageReportRepository damageReportRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<RentalDTO> getUserRentals(User borrower) {
        return rentalRepository.findByBorrowerIdOrderByIssuedAtDesc(borrower.getId())
                .stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<RentalDTO> getAllRentals(RentalStatus status) {
        if (status != null) {
            return rentalRepository.findByStatusOrderByIssuedAtDesc(status)
                    .stream().map(this::mapToDTO).toList();
        }
        return rentalRepository.findAllByOrderByIssuedAtDesc()
                .stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<RentalDTO> getOverdueRentals() {
        return rentalRepository.findOverdueRentals(Instant.now())
                .stream().map(this::mapToDTO).toList();
    }

    @Transactional
    public RentalDTO issueRental(Long rentalId, User admin) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with ID: " + rentalId));

        rental.setStatus(RentalStatus.ACTIVE);
        rental.setIssuedBy(admin);
        Rental saved = rentalRepository.save(rental);

        auditLogService.log(
                admin.getId(),
                admin.getEmail(),
                "ISSUE_RENTAL",
                "RENTAL",
                String.valueOf(saved.getId()),
                "Physical equipment handover completed for " + saved.getEquipment().getName(),
                null
        );

        return mapToDTO(saved);
    }

    @Transactional
    public ReturnRecordDTO recordReturn(Long rentalId, RecordReturnRequest request, User user) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with ID: " + rentalId));

        if (rental.getStatus() == RentalStatus.RETURNED) {
            throw new BadRequestException("This rental has already been marked as returned.");
        }

        // Concurrency protection: lock equipment row
        Equipment equipment = equipmentRepository.findByIdForUpdate(rental.getEquipment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        rental.setStatus(RentalStatus.RETURNED);
        rental.setActualReturnAt(Instant.now());
        rentalRepository.save(rental);

        ReturnRecord returnRecord = ReturnRecord.builder()
                .rental(rental)
                .recordedBy(user)
                .returnedAt(Instant.now())
                .returnCondition(request.getReturnCondition())
                .notes(request.getNotes())
                .build();

        ReturnRecord savedReturn = returnRecordRepository.save(returnRecord);

        if (request.getReturnCondition() == ReturnCondition.WORKING) {
            // Re-increment available stock safely
            equipment.setAvailableQuantity(Math.min(equipment.getTotalQuantity(),
                    equipment.getAvailableQuantity() + rental.getQuantityIssued()));
            equipmentRepository.save(equipment);
        } else {
            // Equipment is damaged or needs maintenance
            equipment.setCondition(EquipmentCondition.DAMAGED);
            equipment.setMaintenanceStatus(MaintenanceStatus.UNDER_MAINTENANCE);
            equipmentRepository.save(equipment);

            DamageReport damageReport = DamageReport.builder()
                    .equipment(equipment)
                    .asset(rental.getAsset())
                    .rental(rental)
                    .reporter(user)
                    .category(request.getReturnCondition() == ReturnCondition.DAMAGED ? DamageCategory.PHYSICAL : DamageCategory.MALFUNCTION)
                    .description("Damage reported upon return: " + (request.getNotes() != null ? request.getNotes() : "Inspection required"))
                    .status(DamageStatus.OPEN)
                    .build();
            damageReportRepository.save(damageReport);
        }

        auditLogService.log(
                user.getId(),
                user.getEmail(),
                "RECORD_RETURN",
                "RETURN",
                String.valueOf(savedReturn.getId()),
                "Recorded return with condition " + request.getReturnCondition() + " for " + equipment.getName(),
                null
        );

        return mapReturnToDTO(savedReturn);
    }

    @Transactional(readOnly = true)
    public List<ReturnRecordDTO> getUserReturns(User borrower) {
        return returnRecordRepository.findByRentalBorrowerIdOrderByReturnedAtDesc(borrower.getId())
                .stream().map(this::mapReturnToDTO).toList();
    }

    public RentalDTO mapToDTO(Rental rental) {
        boolean isOverdue = rental.getStatus() == RentalStatus.ACTIVE &&
                rental.getExpectedReturnAt().isBefore(Instant.now());

        return RentalDTO.builder()
                .id(rental.getId())
                .requestId(rental.getRequest().getId())
                .borrowerId(rental.getBorrower().getId())
                .borrowerName(rental.getBorrower().getFullName())
                .borrowerEmail(rental.getBorrower().getEmail())
                .equipmentId(rental.getEquipment().getId())
                .equipmentName(rental.getEquipment().getName())
                .equipmentModel(rental.getEquipment().getModelNumber())
                .roomId(rental.getEquipment().getRoom().getId())
                .roomNumber(rental.getEquipment().getRoom().getRoomNumber())
                .departmentCode(rental.getEquipment().getDepartment().getCode())
                .assetId(rental.getAsset() != null ? rental.getAsset().getId() : null)
                .quantityIssued(rental.getQuantityIssued())
                .issuedByName(rental.getIssuedBy() != null ? rental.getIssuedBy().getFullName() : null)
                .issuedAt(rental.getIssuedAt())
                .expectedReturnAt(rental.getExpectedReturnAt())
                .actualReturnAt(rental.getActualReturnAt())
                .status(rental.getStatus())
                .isOverdue(isOverdue)
                .build();
    }

    public ReturnRecordDTO mapReturnToDTO(ReturnRecord r) {
        return ReturnRecordDTO.builder()
                .id(r.getId())
                .rentalId(r.getRental().getId())
                .equipmentName(r.getRental().getEquipment().getName())
                .borrowerName(r.getRental().getBorrower().getFullName())
                .recordedByName(r.getRecordedBy().getFullName())
                .returnedAt(r.getReturnedAt())
                .returnCondition(r.getReturnCondition())
                .notes(r.getNotes())
                .build();
    }
}
