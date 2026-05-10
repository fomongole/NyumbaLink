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
  /** Only true for RESIDENTIAL_HOUSE — admin picks SINGLE or DOUBLE subtype */
  showResidentialSubtype: boolean;
  /** Sub-units managed via the HostelRooms module */
  isHostel: boolean;
  /** Supports DAILY billing (Hotel/Lodge and AirBnB) */
  isHotelLodge: boolean;
}

export const PROPERTY_FIELD_CONFIG: Record<PropertyType, PropertyFieldConfig> = {
  RESIDENTIAL_HOUSE: {
    showNumberOfRooms: true,
    showTotalRooms: false,
    showHotelCategory: false,
    showParking: true,
    showFloor: false,           // houses are ground-level
    showFurnishing: true,
    showBillingCycle: true,
    allowedBillingCycles: ['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'],
    showSecurityDeposit: true,
    showResidentialSubtype: true,
    isHostel: false,
    isHotelLodge: false,
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
    showResidentialSubtype: false,
    isHostel: false,
    isHotelLodge: false,
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
    showResidentialSubtype: false,
    isHostel: false,
    isHotelLodge: false,
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
    showResidentialSubtype: false,
    isHostel: false,
    isHotelLodge: false,
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
    showResidentialSubtype: false,
    isHostel: false,
    isHotelLodge: false,
  },
  HOSTEL: {
    showNumberOfRooms: false,
    showTotalRooms: true,
    showHotelCategory: false,
    showParking: true,
    showFloor: true,
    showFurnishing: false,
    showBillingCycle: false,    // billing cycle lives on each HostelRoom
    allowedBillingCycles: [],
    showSecurityDeposit: false,
    showResidentialSubtype: false,
    isHostel: true,
    isHotelLodge: false,
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
    showResidentialSubtype: false,
    isHostel: false,
    isHotelLodge: true,
  },
};

export function getFieldConfig(type?: PropertyType): PropertyFieldConfig | null {
  if (!type) return null;
  return PROPERTY_FIELD_CONFIG[type] ?? null;
}