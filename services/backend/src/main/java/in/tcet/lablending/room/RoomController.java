package in.tcet.lablending.room;

import in.tcet.lablending.auth.AuthService;
import in.tcet.lablending.equipment.EquipmentService;
import in.tcet.lablending.equipment.dto.CreateEquipmentRequest;
import in.tcet.lablending.equipment.dto.EquipmentDTO;
import in.tcet.lablending.photo.StorageService;
import in.tcet.lablending.photo.dto.PhotoDTO;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms", description = "Laboratory rooms, equipment Kanban, and photographs")
public class RoomController {

    private final RoomService roomService;
    private final EquipmentService equipmentService;
    private final StorageService storageService;
    private final AuthService authService;

    @GetMapping("/{roomId}")
    @Operation(summary = "Get room details and metadata")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getRoomById(roomId));
    }

    @PatchMapping("/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update room details (Admin only)")
    public ResponseEntity<RoomDTO> updateRoom(
            @PathVariable Long roomId,
            @RequestBody CreateRoomRequest request
    ) {
        User admin = authService.getCurrentUser();
        return ResponseEntity.ok(roomService.updateRoom(roomId, request, admin));
    }

    @PostMapping("/{roomId}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Confirm administrative assignment of room (e.g. Room 413) (Admin only)")
    public ResponseEntity<RoomDTO> confirmRoom(@PathVariable Long roomId) {
        User admin = authService.getCurrentUser();
        return ResponseEntity.ok(roomService.confirmRoom(roomId, admin));
    }

    @GetMapping("/{roomId}/photos")
    @Operation(summary = "Get all photographs for a room")
    public ResponseEntity<List<PhotoDTO>> getRoomPhotos(@PathVariable Long roomId) {
        return ResponseEntity.ok(storageService.getPhotosByRoom(roomId));
    }

    @GetMapping("/{roomId}/equipment")
    @Operation(summary = "Get all equipment assigned to a room")
    public ResponseEntity<List<EquipmentDTO>> getRoomEquipment(@PathVariable Long roomId) {
        return ResponseEntity.ok(equipmentService.getEquipmentByRoom(roomId));
    }

    @GetMapping("/{roomId}/kanban")
    @Operation(summary = "Get 3-column Kanban board (Working, Rented Out, Not Working) for a room")
    public ResponseEntity<Map<String, List<EquipmentDTO>>> getRoomKanban(@PathVariable Long roomId) {
        return ResponseEntity.ok(equipmentService.getKanbanByRoom(roomId));
    }

    @PostMapping("/{roomId}/equipment")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create equipment item in a room (Admin only)")
    public ResponseEntity<EquipmentDTO> createEquipment(
            @PathVariable Long roomId,
            @Valid @RequestBody CreateEquipmentRequest request
    ) {
        User admin = authService.getCurrentUser();
        EquipmentDTO created = equipmentService.createEquipment(roomId, request, admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
