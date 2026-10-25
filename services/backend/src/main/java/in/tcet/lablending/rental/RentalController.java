package in.tcet.lablending.rental;

import in.tcet.lablending.auth.AuthService;
import in.tcet.lablending.rental.dto.RecordReturnRequest;
import in.tcet.lablending.rental.dto.RentalDTO;
import in.tcet.lablending.rental.dto.ReturnRecordDTO;
import in.tcet.lablending.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Rentals & Returns", description = "Equipment loans, handovers, returns, and overdue tracking")
public class RentalController {

    private final RentalService rentalService;
    private final AuthService authService;

    @GetMapping("/api/v1/rentals/me")
    @Operation(summary = "Get current authenticated user's active and past rentals")
    public ResponseEntity<List<RentalDTO>> getMyRentals() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(rentalService.getUserRentals(user));
    }

    @GetMapping("/api/v1/admin/rentals")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all equipment rentals across TCET laboratories (Admin only)")
    public ResponseEntity<List<RentalDTO>> getAllRentals(
            @RequestParam(required = false) RentalStatus status
    ) {
        return ResponseEntity.ok(rentalService.getAllRentals(status));
    }

    @GetMapping("/api/v1/admin/rentals/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get overdue equipment rentals (Admin only)")
    public ResponseEntity<List<RentalDTO>> getOverdueRentals() {
        return ResponseEntity.ok(rentalService.getOverdueRentals());
    }

    @PostMapping("/api/v1/admin/rentals/{rentalId}/issue")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Confirm physical handover of equipment to borrower (Admin only)")
    public ResponseEntity<RentalDTO> issueRental(@PathVariable Long rentalId) {
        User admin = authService.getCurrentUser();
        return ResponseEntity.ok(rentalService.issueRental(rentalId, admin));
    }

    @PostMapping("/api/v1/rentals/{rentalId}/return")
    @Operation(summary = "Record return of rented equipment and update inventory status")
    public ResponseEntity<ReturnRecordDTO> returnRental(
            @PathVariable Long rentalId,
            @Valid @RequestBody RecordReturnRequest request
    ) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(rentalService.recordReturn(rentalId, request, user));
    }

    @GetMapping("/api/v1/returns/me")
    @Operation(summary = "Get current authenticated user's equipment return history")
    public ResponseEntity<List<ReturnRecordDTO>> getMyReturns() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(rentalService.getUserReturns(user));
    }
}
