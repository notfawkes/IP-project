package in.tcet.lablending.equipment.dto;

import in.tcet.lablending.equipment.EquipmentCondition;
import in.tcet.lablending.equipment.MaintenanceStatus;
import in.tcet.lablending.equipment.TrackingMode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEquipmentRequest {

    @NotBlank(message = "Equipment name is required")
    @Size(max = 200, message = "Equipment name must not exceed 200 characters")
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    private String description;

    @Size(max = 100, message = "Model number must not exceed 100 characters")
    private String modelNumber;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Tracking mode is required")
    @Builder.Default
    private TrackingMode trackingMode = TrackingMode.QUANTITY;

    @NotNull(message = "Total quantity is required")
    @Min(value = 1, message = "Total quantity must be at least 1")
    @Builder.Default
    private Integer totalQuantity = 1;

    @Builder.Default
    private EquipmentCondition condition = EquipmentCondition.EXCELLENT;

    @Builder.Default
    private MaintenanceStatus maintenanceStatus = MaintenanceStatus.OPERATIONAL;
}
