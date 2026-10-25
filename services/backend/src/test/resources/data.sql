-- Test Seed Data for H2
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
    ('FIRST_YEAR', 'First-Year Common Labs', TRUE);

-- COMP Rooms: 304, 305, 306, 324, 325, 326
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '304', 'Programming Lab I', 'SOFTWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'COMP';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '305', 'Programming Lab II', 'SOFTWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'COMP';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '306', 'Database Lab', 'SOFTWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'COMP';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '324', 'Networks Lab', 'NETWORK', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'COMP';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '325', 'OS Lab', 'SOFTWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'COMP';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '326', 'Cloud Lab', 'SOFTWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'COMP';

-- IT Rooms: 203, 204, 205, 220, 221
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '203', 'Web Dev Lab', 'SOFTWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'IT';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '204', 'Software Lab', 'SOFTWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'IT';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '205', 'Multimedia Lab', 'SOFTWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'IT';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '220', 'Security Lab', 'NETWORK', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'IT';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '221', 'Mobile Lab', 'SOFTWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'IT';

-- AI_ML Rooms: 307, 308, 413 (is_confirmed = FALSE)
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '307', 'ML Lab', 'AI_COMPUTE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'AI_ML';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '308', 'Deep Learning Lab', 'AI_COMPUTE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'AI_ML';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '413', 'Advanced Analytics Lab', 'AI_COMPUTE', FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'AI_ML';

-- AI_DS Rooms: 309, 310, 312, 316, 413 (is_confirmed = FALSE)
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '309', 'Data Science Studio', 'DATA_ANALYTICS', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'AI_DS';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '310', 'Big Data Lab', 'DATA_ANALYTICS', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'AI_DS';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '312', 'Computer Vision Lab', 'AI_COMPUTE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'AI_DS';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '316', 'NLP Lab', 'AI_COMPUTE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'AI_DS';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '413', 'Advanced Analytics Lab', 'DATA_ANALYTICS', FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'AI_DS';

-- CYBER Rooms: 222, 223, 317
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '222', 'Ethical Hacking Lab', 'SECURITY', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'CYBER';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '223', 'Digital Forensics Lab', 'SECURITY', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'CYBER';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '317', 'Cyber Threat Lab', 'SECURITY', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'CYBER';

-- IOT Rooms: 213, 529, 601
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '213', 'Sensors Lab', 'HARDWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'IOT';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '529', 'Embedded Systems Lab', 'HARDWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'IOT';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '601', 'Smart Devices Lab', 'ROBOTICS', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'IOT';

-- MME Rooms: 319, 321
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '319', 'PLC Lab', 'HARDWARE', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'MME';
INSERT INTO rooms (department_id, room_number, room_name, lab_type, is_confirmed, active, created_at, updated_at)
SELECT d.id, '321', 'Robotics Lab', 'ROBOTICS', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM departments d WHERE d.code = 'MME';
