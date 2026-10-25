package in.tcet.lablending.equipment;

import in.tcet.lablending.audit.AuditLogService;
import in.tcet.lablending.department.Department;
import in.tcet.lablending.department.DepartmentRepository;
import in.tcet.lablending.equipment.dto.CreateEquipmentRequest;
import in.tcet.lablending.equipment.dto.EquipmentAvailabilityDTO;
import in.tcet.lablending.equipment.dto.EquipmentDTO;
import in.tcet.lablending.exception.BadRequestException;
import in.tcet.lablending.exception.ResourceNotFoundException;
import in.tcet.lablending.rental.Rental;
import in.tcet.lablending.rental.RentalRepository;
import in.tcet.lablending.rental.RentalStatus;
import in.tcet.lablending.room.Room;
import in.tcet.lablending.room.RoomRepository;
import in.tcet.lablending.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final DepartmentRepository departmentRepository;
    private final RoomRepository roomRepository;
    private final RentalRepository rentalRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Map<String, List<EquipmentDTO>> getKanbanByRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        List<EquipmentDTO> working = equipmentRepository.findWorkingByRoomId(roomId)
                .stream().map(this::mapToDTO).toList();

        List<EquipmentDTO> rentedOut = equipmentRepository.findRentedByRoomId(roomId)
                .stream().map(this::mapToDTO).toList();

        List<EquipmentDTO> notWorking = equipmentRepository.findNotWorkingByRoomId(roomId)
                .stream().map(this::mapToDTO).toList();

        Map<String, List<EquipmentDTO>> kanban = new HashMap<>();
        kanban.put("working", working);
        kanban.put("rentedOut", rentedOut);
        kanban.put("notWorking", notWorking);
        return kanban;
    }

    @Transactional(readOnly = true)
    public List<EquipmentDTO> getEquipmentByRoom(Long roomId) {
        return equipmentRepository.findByRoomIdOrderByNameAsc(roomId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public EquipmentDTO getEquipmentById(Long equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + equipmentId));
        return mapToDTO(equipment);
    }

    @Transactional(readOnly = true)
    public EquipmentAvailabilityDTO getAvailability(Long equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + equipmentId));

        int total = equipment.getTotalQuantity();
        int available = equipment.getAvailableQuantity();
        int rented = Math.max(0, total - available);
        boolean isOp = equipment.getMaintenanceStatus() == MaintenanceStatus.OPERATIONAL &&
                equipment.getCondition() != EquipmentCondition.DAMAGED;

        return EquipmentAvailabilityDTO.builder()
                .equipmentId(equipment.getId())
                .equipmentName(equipment.getName())
                .totalQuantity(total)
                .availableQuantity(available)
                .rentedQuantity(rented)
                .maintenanceQuantity(isOp ? 0 : total)
                .isAvailableForRequest(isOp && available > 0)
                .build();
    }

    @Transactional
    public EquipmentDTO createEquipment(Long roomId, CreateEquipmentRequest request, User admin) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        int qty = request.getTotalQuantity() != null ? request.getTotalQuantity() : 1;

        Equipment equipment = Equipment.builder()
                .name(request.getName().trim())
                .category(request.getCategory().trim())
                .description(request.getDescription())
                .modelNumber(request.getModelNumber())
                .department(dept)
                .room(room)
                .trackingMode(request.getTrackingMode() != null ? request.getTrackingMode() : TrackingMode.QUANTITY)
                .totalQuantity(qty)
                .availableQuantity(qty)
                .condition(request.getCondition() != null ? request.getCondition() : EquipmentCondition.EXCELLENT)
                .maintenanceStatus(request.getMaintenanceStatus() != null ? request.getMaintenanceStatus() : MaintenanceStatus.OPERATIONAL)
                .build();

        Equipment saved = equipmentRepository.save(equipment);

        auditLogService.log(
                admin.getId(),
                admin.getEmail(),
                "CREATE_EQUIPMENT",
                "EQUIPMENT",
                String.valueOf(saved.getId()),
                "Created equipment " + saved.getName() + " in room " + room.getRoomNumber(),
                null
        );

        return mapToDTO(saved);
    }

    @Transactional
    public EquipmentDTO updateEquipment(Long equipmentId, CreateEquipmentRequest request, User admin) {
        Equipment equipment = equipmentRepository.findByIdForUpdate(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + equipmentId));

        if (request.getName() != null) equipment.setName(request.getName().trim());
        if (request.getCategory() != null) equipment.setCategory(request.getCategory().trim());
        if (request.getDescription() != null) equipment.setDescription(request.getDescription());
        if (request.getModelNumber() != null) equipment.setModelNumber(request.getModelNumber());
        if (request.getCondition() != null) equipment.setCondition(request.getCondition());
        if (request.getMaintenanceStatus() != null) equipment.setMaintenanceStatus(request.getMaintenanceStatus());

        if (request.getTotalQuantity() != null) {
            int newTotal = request.getTotalQuantity();
            int currentlyIssued = equipment.getTotalQuantity() - equipment.getAvailableQuantity();
            if (newTotal < currentlyIssued) {
                throw new BadRequestException("Cannot decrease total quantity below currently rented count of " + currentlyIssued);
            }
            int diff = newTotal - equipment.getTotalQuantity();
            equipment.setTotalQuantity(newTotal);
            equipment.setAvailableQuantity(equipment.getAvailableQuantity() + diff);
        }

        Equipment saved = equipmentRepository.save(equipment);

        auditLogService.log(
                admin.getId(),
                admin.getEmail(),
                "UPDATE_EQUIPMENT",
                "EQUIPMENT",
                String.valueOf(saved.getId()),
                "Updated equipment " + saved.getName(),
                null
        );

        return mapToDTO(saved);
    }

    public EquipmentDTO mapToDTO(Equipment eq) {
        int rented = Math.max(0, eq.getTotalQuantity() - eq.getAvailableQuantity());
        Instant returnDate = null;
        if (rented > 0) {
            List<Rental> rentals = rentalRepository.findByStatusOrderByIssuedAtDesc(RentalStatus.ACTIVE);
            for (Rental r : rentals) {
                if (r.getEquipment().getId().equals(eq.getId())) {
                    if (returnDate == null || r.getExpectedReturnAt().isBefore(returnDate)) {
                        returnDate = r.getExpectedReturnAt();
                    }
                }
            }
        }

        return EquipmentDTO.builder()
                .id(eq.getId())
                .name(eq.getName())
                .category(eq.getCategory())
                .description(eq.getDescription())
                .modelNumber(eq.getModelNumber())
                .departmentId(eq.getDepartment().getId())
                .departmentCode(eq.getDepartment().getCode())
                .roomId(eq.getRoom().getId())
                .roomNumber(eq.getRoom().getRoomNumber())
                .roomName(eq.getRoom().getRoomName())
                .trackingMode(eq.getTrackingMode())
                .totalQuantity(eq.getTotalQuantity())
                .availableQuantity(eq.getAvailableQuantity())
                .rentedQuantity(rented)
                .condition(eq.getCondition())
                .maintenanceStatus(eq.getMaintenanceStatus())
                .expectedReturnDate(returnDate)
                .createdAt(eq.getCreatedAt())
                .build();
    }
}
