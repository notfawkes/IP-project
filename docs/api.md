# REST API Specification (`/api/v1`)

All endpoints use standard JSON payloads and responses with consistent status codes and error formats.

## Standard Error Response Format

```json
{
  "timestamp": "2026-10-25T11:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for request object",
  "path": "/api/v1/requests",
  "details": [
    {
      "field": "requestedQuantity",
      "issue": "Requested quantity exceeds available stock of 3 units"
    }
  ]
}
```

## 1. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/register`
- **Access**: Public (restricted to `@tcetmumbai.org` domain).
- **Request Body**:
```json
{
  "fullName": "Student Name",
  "email": "student.name@tcetmumbai.org",
  "password": "StrongPassword123!",
  "departmentId": 1,
  "studyingYear": "TE",
  "role": "STUDENT"
}
```
- **Response**: `201 Created` with UserDTO and JWT token.

### `POST /api/v1/auth/login`
- **Access**: Public.
- **Request Body**:
```json
{
  "email": "student.name@tcetmumbai.org",
  "password": "StrongPassword123!"
}
```
- **Response**: `200 OK` with AuthResponseDTO (token, user details, role).

### `GET /api/v1/auth/me`
- **Access**: Authenticated (`STUDENT`, `FACULTY`, `ADMIN`).
- **Response**: `200 OK` with current user profile.

### `POST /api/v1/auth/logout`
- **Access**: Authenticated.
- **Response**: `200 OK`.

---

## 2. Departments & Rooms (`/api/v1/departments`, `/api/v1/rooms`)

### `GET /api/v1/departments`
- **Access**: Authenticated.
- **Response**: List of active departments with room counts.

### `GET /api/v1/departments/{departmentId}/rooms`
- **Access**: Authenticated.
- **Response**: List of rooms belonging to department.

### `POST /api/v1/departments/{departmentId}/rooms`
- **Access**: `ADMIN` only.
- **Request Body**:
```json
{
  "roomNumber": "415",
  "roomName": "Embedded Systems Laboratory",
  "labType": "HARDWARE"
}
```
- **Response**: `201 Created` with RoomDTO.

### `GET /api/v1/rooms/{roomId}`
- **Access**: Authenticated.
- **Response**: Room details, primary photo URL, equipment summary.

### `PATCH /api/v1/rooms/{roomId}`
- **Access**: `ADMIN` only.
- **Response**: `200 OK` with updated RoomDTO.

---

## 3. Equipment & Inventory (`/api/v1/equipment`, `/api/v1/rooms/{roomId}/equipment`)

### `GET /api/v1/rooms/{roomId}/equipment`
- **Access**: Authenticated.
- **Query Params**: `status` (`WORKING`, `RENTED_OUT`, `NOT_WORKING`), `search`, `category`.
- **Response**: List of equipment cards for room Kanban board.

### `GET /api/v1/equipment/{equipmentId}`
- **Access**: Authenticated.
- **Response**: Detailed equipment specifications, availability, and active loans.

### `POST /api/v1/rooms/{roomId}/equipment`
- **Access**: `ADMIN` only.
- **Request Body**:
```json
{
  "name": "Digital Storage Oscilloscope 100MHz",
  "category": "OSCILLOSCOPE",
  "description": "Rigol DS1054Z 4-Channel Digital Oscilloscope",
  "modelNumber": "DS1054Z",
  "departmentId": 1,
  "trackingMode": "QUANTITY",
  "totalQuantity": 10,
  "condition": "EXCELLENT"
}
```
- **Response**: `201 Created` with EquipmentDTO.

### `PATCH /api/v1/equipment/{equipmentId}`
- **Access**: `ADMIN` only.
- **Response**: `200 OK`.

### `GET /api/v1/equipment/{equipmentId}/availability`
- **Access**: Authenticated.
- **Response**: Authoritative stock availability breakdown.

---

## 4. Requests & Rentals (`/api/v1/requests`, `/api/v1/rentals`, `/api/v1/returns`)

### `POST /api/v1/requests`
- **Access**: `STUDENT`, `FACULTY`.
- **Request Body**:
```json
{
  "equipmentId": 5,
  "requestedQuantity": 2,
  "startTime": "2026-10-26T09:00:00Z",
  "endTime": "2026-10-26T17:00:00Z",
  "purpose": "Final Year Capstone Project Testing"
}
```
- **Response**: `201 Created` with RentalRequestDTO.

### `GET /api/v1/requests/me`
- **Access**: Authenticated user's requests.

### `GET /api/v1/admin/requests`
- **Access**: `ADMIN` only. Filterable by status (`PENDING`, `APPROVED`, etc.).

### `POST /api/v1/admin/requests/{requestId}/approve`
- **Access**: `ADMIN` only.
- **Response**: `200 OK`. Generates rental allocation and reserves stock atomically.

### `POST /api/v1/admin/requests/{requestId}/reject`
- **Access**: `ADMIN` only.
- **Request Body**: `{"reason": "Insufficient stock for batch size"}`.

### `POST /api/v1/admin/rentals/{rentalId}/issue`
- **Access**: `ADMIN` only. Confirms physical handover of equipment.

### `GET /api/v1/rentals/me`
- **Access**: Authenticated borrower's active and historical loans.

### `POST /api/v1/rentals/{rentalId}/return`
- **Access**: `ADMIN` (or user initiate with admin verification).
- **Request Body**:
```json
{
  "returnCondition": "WORKING",
  "notes": "Returned with all probes intact"
}
```

### `GET /api/v1/returns/me`
- **Access**: History of returned equipment loans.

---

## 5. Damage Reports & Maintenance (`/api/v1/damage-reports`, `/api/v1/admin/maintenance`)

### `POST /api/v1/damage-reports`
- **Access**: Authenticated (`STUDENT`, `FACULTY`, `ADMIN`).
- **Request Body**:
```json
{
  "equipmentId": 5,
  "rentalId": 12,
  "category": "ELECTRICAL",
  "description": "Channel 1 input BNC connector loose and noisy"
}
```

### `GET /api/v1/admin/damage-reports`
- **Access**: `ADMIN` only.

### `PATCH /api/v1/admin/damage-reports/{reportId}`
- **Access**: `ADMIN` only. Transitions state to `SENT_TO_MAINTENANCE` or `RESOLVED`.

---

## 6. Laboratory Photos (`/api/v1/rooms/{roomId}/photos`, `/api/v1/admin/photos`)

### `POST /api/v1/admin/rooms/{roomId}/photos`
- **Access**: `ADMIN` only.
- **Content-Type**: `multipart/form-data`
  - `file`: Image binary (JPEG, PNG, WebP)
  - `caption`: Description or alt text
  - `isPrimary`: Boolean
- **Response**: `201 Created` with persisted photo metadata and public URL.

### `GET /api/v1/rooms/{roomId}/photos`
- **Access**: Authenticated.
- **Response**: List of photo metadata with direct CDN public URLs.

### `DELETE /api/v1/admin/photos/{photoId}`
- **Access**: `ADMIN` only. Deletes object from Neon Object Storage and database record.

---

## 7. Admin Overview (`/api/v1/admin/dashboard/summary`)

### `GET /api/v1/admin/dashboard/summary`
- **Access**: `ADMIN` only.
- **Response**: Real-time aggregated metrics:
```json
{
  "totalInventory": 184,
  "availableUnits": 142,
  "rentedUnits": 30,
  "nonWorkingUnits": 12,
  "pendingRequests": 5,
  "overdueRentals": 2
}
```
