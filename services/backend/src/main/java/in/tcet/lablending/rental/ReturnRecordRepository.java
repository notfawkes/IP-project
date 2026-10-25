package in.tcet.lablending.rental;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRecordRepository extends JpaRepository<ReturnRecord, Long> {

    List<ReturnRecord> findByRentalBorrowerIdOrderByReturnedAtDesc(Long borrowerId);

    List<ReturnRecord> findAllByOrderByReturnedAtDesc();
}
