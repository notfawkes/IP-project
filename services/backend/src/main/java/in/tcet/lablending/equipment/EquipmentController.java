package in.tcet.lablending.equipment;

import in.tcet.lablending.auth.AuthService;
import in.tcet.lablending.equipment.dto.CreateEquipmentRequest;
import in.tcet.lablending.equipment.dto.EquipmentAvailabilityDTO;
import in.tcet.lablending.equipment.dto.EquipmentDTO;
import in.tcet.lablending.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/equipment")
@RequiredArgsConstructor
@Tag(name = "Equipment", description = "Laboratory equipment inventory, availability, and updates")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final AuthService authService;

    @GetMapping("/{equipmentId}")
    @Operation(summary = "Get equipment details and current loan status")
    public ResponseEntity<EquipmentDTO> getEquipmentById(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(equipmentId));
    }

    @PatchMapping("/{equipmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update equipment quantity, status, or specifications (Admin only)")
    public ResponseEntity<EquipmentDTO> updateEquipment(
            @PathVariable Long equipmentId,
            @RequestBody CreateEquipmentRequest request
    ) {
        User admin = authService.getCurrentUser();
        return ResponseEntity.ok(equipmentService.updateEquipment(equipmentId, request, admin));
    }

    @GetMapping("/{equipmentId}/availability")
    @Operation(summary = "Get authoritative stock availability breakdown for equipment")
    public ResponseEntity<EquipmentAvailabilityDTO> getEquipmentAvailability(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(equipmentService.getAvailability(equipmentId));
    }
}
