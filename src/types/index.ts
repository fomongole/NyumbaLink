// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RENTER';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
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
  whatsapp?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandlordPayload {
  name: string;
  phone: string;
  whatsapp?: string;
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
  amenities: string[];
  landlord: Landlord;
  district: District;
  images: PropertyImage[];
  createdAt: string;
  updatedAt: string;
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
  landlordId: string;
  districtId: string;
  amenities?: string[];
}

export type UpdatePropertyPayload = Partial<CreatePropertyPayload>;

export interface PropertyFilters {
  districtId?: string;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
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