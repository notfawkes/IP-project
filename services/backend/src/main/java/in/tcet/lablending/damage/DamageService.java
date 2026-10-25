package in.tcet.lablending.damage;

import in.tcet.lablending.audit.AuditLogService;
import in.tcet.lablending.damage.dto.CreateDamageReportRequest;
import in.tcet.lablending.damage.dto.DamageReportDTO;
import in.tcet.lablending.equipment.Equipment;
import in.tcet.lablending.equipment.EquipmentCondition;
import in.tcet.lablending.equipment.EquipmentRepository;
import in.tcet.lablending.equipment.MaintenanceStatus;
import in.tcet.lablending.exception.ResourceNotFoundException;
import in.tcet.lablending.rental.Rental;
import in.tcet.lablending.rental.RentalRepository;
import in.tcet.lablending.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DamageService {

    private final DamageReportRepository damageReportRepository;
    private final EquipmentRepository equipmentRepository;
    private final RentalRepository rentalRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public DamageReportDTO createReport(CreateDamageReportRequest request, User reporter) {
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        Rental rental = null;
        if (request.getRentalId() != null) {
            rental = rentalRepository.findById(request.getRentalId()).orElse(null);
        }

        DamageReport report = DamageReport.builder()
                .equipment(equipment)
                .rental(rental)
                .reporter(reporter)
                .category(request.getCategory())
                .description(request.getDescription().trim())
                .photoUrl(request.getPhotoUrl())
                .status(DamageStatus.OPEN)
                .build();

        // Update equipment condition
        equipment.setCondition(EquipmentCondition.DAMAGED);
        equipment.setMaintenanceStatus(MaintenanceStatus.UNDER_MAINTENANCE);
        equipmentRepository.save(equipment);

        DamageReport saved = damageReportRepository.save(report);

        auditLogService.log(
                reporter.getId(),
                reporter.getEmail(),
                "REPORT_DAMAGE",
                "DAMAGE_REPORT",
                String.valueOf(saved.getId()),
                "Reported damage for " + equipment.getName() + " category: " + request.getCategory(),
                null
        );

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<DamageReportDTO> getAllReports() {
        return damageReportRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<DamageReportDTO> getUserReports(User reporter) {
        return damageReportRepository.findByReporterIdOrderByCreatedAtDesc(reporter.getId())
                .stream().map(this::mapToDTO).toList();
    }

    @Transactional
    public DamageReportDTO updateReportStatus(Long reportId, DamageStatus status, User admin) {
        DamageReport report = damageReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Damage report not found with ID: " + reportId));

        report.setStatus(status);
        if (status == DamageStatus.RESOLVED) {
            report.setResolvedAt(Instant.now());
            // If resolved, return equipment to OPERATIONAL
            Equipment eq = report.getEquipment();
            eq.setCondition(EquipmentCondition.GOOD);
            eq.setMaintenanceStatus(MaintenanceStatus.OPERATIONAL);
            equipmentRepository.save(eq);
        }

        DamageReport saved = damageReportRepository.save(report);

        auditLogService.log(
                admin.getId(),
                admin.getEmail(),
                "UPDATE_DAMAGE_STATUS",
                "DAMAGE_REPORT",
                String.valueOf(saved.getId()),
                "Updated status to " + status,
                null
        );

        return mapToDTO(saved);
    }

    public DamageReportDTO mapToDTO(DamageReport r) {
        return DamageReportDTO.builder()
                .id(r.getId())
                .equipmentId(r.getEquipment().getId())
                .equipmentName(r.getEquipment().getName())
                .modelNumber(r.getEquipment().getModelNumber())
                .roomId(r.getEquipment().getRoom().getId())
                .roomNumber(r.getEquipment().getRoom().getRoomNumber())
                .assetId(r.getAsset() != null ? r.getAsset().getId() : null)
                .rentalId(r.getRental() != null ? r.getRental().getId() : null)
                .reporterId(r.getReporter().getId())
                .reporterName(r.getReporter().getFullName())
                .reporterEmail(r.getReporter().getEmail())
                .category(r.getCategory())
                .description(r.getDescription())
                .photoUrl(r.getPhotoUrl())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .resolvedAt(r.getResolvedAt())
                .build();
    }
}
