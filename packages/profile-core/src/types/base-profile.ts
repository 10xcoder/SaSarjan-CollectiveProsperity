import { z } from 'zod';

export const LocationDataSchema = z.object({
  country: z.string(),
  state: z.string(),
  city: z.string(),
  pincode: z.string().optional(),
  district: z.string().optional(),
  taluka: z.string().optional(),
  village: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export const BaseProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  location: LocationDataSchema,
  avatar: z.string().url().optional(),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastSyncAt: z.date().optional()
});

export type LocationData = z.infer<typeof LocationDataSchema>;
export type BaseProfile = z.infer<typeof BaseProfileSchema>;

export interface ProfileMetadata {
  originalAppId: string;
  clonedFrom?: string;
  syncEnabled: boolean;
  visibility: 'public' | 'private' | 'app-only';
}