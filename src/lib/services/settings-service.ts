/**
 * Settings Service
 * 
 * Purpose: Manage system-wide configurable settings
 * Used for: Lead pricing, timeouts, feature flags, business rules
 * 
 * Why use database for settings?
 * - Dynamic updates without code deployment
 * - Admin can change settings via UI
 * - Audit trail of setting changes
 * - Different settings per environment (dev vs prod)
 * 
 * Setting Categories:
 * - Lead pricing (default price, regional pricing)
 * - Timeouts (lead expiry days, quote validity days)
 * - Limits (max quotes per lead, max messages per day)
 * - Feature flags (enable/disable features)
 * - Notification settings (email frequency, notification types)
 */

import { prisma } from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from './audit-logger';

/**
 * Setting keys (for type safety)
 */
export const SETTING_KEYS = {
  // Lead pricing
  LEAD_PRICE_DEFAULT: 'lead_price_default',
  LEAD_PRICE_RESIDENTIAL: 'lead_price_residential',
  LEAD_PRICE_COMMERCIAL: 'lead_price_commercial',

  // Timeouts (in days)
  LEAD_EXPIRY_DAYS: 'lead_expiry_days',
  QUOTE_VALIDITY_DAYS: 'quote_validity_days',
  OTP_EXPIRY_MINUTES: 'otp_expiry_minutes',

  // Limits
  MAX_QUOTES_PER_LEAD: 'max_quotes_per_lead',
  MAX_MESSAGES_PER_DAY: 'max_messages_per_day',
  MAX_OTP_ATTEMPTS: 'max_otp_attempts',
  MIN_LEAD_BUDGET: 'min_lead_budget',

  // Feature flags
  ENABLE_REAL_TIME_CHAT: 'enable_real_time_chat',
  ENABLE_EMAIL_NOTIFICATIONS: 'enable_email_notifications',
  ENABLE_AUTO_APPROVAL: 'enable_auto_approval',
  ENABLE_PAYMENT_PROCESSING: 'enable_payment_processing',

  // Notification settings
  NOTIFY_ADMINS_NEW_LEAD: 'notify_admins_new_lead',
  NOTIFY_INSTALLERS_NEW_LEAD: 'notify_installers_new_lead',

  // System
  MAINTENANCE_MODE: 'maintenance_mode',
  MAINTENANCE_MESSAGE: 'maintenance_message',
} as const;

/**
 * Default setting values
 */
const DEFAULT_SETTINGS: Record<string, string> = {
  [SETTING_KEYS.LEAD_PRICE_DEFAULT]: '50.00',
  [SETTING_KEYS.LEAD_PRICE_RESIDENTIAL]: '40.00',
  [SETTING_KEYS.LEAD_PRICE_COMMERCIAL]: '75.00',

  [SETTING_KEYS.LEAD_EXPIRY_DAYS]: '30',
  [SETTING_KEYS.QUOTE_VALIDITY_DAYS]: '30',
  [SETTING_KEYS.OTP_EXPIRY_MINUTES]: '10',

  [SETTING_KEYS.MAX_QUOTES_PER_LEAD]: '5',
  [SETTING_KEYS.MAX_MESSAGES_PER_DAY]: '50',
  [SETTING_KEYS.MAX_OTP_ATTEMPTS]: '3',
  [SETTING_KEYS.MIN_LEAD_BUDGET]: '1000',

  [SETTING_KEYS.ENABLE_REAL_TIME_CHAT]: 'true',
  [SETTING_KEYS.ENABLE_EMAIL_NOTIFICATIONS]: 'true',
  [SETTING_KEYS.ENABLE_AUTO_APPROVAL]: 'false',
  [SETTING_KEYS.ENABLE_PAYMENT_PROCESSING]: 'true',

  [SETTING_KEYS.NOTIFY_ADMINS_NEW_LEAD]: 'true',
  [SETTING_KEYS.NOTIFY_INSTALLERS_NEW_LEAD]: 'false',

  [SETTING_KEYS.MAINTENANCE_MODE]: 'false',
  [SETTING_KEYS.MAINTENANCE_MESSAGE]: 'System maintenance in progress. Please check back soon.',
};

/**
 * Get setting value by key
 * 
 * @param key - Setting key
 * @returns Setting value (string)
 * @throws Error if setting not found and no default
 * 
 * Example:
 *   const leadPrice = await getSetting(SETTING_KEYS.LEAD_PRICE_DEFAULT);
 *   // Returns:"50.00"
 */
export async function getSetting(key: string): Promise<string> {
  const setting = await prisma.settings.findUnique({
    where: { key },
  });

  if (setting) {
    return setting.value;
  }

  // Return default if not found in database
  if (key in DEFAULT_SETTINGS) {
    return DEFAULT_SETTINGS[key];
  }

  throw new Error(`Setting not found: ${key}`);
}

/**
 * Get setting as number
 * 
 * @param key - Setting key
 * @returns Setting value as number
 * 
 * Example:
 *   const expiryDays = await getSettingAsNumber(SETTING_KEYS.LEAD_EXPIRY_DAYS);
 *   // Returns: 30
 */
export async function getSettingAsNumber(key: string): Promise<number> {
  const value = await getSetting(key);
  const number = parseFloat(value);

  if (isNaN(number)) {
    throw new Error(`Setting ${key} is not a valid number: ${value}`);
  }

  return number;
}

/**
 * Get setting as boolean
 * 
 * @param key - Setting key
 * @returns Setting value as boolean
 * 
 * Example:
 *   const chatEnabled = await getSettingAsBoolean(SETTING_KEYS.ENABLE_REAL_TIME_CHAT);
 *   // Returns: true
 */
export async function getSettingAsBoolean(key: string): Promise<boolean> {
  const value = await getSetting(key);
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Set setting value
 * 
 * @param key - Setting key
 * @param value - Setting value (will be converted to string)
 * @param userId - Admin user ID (for audit log)
 * @param description - Optional description of the setting
 * @returns Updated setting
 * 
 * Example:
 *   await setSetting(
 *     SETTING_KEYS.LEAD_PRICE_DEFAULT,
 *     '55.00',
 *     adminId,
 *     'Increased lead price due to higher quality leads'
 *   );
 */
export async function setSetting(
  key: string,
  value: string | number | boolean,
  userId?: string,
  description?: string
): Promise<void> {
  const stringValue = String(value);

  // Get old value for audit log
  const oldSetting = await prisma.settings.findUnique({
    where: { key },
  });

  // Upsert setting
  await prisma.settings.upsert({
    where: { key },
    create: {
      key,
      value: stringValue,
      description,
      updatedBy: userId,
    },
    update: {
      value: stringValue,
      description,
      updatedBy: userId,
      updatedAt: new Date(),
    },
  });

  // Create audit log
  if (userId) {
    await createAuditLog({
      action: AUDIT_ACTIONS.ADMIN_SETTINGS_CHANGED,
      entityType: 'settings',
      entityId: key,
      userId,
      metadata: {
        key,
        oldValue: oldSetting?.value,
        newValue: stringValue,
      },
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`⚙️ [Settings] Updated ${key}: ${stringValue}`);
  }
}

/**
 * Get multiple settings at once
 * 
 * @param keys - Array of setting keys
 * @returns Object with key-value pairs
 * 
 * Example:
 *   const settings = await getSettings([
 *     SETTING_KEYS.LEAD_PRICE_DEFAULT,
 *     SETTING_KEYS.LEAD_EXPIRY_DAYS,
 *   ]);
 *   // Returns: { lead_price_default:"50.00", lead_expiry_days:"30" }
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const settings = await prisma.settings.findMany({
    where: { key: { in: keys } },
  });

  const result: Record<string, string> = {};

  for (const key of keys) {
    const setting = settings.find((s: any) => s.key === key);
    result[key] = setting?.value ?? DEFAULT_SETTINGS[key] ?? '';
  }

  return result;
}

/**
 * Get all settings (admin dashboard)
 * 
 * @returns Array of all settings
 */
export async function getAllSettings() {
  const dbSettings = await prisma.settings.findMany({
    orderBy: { key: 'asc' },
  });

  // Merge with defaults (in case some aren't in DB yet)
  const allKeys = new Set([
    ...Object.keys(DEFAULT_SETTINGS),
    ...dbSettings.map((s: any) => s.key),
  ]);

  const settings = Array.from(allKeys).map(key => {
    const dbSetting = dbSettings.find((s: any) => s.key === key);
    return {
      key,
      value: dbSetting?.value ?? DEFAULT_SETTINGS[key] ?? '',
      description: dbSetting?.description,
      updatedBy: dbSetting?.updatedBy,
      updatedAt: dbSetting?.updatedAt,
    };
  });

  return settings;
}

/**
 * Seed default settings (run once on setup)
 * 
 * @returns Number of settings created
 * 
 * Usage: Called from prisma/seed.ts or migration script
 */
export async function seedDefaultSettings(): Promise<number> {
  let created = 0;

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await prisma.settings.findUnique({
      where: { key },
    });

    if (!existing) {
      await prisma.settings.create({
        data: { key, value },
      });
      created++;
    }
  }

  if (process.env.NODE_ENV === 'development' && created > 0) {
    console.log(`⚙️ [Settings] Seeded ${created} default setting(s)`);
  }

  return created;
}

/**
 * Get lead price based on project type
 * 
 * @param projectType - residential or commercial
 * @returns Lead price in £
 * 
 * Example:
 *   const price = await getLeadPrice('residential');
 *   // Returns: 40.00
 */
export async function getLeadPrice(projectType: 'residential' | 'commercial'): Promise<number> {
  const key = projectType === 'residential'
    ? SETTING_KEYS.LEAD_PRICE_RESIDENTIAL
    : SETTING_KEYS.LEAD_PRICE_COMMERCIAL;

  return await getSettingAsNumber(key);
}

/**
 * Check if feature is enabled
 * 
 * @param featureKey - Feature setting key
 * @returns True if enabled
 * 
 * Example:
 *   if (await isFeatureEnabled(SETTING_KEYS.ENABLE_REAL_TIME_CHAT)) {
 *     // Enable chat UI
 *   }
 */
export async function isFeatureEnabled(featureKey: string): Promise<boolean> {
  return await getSettingAsBoolean(featureKey);
}

/**
 * Check if system is in maintenance mode
 * 
 * @returns True if in maintenance mode
 * 
 * Usage: Call in middleware to show maintenance page
 */
export async function isMaintenanceMode(): Promise<boolean> {
  return await getSettingAsBoolean(SETTING_KEYS.MAINTENANCE_MODE);
}

/**
 * Get maintenance message
 * 
 * @returns Maintenance message
 */
export async function getMaintenanceMessage(): Promise<string> {
  return await getSetting(SETTING_KEYS.MAINTENANCE_MESSAGE);
}
