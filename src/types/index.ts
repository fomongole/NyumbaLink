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

// ─── Contact (replaces Landlord) ─────────────────────────────────────────────
/** OWNER = the person who owns the property. AGENT = broker / property manager. */
export type ContactRole = 'OWNER' | 'AGENT';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  role: ContactRole;
  email?: string;
  whatsapp?: string;
  nationalId?: string;
  physicalAddress?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactPayload {
  name: string;
  phone: string;
  role: ContactRole;
  email?: string;
  whatsapp?: string;
  nationalId?: string;
  physicalAddress?: string;
  notes?: string;
}

export type UpdateContactPayload = Partial<CreateContactPayload>;

export interface ContactFilters {
  search?: string;
  role?: ContactRole;
  page?: number;
  limit?: number;
}

// ─── Property ────────────────────────────────────────────────────────────────
export type PropertyType =
  | 'RESIDENTIAL_HOUSE'
  | 'APARTMENT'
  | 'AIRBNB'
  | 'OFFICE_SPACE'
  | 'BUSINESS_SPACE'
  | 'HOSTEL'
  | 'HOTEL_LODGE';

export type HotelCategory = 'ORDINARY' | 'VIP' | 'VVIP';
export type PropertyStatus = 'AVAILABLE' | 'RENTED';
export type FurnishingStatus = 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';

/**
 * Replaces the old LeaseTerm.
 * Not every cycle is valid for every property type — see PROPERTY_FIELD_CONFIG.
 */
export type BillingCycle =
  | 'DAILY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'FOUR_MONTHS'
  | 'BIANNUAL'
  | 'ANNUAL';

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
  billingCycle?: BillingCycle;
  numberOfRooms: number;
  totalRooms?: number | null;
  hotelCategory?: HotelCategory | null;
  area: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: PropertyStatus;
  furnishing?: FurnishingStatus;
  securityDeposit?: number;
  availableFrom?: string;
  floor?: number;
  parkingAvailable: boolean;
  amenities: string[];
  viewCount: number;
  enquiryCount: number;
  /** The owner or agent responsible for this property */
  contact: Contact;
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
  billingCycle?: BillingCycle;
  numberOfRooms?: number;
  totalRooms?: number;
  hotelCategory?: HotelCategory;
  area: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  furnishing?: FurnishingStatus;
  securityDeposit?: number;
  availableFrom?: string;
  floor?: number;
  parkingAvailable?: boolean;
  contactId: string;
  districtId: string;
  amenities?: string[];
}

export type UpdatePropertyPayload = Partial<CreatePropertyPayload>;

export interface PropertyFilters {
  districtId?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  billingCycle?: BillingCycle;
  minPrice?: number;
  maxPrice?: number;
  numberOfRooms?: number;
  search?: string;
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
  byType: Record<string, number>;
}

// ─── Hostel Rooms ─────────────────────────────────────────────────────────────
export type HostelRoomType = 'SINGLE' | 'DOUBLE' | 'SHARED';
export type HostelRoomStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';

export interface HostelRoom {
  id: string;
  roomNumber: string;
  type: HostelRoomType;
  price: number;
  billingCycle: BillingCycle;
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
  billingCycle: BillingCycle;
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
  capacityCap: number | null;
  slotsRemaining: number | null;
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

// ─── Complaints ───────────────────────────────────────────────────────────────
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type ComplaintCategory =
  | 'GENERAL'
  | 'PROPERTY_CONDITION'
  | 'CONTACT_CONDUCT'
  | 'PRICING'
  | 'BOOKING'
  | 'APP_ISSUE'
  | 'OTHER';

export interface Complaint {
  id: string;
  submitterName: string;
  submitterPhone: string;
  submitterEmail?: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  adminNotes?: string;
  adminReply?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  property?: Property;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateComplaintStatusPayload {
  status: ComplaintStatus;
  adminNotes?: string;
  adminReply?: string;
}

export interface ComplaintFilters {
  status?: ComplaintStatus;
  category?: ComplaintCategory;
  propertyId?: string;
  page?: number;
  limit?: number;
}

export interface ComplaintStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  thisWeek: number;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'
  | 'STATUS_CHANGE' | 'IMAGE_UPLOAD' | 'IMAGE_DELETE'
  | 'LOGIN' | 'LOGIN_FAILED' | 'LOGOUT'
  | 'PASSWORD_CHANGE';

export type AuditEntity =
  | 'PROPERTY'
  | 'CONTACT'
  | 'USER'
  | 'IMAGE'
  | 'AUTH'
  | 'HOSTEL_ROOM'
  | 'BOOKING'
  | 'DISTRICT'
  | 'COMPLAINT';

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

// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationType =
  | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_COMPLETED'
  | 'COMPLAINT_UPDATED' | 'NEW_PROPERTY'
  | 'WELCOME' | 'ACCOUNT_ACTIVATED' | 'ACCOUNT_DEACTIVATED'
  | 'PASSWORD_CHANGED' | 'SYSTEM_ALERT';

export interface BroadcastNotificationPayload {
  title: string;
  message: string;
  data?: Record<string, unknown>;
}