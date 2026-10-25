export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN';

export type TrackingMode = 'QUANTITY' | 'INDIVIDUAL';
export type EquipmentCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED';
export type MaintenanceStatus = 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'RETIRED';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type RentalStatus = 'ACTIVE' | 'OVERDUE' | 'RETURNED';
export type ReturnCondition = 'WORKING' | 'DAMAGED' | 'REQUIRES_MAINTENANCE';
export type DamageCategory = 'PHYSICAL' | 'ELECTRICAL' | 'MISSING_PARTS' | 'MALFUNCTION';
export type DamageStatus = 'OPEN' | 'INVESTIGATING' | 'SENT_TO_MAINTENANCE' | 'RESOLVED';

export interface User {
  id: number;
  fullName: string;
  email: string;
  departmentId?: number;
  departmentCode?: string;
  departmentName?: string;
  studyingYear?: string;
  role: Role;
  active: boolean;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface Room {
  id: number;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  roomNumber: string;
  roomName?: string;
  labType?: string;
  isConfirmed: boolean;
  active: boolean;
  primaryPhotoUrl?: string;
  photoCount: number;
  equipmentCount: number;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  active: boolean;
  roomCount: number;
  rooms: Room[];
}

export interface Equipment {
  id: number;
  name: string;
  category: string;
  description?: string;
  modelNumber?: string;
  departmentId: number;
  departmentCode: string;
  roomId: number;
  roomNumber: string;
  roomName?: string;
  trackingMode: TrackingMode;
  totalQuantity: number;
  availableQuantity: number;
  rentedQuantity: number;
  condition: EquipmentCondition;
  maintenanceStatus: MaintenanceStatus;
  expectedReturnDate?: string;
  createdAt: string;
}

export interface EquipmentAvailability {
  equipmentId: number;
  equipmentName: string;
  totalQuantity: number;
  availableQuantity: number;
  rentedQuantity: number;
  maintenanceQuantity: number;
  isAvailableForRequest: boolean;
}

export interface RentalRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
  equipmentId: number;
  equipmentName: string;
  equipmentModel?: string;
  roomId: number;
  roomNumber: string;
  departmentCode: string;
  assetId?: string;
  requestedQuantity: number;
  startTime: string;
  endTime: string;
  purpose: string;
  status: RequestStatus;
  decisionByName?: string;
  decisionTime?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Rental {
  id: number;
  requestId: number;
  borrowerId: number;
  borrowerName: string;
  borrowerEmail: string;
  equipmentId: number;
  equipmentName: string;
  equipmentModel?: string;
  roomId: number;
  roomNumber: string;
  departmentCode: string;
  assetId?: string;
  quantityIssued: number;
  issuedByName?: string;
  issuedAt: string;
  expectedReturnAt: string;
  actualReturnAt?: string;
  status: RentalStatus;
  isOverdue: boolean;
}

export interface ReturnRecord {
  id: number;
  rentalId: number;
  equipmentName: string;
  borrowerName: string;
  recordedByName: string;
  returnedAt: string;
  returnCondition: ReturnCondition;
  notes?: string;
}

export interface DamageReport {
  id: number;
  equipmentId: number;
  equipmentName: string;
  modelNumber?: string;
  roomId: number;
  roomNumber: string;
  assetId?: string;
  rentalId?: number;
  reporterId: number;
  reporterName: string;
  reporterEmail: string;
  category: DamageCategory;
  description: string;
  photoUrl?: string;
  status: DamageStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface Photo {
  id: number;
  roomId: number;
  roomNumber: string;
  departmentId: number;
  departmentCode: string;
  storageKey: string;
  publicUrl: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  caption?: string;
  isPrimary: boolean;
  uploadedById: number;
  uploadedByName: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalInventory: number;
  availableUnits: number;
  rentedUnits: number;
  nonWorkingUnits: number;
  pendingRequests: number;
  overdueRentals: number;
  totalRooms: number;
  unconfirmedRooms: number;
}

export interface KanbanData {
  working: Equipment[];
  rentedOut: Equipment[];
  notWorking: Equipment[];
}
