/**
 * Contact Masking Utilities
 * 
 * Masks email and phone for installers viewing unpurchased leads
 * Prevents contact harvesting while showing installer data exists
 * 
 * Phase 4.16.14 - Sprint 4.16.14.1
 */

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.com';
  
  const [local, domain] = email.split('@');
  const domainParts = domain.split('.');
  const tld = domainParts.pop() || 'com';
  
  return `${local[0]}***@***.${tld}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return '(***) ***-****';
  
  // Extract digits only
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `(${digits.substring(0, 3)}) ***-****`;
  }
  
  return '(***) ***-****';
}

export function maskName(name: string): string {
  if (!name) return 'Homeowner';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return `${parts[0][0]}***`;
  }
  
  return `${parts[0]} ${parts[1][0]}.`;
}
