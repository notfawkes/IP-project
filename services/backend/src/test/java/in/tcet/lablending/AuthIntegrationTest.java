package in.tcet.lablending;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.tcet.lablending.auth.dto.LoginRequest;
import in.tcet.lablending.auth.dto.RegisterRequest;
import in.tcet.lablending.user.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should reject registration with non-institutional email domain")
    void shouldRejectNonInstitutionalEmail() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .fullName("External User")
                .email("user@gmail.com")
                .password("Password123!")
                .role(Role.STUDENT)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("Should reject lookalike email domain such as tcetmumbai.org.fake.com")
    void shouldRejectLookalikeEmailDomain() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .fullName("Sneaky User")
                .email("user@tcetmumbai.org.attacker.com")
                .password("Password123!")
                .role(Role.STUDENT)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should register and login valid TCET student with @tcetmumbai.org email")
    void shouldRegisterAndLoginValidStudent() throws Exception {
        String email = "rahul.sharma@tcetmumbai.org";
        RegisterRequest regReq = RegisterRequest.builder()
                .fullName("Rahul Sharma")
                .email(email)
                .password("StrongPass123!")
                .studyingYear("TE")
                .role(Role.STUDENT)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value(email))
                .andExpect(jsonPath("$.user.role").value("STUDENT"));

        // Login with correct credentials
        LoginRequest loginReq = LoginRequest.builder()
                .email(email)
                .password("StrongPass123!")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        // Student should NOT be able to access admin overview endpoint (403 Forbidden)
        mockMvc.perform(get("/api/v1/admin/dashboard/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should reject login with invalid password")
    void shouldRejectLoginWithWrongPassword() throws Exception {
        LoginRequest loginReq = LoginRequest.builder()
                .email("admin@tcetmumbai.org")
                .password("WrongPassword123!")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Default administrator can login and access administrative overview")
    void defaultAdminCanAccessAdminEndpoint() throws Exception {
        LoginRequest loginReq = LoginRequest.builder()
                .email("admin@tcetmumbai.org")
                .password("Admin@TCET2026!")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        mockMvc.perform(get("/api/v1/admin/dashboard/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalInventory").exists())
                .andExpect(jsonPath("$.availableUnits").exists());
    }
}
