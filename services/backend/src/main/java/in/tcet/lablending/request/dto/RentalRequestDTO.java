package in.tcet.lablending.request.dto;

import in.tcet.lablending.request.RequestStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalRequestDTO {
    private Long id;
    private Long requesterId;
    private String requesterName;
    private String requesterEmail;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentModel;
    private Long roomId;
    private String roomNumber;
    private String departmentCode;
    private String assetId;
    private Integer requestedQuantity;
    private Instant startTime;
    private Instant endTime;
    private String purpose;
    private RequestStatus status;
    private String decisionByName;
    private Instant decisionTime;
    private String rejectionReason;
    private Instant createdAt;
}
