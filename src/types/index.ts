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
  | 'STUDIO';

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

export type AuditEntity = 'PROPERTY' | 'LANDLORD' | 'USER' | 'IMAGE' | 'AUTH';

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

// ─── API Error ───────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}