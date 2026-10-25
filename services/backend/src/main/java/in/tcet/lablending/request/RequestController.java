package in.tcet.lablending.request;

import in.tcet.lablending.auth.AuthService;
import in.tcet.lablending.request.dto.CreateRentalRequest;
import in.tcet.lablending.request.dto.RejectRequest;
import in.tcet.lablending.request.dto.RentalRequestDTO;
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
@RequiredArgsConstructor
@Tag(name = "Rental Requests", description = "Equipment lending requests and administrative approvals")
public class RequestController {

    private final RequestService requestService;
    private final AuthService authService;

    @PostMapping("/api/v1/requests")
    @Operation(summary = "Submit a new equipment lending request")
    public ResponseEntity<RentalRequestDTO> createRequest(@Valid @RequestBody CreateRentalRequest request) {
        User user = authService.getCurrentUser();
        RentalRequestDTO created = requestService.createRequest(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/api/v1/requests/me")
    @Operation(summary = "Get current authenticated user's lending requests")
    public ResponseEntity<List<RentalRequestDTO>> getMyRequests() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(requestService.getUserRequests(user));
    }

    @GetMapping("/api/v1/admin/requests")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all equipment lending requests (Admin only)")
    public ResponseEntity<List<RentalRequestDTO>> getAllRequests(
            @RequestParam(required = false) RequestStatus status
    ) {
        return ResponseEntity.ok(requestService.getAllRequests(status));
    }

    @PostMapping("/api/v1/admin/requests/{requestId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve lending request and generate active loan allocation (Admin only)")
    public ResponseEntity<RentalRequestDTO> approveRequest(@PathVariable Long requestId) {
        User admin = authService.getCurrentUser();
        return ResponseEntity.ok(requestService.approveRequest(requestId, admin));
    }

    @PostMapping("/api/v1/admin/requests/{requestId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject lending request with explanation (Admin only)")
    public ResponseEntity<RentalRequestDTO> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) RejectRequest body
    ) {
        User admin = authService.getCurrentUser();
        String reason = body != null ? body.getReason() : "Request rejected by laboratory administrator";
        return ResponseEntity.ok(requestService.rejectRequest(requestId, reason, admin));
    }
}
