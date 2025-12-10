import { z } from 'zod';

// Phone number validation (E.164 format: +61XXXXXXXXX for Australia)
const phoneE164Schema = z.string()
  .regex(/^\+61[0-9]{9}$/, 'Phone must be in E.164 format (+61XXXXXXXXX)')
  .describe('Australian phone number in E.164 format');

// Social links schema
const socialLinksSchema = z.object({
  facebook: z.string().url().optional().nullable(),
  instagram: z.string().url().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  youtube: z.string().url().optional().nullable(),
}).optional().nullable();

// Services enum (exported for UI usage)
export const servicesEnum = z.enum([
  'Residential Solar',
  'Commercial Solar',
  'Battery Storage',
  'EV Chargers',
  'Solar Maintenance',
  'System Upgrades',
]);

// Service areas enum (exported for UI usage)
export const serviceAreasEnum = z.enum([
  'Sydney',
  'Melbourne',
  'Brisbane',
  'Perth',
  'Adelaide',
  'Gold Coast',
  'Canberra',
  'Newcastle',
  'Wollongong',
  'Sunshine Coast',
  'Hobart',
  'Geelong',
  'Townsville',
  'Cairns',
  'Darwin',
]);

// Installer Verification Submit Schema
export const installerVerificationSubmitSchema = z.object({
  // Company & Representative
  companyName: z.string().min(2, 'Company name required').max(200),
  representativeName: z.string().min(2, 'Representative name required').max(100),
  designation: z.string().min(2, 'Designation required').max(100),
  email: z.string().email('Valid email required'),
  phone: phoneE164Schema,
  address: z.string().min(5, 'Address must be at least 5 characters').max(500).optional().nullable(),

  // Business Legal
  abnOrLicense: z.string().min(9, 'ABN/License required').max(50),
  establishedYear: z.number().int().min(1900).max(new Date().getFullYear()),
  employeeCount: z.number().int().min(1).max(10000),

  // Services & Coverage
  services: z.array(servicesEnum).min(1, 'At least one service required'),
  serviceAreas: z.array(serviceAreasEnum).min(1, 'At least one service area required'),
  postcodes: z.array(z.string().regex(/^[0-9]{4}$/, 'Valid 4-digit postcode')).min(1, 'At least one postcode required'),

  // Additional Information
  website: z.string().url().optional().nullable(),
  socialLinks: socialLinksSchema,
  companyDescription: z.string().max(2000).optional().nullable(),

  // Document keys (uploaded separately via presign)
  licenseDocKey: z.string().optional().nullable(),
  abnDocKey: z.string().optional().nullable(),
  logoKey: z.string().optional().nullable(),
});

export type InstallerVerificationSubmit = z.infer<typeof installerVerificationSubmitSchema>;

// Installer Profile Update Schema (post-approval editable subset)
export const installerProfileUpdateSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  businessAddress: z.string().min(5).max(300).optional(),
  postcode: z.string().regex(/^[0-9]{4}$/).optional(),
  services: z.array(servicesEnum).optional(),
  serviceAreas: z.array(serviceAreasEnum).optional(),
  postcodes: z.array(z.string().regex(/^[0-9]{4}$/)).optional(),
  website: z.string().url().optional().nullable(),
  socialLinks: socialLinksSchema, // Already .optional().nullable() in schema definition
  companyDescription: z.string().max(2000).optional().nullable(),
  logoKey: z.string().optional().nullable(),
  // Newly added document keys for profile editing (Phase E13)
  licenseDocKey: z.string().optional().nullable(),
  abnDocKey: z.string().optional().nullable(),
  phone: phoneE164Schema.optional(), // E1: Allow phone updates after OTP verification
  // E2: Add company details fields
  representativeName: z.string().min(2).max(100).optional(),
  designation: z.string().min(2).max(100).optional(),
  address: z.string().min(5).max(500).optional().nullable(), // F14: Business address field
  abnOrLicense: z.string().min(9).max(50).optional(),
  establishedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  employeeCount: z.number().int().min(1).max(10000).optional(),
});

export type InstallerProfileUpdate = z.infer<typeof installerProfileUpdateSchema>;

// Installer Preferences Schema
export const installerPreferencesSchema = z.object({
  alertNewLead: z.boolean().optional(),
  alertLeadUpdates: z.boolean().optional(),
  alertAdminMessages: z.boolean().optional(),
  alertVerificationUpdates: z.boolean().optional(),
  alertAccountActivity: z.boolean().optional(),
});

export type InstallerPreferencesUpdate = z.infer<typeof installerPreferencesSchema>;

// Admin Verification Action Schema
export const adminVerificationActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_INFO']),
  notes: z.string().max(2000).optional().nullable(),
});

export type AdminVerificationAction = z.infer<typeof adminVerificationActionSchema>;

// Operational Status Schema
export const operationalStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'INACTIVE']),
});

export type OperationalStatusUpdate = z.infer<typeof operationalStatusSchema>;

// Password Change Schema (aligned with signup: 8 chars, letter + number)
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine((password) => /[a-zA-Z]/.test(password), {
      message: 'Password must contain at least one letter',
    })
    .refine((password) => /[0-9]/.test(password), {
      message: 'Password must contain at least one number',
    }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

export type PasswordChange = z.infer<typeof passwordChangeSchema>;
