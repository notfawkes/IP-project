package in.tcet.lablending.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    private long totalInventory;
    private long availableUnits;
    private long rentedUnits;
    private long nonWorkingUnits;
    private long pendingRequests;
    private long overdueRentals;
    private long totalRooms;
    private long unconfirmedRooms;
}
