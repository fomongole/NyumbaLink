import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const landlordSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  nationalId: z.string().optional(),
  physicalAddress: z.string().optional(),
  notes: z.string().optional(),
});

// Helper to handle empty string inputs for optional numbers
const optionalNumber = z.preprocess(
  (v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)),
  z.number().optional()
);

export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.enum(['SINGLE_ROOM', 'DOUBLE_ROOM', 'APARTMENT', 'HOUSE', 'STUDIO', 'HOSTEL']),
  // Require price, but cleanly cast strings to numbers
  price: z.preprocess((v) => Number(v), z.number().min(1, 'Price is required')),
  
  // Use our helper for all optional numeric fields
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
export type LandlordFormData = z.infer<typeof landlordSchema>;
export type PropertyFormData = z.infer<typeof propertySchema>;
export type CreateAdminFormData = z.infer<typeof createAdminSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;