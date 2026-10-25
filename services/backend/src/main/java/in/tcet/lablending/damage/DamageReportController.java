package in.tcet.lablending.damage;

import in.tcet.lablending.auth.AuthService;
import in.tcet.lablending.damage.dto.CreateDamageReportRequest;
import in.tcet.lablending.damage.dto.DamageReportDTO;
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
@Tag(name = "Damage Reports", description = "Report damaged or malfunctioning equipment and maintenance triage")
public class DamageReportController {

    private final DamageService damageService;
    private final AuthService authService;

    @PostMapping("/api/v1/damage-reports")
    @Operation(summary = "Submit a damage report for laboratory equipment")
    public ResponseEntity<DamageReportDTO> createReport(@Valid @RequestBody CreateDamageReportRequest request) {
        User user = authService.getCurrentUser();
        DamageReportDTO created = damageService.createReport(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/api/v1/damage-reports/me")
    @Operation(summary = "Get current authenticated user's submitted damage reports")
    public ResponseEntity<List<DamageReportDTO>> getMyReports() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(damageService.getUserReports(user));
    }

    @GetMapping("/api/v1/admin/damage-reports")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all damage reports across laboratories (Admin only)")
    public ResponseEntity<List<DamageReportDTO>> getAllReports() {
        return ResponseEntity.ok(damageService.getAllReports());
    }

    @PatchMapping("/api/v1/admin/damage-reports/{reportId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update damage report status (e.g. SENT_TO_MAINTENANCE, RESOLVED) (Admin only)")
    public ResponseEntity<DamageReportDTO> updateStatus(
            @PathVariable Long reportId,
            @RequestParam DamageStatus status
    ) {
        User admin = authService.getCurrentUser();
        return ResponseEntity.ok(damageService.updateReportStatus(reportId, status, admin));
    }
}
