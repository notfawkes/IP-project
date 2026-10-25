package in.tcet.lablending;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.tcet.lablending.auth.AuthService;
import in.tcet.lablending.auth.dto.LoginRequest;
import in.tcet.lablending.department.Department;
import in.tcet.lablending.department.DepartmentRepository;
import in.tcet.lablending.room.Room;
import in.tcet.lablending.room.RoomRepository;
import in.tcet.lablending.room.dto.CreateRoomRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DepartmentRoomIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private AuthService authService;

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        LoginRequest loginReq = LoginRequest.builder()
                .email("admin@tcetmumbai.org")
                .password("Admin@TCET2026!")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        adminToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @DisplayName("Should return all 11 TCET departments with correct room counts")
    void shouldReturnAllDepartments() throws Exception {
        mockMvc.perform(get("/api/v1/departments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(11)))
                .andExpect(jsonPath("$[?(@.code == 'COMP')].roomCount").value(hasItem(6)))
                .andExpect(jsonPath("$[?(@.code == 'IT')].roomCount").value(hasItem(5)))
                .andExpect(jsonPath("$[?(@.code == 'ETC')].roomCount").value(hasItem(0)))
                .andExpect(jsonPath("$[?(@.code == 'CIVIL')].roomCount").value(hasItem(0)));
    }

    @Test
    @DisplayName("Should preserve duplicate Room 413 in AI_ML and AI_DS marked unconfirmed")
    void shouldPreserveDuplicateRoom413Unconfirmed() throws Exception {
        List<Room> unconfirmed = roomRepository.findUnconfirmedRooms();
        assertFalse(unconfirmed.isEmpty(), "Unconfirmed rooms list should contain Room 413");

        long count413 = unconfirmed.stream().filter(r -> "413".equals(r.getRoomNumber())).count();
        org.junit.jupiter.api.Assertions.assertTrue(count413 >= 1, "Room 413 should exist in unconfirmed assignments");
    }

    @Test
    @DisplayName("Admin can confirm duplicate room assignment")
    void adminCanConfirmRoom() throws Exception {
        List<Room> unconfirmed = roomRepository.findUnconfirmedRooms();
        Room target = unconfirmed.get(0);

        mockMvc.perform(post("/api/v1/rooms/" + target.getId() + "/confirm")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isConfirmed").value(true));
    }

    @Test
    @DisplayName("Admin can add room to department with no confirmed rooms (e.g. ETC)")
    void adminCanAddRoomToEmptyDepartment() throws Exception {
        Department etc = departmentRepository.findByCode("ETC")
                .orElseThrow();

        CreateRoomRequest req = CreateRoomRequest.builder()
                .roomNumber("502")
                .roomName("Microwave & Antenna Lab")
                .labType("HARDWARE")
                .build();

        mockMvc.perform(post("/api/v1/departments/" + etc.getId() + "/rooms")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomNumber").value("502"))
                .andExpect(jsonPath("$.departmentCode").value("ETC"));
    }

    @Test
    @DisplayName("Should reject duplicate room number in the same department")
    void shouldRejectDuplicateRoomInSameDepartment() throws Exception {
        Department comp = departmentRepository.findByCode("COMP")
                .orElseThrow();

        // Room 304 already exists in COMP
        CreateRoomRequest req = CreateRoomRequest.builder()
                .roomNumber("304")
                .roomName("Duplicate Programming Lab")
                .build();

        mockMvc.perform(post("/api/v1/departments/" + comp.getId() + "/rooms")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }
}
