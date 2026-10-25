package in.tcet.lablending.equipment.dto;

import in.tcet.lablending.equipment.EquipmentCondition;
import in.tcet.lablending.equipment.MaintenanceStatus;
import in.tcet.lablending.equipment.TrackingMode;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentDTO {
    private Long id;
    private String name;
    private String category;
    private String description;
    private String modelNumber;
    private Long departmentId;
    private String departmentCode;
    private Long roomId;
    private String roomNumber;
    private String roomName;
    private TrackingMode trackingMode;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private Integer rentedQuantity;
    private EquipmentCondition condition;
    private MaintenanceStatus maintenanceStatus;
    private Instant expectedReturnDate;
    private Instant createdAt;
}
