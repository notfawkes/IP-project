# TCET Lab Inventory & Equipment Lending Platform

A modern, full-stack, enterprise-grade laboratory equipment lending and inventory management monorepo for **Thakur College of Engineering and Technology (TCET), Mumbai**.

Built with **Next.js App Router (TypeScript + Tailwind CSS)** on the frontend and **Spring Boot 3.3 (Java 21 + Maven)** on the backend, integrated with **Neon PostgreSQL** and **Neon Object Storage (`lab-photos`)**.

---

## Prerequisites

- **Java Development Kit (JDK)**: Java 21 or later (`java -version`)
- **Apache Maven**: 3.9+ (`mvn -version`)
- **Node.js**: v20+ / v22+ (`node -v`)
- **NPM**: v10+ (`npm -v`)
- **Neon CLI**: `npm i -g neon@latest` (authenticated via `neon login`)

---

## Monorepo Structure

```text
tcet-lab-lending/
├── apps/
│   └── frontend/              # Next.js 14/15 App Router Frontend
│       ├── src/
│       │   ├── app/           # App routes: /, /login, /dashboard, /admin
│       │   ├── components/    # Reusable UI, Kanban, Sidebar, Modals, Camera
│       │   ├── services/      # Typed API client modules for REST endpoints
│       │   ├── types/         # Domain TypeScript models matching DTOs
│       │   └── styles/        # Global Tailwind CSS and TCET tokens
│       └── package.json
├── services/
│   └── backend/               # Spring Boot 3.3.5 Backend
│       ├── src/
│       │   ├── main/java/in/tcet/lablending/  # Spring Boot controllers, services, entities
│       │   └── main/resources/
│       │       ├── db/migration/             # Flyway SQL migrations (V1, V2)
│       │       └── application.yml           # Database, S3 & security settings
│       ├── src/test/java/                    # JUnit 5 integration & unit tests
│       └── pom.xml
├── docs/                      # Architecture, API, Schema & Dependency specs
├── assets/reference/          # Official TCET logo & campus photography
├── neon.ts                    # Neon Infrastructure-as-Code bucket configuration
├── .env.example               # Template environment configuration
└── package.json               # Root monorepo orchestration scripts
```

---

## Neon Project & Object Storage Setup

The project is linked to the existing Neon project and production branch:
- **Org ID**: `org-plain-fog-38124580`
- **Project ID**: `sparkling-brook-72692787`
- **Branch**: `production`
- **Bucket**: `lab-photos` (configured with `public_read` policy in `neon.ts`)

To inspect or re-deploy services from the monorepo root:
```bash
# Preview Neon resources
neon config plan

# Deploy bucket policy and update .env.local
neon deploy

# Pull fresh credentials into .env.local
neon env pull
```

---

## Environment Configuration

Copy `.env.example` to `.env.local` or ensure the backend has the required environment variables:
```bash
cp .env.example .env.local
```

Key variables:
- `DATABASE_URL`: Neon PostgreSQL pooled connection URI
- `AWS_ACCESS_KEY_ID`: Neon storage access key
- `AWS_SECRET_ACCESS_KEY`: Neon storage secret access key
- `AWS_ENDPOINT_URL_S3`: Neon S3 storage endpoint URL
- `AWS_REGION`: `us-east-2`
- `STORAGE_BUCKET_NAME`: `lab-photos`
- `JWT_SECRET`: 256-bit secret key for JWT signing

---

## Quickstart (Development)

Run both frontend and backend using root commands:

### 1. Start the Spring Boot Backend (Port 8080)
```bash
# From repository root
npm run dev:backend
# Or directly inside services/backend
cd services/backend && mvn spring-boot:run
```
Flyway automatically applies database migrations (`V1__init_schema.sql` and `V2__seed_departments_and_rooms.sql`) on startup.

### 2. Start the Next.js Frontend (Port 3000)
```bash
# From repository root
npm run dev:frontend
# Or directly inside apps/frontend
cd apps/frontend && npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the landing page.

---

## Build and Testing

### Build both applications:
```bash
# Production frontend build
npm run build

# Spring Boot backend build
npm run build:backend
```

### Run automated tests:
```bash
# Run backend JUnit test suite
npm run test:backend

# Run frontend tests
npm run test:frontend
```

---

## API Documentation

When the Spring Boot backend is running, access the interactive Swagger UI and OpenAPI documentation at:
- **Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## Production Deployment Guidance

1. **Frontend**: Deploy on Vercel or containerized Node.js. Configure `NEXT_PUBLIC_API_BASE_URL` pointing to the public backend domain.
2. **Backend**: Package the executable JAR (`mvn clean package -DskipTests`) and deploy to a container runtime or cloud VM with Java 21+. Pass `DATABASE_URL`, `AWS_*` variables via secure secrets management.
3. **CORS**: Set `CORS_ALLOWED_ORIGINS` in production to the specific production frontend domain.
