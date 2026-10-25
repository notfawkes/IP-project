package in.tcet.lablending.rental.dto;

import in.tcet.lablending.rental.ReturnCondition;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordReturnRequest {

    @NotNull(message = "Return condition is required")
    private ReturnCondition returnCondition;

    private String notes;
}
