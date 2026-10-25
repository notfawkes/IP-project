-- ==============================================================================
-- V1__init_schema.sql
-- TCET Lab Inventory & Equipment Lending Platform Schema Initialization
-- ==============================================================================

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Rooms Table
-- Scoped to department; unique constraint on (department_id, room_number)
-- allows room 413 to exist in both AI&ML and AI&DS without conflicts.
CREATE TABLE IF NOT EXISTS rooms (
    id BIGSERIAL PRIMARY KEY,
    department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    room_number VARCHAR(50) NOT NULL,
    room_name VARCHAR(150),
    lab_type VARCHAR(100),
    is_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dept_room UNIQUE (department_id, room_number)
);

CREATE INDEX IF NOT EXISTS idx_rooms_department ON rooms(department_id);
CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms(room_number);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    studying_year VARCHAR(30),
    role VARCHAR(30) NOT NULL, -- STUDENT, FACULTY, ADMIN
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 4. Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    model_number VARCHAR(100),
    department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    tracking_mode VARCHAR(30) NOT NULL DEFAULT 'QUANTITY', -- QUANTITY or INDIVIDUAL
    total_quantity INT NOT NULL DEFAULT 1,
    available_quantity INT NOT NULL DEFAULT 1,
    equipment_condition VARCHAR(50) NOT NULL DEFAULT 'EXCELLENT', -- EXCELLENT, GOOD, FAIR, DAMAGED
    maintenance_status VARCHAR(50) NOT NULL DEFAULT 'OPERATIONAL', -- OPERATIONAL, UNDER_MAINTENANCE, RETIRED
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_qty_non_negative CHECK (total_quantity >= 0 AND available_quantity >= 0),
    CONSTRAINT chk_avail_lte_total CHECK (available_quantity <= total_quantity)
);

CREATE INDEX IF NOT EXISTS idx_equipment_room ON equipment(room_id);
CREATE INDEX IF NOT EXISTS idx_equipment_dept ON equipment(department_id);
CREATE INDEX IF NOT EXISTS idx_equipment_condition ON equipment(equipment_condition);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance ON equipment(maintenance_status);

-- 5. Individually Tracked Physical Assets
CREATE TABLE IF NOT EXISTS equipment_assets (
    id VARCHAR(100) PRIMARY KEY, -- Unique asset barcode or tag
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    current_condition VARCHAR(50) NOT NULL DEFAULT 'EXCELLENT',
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, RENTED, UNDER_MAINTENANCE, RETIRED
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assets_equipment ON equipment_assets(equipment_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON equipment_assets(status);

-- 6. Rental Requests Table
CREATE TABLE IF NOT EXISTS rental_requests (
    id BIGSERIAL PRIMARY KEY,
    requester_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    asset_id VARCHAR(100) REFERENCES equipment_assets(id) ON DELETE SET NULL,
    requested_quantity INT NOT NULL DEFAULT 1,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CANCELLED
    decision_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    decision_time TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_req_qty_positive CHECK (requested_quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_requests_requester ON rental_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_equipment ON rental_requests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON rental_requests(status);

-- 7. Active and Historical Rentals
CREATE TABLE IF NOT EXISTS rentals (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES rental_requests(id) ON DELETE RESTRICT,
    borrower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    asset_id VARCHAR(100) REFERENCES equipment_assets(id) ON DELETE SET NULL,
    quantity_issued INT NOT NULL DEFAULT 1,
    issued_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_return_at TIMESTAMPTZ NOT NULL,
    actual_return_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, OVERDUE, RETURNED
    CONSTRAINT chk_issue_qty_positive CHECK (quantity_issued > 0)
);

CREATE INDEX IF NOT EXISTS idx_rentals_borrower ON rentals(borrower_id);
CREATE INDEX IF NOT EXISTS idx_rentals_equipment ON rentals(equipment_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);

-- 8. Return Records
CREATE TABLE IF NOT EXISTS returns (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rentals(id) ON DELETE RESTRICT,
    recorded_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    returned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    return_condition VARCHAR(50) NOT NULL DEFAULT 'WORKING', -- WORKING, DAMAGED, REQUIRES_MAINTENANCE
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_returns_rental ON returns(rental_id);

-- 9. Damage Reports
CREATE TABLE IF NOT EXISTS damage_reports (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    asset_id VARCHAR(100) REFERENCES equipment_assets(id) ON DELETE SET NULL,
    rental_id BIGINT REFERENCES rentals(id) ON DELETE SET NULL,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category VARCHAR(100) NOT NULL, -- PHYSICAL, ELECTRICAL, MISSING_PARTS, MALFUNCTION
    description TEXT NOT NULL,
    photo_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, INVESTIGATING, SENT_TO_MAINTENANCE, RESOLVED
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_damage_equipment ON damage_reports(equipment_id);
CREATE INDEX IF NOT EXISTS idx_damage_status ON damage_reports(status);

-- 10. Maintenance Records
CREATE TABLE IF NOT EXISTS maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    asset_id VARCHAR(100) REFERENCES equipment_assets(id) ON DELETE SET NULL,
    damage_report_id BIGINT REFERENCES damage_reports(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, COMPLETED
    admin_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_maint_equipment ON maintenance_records(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maint_status ON maintenance_records(status);

-- 11. Laboratory Photos (Neon Object Storage bucket: lab-photos)
CREATE TABLE IF NOT EXISTS lab_photos (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    storage_key VARCHAR(300) NOT NULL UNIQUE,
    public_url VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    caption VARCHAR(300),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photos_room ON lab_photos(room_id);
CREATE INDEX IF NOT EXISTS idx_photos_dept ON lab_photos(department_id);

-- 12. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id BIGINT,
    actor_email VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
