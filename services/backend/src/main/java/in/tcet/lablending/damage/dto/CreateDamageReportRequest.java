package in.tcet.lablending.damage.dto;

import in.tcet.lablending.damage.DamageCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDamageReportRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    private String assetId;

    private Long rentalId;

    @NotNull(message = "Damage category is required")
    private DamageCategory category;

    @NotBlank(message = "Description of damage is required")
    private String description;

    private String photoUrl;
}
