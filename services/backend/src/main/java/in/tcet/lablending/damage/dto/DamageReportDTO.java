package in.tcet.lablending.damage.dto;

import in.tcet.lablending.damage.DamageCategory;
import in.tcet.lablending.damage.DamageStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DamageReportDTO {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String modelNumber;
    private Long roomId;
    private String roomNumber;
    private String assetId;
    private Long rentalId;
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;
    private DamageCategory category;
    private String description;
    private String photoUrl;
    private DamageStatus status;
    private Instant createdAt;
    private Instant resolvedAt;
}
