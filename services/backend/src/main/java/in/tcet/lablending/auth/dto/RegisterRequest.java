package in.tcet.lablending.auth.dto;

import in.tcet.lablending.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 150, message = "Full name must be between 2 and 150 characters")
    private String fullName;

    @NotBlank(message = "Institutional email is required")
    @Email(message = "Email must be valid format")
    @Pattern(
        regexp = "^[a-zA-Z0-9._%+-]+@tcetmumbai\\.org$",
        message = "Email must belong strictly to the tcetmumbai.org institutional domain"
    )
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    private Long departmentId;

    private String studyingYear;

    @NotNull(message = "Role is required")
    private Role role;
}
