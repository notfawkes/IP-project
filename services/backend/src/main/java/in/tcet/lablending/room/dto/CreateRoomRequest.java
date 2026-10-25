package in.tcet.lablending.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRoomRequest {

    @NotBlank(message = "Room number is required")
    @Size(max = 50, message = "Room number must not exceed 50 characters")
    private String roomNumber;

    @Size(max = 150, message = "Room name must not exceed 150 characters")
    private String roomName;

    @Size(max = 100, message = "Lab type must not exceed 100 characters")
    private String labType;

    @Builder.Default
    private Boolean isConfirmed = true;
}
