# Module Responsibilities, Imports, and Dependencies

This document details the architectural boundaries, package structure, and dependencies across both the Next.js frontend and Spring Boot backend.

## 1. Monorepo Organization

```text
/Users/bala/IP-project/
├── apps/
│   └── frontend/              # Next.js App Router (TypeScript, Tailwind, Lucide)
├── services/
│   └── backend/               # Spring Boot 3.3+ (Java 21, Maven, Flyway, Neon)
├── docs/                      # Architectural, API, and Schema specifications
├── assets/                    # Official college logo and campus photography
├── neon.ts                    # Neon Infrastructure-as-Code service declarations
├── .env.example               # Clean environment variables specification
└── package.json               # Root monorepo orchestration scripts
```

---

## 2. Spring Boot Backend Dependencies (`services/backend/pom.xml`)

| Artifact / Library | Version / Source | Purpose |
|---|---|---|
| `spring-boot-starter-web` | 3.3.5 | REST controllers, JSON serialization (Jackson), embedded Tomcat |
| `spring-boot-starter-security` | 3.3.5 | Security filter chain, authentication manager, method authorization |
| `spring-boot-starter-data-jpa` | 3.3.5 | Hibernate ORM, Spring Data JPA repositories, pessimistic row locking |
| `spring-boot-starter-validation` | 3.3.5 | Bean validation (`@Valid`, `@NotNull`, `@Size`, email regex) |
| `postgresql` | runtime | PostgreSQL JDBC driver configured for Neon database connection |
| `flyway-core`, `flyway-database-postgresql` | 10.x | Idempotent, versioned database schema migrations |
| `jjwt-api`, `jjwt-impl`, `jjwt-jackson` | 0.12.6 | Cryptographic signing and verification of JSON Web Tokens |
| `software.amazon.awssdk:s3` | 2.29.x | AWS Java SDK v2 for Neon Object Storage (S3-compatible endpoint) |
| `springdoc-openapi-starter-webmvc-ui` | 2.6.0 | Automated OpenAPI 3.0 generation and interactive Swagger UI |
| `lombok` | 1.18.x | Boilerplate reduction (getters, setters, builders, constructors) |
| `spring-boot-starter-test` | 3.3.5 | JUnit 5 Jupiter, Mockito, Spring Test Context |

### Backend Package Responsibility Map (`in.tcet.lablending.*`)

- `config`: CORS policy, OpenAPI/Swagger configuration, AWS S3 Client bean configuration.
- `security`: `JwtAuthenticationFilter`, `JwtService`, `SecurityConfig`, `UserDetailsServiceImpl`.
- `auth`: `AuthController`, `AuthService`, registration/login request & response DTOs.
- `department`: Department entity, repository, service, and controller.
- `room`: Room entity, repository, service, controller (scopes rooms to departments; handles room 413).
- `equipment`: Equipment entity, asset entity, availability calculation service, Kanban query endpoints.
- `request`: Rental request lifecycle, admin approval/rejection with concurrency locking.
- `rental`: Active rental tracking, issue handover, return processing, overdue calculation.
- `damage`: Damage report submission, category triage, maintenance dispatch.
- `photo`: `PhotoController`, `StorageService` (Neon S3 client integration, file validation).
- `audit`: `AuditLogService` logging administrative and mutation events.
- `exception`: GlobalExceptionHandler translating domain exceptions into standard error payloads.

---

## 3. Next.js Frontend Dependencies (`apps/frontend/package.json`)

| Package | Purpose |
|---|---|
| `next` (14.2+ or 15) | React framework with App Router, server/client components, optimized bundling |
| `react`, `react-dom` | Core UI engine |
| `typescript`, `@types/react` | Type safety across API contracts and UI states |
| `tailwindcss`, `postcss`, `autoprefixer` | Utility-first styling with TCET branding tokens |
| `lucide-react` | Clean, accessible technical and navigational iconography |
| `react-hook-form` | Performant form state management |
| `@hookform/resolvers`, `zod` | Declarative schema validation (institutional email, passwords, loan dates) |

### Frontend Directory Structure (`apps/frontend/src/`)

- `app/`: Next.js App Router pages:
  - `page.tsx`: Premium landing page with hero, How It Works, and TCET branding.
  - `login/page.tsx`: Split-screen authentication page matching reference composition.
  - `dashboard/page.tsx`: Student & faculty Kanban dashboard with room selector.
  - `admin/page.tsx`: Administrator dashboard with photo management, room/inventory CRUD.
- `components/`:
  - `sidebar/`: Persistent collapsable sidebar with department/room accordion.
  - `kanban/`: 3-column Kanban board (`Working`, `Rented Out`, `Not Working`).
  - `modal/`: Fixed-size accessible wizard modal with 50% opacity backdrop.
  - `photo/`: Photo upload and live device camera capture wizard.
  - `ui/`: Buttons, badges, input fields, skeletons, toast notifications.
- `services/`: Strongly-typed API client modules (`authApi`, `departmentApi`, `equipmentApi`, `requestApi`, `photoApi`).
- `types/`: TypeScript interfaces mirroring backend DTOs.
