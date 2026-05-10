import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ─── Shared helpers ───────────────────────────────────────────────────────────
/** Converts empty strings to undefined so optional unique DB fields get NULL */
const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v));

const optionalNumber = z.preprocess(
  (v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)),
  z.number().optional(),
);

const availableFromField = z
  .string()
  .optional()
  .transform((v) => {
    if (!v || v === '') return undefined;
    if (v.includes('T')) return v;
    const date = new Date(v);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  });

// ─── Contact (replaces Landlord) ─────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  role: z.enum(['OWNER', 'AGENT'], { message: 'Select a role' }),
  email: z
    .string()
    .email('Enter a valid email')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' ? undefined : v)),
  whatsapp: optionalString,
  nationalId: optionalString,
  physicalAddress: optionalString,
  notes: optionalString,
});

export type ContactFormInput = z.input<typeof contactSchema>;
export type ContactFormData = z.output<typeof contactSchema>;

// ─── Property ─────────────────────────────────────────────────────────────────
export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(
    [
      'RESIDENTIAL_HOUSE',
      'APARTMENT',
      'AIRBNB',
      'OFFICE_SPACE',
      'BUSINESS_SPACE',
      'HOSTEL',
      'HOTEL_LODGE',
    ] as const,
    { message: 'Please select a property type' },
  ),
  residentialSubtype: z.enum(['SINGLE', 'DOUBLE'] as const).optional(),
  price: z.preprocess(
    (v) =>
      v === '' || v === undefined || v === null || Number.isNaN(Number(v))
        ? undefined
        : Number(v),
    z.number({ message: 'Price is required' }).min(1, 'Price must be greater than 0'),
  ),
  billingCycle: z
    .enum(['DAILY', 'MONTHLY', 'QUARTERLY', 'FOUR_MONTHS', 'BIANNUAL', 'ANNUAL'] as const)
    .optional(),
  numberOfRooms: z.preprocess(
    (v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)),
    z.number().min(1).optional(),
  ),
  totalRooms: z.preprocess(
    (v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)),
    z.number().min(1).optional(),
  ),
  hotelCategory: z.enum(['ORDINARY', 'VIP', 'VVIP']).optional(),
  securityDeposit: z.preprocess(
    (v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)),
    z.number().min(0).optional(),
  ),
  floor: z.preprocess(
    (v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)),
    z.number().min(0).optional(),
  ),
  latitude: optionalNumber,
  longitude: optionalNumber,
  area: z.string().min(2, 'Area is required'),
  address: z.string().optional(),
  furnishing: z.enum(['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']).optional(),
  availableFrom: availableFromField,
  parkingAvailable: z.boolean().optional(),
  contactId: z.string().uuid('Select a contact'),
  districtId: z.string().uuid('Select a district'),
  amenities: z.array(z.string()).optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

// ─── Users ────────────────────────────────────────────────────────────────────
export const createAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'RENTER']),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Enter a valid email').optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateAdminFormData = z.infer<typeof createAdminSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;