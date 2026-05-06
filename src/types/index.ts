// src/types/index.ts — Full updated version

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RENTER';
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'isActive' | 'createdAt'>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'RENTER';
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ─── District ────────────────────────────────────────────────────────────────
export interface District {
  id: string;
  name: string;
  region: string;
  createdAt: string;
}

export interface CreateDistrictPayload {
  name: string;
  region?: string;
}

export type UpdateDistrictPayload = Partial<CreateDistrictPayload>;

// ─── Landlord ────────────────────────────────────────────────────────────────
export interface Landlord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  nationalId?: string;
  physicalAddress?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandlordPayload {
  name: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  nationalId?: string;
  physicalAddress?: string;
  notes?: string;
}

export type UpdateLandlordPayload = Partial<CreateLandlordPayload>;

// ─── Property ────────────────────────────────────────────────────────────────
export type PropertyType =
  | 'SINGLE_ROOM'
  | 'DOUBLE_ROOM'
  | 'APARTMENT'
  | 'HOUSE'
  | 'STUDIO'
  | 'HOSTEL';

export type PropertyStatus = 'AVAILABLE' | 'RENTED';
export type FurnishingStatus = 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
export type LeaseTerm = 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL';

export interface PropertyImage {
  id: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: PropertyStatus;
  furnishing?: FurnishingStatus;
  leaseTerm?: LeaseTerm;
  securityDeposit?: number;
  availableFrom?: string;
  floor?: number;
  parkingAvailable: boolean;
  amenities: string[];
  viewCount: number;
  enquiryCount: number;
  landlord: Landlord;
  district: District;
  images: PropertyImage[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreatePropertyPayload {
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  furnishing?: FurnishingStatus;
  leaseTerm?: LeaseTerm;
  securityDeposit?: number;
  availableFrom?: string;
  floor?: number;
  parkingAvailable?: boolean;
  landlordId: string;
  districtId: string;
  amenities?: string[];
}

export type UpdatePropertyPayload = Partial<CreatePropertyPayload>;

export interface PropertyFilters {
  districtId?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface PropertyStats {
  total: number;
  available: number;
  rented: number;
  occupancyRate: number;
  addedThisWeek: number;
  topViewed: Property[];
  topEnquired: Property[];
}

// ─── Hostel Rooms ─────────────────────────────────────────────────────────────
export type HostelRoomType = 'SINGLE' | 'DOUBLE' | 'SHARED';
export type HostelRoomStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';

export interface HostelRoom {
  id: string;
  roomNumber: string;
  type: HostelRoomType;
  price: number;
  status: HostelRoomStatus;
  floor?: number;
  description?: string;
  amenities?: string[];
  property: Property;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHostelRoomPayload {
  roomNumber: string;
  type: HostelRoomType;
  price: number;
  floor?: number;
  description?: string;
  amenities?: string[];
}

export type UpdateHostelRoomPayload = Partial<CreateHostelRoomPayload>;

export interface UpdateRoomStatusPayload {
  status: HostelRoomStatus;
}

export interface HostelRoomStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  occupancyRate: number;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  status: BookingStatus;
  renterName: string;
  renterPhone: string;
  renterEmail?: string;
  moveInDate: string;
  moveOutDate?: string;
  notes?: string;
  adminNotes?: string;
  property: Property;
  hostelRoom?: HostelRoom;
  confirmedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  renterName: string;
  renterPhone: string;
  renterEmail?: string;
  propertyId: string;
  hostelRoomId?: string;
  moveInDate: string;
  moveOutDate?: string;
  notes?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  propertyId?: string;
  page?: number;
  limit?: number;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  thisWeek: number;
}

export interface ConfirmBookingPayload {
  adminNotes?: string;
}

export interface CancelBookingPayload {
  reason?: string;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RESTORE'
  | 'STATUS_CHANGE'
  | 'IMAGE_UPLOAD'
  | 'IMAGE_DELETE'
  | 'LOGIN'
  | 'PASSWORD_CHANGE';

export type AuditEntity =
  | 'PROPERTY'
  | 'LANDLORD'
  | 'USER'
  | 'IMAGE'
  | 'AUTH'
  | 'HOSTEL_ROOM'
  | 'BOOKING'
  | 'DISTRICT';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  entityTitle?: string;
  performedById?: string;
  performedByName: string;
  performedByEmail: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: AuditAction;
  entity?: AuditEntity;
  entityId?: string;
  performedById?: string;
  page?: number;
  limit?: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── API Error ────────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}