/**
 * Installer Type Definitions
 * 
 * Type definitions for installer profile and assigned leads API responses.
 */

export interface InstallerProfile {
  id: string;
  companyName: string;
  email: string;
  phone: string | null;
  serviceAreas: string[];
  postcodes: string[];
  isApproved: boolean;
  verified: boolean;
  creditBalance: number;
  totalUnlocks: number;
  successRate: number;
}

export interface AssignedLead {
  id: string;
  homeownerId: string;
  status: string;
  quoteType: string;
  postcode: string;
  location: string;
  state: string;
  propertyType: string | null;
  projectType: string;
  roofType?: string | null;
  budgetRange?: string | null;
  leadPrice: number | null;
  purchaseStatus?: string | null;
  purchasedAt?: string | null;
  quotesCount?: number;
  expiresAt: string | null;
  createdAt: string;
  assignedAt: string;
  assignmentNotes: string | null;
  homeowner: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  countdown: {
    daysLeft: number;
    hoursLeft: number;
    minutesLeft: number;
    expired: boolean;
  } | null;
  isPurchased?: boolean;
  isPurchasedByAnother?: boolean;
  // Extended fields (visible only after purchase)
  address?: string | null;
  energyBill?: number | null;
  billType?: string | null;
  desiredOffset?: number | null;
  batteryRequired?: boolean | null;
  batteryCapacity?: string | null;
  timeframe?: string | null;
  additionalNotes?: string | null;
  phoneNumber?: string | null;
  phoneVerified?: boolean | null;
  approvedAt?: string | null;
  quoteData?: any; // JSON data from InstantQuote
  // T196: Bids data for winner/loser detection
  installerId?: string | null;
  bids?: Array<{
    id: string;
    installerId: string;
    status: string;
    amount: number;
    selectedAt?: Date | null;
    purchasedAt?: Date | null;
  }>;
}
