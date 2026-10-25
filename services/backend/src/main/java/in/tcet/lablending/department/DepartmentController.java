package in.tcet.lablending.department;

import in.tcet.lablending.auth.AuthService;
import in.tcet.lablending.department.dto.DepartmentDTO;
import in.tcet.lablending.room.RoomService;
import in.tcet.lablending.room.dto.CreateRoomRequest;
import in.tcet.lablending.room.dto.RoomDTO;
import in.tcet.lablending.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "TCET Departments and assigned laboratory rooms")
public class DepartmentController {

    private final DepartmentService departmentService;
    private final RoomService roomService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get all active departments with rooms hierarchy")
    public ResponseEntity<List<DepartmentDTO>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/{departmentId}")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<DepartmentDTO> getDepartmentById(@PathVariable Long departmentId) {
        return ResponseEntity.ok(departmentService.getDepartmentById(departmentId));
    }

    @GetMapping("/{departmentId}/rooms")
    @Operation(summary = "Get rooms belonging to department")
    public ResponseEntity<List<RoomDTO>> getRoomsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(roomService.getRoomsByDepartment(departmentId));
    }

    @PostMapping("/{departmentId}/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add room to department (Admin only)")
    public ResponseEntity<RoomDTO> addRoom(
            @PathVariable Long departmentId,
            @Valid @RequestBody CreateRoomRequest request
    ) {
        User admin = authService.getCurrentUser();
        RoomDTO created = roomService.addRoom(departmentId, request, admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
