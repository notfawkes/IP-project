package in.tcet.lablending.room;

import in.tcet.lablending.audit.AuditLogService;
import in.tcet.lablending.department.Department;
import in.tcet.lablending.department.DepartmentRepository;
import in.tcet.lablending.equipment.EquipmentRepository;
import in.tcet.lablending.exception.ConflictException;
import in.tcet.lablending.exception.ResourceNotFoundException;
import in.tcet.lablending.photo.LabPhoto;
import in.tcet.lablending.photo.LabPhotoRepository;
import in.tcet.lablending.room.dto.CreateRoomRequest;
import in.tcet.lablending.room.dto.RoomDTO;
import in.tcet.lablending.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final DepartmentRepository departmentRepository;
    private final LabPhotoRepository photoRepository;
    private final EquipmentRepository equipmentRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<RoomDTO> getRoomsByDepartment(Long departmentId) {
        return roomRepository.findByDepartmentIdAndActiveTrueOrderByRoomNumberAsc(departmentId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoomDTO getRoomById(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
        return mapToDTO(room);
    }

    @Transactional
    public RoomDTO addRoom(Long departmentId, CreateRoomRequest request, User admin) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + departmentId));

        String trimmedNumber = request.getRoomNumber().trim();
        if (roomRepository.findByDepartmentIdAndRoomNumber(departmentId, trimmedNumber).isPresent()) {
            throw new ConflictException("Room " + trimmedNumber + " already exists in department " + dept.getCode());
        }

        Room room = Room.builder()
                .department(dept)
                .roomNumber(trimmedNumber)
                .roomName(request.getRoomName() != null ? request.getRoomName().trim() : null)
                .labType(request.getLabType() != null ? request.getLabType().trim() : "GENERAL")
                .isConfirmed(request.getIsConfirmed() != null ? request.getIsConfirmed() : true)
                .active(true)
                .build();

        Room saved = roomRepository.save(room);

        auditLogService.log(
                admin.getId(),
                admin.getEmail(),
                "CREATE_ROOM",
                "ROOM",
                String.valueOf(saved.getId()),
                "Created room " + saved.getRoomNumber() + " in department " + dept.getCode(),
                null
        );

        return mapToDTO(saved);
    }

    @Transactional
    public RoomDTO confirmRoom(Long roomId, User admin) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        room.setConfirmed(true);
        Room saved = roomRepository.save(room);

        auditLogService.log(
                admin.getId(),
                admin.getEmail(),
                "CONFIRM_ROOM",
                "ROOM",
                String.valueOf(saved.getId()),
                "Confirmed assignment of room " + saved.getRoomNumber() + " for " + saved.getDepartment().getCode(),
                null
        );

        return mapToDTO(saved);
    }

    @Transactional
    public RoomDTO updateRoom(Long roomId, CreateRoomRequest request, User admin) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        if (request.getRoomName() != null) {
            room.setRoomName(request.getRoomName().trim());
        }
        if (request.getLabType() != null) {
            room.setLabType(request.getLabType().trim());
        }
        if (request.getIsConfirmed() != null) {
            room.setConfirmed(request.getIsConfirmed());
        }

        Room saved = roomRepository.save(room);

        auditLogService.log(
                admin.getId(),
                admin.getEmail(),
                "UPDATE_ROOM",
                "ROOM",
                String.valueOf(saved.getId()),
                "Updated details for room " + saved.getRoomNumber(),
                null
        );

        return mapToDTO(saved);
    }

    public RoomDTO mapToDTO(Room room) {
        String primaryUrl = photoRepository.findByRoomIdAndIsPrimaryTrue(room.getId())
                .map(LabPhoto::getPublicUrl)
                .orElse(null);

        List<LabPhoto> photos = photoRepository.findByRoomIdOrderByIsPrimaryDescCreatedAtDesc(room.getId());
        if (primaryUrl == null && !photos.isEmpty()) {
            primaryUrl = photos.get(0).getPublicUrl();
        }

        int equipmentCount = equipmentRepository.findByRoomIdOrderByNameAsc(room.getId()).size();

        return RoomDTO.builder()
                .id(room.getId())
                .departmentId(room.getDepartment().getId())
                .departmentCode(room.getDepartment().getCode())
                .departmentName(room.getDepartment().getName())
                .roomNumber(room.getRoomNumber())
                .roomName(room.getRoomName())
                .labType(room.getLabType())
                .isConfirmed(room.isConfirmed())
                .active(room.isActive())
                .primaryPhotoUrl(primaryUrl)
                .photoCount(photos.size())
                .equipmentCount(equipmentCount)
                .build();
    }
}
