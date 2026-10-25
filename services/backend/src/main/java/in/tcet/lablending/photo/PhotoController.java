package in.tcet.lablending.photo;

import in.tcet.lablending.auth.AuthService;
import in.tcet.lablending.photo.dto.PhotoDTO;
import in.tcet.lablending.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Laboratory Photos", description = "Neon Object Storage photographs of rooms and equipment")
public class PhotoController {

    private final StorageService storageService;
    private final AuthService authService;

    @PostMapping(value = "/api/v1/admin/rooms/{roomId}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload room photograph to Neon Object Storage bucket lab-photos (Admin only)")
    public ResponseEntity<PhotoDTO> uploadPhoto(
            @PathVariable Long roomId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "isPrimary", required = false, defaultValue = "false") Boolean isPrimary
    ) {
        User admin = authService.getCurrentUser();
        PhotoDTO photo = storageService.uploadPhoto(roomId, file, caption, isPrimary, admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(photo);
    }

    @GetMapping("/api/v1/rooms/{roomId}/photos")
    @Operation(summary = "List all photographs for a room with direct CDN public URLs")
    public ResponseEntity<List<PhotoDTO>> getRoomPhotos(@PathVariable Long roomId) {
        return ResponseEntity.ok(storageService.getPhotosByRoom(roomId));
    }

    @DeleteMapping("/api/v1/admin/photos/{photoId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete photograph from Neon Object Storage and database (Admin only)")
    public ResponseEntity<Map<String, String>> deletePhoto(@PathVariable Long photoId) {
        User admin = authService.getCurrentUser();
        storageService.deletePhoto(photoId, admin);
        return ResponseEntity.ok(Map.of("message", "Photograph deleted successfully"));
    }

    @PostMapping("/api/v1/admin/photos/{photoId}/primary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Designate photograph as primary cover photo for room (Admin only)")
    public ResponseEntity<PhotoDTO> setPrimaryPhoto(@PathVariable Long photoId) {
        User admin = authService.getCurrentUser();
        return ResponseEntity.ok(storageService.setPrimaryPhoto(photoId, admin));
    }
}
