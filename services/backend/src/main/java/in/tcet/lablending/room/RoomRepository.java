package in.tcet.lablending.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByDepartmentIdAndActiveTrueOrderByRoomNumberAsc(Long departmentId);

    List<Room> findByDepartmentCodeAndActiveTrueOrderByRoomNumberAsc(String departmentCode);

    Optional<Room> findByDepartmentIdAndRoomNumber(Long departmentId, String roomNumber);

    @Query("SELECT r FROM Room r WHERE r.isConfirmed = false AND r.active = true")
    List<Room> findUnconfirmedRooms();

    @Query("SELECT r FROM Room r WHERE r.active = true ORDER BY r.department.code ASC, r.roomNumber ASC")
    List<Room> findAllActiveRooms();
}
