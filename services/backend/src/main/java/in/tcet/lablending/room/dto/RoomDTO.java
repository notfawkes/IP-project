package in.tcet.lablending.room.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDTO {
    private Long id;
    private Long departmentId;
    private String departmentCode;
    private String departmentName;
    private String roomNumber;
    private String roomName;
    private String labType;
    private boolean isConfirmed;
    private boolean active;
    private String primaryPhotoUrl;
    private int photoCount;
    private int equipmentCount;
}
