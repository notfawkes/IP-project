package in.tcet.lablending.auth.dto;

import in.tcet.lablending.user.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String fullName;
    private String email;
    private Long departmentId;
    private String departmentCode;
    private String departmentName;
    private String studyingYear;
    private Role role;
    private boolean active;
}
