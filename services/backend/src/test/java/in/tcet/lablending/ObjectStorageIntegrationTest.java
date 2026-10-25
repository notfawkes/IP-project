package in.tcet.lablending;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.tcet.lablending.auth.dto.LoginRequest;
import in.tcet.lablending.auth.dto.RegisterRequest;
import in.tcet.lablending.department.Department;
import in.tcet.lablending.department.DepartmentRepository;
import in.tcet.lablending.room.Room;
import in.tcet.lablending.room.RoomRepository;
import in.tcet.lablending.user.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ObjectStorageIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RoomRepository roomRepository;

    @MockBean
    private S3Client s3Client;

    private String adminToken;
    private String studentToken;
    private Room testRoom;

    @BeforeEach
    void setUp() throws Exception {
        // Admin
        LoginRequest adminLogin = LoginRequest.builder()
                .email("admin@tcetmumbai.org")
                .password("Admin@TCET2026!")
                .build();
        MvcResult adminRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andReturn();
        adminToken = objectMapper.readTree(adminRes.getResponse().getContentAsString()).get("token").asText();

        // Student
        String email = "student.storage@tcetmumbai.org";
        RegisterRequest studentReg = RegisterRequest.builder()
                .fullName("Storage Student")
                .email(email)
                .password("Password123!")
                .role(Role.STUDENT)
                .build();
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentReg)));

        LoginRequest studentLogin = LoginRequest.builder()
                .email(email)
                .password("Password123!")
                .build();
        MvcResult studentRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        studentToken = objectMapper.readTree(studentRes.getResponse().getContentAsString()).get("token").asText();

        Department comp = departmentRepository.findByCode("COMP").orElseThrow();
        testRoom = roomRepository.findByDepartmentIdAndRoomNumber(comp.getId(), "305").orElseThrow();
    }

    @Test
    @DisplayName("Should prevent students from uploading photographs (403 Forbidden)")
    void studentCannotUploadPhoto() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "lab.jpg", "image/jpeg", "fake image content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/admin/rooms/" + testRoom.getId() + "/photos")
                        .file(file)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should reject unsupported file types like application/pdf (400 Bad Request)")
    void shouldRejectUnsupportedFileTypes() throws Exception {
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file", "document.pdf", "application/pdf", "fake pdf content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/admin/rooms/" + testRoom.getId() + "/photos")
                        .file(pdfFile)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Only JPEG, PNG, and WebP images are permitted")));
    }

    @Test
    @DisplayName("Admin can upload valid JPEG photograph and receive public URL and metadata")
    void adminCanUploadPhotoSuccessfully() throws Exception {
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

        MockMultipartFile imageFile = new MockMultipartFile(
                "file", "programming-lab.jpg", "image/jpeg", "valid jpeg test image data".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/admin/rooms/" + testRoom.getId() + "/photos")
                        .file(imageFile)
                        .param("caption", "High Performance Workstation Row")
                        .param("isPrimary", "true")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomId").value(testRoom.getId()))
                .andExpect(jsonPath("$.publicUrl").isString())
                .andExpect(jsonPath("$.storageKey").value(org.hamcrest.Matchers.containsString("departments/")))
                .andExpect(jsonPath("$.isPrimary").value(true));
    }
}
