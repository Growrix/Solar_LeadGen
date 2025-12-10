/**
 * Lead Type Definitions
 * 
 * Purpose: TypeScript types for lead management
 * Used for: API requests/responses, form validation, state management
 * 
 * Why separate from Prisma types?
 * - Prisma types include ALL database fields (including internal IDs, timestamps)
 * - These types are for API contracts (only fields we want to expose)
 * - Allows us to add computed fields or transform data
 * - Better type safety for frontend/backend communication
 */

import { Lead, LeadStatus, LeadVisibility, PurchaseStatus } from '@prisma/client';

/**
 * Lead creation data (from homeowner)
 * Used when homeowner submits a new lead request
 */
export interface CreateLeadInput {
  // Project details
  projectType: 'residential' | 'commercial';
  quoteType: 'CALL_VISIT' | 'WRITTEN_QUOTE';
  propertyType: string;
  postcode: string;
  location: string;
  state: string;
  address?: string;

  // Energy requirements
  energyBill: number;
  billType: 'quarterly' | 'monthly';
  roofType: string;
  budgetRange: string;
  desiredOffset: number; // 0-100

  // Preferences
  batteryRequired: boolean;
  batteryCapacity?: string;
  timeframe?: string;
  additionalNotes?: string;

  // Phone verification
  phoneNumber: string; // E.164 format

  // Quote Data (Phase 4.5: Complete instant quote calculation)
  quoteData?: any; // Complete InstantQuoteForm data + calculation results
}

/**
 * Lead with computed fields (for display)
 * Used when returning lead data to frontend
 */
export interface LeadWithDetails extends Lead {
  // Computed fields
  homeownerName: string;
  installerName?: string;
  installerCompany?: string;
  quotesCount: number;
  unreadMessagesCount: number;
  daysUntilExpiry?: number;
  
  // Nested relations
  phoneVerification?: {
    isVerified: boolean;
    phoneNumber: string;
  };
}

/**
 * Lead list item (for feed/dashboard)
 * Minimal data for list views
 */
export interface LeadListItem {
  id: string;
  projectType: string;
  quoteType: 'CALL_VISIT' | 'WRITTEN_QUOTE';
  postcode: string;
  location: string;
  state: string;
  budgetRange: string;
  batteryRequired: boolean;
  status: LeadStatus;
  leadPrice?: number;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Lead purchase request
 * Used when installer purchases a lead
 */
export interface PurchaseLeadInput {
  leadId: string;
  paymentMethodId: string; // Stripe payment method ID
}

/**
 * Lead purchase response
 * Returned after successful purchase
 */
export interface PurchaseLeadResponse {
  success: boolean;
  lead: LeadWithDetails;
  paymentIntentId: string;
  clientSecret: string; // For 3D Secure authentication
}

/**
 * Lead update input (admin only)
 * Used for admin moderation
 */
export interface UpdateLeadInput {
  status?: LeadStatus;
  visibility?: LeadVisibility;
  adminNotes?: string;
  flaggedReason?: string;
  leadPrice?: number;
}

/**
 * Lead statistics (for analytics)
 */
export interface LeadStatistics {
  total: number;
  byStatus: Record<LeadStatus, number>;
  byState: Record<string, number>;
  averageLeadPrice: number;
  conversionRate: number; // % of leads that result in quotes
  averageResponseTime: number; // Hours until first quote
}

/**
 * Lead filters (for search/filter)
 */
export interface LeadFilters {
  status?: LeadStatus[];
  visibility?: LeadVisibility[];
  state?: string[];
  postcode?: string;
  projectType?: ('residential' | 'commercial')[];
  quoteType?: ('CALL_VISIT' | 'WRITTEN_QUOTE')[];
  batteryRequired?: boolean;
  minBudget?: number;
  maxBudget?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Lead sort options
 */
export type LeadSortField = 'createdAt' | 'updatedAt' | 'leadPrice' | 'postcode';
export type LeadSortOrder = 'asc' | 'desc';

export interface LeadSort {
  field: LeadSortField;
  order: LeadSortOrder;
}

/**
 * Paginated lead response
 */
export interface PaginatedLeads {
  leads: LeadListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * InstantQuote Results (complete calculation data + user inputs)
 * Used in BidEvaluationModal, QuoteBuilderModal right column, LeadTechnicalDetails
 */
export interface InstantQuoteResults {
  quoteType: 'residential' | 'commercial';
  systemSize: number;
  annualProduction: number;
  annualSavings: number;
  currentAnnualBill: number;
  totalCost: number;
  federalRebate: number;
  batteryRebate: number;
  stateRebate: number;
  finalPrice: number;
  simplePaybackYears: number | null;
  selfConsumedKwh?: number;
  exportedKwh?: number;
  co2Reduction?: number;
  roofArea?: number;
  panelsRequired?: number;
  demandChargeSavings?: number;
  energySavings?: number;
  disclaimers?: string[];
  // User selections from InstantQuoteForm
  electricityValue?: string | number;
  electricityUsageType?: 'monthly' | 'quarterly';
  desiredOffset?: number;
  usagePattern?: string;
  panelBrand?: string;
  panelOrientation?: string;
  roofTilt?: string;
  shadingLevel?: string;
  includeOptimizers?: boolean;
  includeMicroinverters?: boolean;
  batteryBrand?: string;
  batteryCapacity?: string;
  customBatteryCapacity?: string;
  backupCritical?: string;
  batteryUsage?: string;
  retailer?: string;
  tariffPlan?: string;
  customRetailRate?: string;
  customFeedInRate?: string;
  includeVPP?: boolean;
  includeEVCharging?: boolean;
  includeSmartHome?: boolean;
  includeGridServices?: boolean;
  hasExistingSystem?: boolean;
  existingSystemSize?: string;
  peakDemand?: string;
  isThreePhase?: boolean;
  projectPriority?: string;
  systemSizeOverride?: string;
}

/**
 * Full Lead Data (from API response)
 * Used in BidEvaluationModal, QuoteBuilderModal right column
 * Contains all lead properties including nested quoteData
 */
export interface LeadData {
  id: string;
  projectType: string;
  propertyType: string;
  postcode: string;
  location: string;
  state: string;
  address?: string;
  energyBill: number;
  billType: string;
  roofType: string;
  budgetRange: string;
  desiredOffset: number;
  batteryRequired: boolean;
  batteryCapacity?: string;
  timeframe?: string;
  additionalNotes?: string;
  quoteData?: InstantQuoteResults;
  quoteType: string;
  expiresAt?: string;
  leadPrice?: number;
  phoneNumber?: string;
  name?: string;
}
