package in.tcet.lablending.photo.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoDTO {
    private Long id;
    private Long roomId;
    private String roomNumber;
    private Long departmentId;
    private String departmentCode;
    private String storageKey;
    private String publicUrl;
    private String originalFilename;
    private String mimeType;
    private Long fileSize;
    private String caption;
    private boolean isPrimary;
    private Long uploadedById;
    private String uploadedByName;
    private Instant createdAt;
}
