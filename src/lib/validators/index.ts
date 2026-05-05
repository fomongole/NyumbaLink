import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const landlordSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  whatsapp: z.string().optional(),
  notes: z.string().optional(),
});

export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.enum(['SINGLE_ROOM', 'DOUBLE_ROOM', 'APARTMENT', 'HOUSE', 'STUDIO']),
  price: z.number().min(1, 'Price is required'),
  bedrooms: z.number().min(1).optional(),
  bathrooms: z.number().min(1).optional(),
  area: z.string().min(2, 'Area is required'),
  address: z.string().optional(),
  landlordId: z.string().uuid('Select a landlord'),
  districtId: z.string().uuid('Select a district'),
  amenities: z.array(z.string()).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type LandlordFormData = z.infer<typeof landlordSchema>;
export type PropertyFormData = z.infer<typeof propertySchema>;