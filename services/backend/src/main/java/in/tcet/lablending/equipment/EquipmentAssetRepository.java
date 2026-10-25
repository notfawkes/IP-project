package in.tcet.lablending.equipment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentAssetRepository extends JpaRepository<EquipmentAsset, String> {

    List<EquipmentAsset> findByEquipmentId(Long equipmentId);

    List<EquipmentAsset> findByEquipmentIdAndStatus(Long equipmentId, AssetStatus status);

    List<EquipmentAsset> findByRoomId(Long roomId);
}
