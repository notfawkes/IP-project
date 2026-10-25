package in.tcet.lablending.rental.dto;

import in.tcet.lablending.rental.ReturnCondition;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRecordDTO {
    private Long id;
    private Long rentalId;
    private String equipmentName;
    private String borrowerName;
    private String recordedByName;
    private Instant returnedAt;
    private ReturnCondition returnCondition;
    private String notes;
}
