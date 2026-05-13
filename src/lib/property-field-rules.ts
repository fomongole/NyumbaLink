// Mirror of backend: src/modules/properties/utils/property-field-rules.ts
// Keep in sync when adding/removing property types or billing cycles.
import { BillingCycle, PropertyType } from '@/types';

export interface PropertyFieldConfig {
  showNumberOfRooms: boolean;
  showTotalRooms: boolean;
  showHotelCategory: boolean;
  showParking: boolean;
  showFloor: boolean;
  showFurnishing: boolean;
  showBillingCycle: boolean;
  allowedBillingCycles: BillingCycle[];
  showSecurityDeposit: boolean;
  /** Sub-units managed via the HostelRooms module */
  isHostel: boolean;
  /** Supports DAILY billing (Hotel/Lodge and AirBnB) */
  isHotelLodge: boolean;
  /**
   * HOSTEL only: the nearby university this hostel primarily serves.
   * Enables "find hostels near Kyambogo" filtering.
   */
  showUniversity: boolean;
  /**
   * HOSTEL only: admin-entered walking distance to the linked university (km).
   */
  showApproximateDistanceKm: boolean;
}

export const PROPERTY_FIELD_CONFIG: Record<PropertyType, PropertyFieldConfig> = {
  RESIDENTIAL_HOUSE: {
    showNumberOfRooms: true,
    showTotalRooms: false,
    showHotelCategory: false,
    showParking: true,
    showFloor: false,
    showFurnishing: true,
    showBillingCycle: true,
    allowedBillingCycles: ['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'],
    showSecurityDeposit: true,
    isHostel: false,
    isHotelLodge: false,
    showUniversity: false,
    showApproximateDistanceKm: false,
  },
  APARTMENT: {
    showNumberOfRooms: true,
    showTotalRooms: false,
    showHotelCategory: false,
    showParking: true,
    showFloor: true,
    showFurnishing: true,
    showBillingCycle: true,
    allowedBillingCycles: ['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'],
    showSecurityDeposit: true,
    isHostel: false,
    isHotelLodge: false,
    showUniversity: false,
    showApproximateDistanceKm: false,
  },
  AIRBNB: {
    showNumberOfRooms: true,
    showTotalRooms: false,
    showHotelCategory: false,
    showParking: true,
    showFloor: true,
    showFurnishing: true,
    showBillingCycle: true,
    allowedBillingCycles: ['DAILY', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'],
    showSecurityDeposit: true,
    isHostel: false,
    isHotelLodge: false,
    showUniversity: false,
    showApproximateDistanceKm: false,
  },
  OFFICE_SPACE: {
    showNumberOfRooms: true,
    showTotalRooms: false,
    showHotelCategory: false,
    showParking: true,
    showFloor: true,
    showFurnishing: true,
    showBillingCycle: true,
    allowedBillingCycles: ['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'],
    showSecurityDeposit: true,
    isHostel: false,
    isHotelLodge: false,
    showUniversity: false,
    showApproximateDistanceKm: false,
  },
  BUSINESS_SPACE: {
    showNumberOfRooms: true,
    showTotalRooms: false,
    showHotelCategory: false,
    showParking: true,
    showFloor: true,
    showFurnishing: false,
    showBillingCycle: true,
    allowedBillingCycles: ['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'],
    showSecurityDeposit: true,
    isHostel: false,
    isHotelLodge: false,
    showUniversity: false,
    showApproximateDistanceKm: false,
  },
  HOSTEL: {
    showNumberOfRooms: false,
    showTotalRooms: true,
    showHotelCategory: false,
    showParking: true,
    showFloor: true,
    showFurnishing: false,
    showBillingCycle: false,
    allowedBillingCycles: [],
    showSecurityDeposit: false,
    isHostel: true,
    isHotelLodge: false,
    showUniversity: true,        // ← hostel can be linked to a nearby university
    showApproximateDistanceKm: true, // ← walking distance to that university
  },
  HOTEL_LODGE: {
    showNumberOfRooms: true,
    showTotalRooms: false,
    showHotelCategory: true,
    showParking: true,
    showFloor: true,
    showFurnishing: true,
    showBillingCycle: true,
    allowedBillingCycles: ['DAILY', 'MONTHLY'],
    showSecurityDeposit: false,
    isHostel: false,
    isHotelLodge: true,
    showUniversity: false,
    showApproximateDistanceKm: false,
  },
};

export function getFieldConfig(type?: PropertyType): PropertyFieldConfig | null {
  if (!type) return null;
  return PROPERTY_FIELD_CONFIG[type] ?? null;
}