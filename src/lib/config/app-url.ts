/**
 * Application URL Configuration Helper
 * 
 * Purpose: Provide single source of truth for application base URL in email links
 * Authority: DOC/AUDIT-REPORTS/System/UNIVERSAL-SYSTEM-AUDIT-2025-12-14.md (Phase 3)
 * 
 * Background:
 * - Mixed usage of NEXTAUTH_URL and NEXT_PUBLIC_APP_URL caused link inconsistencies
 * - Email links must use server-side value (NEXTAUTH_URL) for security
 * - Client-side code can use NEXT_PUBLIC_APP_URL for public API calls
 * 
 * Decision: NEXTAUTH_URL is canonical for all outbound email links
 */

/**
 * Get the application base URL for email links
 * 
 * @returns {string} Base URL without trailing slash
 * 
 * @example
 * const fullUrl = `${getAppUrl()}/admin/leads/${leadId}`;
 * // => "https://solarmatch.com/admin/leads/123"
 */
export function getAppUrl(): string {
  const url = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Build a full URL from a relative path
 * 
 * @param path - Relative path (with or without leading slash)
 * @returns {string} Full absolute URL
 * 
 * @example
 * buildFullUrl('/admin/leads/123');
 * // => "https://solarmatch.com/admin/leads/123"
 * 
 * buildFullUrl('admin/leads/123');
 * // => "https://solarmatch.com/admin/leads/123"
 */
export function buildFullUrl(path: string): string {
  const baseUrl = getAppUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Build role-specific dashboard URL
 * 
 * @param role - User role
 * @returns {string} Full dashboard URL
 * 
 * @example
 * buildDashboardUrl('ADMIN');
 * // => "https://solarmatch.com/admin/dashboard"
 */
export function buildDashboardUrl(role: 'ADMIN' | 'INSTALLER' | 'HOMEOWNER'): string {
  const paths = {
    ADMIN: '/admin/dashboard',
    INSTALLER: '/installer/dashboard',
    HOMEOWNER: '/homeowner/dashboard',
  };
  return buildFullUrl(paths[role]);
}

/**
 * Validate that NEXTAUTH_URL is properly configured
 * 
 * @throws {Error} If NEXTAUTH_URL is missing or invalid
 */
export function validateAppUrlConfig(): void {
  const url = process.env.NEXTAUTH_URL;
  
  if (!url) {
    throw new Error('[Config] NEXTAUTH_URL environment variable is required');
  }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('[Config] NEXTAUTH_URL must start with http:// or https://');
  }
  
  if (url.includes('localhost') && process.env.NODE_ENV === 'production') {
    console.warn('[Config] ⚠️ WARNING: NEXTAUTH_URL points to localhost in production environment');
  }
}
