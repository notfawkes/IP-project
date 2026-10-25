package in.tcet.lablending.dashboard;

import in.tcet.lablending.dashboard.dto.DashboardSummaryDTO;
import in.tcet.lablending.equipment.EquipmentRepository;
import in.tcet.lablending.rental.RentalRepository;
import in.tcet.lablending.request.RentalRequestRepository;
import in.tcet.lablending.request.RequestStatus;
import in.tcet.lablending.room.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EquipmentRepository equipmentRepository;
    private final RentalRequestRepository requestRepository;
    private final RentalRepository rentalRepository;
    private final RoomRepository roomRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getSummary() {
        long totalInventory = equipmentRepository.sumTotalQuantity();
        long availableUnits = equipmentRepository.sumAvailableQuantity();
        long rentedUnits = equipmentRepository.sumRentedQuantity();
        long nonWorkingUnits = equipmentRepository.countNonWorkingEquipment();
        long pendingRequests = requestRepository.countByStatus(RequestStatus.PENDING);
        long overdueRentals = rentalRepository.countOverdueRentals(Instant.now());
        long totalRooms = roomRepository.count();
        long unconfirmedRooms = roomRepository.findUnconfirmedRooms().size();

        return DashboardSummaryDTO.builder()
                .totalInventory(totalInventory)
                .availableUnits(availableUnits)
                .rentedUnits(rentedUnits)
                .nonWorkingUnits(nonWorkingUnits)
                .pendingRequests(pendingRequests)
                .overdueRentals(overdueRentals)
                .totalRooms(totalRooms)
                .unconfirmedRooms(unconfirmedRooms)
                .build();
    }
}
