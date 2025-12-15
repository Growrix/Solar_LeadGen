/**
 * Phase 13 - Comprehensive Bid Type Definitions
 * 
 * These types define the structure for storing Quote Builder data
 * in the Bid model's JSON fields. This enables full persistence of
 * all installer quote details for homeowner comparison and winner selection.
 */

// ===========================
// System Data Types
// ===========================

export interface BidSystemData {
  capacityKw: number;
  systemType: 'gridTied' | 'hybrid' | 'offGrid';
  solarPanelsArray: Array<{
    quantity: number;
    wattage: number;
    totalKw: number;
  }>;
}

// ===========================
// Products Data Types
// ===========================

export interface BidProductsData {
  solarPanels: Array<{
    brand: string;
    model: string;
    wattage: number;
    quantity: number;
    efficiency: number;
    warranty: string;
  }>;
  inverter: {
    brand: string;
    model: string;
    capacityKw: number;
    type: 'string' | 'micro' | 'hybrid';
    warranty: string;
    phaseType: 'single' | 'three';
  };
  battery?: {
    brand: string;
    model: string;
    capacityKwh: number;
    warranty: string;
    chemistry: string;
  };
}

// ===========================
// Line Items (Pricing Engine)
// ===========================

export interface BidLineItem {
  category: 'panels' | 'inverter' | 'battery' | 'installation' | 'electrical' | 'design' | 'permits' | 'other' | 'discount';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  gstIncluded: boolean;
  notes?: string;
}

// ===========================
// Assumptions Data Types
// ===========================

export interface BidAssumptions {
  feedInTariffCentsKwh: number;
  dailyUsageKwh: number;
  solarOffsetPercent: number;
  annualPriceIncrease: number;
  paybackYears: number;
  systemLifespanYears: number;
  notes?: string;
}

// ===========================
// Roof & Site Details Types
// ===========================

export interface BidRoofData {
  roofType: string;
  pitchDeg: number;
  arrays: number;
  orientations: string[];
  shadingLevel: number; // 0-100
  phaseType: 'single' | 'three';
  switchboardUpgrade: boolean;
  smartMeterRequired: boolean;
  distanceToSwitchboardM: number;
  notes: string;
  photos: string[]; // S3 URLs
  // Phase 9 - Installer-only fields
  arrayLayoutNotes?: string;
  roofAccessNotes?: string;
  structuralNotes?: string;
  mountingSystemPreferred?: string;
  conduitRunComplexity?: 'low' | 'medium' | 'high';
  inverterLocationNotes?: string;
}

// ===========================
// Calculations Data Types
// ===========================

export interface BidCalculations {
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  includeIncentive: boolean;
  incentiveAmount: number;
  finalTotal: number;
  pricePerWatt: number;
  estimatedAnnualSavings?: number;
  paybackYears?: number;
}

// ===========================
// Import Metadata Types
// ===========================

export interface BidImportMeta {
  prefilledFields: string[];
  importSource: 'lead' | 'instant-quote' | 'manual';
  importTimestamp: string; // ISO 8601
  leadId: string;
  instantQuoteId?: string;
}

// ===========================
// Installer Contact Types
// ===========================

export interface BidInstallerContact {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  cec: string;
  accreditation: string;
}

// ===========================
// Comprehensive Bid Data
// ===========================

/**
 * Complete structure for all Quote Builder data stored in Bid model
 * Maps to the 8 JSON fields: systemData, productsData, lineItems, assumptions,
 * roofData, calculations, importMeta, installerContact
 */
export interface ComprehensiveBidData {
  systemData: BidSystemData;
  productsData: BidProductsData;
  lineItems: BidLineItem[];
  assumptions: BidAssumptions;
  roofData: BidRoofData;
  calculations: BidCalculations;
  importMeta: BidImportMeta;
  installerContact: BidInstallerContact;
}

// ===========================
// API Request/Response Types
// ===========================

/**
 * Request body for POST /api/bids (creating a new bid)
 * Combines legacy fields with new comprehensive data
 */
export interface CreateBidRequest {
  leadId: string;
  
  // Legacy fields (backward compatible)
  amount: number;
  capacityOffer?: number;
  expectedInstallDate?: string;
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
  
  // Phase 13 - Comprehensive Quote Builder data
  systemData?: BidSystemData;
  productsData?: BidProductsData;
  lineItems?: BidLineItem[];
  assumptions?: BidAssumptions;
  roofData?: BidRoofData;
  calculations?: BidCalculations;
  importMeta?: BidImportMeta;
  installerContact?: BidInstallerContact;
}

/**
 * Response from POST /api/bids
 */
export interface CreateBidResponse {
  success: boolean;
  bidId: string;
  message: string;
  bid: {
    id: string;
    leadId: string;
    installerId: string;
    amount: number;
    finalTotal: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Response from GET /api/bids?leadId={leadId} or GET /api/leads/{leadId}/bids
 * Returns all bids for a lead (for homeowner comparison)
 */
export interface GetBidsResponse {
  success: boolean;
  bids: Array<{
    id: string;
    leadId: string;
    installerId: string;
    installer: {
      companyName: string;
      email: string;
      phone: string;
      businessAddress: string;
    };
    amount: number;
    finalTotal: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    
    // Legacy fields
    capacityOffer?: number;
    expectedInstallDate?: string;
    notes?: string;
    panelBrand?: string;
    inverterBrand?: string;
    batteryBrand?: string;
    batteryCapacity?: string;
    
    // Phase 13 - Comprehensive data
    systemData?: BidSystemData;
    productsData?: BidProductsData;
    lineItems?: BidLineItem[];
    assumptions?: BidAssumptions;
    roofData?: BidRoofData;
    calculations?: BidCalculations;
    importMeta?: BidImportMeta;
    installerContact?: BidInstallerContact;
  }>;
}

/**
 * Response from POST /api/bids/{bidId}/select (winner selection)
 */
export interface SelectWinnerResponse {
  success: boolean;
  message: string;
  selectedBid: {
    id: string;
    leadId: string;
    installerId: string;
    status: string;
    selectedAt: string;
  };
  notifiedInstallers: {
    winner: string; // Winner installer ID
    losers: string[]; // Loser installer IDs
  };
}
