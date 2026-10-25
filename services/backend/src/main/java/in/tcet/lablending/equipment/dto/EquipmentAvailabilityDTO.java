package in.tcet.lablending.equipment.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentAvailabilityDTO {
    private Long equipmentId;
    private String equipmentName;
    private int totalQuantity;
    private int availableQuantity;
    private int rentedQuantity;
    private int maintenanceQuantity;
    private boolean isAvailableForRequest;
}
