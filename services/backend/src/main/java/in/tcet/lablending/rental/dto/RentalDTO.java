package in.tcet.lablending.rental.dto;

import in.tcet.lablending.rental.RentalStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalDTO {
    private Long id;
    private Long requestId;
    private Long borrowerId;
    private String borrowerName;
    private String borrowerEmail;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentModel;
    private Long roomId;
    private String roomNumber;
    private String departmentCode;
    private String assetId;
    private Integer quantityIssued;
    private String issuedByName;
    private Instant issuedAt;
    private Instant expectedReturnAt;
    private Instant actualReturnAt;
    private RentalStatus status;
    private boolean isOverdue;
}
