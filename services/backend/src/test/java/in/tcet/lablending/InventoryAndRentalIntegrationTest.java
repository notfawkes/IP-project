package in.tcet.lablending;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.tcet.lablending.auth.dto.LoginRequest;
import in.tcet.lablending.auth.dto.RegisterRequest;
import in.tcet.lablending.department.Department;
import in.tcet.lablending.department.DepartmentRepository;
import in.tcet.lablending.equipment.Equipment;
import in.tcet.lablending.equipment.EquipmentCondition;
import in.tcet.lablending.equipment.EquipmentRepository;
import in.tcet.lablending.equipment.MaintenanceStatus;
import in.tcet.lablending.equipment.dto.CreateEquipmentRequest;
import in.tcet.lablending.rental.Rental;
import in.tcet.lablending.rental.RentalRepository;
import in.tcet.lablending.rental.RentalStatus;
import in.tcet.lablending.rental.ReturnCondition;
import in.tcet.lablending.rental.dto.RecordReturnRequest;
import in.tcet.lablending.request.RentalRequest;
import in.tcet.lablending.request.RentalRequestRepository;
import in.tcet.lablending.request.RequestStatus;
import in.tcet.lablending.request.dto.CreateRentalRequest;
import in.tcet.lablending.room.Room;
import in.tcet.lablending.room.RoomRepository;
import in.tcet.lablending.user.Role;
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

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class InventoryAndRentalIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RentalRequestRepository requestRepository;

    @Autowired
    private RentalRepository rentalRepository;

    private String adminToken;
    private String studentToken;
    private Equipment testEquipment;

    @BeforeEach
    void setUp() throws Exception {
        // Admin token
        LoginRequest adminLogin = LoginRequest.builder()
                .email("admin@tcetmumbai.org")
                .password("Admin@TCET2026!")
                .build();
        MvcResult adminRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andReturn();
        adminToken = objectMapper.readTree(adminRes.getResponse().getContentAsString()).get("token").asText();

        // Student token
        String studentEmail = "priya.verma@tcetmumbai.org";
        RegisterRequest studentReg = RegisterRequest.builder()
                .fullName("Priya Verma")
                .email(studentEmail)
                .password("PassWord123!")
                .role(Role.STUDENT)
                .build();
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentReg)));

        LoginRequest studentLogin = LoginRequest.builder()
                .email(studentEmail)
                .password("PassWord123!")
                .build();
        MvcResult studentRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        studentToken = objectMapper.readTree(studentRes.getResponse().getContentAsString()).get("token").asText();

        // Setup equipment in room 304
        Department comp = departmentRepository.findByCode("COMP").orElseThrow();
        Room room304 = roomRepository.findByDepartmentIdAndRoomNumber(comp.getId(), "304").orElseThrow();

        testEquipment = Equipment.builder()
                .name("Arduino Mega 2560 Starter Kit")
                .category("MICROCONTROLLER")
                .modelNumber("MEGA-2560-R3")
                .department(comp)
                .room(room304)
                .totalQuantity(5)
                .availableQuantity(5)
                .condition(EquipmentCondition.EXCELLENT)
                .maintenanceStatus(MaintenanceStatus.OPERATIONAL)
                .build();
        testEquipment = equipmentRepository.save(testEquipment);
    }

    @Test
    @DisplayName("Should prevent requesting quantity greater than available inventory")
    void shouldPreventRequestingMoreThanAvailable() throws Exception {
        CreateRentalRequest req = CreateRentalRequest.builder()
                .equipmentId(testEquipment.getId())
                .requestedQuantity(10) // Only 5 available!
                .startTime(Instant.now().plus(1, ChronoUnit.HOURS))
                .endTime(Instant.now().plus(5, ChronoUnit.HOURS))
                .purpose("Robotics workshop")
                .build();

        mockMvc.perform(post("/api/v1/requests")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("exceeds currently available stock")));
    }

    @Test
    @DisplayName("Complete workflow: submit request, approve, decrement stock, and return to replenish stock")
    void completeLendingAndReturnWorkflow() throws Exception {
        // 1. Submit request for 2 units
        CreateRentalRequest req = CreateRentalRequest.builder()
                .equipmentId(testEquipment.getId())
                .requestedQuantity(2)
                .startTime(Instant.now().plus(1, ChronoUnit.HOURS))
                .endTime(Instant.now().plus(6, ChronoUnit.HOURS))
                .purpose("Sensors lab assignment")
                .build();

        MvcResult reqResult = mockMvc.perform(post("/api/v1/requests")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        long requestId = objectMapper.readTree(reqResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. Admin approves request
        mockMvc.perform(post("/api/v1/admin/requests/" + requestId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        // Verify stock decremented from 5 to 3
        Equipment afterApprove = equipmentRepository.findById(testEquipment.getId()).orElseThrow();
        assertEquals(3, afterApprove.getAvailableQuantity());

        // Find created rental
        Rental rental = rentalRepository.findByStatusOrderByIssuedAtDesc(RentalStatus.ACTIVE).get(0);

        // 3. Return the equipment in WORKING condition
        RecordReturnRequest returnReq = RecordReturnRequest.builder()
                .returnCondition(ReturnCondition.WORKING)
                .notes("Returned cleanly with all cables")
                .build();

        mockMvc.perform(post("/api/v1/rentals/" + rental.getId() + "/return")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(returnReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.returnCondition").value("WORKING"));

        // Verify stock replenished back to 5
        Equipment afterReturn = equipmentRepository.findById(testEquipment.getId()).orElseThrow();
        assertEquals(5, afterReturn.getAvailableQuantity());

        // 4. Attempting duplicate return must fail
        mockMvc.perform(post("/api/v1/rentals/" + rental.getId() + "/return")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(returnReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already been marked as returned")));
    }
}
