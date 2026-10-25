package in.tcet.lablending.department.dto;

import in.tcet.lablending.room.dto.RoomDTO;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentDTO {
    private Long id;
    private String code;
    private String name;
    private boolean active;
    private int roomCount;
    private List<RoomDTO> rooms;
}
