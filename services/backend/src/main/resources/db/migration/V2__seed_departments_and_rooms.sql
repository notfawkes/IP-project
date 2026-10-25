-- ==============================================================================
-- V2__seed_departments_and_rooms.sql
-- TCET Department and Room Seed Data (Idempotent)
-- ==============================================================================

-- 1. Insert Official Departments
INSERT INTO departments (code, name, active) VALUES
    ('COMP', 'Computer Engineering', TRUE),
    ('IT', 'Information Technology', TRUE),
    ('AI_ML', 'Artificial Intelligence & Machine Learning', TRUE),
    ('AI_DS', 'Artificial Intelligence & Data Science', TRUE),
    ('CYBER', 'Cyber Security', TRUE),
    ('IOT', 'Internet of Things (IoT)', TRUE),
    ('MME', 'Mechanical & Mechatronics Engineering', TRUE),
    ('ETC', 'Electronics & Telecommunication Engineering', TRUE),
    ('ECS', 'Electronics & Computer Science', TRUE),
    ('CIVIL', 'Civil Engineering', TRUE),
    ('FIRST_YEAR', 'First-Year Common Labs', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Confirmed Department Rooms
-- COMP: 304, 305, 306, 324, 325, 326
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active)
SELECT d.id, r.room_number, r.room_name, r.lab_type, TRUE, TRUE
FROM departments d
CROSS JOIN (VALUES
    ('304', 'Programming Laboratory I', 'SOFTWARE'),
    ('305', 'Programming Laboratory II', 'SOFTWARE'),
    ('306', 'Database & Algorithms Lab', 'SOFTWARE'),
    ('324', 'Computer Networks Lab', 'NETWORK'),
    ('325', 'Operating Systems Lab', 'SOFTWARE'),
    ('326', 'Cloud Computing Lab', 'SOFTWARE')
) AS r(room_number, room_name, lab_type)
WHERE d.code = 'COMP'
ON CONFLICT (department_id, room_number) DO NOTHING;

-- IT: 203, 204, 205, 220, 221
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active)
SELECT d.id, r.room_number, r.room_name, r.lab_type, TRUE, TRUE
FROM departments d
CROSS JOIN (VALUES
    ('203', 'Web Development Lab', 'SOFTWARE'),
    ('204', 'Software Engineering Lab', 'SOFTWARE'),
    ('205', 'Multimedia & Graphics Lab', 'SOFTWARE'),
    ('220', 'Information Security Lab', 'NETWORK'),
    ('221', 'Mobile Applications Lab', 'SOFTWARE')
) AS r(room_number, room_name, lab_type)
WHERE d.code = 'IT'
ON CONFLICT (department_id, room_number) DO NOTHING;

-- AI&ML: 307, 308, 413
-- Note: Room 413 is flagged with is_confirmed = FALSE for administrative confirmation
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active)
SELECT d.id, r.room_number, r.room_name, r.lab_type, r.is_confirmed, TRUE
FROM departments d
CROSS JOIN (VALUES
    ('307', 'Machine Learning Lab', 'AI_COMPUTE', TRUE),
    ('308', 'Deep Learning Research Lab', 'AI_COMPUTE', TRUE),
    ('413', 'Advanced Analytics Lab (Needs Admin Confirmation)', 'AI_COMPUTE', FALSE)
) AS r(room_number, room_name, lab_type, is_confirmed)
WHERE d.code = 'AI_ML'
ON CONFLICT (department_id, room_number) DO NOTHING;

-- AI&DS: 309, 310, 312, 316, 413
-- Note: Room 413 is preserved here too with is_confirmed = FALSE for administrative confirmation
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active)
SELECT d.id, r.room_number, r.room_name, r.lab_type, r.is_confirmed, TRUE
FROM departments d
CROSS JOIN (VALUES
    ('309', 'Data Science Studio', 'DATA_ANALYTICS', TRUE),
    ('310', 'Big Data Engineering Lab', 'DATA_ANALYTICS', TRUE),
    ('312', 'Computer Vision Lab', 'AI_COMPUTE', TRUE),
    ('316', 'Natural Language Processing Lab', 'AI_COMPUTE', TRUE),
    ('413', 'Advanced Analytics Lab (Needs Admin Confirmation)', 'DATA_ANALYTICS', FALSE)
) AS r(room_number, room_name, lab_type, is_confirmed)
WHERE d.code = 'AI_DS'
ON CONFLICT (department_id, room_number) DO NOTHING;

-- Cyber Security: 222, 223, 317
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active)
SELECT d.id, r.room_number, r.room_name, r.lab_type, TRUE, TRUE
FROM departments d
CROSS JOIN (VALUES
    ('222', 'Ethical Hacking Lab', 'SECURITY'),
    ('223', 'Digital Forensics Lab', 'SECURITY'),
    ('317', 'Cyber Threat Intelligence Lab', 'SECURITY')
) AS r(room_number, room_name, lab_type)
WHERE d.code = 'CYBER'
ON CONFLICT (department_id, room_number) DO NOTHING;

-- IoT: 213, 529, 601
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active)
SELECT d.id, r.room_number, r.room_name, r.lab_type, TRUE, TRUE
FROM departments d
CROSS JOIN (VALUES
    ('213', 'Sensors & Microcontrollers Lab', 'HARDWARE'),
    ('529', 'Embedded Systems & Automation Lab', 'HARDWARE'),
    ('601', 'Smart Devices & Robotics Lab', 'ROBOTICS')
) AS r(room_number, room_name, lab_type)
WHERE d.code = 'IOT'
ON CONFLICT (department_id, room_number) DO NOTHING;

-- MME: 319, 321
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active)
SELECT d.id, r.room_number, r.room_name, r.lab_type, TRUE, TRUE
FROM departments d
CROSS JOIN (VALUES
    ('319', 'Mechatronics & PLC Lab', 'HARDWARE'),
    ('321', 'Robotics & Control Systems Lab', 'ROBOTICS')
) AS r(room_number, room_name, lab_type)
WHERE d.code = 'MME'
ON CONFLICT (department_id, room_number) DO NOTHING;

-- E&TC, E&CS, Civil, First-year common labs intentionally have NO confirmed room records.
-- Administrators can use the authorized "Add Room" workflow to create rooms for them.
