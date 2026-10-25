package in.tcet.lablending.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Institutional email is required")
    @Email(message = "Email must be valid format")
    @Pattern(
        regexp = "^[a-zA-Z0-9._%+-]+@tcetmumbai\\.org$",
        message = "Email must belong strictly to the tcetmumbai.org institutional domain"
    )
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
