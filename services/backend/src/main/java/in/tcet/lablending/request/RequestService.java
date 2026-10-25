package in.tcet.lablending.request;

import in.tcet.lablending.audit.AuditLogService;
import in.tcet.lablending.equipment.Equipment;
import in.tcet.lablending.equipment.EquipmentCondition;
import in.tcet.lablending.equipment.EquipmentRepository;
import in.tcet.lablending.equipment.MaintenanceStatus;
import in.tcet.lablending.exception.BadRequestException;
import in.tcet.lablending.exception.ResourceNotFoundException;
import in.tcet.lablending.rental.Rental;
import in.tcet.lablending.rental.RentalRepository;
import in.tcet.lablending.rental.RentalStatus;
import in.tcet.lablending.request.dto.CreateRentalRequest;
import in.tcet.lablending.request.dto.RentalRequestDTO;
import in.tcet.lablending.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RentalRequestRepository requestRepository;
    private final EquipmentRepository equipmentRepository;
    private final RentalRepository rentalRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public RentalRequestDTO createRequest(CreateRentalRequest request, User requester) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BadRequestException("Requested start time must be before end time");
        }

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        if (equipment.getMaintenanceStatus() != MaintenanceStatus.OPERATIONAL ||
                equipment.getCondition() == EquipmentCondition.DAMAGED) {
            throw new BadRequestException("Equipment is currently under maintenance or damaged and cannot be requested");
        }

        if (equipment.getAvailableQuantity() < request.getRequestedQuantity()) {
            throw new BadRequestException(String.format("Requested quantity (%d) exceeds currently available stock (%d)",
                    request.getRequestedQuantity(), equipment.getAvailableQuantity()));
        }

        RentalRequest entity = RentalRequest.builder()
                .requester(requester)
                .equipment(equipment)
                .asset(null)
                .requestedQuantity(request.getRequestedQuantity())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose().trim())
                .status(RequestStatus.PENDING)
                .build();

        RentalRequest saved = requestRepository.save(entity);

        auditLogService.log(
                requester.getId(),
                requester.getEmail(),
                "CREATE_REQUEST",
                "RENTAL_REQUEST",
                String.valueOf(saved.getId()),
                "Created equipment lending request for " + equipment.getName() + " (qty: " + request.getRequestedQuantity() + ")",
                null
        );

        return mapToDTO(saved);
    }

    @Transactional
    public RentalRequestDTO approveRequest(Long requestId, User admin) {
        RentalRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be approved. Current status: " + request.getStatus());
        }

        // Concurrency protection: lock equipment row for pessimistic write
        Equipment equipment = equipmentRepository.findByIdForUpdate(request.getEquipment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        if (equipment.getAvailableQuantity() < request.getRequestedQuantity()) {
            throw new BadRequestException(String.format("Insufficient stock to approve request. Required: %d, Available: %d",
                    request.getRequestedQuantity(), equipment.getAvailableQuantity()));
        }

        // Atomically decrement stock
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() - request.getRequestedQuantity());
        equipmentRepository.save(equipment);

        request.setStatus(RequestStatus.APPROVED);
        request.setDecisionBy(admin);
        request.setDecisionTime(Instant.now());
        RentalRequest savedRequest = requestRepository.save(request);

        // Create active rental record
        Rental rental = Rental.builder()
                .request(savedRequest)
                .borrower(savedRequest.getRequester())
                .equipment(equipment)
                .quantityIssued(savedRequest.getRequestedQuantity())
                .issuedBy(admin)
                .issuedAt(Instant.now())
                .expectedReturnAt(savedRequest.getEndTime())
                .status(RentalStatus.ACTIVE)
                .build();
        rentalRepository.save(rental);

        auditLogService.log(
                admin.getId(),
                admin.getEmail(),
                "APPROVE_REQUEST",
                "RENTAL_REQUEST",
                String.valueOf(savedRequest.getId()),
                "Approved request and generated rental for " + equipment.getName(),
                null
        );

        return mapToDTO(savedRequest);
    }

    @Transactional
    public RentalRequestDTO rejectRequest(Long requestId, String reason, User admin) {
        RentalRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be rejected. Current status: " + request.getStatus());
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setDecisionBy(admin);
        request.setDecisionTime(Instant.now());
        request.setRejectionReason(reason != null ? reason.trim() : "Rejected by laboratory administrator");
        RentalRequest saved = requestRepository.save(request);

        auditLogService.log(
                admin.getId(),
                admin.getEmail(),
                "REJECT_REQUEST",
                "RENTAL_REQUEST",
                String.valueOf(saved.getId()),
                "Rejected request: " + saved.getRejectionReason(),
                null
        );

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<RentalRequestDTO> getUserRequests(User requester) {
        return requestRepository.findByRequesterIdOrderByCreatedAtDesc(requester.getId())
                .stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<RentalRequestDTO> getAllRequests(RequestStatus status) {
        if (status != null) {
            return requestRepository.findByStatusOrderByCreatedAtDesc(status)
                    .stream().map(this::mapToDTO).toList();
        }
        return requestRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDTO).toList();
    }

    public RentalRequestDTO mapToDTO(RentalRequest r) {
        return RentalRequestDTO.builder()
                .id(r.getId())
                .requesterId(r.getRequester().getId())
                .requesterName(r.getRequester().getFullName())
                .requesterEmail(r.getRequester().getEmail())
                .equipmentId(r.getEquipment().getId())
                .equipmentName(r.getEquipment().getName())
                .equipmentModel(r.getEquipment().getModelNumber())
                .roomId(r.getEquipment().getRoom().getId())
                .roomNumber(r.getEquipment().getRoom().getRoomNumber())
                .departmentCode(r.getEquipment().getDepartment().getCode())
                .assetId(r.getAsset() != null ? r.getAsset().getId() : null)
                .requestedQuantity(r.getRequestedQuantity())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .purpose(r.getPurpose())
                .status(r.getStatus())
                .decisionByName(r.getDecisionBy() != null ? r.getDecisionBy().getFullName() : null)
                .decisionTime(r.getDecisionTime())
                .rejectionReason(r.getRejectionReason())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
