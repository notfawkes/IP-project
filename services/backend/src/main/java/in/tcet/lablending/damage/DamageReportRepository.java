package in.tcet.lablending.damage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DamageReportRepository extends JpaRepository<DamageReport, Long> {

    List<DamageReport> findByReporterIdOrderByCreatedAtDesc(Long reporterId);

    List<DamageReport> findByStatusOrderByCreatedAtDesc(DamageStatus status);

    List<DamageReport> findAllByOrderByCreatedAtDesc();

    long countByStatus(DamageStatus status);
}
