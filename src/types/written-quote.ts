// Phase 13W: Written Quote Negotiation Types
// This file contains all TypeScript types for the Written Quote feature

// Import Bid type interfaces for reuse (DRY principle)
// Written Quote uses the same Quote Builder data structure as Bid
import {
  BidSystemData,
  BidProductsData,
  BidLineItem,
  BidAssumptions,
  BidRoofData,
  BidCalculations,
  BidImportMeta,
  BidInstallerContact
} from './bid';

/**
 * Request body for creating a new Written Quote (POST /api/written-quotes)
 * Installer submits initial quote to homeowner
 */
export interface CreateWrittenQuoteRequest {
  leadId: string;
  amount: number;
  capacityOffer?: number;
  expectedInstallDate?: string; // ISO 8601 date string
  notes?: string;
  panelBrand?: string;
  inverterBrand?: string;
  batteryBrand?: string;
  batteryCapacity?: string;
  includeGst?: boolean;
  gstPercent?: number;
  gstAmount?: number;
  includeIncentive?: boolean;
  incentiveAmount?: number;
  finalTotal: number;
  
  // Phase 13 - Comprehensive Quote Builder data (JSON fields)
  systemData?: Record<string, unknown>; // System capacity, type, solar panels array
  productsData?: Record<string, unknown>; // Panel, inverter, battery details
  lineItems?: Record<string, unknown>; // Pricing engine 9 categories
  assumptions?: Record<string, unknown>; // Feed-in tariff, usage, offset
  roofData?: Record<string, unknown>; // Roof type, pitch, arrays, orientations
  calculations?: Record<string, unknown>; // Total cost, GST, incentive, payback
  importMeta?: Record<string, unknown>; // Prefilled fields metadata
  installerContact?: Record<string, unknown>; // Installer contact info
}

/**
 * Request body for homeowner counter offer (PATCH /api/written-quotes/[id]/counter)
 * Homeowner can counter ONCE only
 */
export interface CounterOfferRequest {
  counterAmount: number;
  message?: string; // Optional message to installer
}

/**
 * Request body for installer to revise quote (PATCH /api/written-quotes/[id]/revise)
 * Installer can revise unlimited times
 */
export interface ReviseQuoteRequest {
  revisedAmount: number;
  message?: string; // Optional message to homeowner
}

/**
 * Request body for either party to agree (POST /api/written-quotes/[id]/agree)
 * Either installer or homeowner can click "Done Deal"
 */
export interface AgreeQuoteRequest {
  agreedBy: string; // User ID of person accepting
}

/**
 * Step 2: Accept a pending done-deal request
 */
export interface AcceptQuoteResponse {
  success: boolean;
  agreedAmount?: number;
  message?: string;
}

/**
 * Response from GET /api/written-quotes?leadId={id}
 * Returns all written quotes for a specific lead
 */
export interface GetWrittenQuotesResponse {
  success?: boolean;
  writtenQuotes: WrittenQuoteWithInstaller[];
}

/**
 * Written Quote with installer information (for display in homeowner modal)
 */
export interface WrittenQuoteWithInstaller {
  id: string;
  leadId: string;
  installerId: string;
  amount: number;
  capacityOffer?: number | null;
  expectedInstallDate?: string | null;
  notes?: string | null;
  panelBrand?: string | null;
  inverterBrand?: string | null;
  batteryBrand?: string | null;
  batteryCapacity?: string | null;
  includeGst: boolean;
  gstPercent: number;
  gstAmount: number;
  includeIncentive: boolean;
  incentiveAmount: number;
  finalTotal: number;
  status: string;
  
  // Negotiation fields
  negotiationStatus: string;
  homeownerCounterAmount?: number | null;
  homeownerCounterAt?: string | null;
  installerRevisedAmount?: number | null;
  installerRevisedAt?: string | null;
  agreedAmount?: number | null;
  agreedAt?: string | null;
  agreedBy?: string | null;
  homeownerCounterCount?: number | null;
  installerRevisionCount?: number | null;
  negotiationTurnCount?: number | null;
  negotiationDeadlineAt?: string | null;
  negotiationExpiredAt?: string | null;
  homeownerModalActiveAt?: string | null;
  installerModalActiveAt?: string | null;
  homeownerExtensionUsed?: boolean | null;
  installerExtensionUsed?: boolean | null;
  adminExtensionCount?: number | null;
  adminLastExtendedAt?: string | null;
  adminLastExtendedBy?: string | null;
  selectedAt?: string | null;
  purchasedAt?: string | null; // Phase 13W.2: Purchase timestamp
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // JSON data (properly typed using Bid interfaces for consistency)
  systemData?: BidSystemData;
  productsData?: BidProductsData;
  lineItems?: BidLineItem[];
  assumptions?: BidAssumptions;
  roofData?: BidRoofData;
  calculations?: BidCalculations;
  importMeta?: BidImportMeta;
  installerContact?: BidInstallerContact;
  
  // Installer info (joined from User table)
  installer: {
    id: string;
    companyName?: string | null;
    email: string;
    phone?: string | null;
    businessAddress?: string | null;
  };
}

/**
 * Negotiation event for timeline display
 * Used in NegotiationTimeline component
 */
export interface NegotiationEvent {
  id: string;
  action: 'SUBMIT' | 'COUNTER' | 'REVISE' | 'ACCEPT';
  actorRole: 'INSTALLER' | 'HOMEOWNER';
  amount: number;
  message?: string | null;
  createdAt: string; // ISO 8601 timestamp
}

/**
 * Response from successful Written Quote creation
 */
export interface CreateWrittenQuoteResponse {
  success: boolean;
  writtenQuoteId: string;
  message?: string;
}

/**
 * Response from successful counter/revise/agree action
 */
export interface UpdateWrittenQuoteResponse {
  success: boolean;
  message?: string;
  agreedAmount?: number; // Returned on /agree endpoint
}

/**
 * Error response from Written Quote APIs
 */
export interface WrittenQuoteErrorResponse {
  error: string;
  details?: string;
}

/**
 * Negotiation status enum
 */
export enum NegotiationStatus {
  PENDING = 'PENDING',
  HOMEOWNER_COUNTERED = 'HOMEOWNER_COUNTERED',
  INSTALLER_RESPONDED = 'INSTALLER_RESPONDED',
  PENDING_ACCEPTANCE = 'PENDING_ACCEPTANCE',
  AGREED = 'AGREED',
  REJECTED = 'REJECTED',
}

/**
 * Written Quote status enum
 */
export enum WrittenQuoteStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_NEGOTIATION = 'UNDER_NEGOTIATION',
  AGREED = 'AGREED',
  SELECTED = 'SELECTED',
  PURCHASED = 'PURCHASED',
  REJECTED = 'REJECTED',
}

// (duplicate GetWrittenQuotesResponse removed)
