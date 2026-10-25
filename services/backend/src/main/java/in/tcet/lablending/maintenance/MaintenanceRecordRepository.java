package in.tcet.lablending.maintenance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {

    List<MaintenanceRecord> findByEquipmentIdOrderByStartedAtDesc(Long equipmentId);

    List<MaintenanceRecord> findByStatusOrderByStartedAtDesc(MaintenanceRecordStatus status);

    List<MaintenanceRecord> findAllByOrderByStartedAtDesc();
}
