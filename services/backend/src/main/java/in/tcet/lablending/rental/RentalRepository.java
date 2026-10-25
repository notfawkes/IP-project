package in.tcet.lablending.rental;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {

    List<Rental> findByBorrowerIdOrderByIssuedAtDesc(Long borrowerId);

    List<Rental> findByStatusOrderByIssuedAtDesc(RentalStatus status);

    List<Rental> findAllByOrderByIssuedAtDesc();

    @Query("SELECT r FROM Rental r WHERE r.status = in.tcet.lablending.rental.RentalStatus.ACTIVE AND r.expectedReturnAt < :now")
    List<Rental> findOverdueRentals(@Param("now") Instant now);

    @Query("SELECT COUNT(r) FROM Rental r WHERE r.status = in.tcet.lablending.rental.RentalStatus.ACTIVE AND r.expectedReturnAt < :now")
    long countOverdueRentals(@Param("now") Instant now);

    long countByStatus(RentalStatus status);
}
