import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Converts empty strings to undefined so optional unique fields
// (nationalId, email) are not sent as '' and do not hit the unique constraint
const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v));

export const landlordSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
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

// Helper to handle empty string inputs for optional numbers
const optionalNumber = z.preprocess(
  (v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)),
  z.number().optional()
);

export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  // Description: no artificial minimum — let the admin decide
  description: z.string().min(1, 'Description is required'),
  type: z.enum(
    ['SINGLE_ROOM', 'DOUBLE_ROOM', 'APARTMENT', 'HOUSE', 'STUDIO', 'HOSTEL'] as const,
    { message: 'Please select a property type' },
  ),
  price: z.preprocess(
    (v) => (v === '' || v === undefined || v === null || Number.isNaN(Number(v)) ? undefined : Number(v)),
    z.number({ message: 'Price is required' }).min(1, 'Price must be greater than 0'),
  ),
  bedrooms: z.preprocess((v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)), z.number().min(1).optional()),
  bathrooms: z.preprocess((v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)), z.number().min(1).optional()),
  securityDeposit: z.preprocess((v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)), z.number().min(0).optional()),
  floor: z.preprocess((v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)), z.number().min(0).optional()),
  latitude: optionalNumber,
  longitude: optionalNumber,
  area: z.string().min(2, 'Area is required'),
  address: z.string().optional(),
  furnishing: z.enum(['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']).optional(),
  leaseTerm: z.enum(['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL']).optional(),
  availableFrom: z.string().optional(),
  parkingAvailable: z.boolean().optional(),
  landlordId: z.string().uuid('Select a landlord'),
  districtId: z.string().uuid('Select a district'),
  amenities: z.array(z.string()).optional(),
});

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

// LandlordFormInput  = shape of the raw form fields (empty strings allowed)
// LandlordFormData   = shape after Zod transforms (empty strings → undefined)
export type LandlordFormInput = z.input<typeof landlordSchema>;
export type LandlordFormData = z.output<typeof landlordSchema>;

export type PropertyFormData = z.infer<typeof propertySchema>;
export type CreateAdminFormData = z.infer<typeof createAdminSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;