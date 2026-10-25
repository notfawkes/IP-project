package in.tcet.lablending.department;

import in.tcet.lablending.department.dto.DepartmentDTO;
import in.tcet.lablending.exception.ResourceNotFoundException;
import in.tcet.lablending.photo.LabPhoto;
import in.tcet.lablending.photo.LabPhotoRepository;
import in.tcet.lablending.room.Room;
import in.tcet.lablending.room.RoomRepository;
import in.tcet.lablending.room.dto.RoomDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final RoomRepository roomRepository;
    private final LabPhotoRepository photoRepository;

    @Transactional(readOnly = true)
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findByActiveTrueOrderByCodeAsc().stream()
                .map(this::mapToDTOWithRooms)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentDTO getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        return mapToDTOWithRooms(dept);
    }

    private DepartmentDTO mapToDTOWithRooms(Department dept) {
        List<Room> rooms = roomRepository.findByDepartmentIdAndActiveTrueOrderByRoomNumberAsc(dept.getId());
        List<RoomDTO> roomDTOs = rooms.stream().map(r -> {
            String primaryUrl = photoRepository.findByRoomIdAndIsPrimaryTrue(r.getId())
                    .map(LabPhoto::getPublicUrl)
                    .orElse(null);
            return RoomDTO.builder()
                    .id(r.getId())
                    .departmentId(dept.getId())
                    .departmentCode(dept.getCode())
                    .departmentName(dept.getName())
                    .roomNumber(r.getRoomNumber())
                    .roomName(r.getRoomName())
                    .labType(r.getLabType())
                    .isConfirmed(r.isConfirmed())
                    .active(r.isActive())
                    .primaryPhotoUrl(primaryUrl)
                    .photoCount(r.getPhotos() != null ? r.getPhotos().size() : 0)
                    .build();
        }).toList();

        return DepartmentDTO.builder()
                .id(dept.getId())
                .code(dept.getCode())
                .name(dept.getName())
                .active(dept.isActive())
                .roomCount(rooms.size())
                .rooms(roomDTOs)
                .build();
    }
}
