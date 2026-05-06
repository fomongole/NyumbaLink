// src/lib/property-field-rules.ts
// Mirror of backend: src/modules/properties/utils/property-field-rules.ts
// Keep in sync with backend when adding/removing property types.

export type PropertyType =
  | 'SINGLE_ROOM'
  | 'DOUBLE_ROOM'
  | 'APARTMENT'
  | 'HOUSE'
  | 'STUDIO'
  | 'HOSTEL';

export interface PropertyFieldConfig {
  showBedrooms: boolean;
  showBathrooms: boolean;
  showParking: boolean;
  showFloor: boolean;
  showFurnishing: boolean;
  showLeaseTerm: boolean;
  showSecurityDeposit: boolean;
  isHostel: boolean;
}

export const PROPERTY_FIELD_CONFIG: Record<PropertyType, PropertyFieldConfig> = {
  SINGLE_ROOM: {
    showBedrooms: false,
    showBathrooms: false,
    showParking: false,
    showFloor: true,
    showFurnishing: true,
    showLeaseTerm: true,
    showSecurityDeposit: true,
    isHostel: false,
  },
  DOUBLE_ROOM: {
    showBedrooms: false,
    showBathrooms: false,
    showParking: false,
    showFloor: true,
    showFurnishing: true,
    showLeaseTerm: true,
    showSecurityDeposit: true,
    isHostel: false,
  },
  STUDIO: {
    showBedrooms: false,
    showBathrooms: true,
    showParking: true,
    showFloor: true,
    showFurnishing: true,
    showLeaseTerm: true,
    showSecurityDeposit: true,
    isHostel: false,
  },
  APARTMENT: {
    showBedrooms: true,
    showBathrooms: true,
    showParking: true,
    showFloor: true,
    showFurnishing: true,
    showLeaseTerm: true,
    showSecurityDeposit: true,
    isHostel: false,
  },
  HOUSE: {
    showBedrooms: true,
    showBathrooms: true,
    showParking: true,
    showFloor: false,
    showFurnishing: true,
    showLeaseTerm: true,
    showSecurityDeposit: true,
    isHostel: false,
  },
  HOSTEL: {
    showBedrooms: false,
    showBathrooms: false,
    showParking: true,
    showFloor: false,
    showFurnishing: false,
    showLeaseTerm: false,
    showSecurityDeposit: false,
    isHostel: true,
  },
};

export function getFieldConfig(type?: PropertyType): PropertyFieldConfig | null {
  if (!type) return null;
  return PROPERTY_FIELD_CONFIG[type] ?? null;
}