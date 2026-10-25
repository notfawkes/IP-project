package in.tcet.lablending.photo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabPhotoRepository extends JpaRepository<LabPhoto, Long> {

    List<LabPhoto> findByRoomIdOrderByIsPrimaryDescCreatedAtDesc(Long roomId);

    List<LabPhoto> findByDepartmentIdOrderByCreatedAtDesc(Long departmentId);

    Optional<LabPhoto> findByRoomIdAndIsPrimaryTrue(Long roomId);

    Optional<LabPhoto> findByStorageKey(String storageKey);
}
