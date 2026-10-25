package in.tcet.lablending.auth;

import in.tcet.lablending.audit.AuditLogService;
import in.tcet.lablending.auth.dto.AuthResponse;
import in.tcet.lablending.auth.dto.LoginRequest;
import in.tcet.lablending.auth.dto.RegisterRequest;
import in.tcet.lablending.auth.dto.UserDTO;
import in.tcet.lablending.department.Department;
import in.tcet.lablending.department.DepartmentRepository;
import in.tcet.lablending.exception.BadRequestException;
import in.tcet.lablending.exception.ConflictException;
import in.tcet.lablending.exception.ResourceNotFoundException;
import in.tcet.lablending.security.CustomUserDetails;
import in.tcet.lablending.security.JwtService;
import in.tcet.lablending.user.Role;
import in.tcet.lablending.user.User;
import in.tcet.lablending.user.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final Pattern INSTITUTIONAL_EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@tcetmumbai\\.org$");

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;

    @PostConstruct
    public void initDefaultAdmin() {
        try {
            if (!userRepository.existsByEmail("admin@tcetmumbai.org")) {
                Department compDept = departmentRepository.findByCode("COMP").orElse(null);
                User admin = User.builder()
                        .fullName("TCET Laboratory Administrator")
                        .email("admin@tcetmumbai.org")
                        .passwordHash(passwordEncoder.encode("Admin@TCET2026!"))
                        .role(Role.ADMIN)
                        .department(compDept)
                        .studyingYear("FACULTY")
                        .active(true)
                        .build();
                userRepository.save(admin);
                log.info("Initialized default administrator account: admin@tcetmumbai.org");
            }
        } catch (Exception e) {
            log.warn("Could not seed default admin: {}", e.getMessage());
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        validateInstitutionalDomain(normalizedEmail);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("An account with email " + normalizedEmail + " already exists.");
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .department(department)
                .studyingYear(request.getStudyingYear())
                .role(request.getRole())
                .active(true)
                .build();

        User saved = userRepository.save(user);

        auditLogService.log(
                saved.getId(),
                saved.getEmail(),
                "REGISTER",
                "USER",
                String.valueOf(saved.getId()),
                "User registered with role: " + saved.getRole(),
                null
        );

        CustomUserDetails userDetails = new CustomUserDetails(saved);
        String token = jwtService.generateToken(userDetails, saved.getId(), saved.getFullName(), saved.getRole());

        return AuthResponse.builder()
                .token(token)
                .user(mapToDTO(saved))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        validateInstitutionalDomain(normalizedEmail);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            String token = jwtService.generateToken(userDetails, user.getId(), user.getFullName(), user.getRole());

            auditLogService.log(
                    user.getId(),
                    user.getEmail(),
                    "LOGIN",
                    "USER",
                    String.valueOf(user.getId()),
                    "Successful login",
                    null
            );

            return AuthResponse.builder()
                    .token(token)
                    .user(mapToDTO(user))
                    .build();
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid institutional email or password");
        }
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new BadRequestException("No authenticated user session found");
        }
        return userDetails.getUser();
    }

    public UserDTO getCurrentUserDTO() {
        return mapToDTO(getCurrentUser());
    }

    private void validateInstitutionalDomain(String email) {
        if (email == null || !INSTITUTIONAL_EMAIL_PATTERN.matcher(email).matches()) {
            throw new BadRequestException("Access is restricted to official @tcetmumbai.org institutional email addresses.");
        }
    }

    public UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .departmentCode(user.getDepartment() != null ? user.getDepartment().getCode() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .studyingYear(user.getStudyingYear())
                .role(user.getRole())
                .active(user.isActive())
                .build();
    }
}
