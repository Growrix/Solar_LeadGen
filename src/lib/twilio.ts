/**
 * Twilio Verify Client Singleton
 * 
 * Purpose: Send and verify OTP (One-Time Password) codes for phone verification
 * Used for: Homeowner and installer phone number verification
 * 
 * Why Twilio Verify?
 * - Built-in rate limiting and fraud prevention
 * - Automatic OTP expiry (10 minutes)
 * - SMS delivery optimization
 * - Multi-channel support (SMS, voice call, email)
 * 
 * Usage:
 *   import { sendOTP, verifyOTP } from '@/lib/twilio';
 *   
 *   // Send OTP
 *   await sendOTP('+447700900123');
 *   
 *   // Verify OTP
 *   const isValid = await verifyOTP('+447700900123', '123456');
 * 
 * Environment Variables Required:
 * - TWILIO_ACCOUNT_SID: Your Twilio account SID
 * - TWILIO_AUTH_TOKEN: Your Twilio auth token
 * - TWILIO_VERIFY_SERVICE_SID: Your Twilio Verify service SID
 */

import twilio from 'twilio';

// Validate environment variables at startup
if (!process.env.TWILIO_ACCOUNT_SID) {
  console.warn('⚠️ [Twilio] TWILIO_ACCOUNT_SID not configured - OTP verification will not work');
}
if (!process.env.TWILIO_AUTH_TOKEN) {
  console.warn('⚠️ [Twilio] TWILIO_AUTH_TOKEN not configured - OTP verification will not work');
}
if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
  console.warn('⚠️ [Twilio] TWILIO_VERIFY_SERVICE_SID not configured - OTP verification will not work');
}

// Initialize Twilio client
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID || '';

/**
 * Send OTP code to a phone number via SMS
 * 
 * @param phoneNumber - Phone number in E.164 format (e.g., +447700900123)
 * @returns Promise that resolves when OTP is sent
 * 
 * Rate Limiting:
 * - Twilio Verify has built-in rate limiting
 * - Additional rate limiting should be implemented in the API route (3 requests per hour)
 * 
 * OTP Expiry:
 * - OTP codes expire after 10 minutes
 * 
 * Example:
 *   await sendOTP('+447700900123');
 *   // User receives SMS:"Your SolarMatch verification code is: 123456"
 */
export async function sendOTP(phoneNumber: string): Promise<void> {
  if (!twilioClient || !VERIFY_SERVICE_SID) {
    throw new Error('Twilio is not configured. Check environment variables.');
  }

  try {
    await twilioClient.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
      });

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [Twilio] OTP sent to ${phoneNumber}`);
    }
  } catch (error: any) {
    console.error('❌ [Twilio] Failed to send OTP:', error);
    
    // Provide user-friendly error messages
    if (error.code === 60200) {
      throw new Error('Invalid phone number format. Use E.164 format (e.g., +447700900123)');
    } else if (error.code === 60203) {
      throw new Error('Maximum send attempts reached. Please try again later.');
    } else {
      throw new Error('Failed to send verification code. Please try again.');
    }
  }
}

/**
 * Verify OTP code entered by user
 * 
 * @param phoneNumber - Phone number in E.164 format (e.g., +447700900123)
 * @param code - 6-digit OTP code entered by user
 * @returns True if code is valid, false otherwise
 * 
 * Max Attempts:
 * - Maximum 3 verification attempts per OTP
 * - After 3 failed attempts, user must request a new OTP
 * 
 * Example:
 *   const isValid = await verifyOTP('+447700900123', '123456');
 *   if (isValid) {
 *     // Mark user as verified
 *   } else {
 *     // Show error message
 *   }
 */
export async function verifyOTP(
  phoneNumber: string,
  code: string
): Promise<boolean> {
  if (!twilioClient || !VERIFY_SERVICE_SID) {
    throw new Error('Twilio is not configured. Check environment variables.');
  }

  try {
    const verification = await twilioClient.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: phoneNumber,
        code,
      });

    const isValid = verification.status === 'approved';

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${isValid ? '✅' : '❌'} [Twilio] OTP verification for ${phoneNumber}: ${verification.status}`
      );
    }

    return isValid;
  } catch (error: any) {
    console.error('❌ [Twilio] Failed to verify OTP:', error);

    // Provide user-friendly error messages
    if (error.code === 60200) {
      throw new Error('Invalid phone number format.');
    } else if (error.code === 60202) {
      throw new Error('Maximum check attempts reached. Please request a new code.');
    } else if (error.code === 60223) {
      // Verification expired or invalid
      return false;
    } else {
      throw new Error('Failed to verify code. Please try again.');
    }
  }
}

/**
 * Validate phone number format (E.164)
 * 
 * E.164 format:
 * - Starts with +
 * - Country code (1-3 digits)
 * - Subscriber number (up to 15 digits total)
 * - No spaces, hyphens, or parentheses
 * 
 * Examples:
 * - Valid: +447700900123 (UK)
 * - Valid: +12025551234 (US)
 * - Invalid: 07700900123 (missing +44)
 * - Invalid: +44 7700 900 123 (spaces)
 * 
 * @param phoneNumber - Phone number to validate
 * @returns True if valid E.164 format
 */
export function isValidE164PhoneNumber(phoneNumber: string): boolean {
  // E.164 regex: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

/**
 * Format phone number to E.164 (basic UK conversion)
 * 
 * This is a simple helper for UK numbers only.
 * For production, use a library like libphonenumber-js for comprehensive formatting.
 * 
 * @param phoneNumber - Phone number (e.g.,"07700900123")
 * @param countryCode - Country code (default:"44" for UK)
 * @returns E.164 formatted number (e.g.,"+447700900123")
 * 
 * Example:
 *   formatToE164("07700900123") //"+447700900123"
 *   formatToE164("7700900123") //"+447700900123"
 */
export function formatToE164(phoneNumber: string, countryCode: string = '44'): string {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');

  // Remove leading 0 if present (UK mobile numbers)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Add country code
  return `+${countryCode}${cleaned}`;
}

/**
 * Check if phone number is already verified in Twilio
 * 
 * Note: This function is primarily for debugging/admin purposes.
 * Always check the database PhoneVerification table for user verification status.
 * 
 * @param phoneNumber - Phone number in E.164 format
 * @param verificationSid - Optional verification SID to check specific verification
 * @returns Verification status object
 * 
 * Teaching Note:
 * Twilio Verify doesn't provide a simple way to"list all verifications for a phone number"
 * Instead, we should track verification status in our database (PhoneVerification table)
 * This function is kept simple and only useful with a specific verificationSid
 */
export async function getVerificationStatus(
  phoneNumber: string,
  verificationSid?: string
): Promise<{
  status: string;
  valid: boolean;
}> {
  if (!twilioClient || !VERIFY_SERVICE_SID) {
    throw new Error('Twilio is not configured. Check environment variables.');
  }

  if (!verificationSid) {
    // Without a specific SID, we can't check Twilio
    // Caller should check database instead
    return {
      status: 'unknown',
      valid: false,
    };
  }

  try {
    const verification = await twilioClient.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications(verificationSid)
      .fetch();

    return {
      status: verification.status,
      valid: verification.valid || false,
    };
  } catch (error) {
    console.error('❌ [Twilio] Failed to get verification status:', error);
    return {
      status: 'error',
      valid: false,
    };
  }
}
