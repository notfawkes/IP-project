package in.tcet.lablending.photo;

import in.tcet.lablending.audit.AuditLogService;
import in.tcet.lablending.exception.BadRequestException;
import in.tcet.lablending.exception.ResourceNotFoundException;
import in.tcet.lablending.photo.dto.PhotoDTO;
import in.tcet.lablending.room.Room;
import in.tcet.lablending.room.RoomRepository;
import in.tcet.lablending.user.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final S3Client s3Client;
    private final LabPhotoRepository photoRepository;
    private final RoomRepository roomRepository;
    private final AuditLogService auditLogService;

    @Value("${neon.storage.endpoint:}")
    private String endpoint;

    @Value("${neon.storage.bucket-name:lab-photos}")
    private String bucketName;

    @Transactional
    public PhotoDTO uploadPhoto(Long roomId, MultipartFile file, String caption, Boolean isPrimary, User uploader) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded photograph file must not be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 10MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Only JPEG, PNG, and WebP images are permitted. Provided: " + contentType);
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        String extension = switch (contentType.toLowerCase()) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "jpg";
        };

        String storageKey = String.format("departments/%d/rooms/%d/%s.%s",
                room.getDepartment().getId(), room.getId(), UUID.randomUUID(), extension);

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.info("Uploaded object to bucket: {} with key: {}", bucketName, storageKey);
        } catch (IOException e) {
            log.error("Failed to read upload file stream: {}", e.getMessage(), e);
            throw new BadRequestException("Could not read uploaded photograph data: " + e.getMessage());
        } catch (Exception e) {
            log.error("Neon Object Storage upload failed for key {}: {}", storageKey, e.getMessage(), e);
            throw new BadRequestException("Neon Object Storage upload failed: " + e.getMessage());
        }

        String publicUrl = buildPublicUrl(storageKey);

        boolean makePrimary = Boolean.TRUE.equals(isPrimary);
        if (makePrimary) {
            List<LabPhoto> existing = photoRepository.findByRoomIdOrderByIsPrimaryDescCreatedAtDesc(roomId);
            for (LabPhoto p : existing) {
                if (p.isPrimary()) {
                    p.setPrimary(false);
                    photoRepository.save(p);
                }
            }
        } else {
            // If it's the first photo for this room, make it primary automatically
            if (photoRepository.findByRoomIdAndIsPrimaryTrue(roomId).isEmpty()) {
                makePrimary = true;
            }
        }

        LabPhoto photo = LabPhoto.builder()
                .room(room)
                .department(room.getDepartment())
                .storageKey(storageKey)
                .publicUrl(publicUrl)
                .originalFilename(file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo." + extension)
                .mimeType(contentType)
                .fileSize(file.getSize())
                .caption(caption)
                .isPrimary(makePrimary)
                .uploadedBy(uploader)
                .build();

        LabPhoto saved = photoRepository.save(photo);

        auditLogService.log(
                uploader.getId(),
                uploader.getEmail(),
                "UPLOAD_PHOTO",
                "LAB_PHOTO",
                String.valueOf(saved.getId()),
                "Uploaded room photo to bucket: " + bucketName + ", key: " + storageKey,
                null
        );

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PhotoDTO> getPhotosByRoom(Long roomId) {
        return photoRepository.findByRoomIdOrderByIsPrimaryDescCreatedAtDesc(roomId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public void deletePhoto(Long photoId, User currentUser) {
        LabPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photograph not found with ID: " + photoId));

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(photo.getStorageKey())
                    .build();
            s3Client.deleteObject(deleteRequest);
            log.info("Deleted object from bucket: {} key: {}", bucketName, photo.getStorageKey());
        } catch (Exception e) {
            log.warn("Could not delete S3 object: {}", e.getMessage());
        }

        photoRepository.delete(photo);

        auditLogService.log(
                currentUser.getId(),
                currentUser.getEmail(),
                "DELETE_PHOTO",
                "LAB_PHOTO",
                String.valueOf(photoId),
                "Deleted photo with key: " + photo.getStorageKey(),
                null
        );
    }

    @Transactional
    public PhotoDTO setPrimaryPhoto(Long photoId, User currentUser) {
        LabPhoto target = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photograph not found with ID: " + photoId));

        List<LabPhoto> roomPhotos = photoRepository.findByRoomIdOrderByIsPrimaryDescCreatedAtDesc(target.getRoom().getId());
        for (LabPhoto p : roomPhotos) {
            p.setPrimary(p.getId().equals(photoId));
            photoRepository.save(p);
        }

        auditLogService.log(
                currentUser.getId(),
                currentUser.getEmail(),
                "SET_PRIMARY_PHOTO",
                "LAB_PHOTO",
                String.valueOf(photoId),
                "Set primary photo for room " + target.getRoom().getRoomNumber(),
                null
        );

        return mapToDTO(target);
    }

    private String buildPublicUrl(String storageKey) {
        String base = endpoint != null && !endpoint.isBlank() ? endpoint.trim() : "https://storage.aws.neon.tech";
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return String.format("%s/%s/%s", base, bucketName, storageKey);
    }

    public PhotoDTO mapToDTO(LabPhoto photo) {
        return PhotoDTO.builder()
                .id(photo.getId())
                .roomId(photo.getRoom().getId())
                .roomNumber(photo.getRoom().getRoomNumber())
                .departmentId(photo.getDepartment().getId())
                .departmentCode(photo.getDepartment().getCode())
                .storageKey(photo.getStorageKey())
                .publicUrl(photo.getPublicUrl())
                .originalFilename(photo.getOriginalFilename())
                .mimeType(photo.getMimeType())
                .fileSize(photo.getFileSize())
                .caption(photo.getCaption())
                .isPrimary(photo.isPrimary())
                .uploadedById(photo.getUploadedBy().getId())
                .uploadedByName(photo.getUploadedBy().getFullName())
                .createdAt(photo.getCreatedAt())
                .build();
    }
}
