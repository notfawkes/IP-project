package in.tcet.lablending.maintenance.dto;

import in.tcet.lablending.maintenance.MaintenanceRecordStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRecordDTO {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String assetId;
    private Long damageReportId;
    private String reason;
    private String notes;
    private MaintenanceRecordStatus status;
    private Long adminId;
    private String adminName;
    private Instant startedAt;
    private Instant completedAt;
}
