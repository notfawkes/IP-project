package in.tcet.lablending.request;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalRequestRepository extends JpaRepository<RentalRequest, Long> {

    List<RentalRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);

    List<RentalRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);

    List<RentalRequest> findAllByOrderByCreatedAtDesc();

    long countByStatus(RequestStatus status);
}
