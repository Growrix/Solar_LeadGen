import crypto from 'crypto';

/**
 * Token utility functions for email verification and password reset
 * Implements secure token generation and hashing per research.md decisions
 */

/**
 * TTL constants for tokens (30 minutes as per spec SC-004)
 */
export const TOKEN_TTL_MINUTES = 30;
export const TOKEN_TTL_MS = TOKEN_TTL_MINUTES * 60 * 1000;

/**
 * Generate a cryptographically secure random token
 * @returns A URL-safe random string (32 bytes = 43 characters base64url)
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Hash a token using SHA-256
 * Tokens are hashed before storage to prevent leakage if DB is compromised
 * @param token - The plaintext token to hash
 * @returns The SHA-256 hash in hex format
 */
export function hashSHA256(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Calculate the expiry timestamp for a new token
 * @returns Date object representing TOKEN_TTL_MINUTES from now
 */
export function getTokenExpiry(): Date {
  return new Date(Date.now() + TOKEN_TTL_MS);
}

/**
 * Check if a token has expired
 * @param expiryDate - The expiry date from the database
 * @returns true if the token is expired
 */
export function isTokenExpired(expiryDate: Date): boolean {
  return expiryDate.getTime() < Date.now();
}
