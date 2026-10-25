package in.tcet.lablending.equipment;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByRoomIdOrderByNameAsc(Long roomId);

    List<Equipment> findByDepartmentIdOrderByNameAsc(Long departmentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Equipment e WHERE e.id = :id")
    Optional<Equipment> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT e FROM Equipment e WHERE e.room.id = :roomId AND e.condition != in.tcet.lablending.equipment.EquipmentCondition.DAMAGED AND e.maintenanceStatus = in.tcet.lablending.equipment.MaintenanceStatus.OPERATIONAL AND e.availableQuantity > 0 ORDER BY e.name ASC")
    List<Equipment> findWorkingByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT e FROM Equipment e WHERE e.room.id = :roomId AND e.availableQuantity < e.totalQuantity ORDER BY e.name ASC")
    List<Equipment> findRentedByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT e FROM Equipment e WHERE e.room.id = :roomId AND (e.condition = in.tcet.lablending.equipment.EquipmentCondition.DAMAGED OR e.maintenanceStatus != in.tcet.lablending.equipment.MaintenanceStatus.OPERATIONAL) ORDER BY e.name ASC")
    List<Equipment> findNotWorkingByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT COALESCE(SUM(e.totalQuantity), 0) FROM Equipment e")
    long sumTotalQuantity();

    @Query("SELECT COALESCE(SUM(e.availableQuantity), 0) FROM Equipment e")
    long sumAvailableQuantity();

    @Query("SELECT COALESCE(SUM(e.totalQuantity - e.availableQuantity), 0) FROM Equipment e WHERE e.maintenanceStatus = in.tcet.lablending.equipment.MaintenanceStatus.OPERATIONAL")
    long sumRentedQuantity();

    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.condition = in.tcet.lablending.equipment.EquipmentCondition.DAMAGED OR e.maintenanceStatus != in.tcet.lablending.equipment.MaintenanceStatus.OPERATIONAL")
    long countNonWorkingEquipment();
}
