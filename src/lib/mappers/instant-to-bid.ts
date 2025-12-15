/**
 * Instant Quote → Bid Builder Mapper
 * 
 * Purpose: Transform homeowner Instant Quote data (lead.quoteData) into Bid Builder format
 * Source: DOC/Features/Quote Builder Modal/INSTANT-to-BID-ENHANCEMENT-PLAN.md
 * Date: 2025-12-01
 */

import { getSTCZoneFromPostcode } from '@/utils/stcZones';

// Type definitions
export interface InstantQuoteData {
  // Property & Location
  propertyType?: string; // 'residential' | 'commercial'
  postcode?: string;
  location?: string;
  state?: string;
  
  // System
  systemSizeOverride?: number | string; // kW
  recommendedSize?: number | string; // kW
  
  // Roof
  roofType?: string;
  roofTilt?: string; // bucket: 'flat' | 'low' | 'optimal' | 'steep'
  panelOrientation?: string; // 'north' | 'northeast' | 'northwest' | etc.
  shadingLevel?: string; // bucket: 'none' | 'minimal' | 'partial' | 'moderate' | 'heavy'
  
  // Energy & Tariffs
  customRetailRate?: number | string; // c/kWh
  customFeedInRate?: number | string; // c/kWh
  usagePattern?: string; // 'evening' | 'daytime' | 'spread'
  budgetRange?: string; // e.g., '$8000-$10000'
  desiredOffset?: number; // percentage
  electricityUsage?: number; // kWh per bill
  retailer?: string; // energy retailer
  tariffPlan?: string; // tariff name
  
  // Product Preferences (NEW - Phase 12)
  panelBrandPreference?: string;
  optimizers?: boolean;
  microinverters?: boolean;
  existingSystem?: boolean;
  
  // Battery
  batteryIncluded?: boolean;
  batteryCapacity?: string; // e.g., '10', '13.5'
  batteryBrand?: string;
  customBatteryCapacity?: string;
  backupCritical?: string; // 'essential' | 'partial' | 'whole-home'
  batteryUsage?: string; // 'self-consumption' | 'backup' | 'both'
  
  // Advanced Features
  includeVPP?: boolean;
  includeEVCharging?: boolean;
  includeSmartHome?: boolean;
  includeGridServices?: boolean;
  
  // Other
  [key: string]: any;
}

export interface QuoteDraftPartial {
  mode?: 'quote' | 'bid' | 'config';
  system?: {
    systemType?: string;
    systemSize?: number;
    projectType?: string;
  };
  roof?: {
    roofType?: string;
    pitchDeg?: number;
    orientations?: string[];
    shadingLevel?: number;
  };
  products?: {
    battery?: {
      included: boolean;
      capacity?: string;
      brand?: string;
      backupCircuitRequired?: boolean;
      usage?: string;
    };
    addons?: Array<{
      id: string;
      label: string;
      qty: number;
      unitPrice: number;
    }>;
  };
  pricing?: {
    stc?: {
      eligible: boolean;
      postcode?: string;
      zone: string;
      stcCount: number;
      stcPrice: number;
    };
  };
  assumptions?: {
    retailPrice?: number; // $/kWh
    feedInTariff?: number; // $/kWh
    selfConsumption?: number; // 0-1
  };
  meta?: {
    importedAt?: string;
    importSource?: 'instant-quote';
    prefilledFields?: string[];
    // Homeowner Context (NEW - Phase 12)
    homeownerBudget?: string; // e.g., '$8000-$10000'
    homeownerOffset?: number; // percentage 0-100
    homeownerUsagePattern?: string; // 'evening' | 'daytime' | 'spread'
    homeownerRetailer?: string; // energy retailer name
    homeownerTariff?: string; // tariff plan name
    homeownerElectricityUsage?: number; // kWh per bill
    homeownerPanelPreference?: string; // preferred panel brand
    homeownerOptimizerPreference?: boolean; // wants optimizers
    homeownerMicroinverterPreference?: boolean; // wants microinverters
    homeownerExistingSystem?: boolean; // has existing solar
    homeownerPropertyType?: string; // 'residential' | 'commercial'
  };
}

/**
 * Normalize tilt bucket to degrees
 */
export function tiltBucketToDegrees(bucket: string | undefined): number {
  if (!bucket) return 22; // default optimal
  const normalized = bucket.toLowerCase();
  switch (normalized) {
    case 'flat':
      return 5;
    case 'low':
      return 15;
    case 'optimal':
      return 25;
    case 'steep':
      return 40;
    default:
      return 22;
  }
}

/**
 * Normalize shading bucket to numeric scale (0-4)
 */
export function shadingBucketToNumeric(bucket: string | undefined): number {
  if (!bucket) return 0; // default none
  const normalized = bucket.toLowerCase();
  switch (normalized) {
    case 'none':
      return 0;
    case 'minimal':
      return 1;
    case 'partial':
      return 2;
    case 'moderate':
      return 3;
    case 'heavy':
      return 4;
    default:
      return 0;
  }
}

/**
 * Convert c/kWh to $/kWh
 */
export function centsToDollars(cents: number | string | undefined): number | undefined {
  if (cents === undefined || cents === null || cents === '') return undefined;
  const value = typeof cents === 'string' ? parseFloat(cents) : cents;
  if (isNaN(value)) return undefined;
  return value / 100;
}

/**
 * Parse budget range string to {min, max}
 */
export function parseBudgetRange(range: string | undefined): { min: number; max: number } | undefined {
  if (!range) return undefined;
  const match = range.match(/\$?(\d+(?:,\d{3})*(?:\.\d+)?)\s*-\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)/);
  if (!match) return undefined;
  const min = parseFloat(match[1].replace(/,/g, ''));
  const max = parseFloat(match[2].replace(/,/g, ''));
  return { min, max };
}

/**
 * Map usage pattern to self-consumption estimate
 */
export function usagePatternToSelfConsumption(pattern: string | undefined): number {
  if (!pattern) return 0.55; // default spread
  const normalized = pattern.toLowerCase();
  switch (normalized) {
    case 'evening':
      return 0.45;
    case 'daytime':
      return 0.65;
    case 'spread':
      return 0.55;
    default:
      return 0.55;
  }
}

/**
 * Safe parse number from various formats
 */
function safeParseNumber(value: any): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Main mapper: Instant Quote Data → Partial Quote Draft
 * 
 * @param instant - Raw quoteData from lead.quoteData
 * @returns Partial quote draft that can be merged with existing draft
 */
export function mapInstantToBid(instant: InstantQuoteData | null | undefined): QuoteDraftPartial {
  if (!instant || typeof instant !== 'object') {
    return {}; // Safe fallback
  }

  const prefilledFields: string[] = [];
  const result: QuoteDraftPartial = {
    meta: {
      importedAt: new Date().toISOString(),
      importSource: 'instant-quote',
      prefilledFields: [],
    },
  };

  // === System ===
  const systemSize = safeParseNumber(instant.systemSizeOverride) || safeParseNumber(instant.recommendedSize);
  if (systemSize) {
    result.system = {
      systemSize,
      projectType: instant.propertyType === 'commercial' ? 'Commercial' : 'Residential',
    };
    prefilledFields.push('system.systemSize', 'system.projectType');
  }

  // === Roof ===
  result.roof = {};
  if (instant.roofType) {
    result.roof.roofType = instant.roofType;
    prefilledFields.push('roof.roofType');
  }
  
  const pitchDeg = tiltBucketToDegrees(instant.roofTilt);
  if (instant.roofTilt) {
    result.roof.pitchDeg = pitchDeg;
    prefilledFields.push('roof.pitchDeg');
  }
  
  if (instant.panelOrientation) {
    result.roof.orientations = [instant.panelOrientation];
    prefilledFields.push('roof.orientations');
  }
  
  const shadingLevel = shadingBucketToNumeric(instant.shadingLevel);
  if (instant.shadingLevel) {
    result.roof.shadingLevel = shadingLevel;
    prefilledFields.push('roof.shadingLevel');
  }

  // === Assumptions (Tariffs & Self-Consumption) ===
  result.assumptions = {};
  
  const retailPrice = centsToDollars(instant.customRetailRate);
  if (retailPrice !== undefined) {
    result.assumptions.retailPrice = retailPrice;
    prefilledFields.push('assumptions.retailPrice');
  }
  
  const feedInTariff = centsToDollars(instant.customFeedInRate);
  if (feedInTariff !== undefined) {
    result.assumptions.feedInTariff = feedInTariff;
    prefilledFields.push('assumptions.feedInTariff');
  }
  
  if (instant.usagePattern) {
    result.assumptions.selfConsumption = usagePatternToSelfConsumption(instant.usagePattern);
    prefilledFields.push('assumptions.selfConsumption');
  }

  // === Battery ===
  if (instant.batteryIncluded) {
    result.products = {
      battery: {
        included: true,
        capacity: instant.batteryCapacity || instant.customBatteryCapacity || undefined,
        brand: instant.batteryBrand || undefined,
        backupCircuitRequired: instant.backupCritical !== 'essential',
        usage: instant.batteryUsage || 'self-consumption',
      },
    };
    prefilledFields.push('products.battery');
  }

  // === Addons (VPP, EV, SmartHome, GridServices) ===
  const addons: Array<{ id: string; label: string; qty: number; unitPrice: number }> = [];
  
  if (instant.includeVPP) {
    addons.push({ id: 'vpp', label: 'VPP Enrollment', qty: 1, unitPrice: 0 });
    prefilledFields.push('products.addons.vpp');
  }
  
  if (instant.includeEVCharging) {
    addons.push({ id: 'ev-charger', label: 'EV Charger Ready', qty: 1, unitPrice: 0 });
    prefilledFields.push('products.addons.ev-charger');
  }
  
  if (instant.includeSmartHome) {
    addons.push({ id: 'smart-home', label: 'Smart Home Integration', qty: 1, unitPrice: 0 });
    prefilledFields.push('products.addons.smart-home');
  }
  
  if (instant.includeGridServices) {
    addons.push({ id: 'grid-services', label: 'Grid Services Capable', qty: 1, unitPrice: 0 });
    prefilledFields.push('products.addons.grid-services');
  }
  
  if (addons.length > 0) {
    if (!result.products) result.products = {};
    result.products.addons = addons;
  }

  // === STC Zone Auto-Detection ===
  if (instant.postcode) {
    const detectedZone = getSTCZoneFromPostcode(instant.postcode);
    if (!result.pricing) result.pricing = {};
    result.pricing.stc = {
      eligible: true,
      postcode: instant.postcode,
      zone: detectedZone || 'Zone 3', // Default to Zone 3 if postcode lookup fails
      stcCount: 0, // Will be recalculated by PricingEngine
      stcPrice: 40, // Default STC price
    };
    prefilledFields.push('pricing.stc.postcode', 'pricing.stc.zone');
  }

  // Store prefilled fields for caption logic
  if (result.meta) {
    result.meta.prefilledFields = prefilledFields;
    
    // === Homeowner Context (NEW - Phase 12) ===
    // Store homeowner inputs for display in Homeowner Requirements section
    
    if (instant.budgetRange) {
      result.meta.homeownerBudget = instant.budgetRange;
    }
    
    if (instant.desiredOffset !== undefined) {
      result.meta.homeownerOffset = typeof instant.desiredOffset === 'number' 
        ? instant.desiredOffset 
        : parseFloat(String(instant.desiredOffset));
    }
    
    if (instant.usagePattern) {
      result.meta.homeownerUsagePattern = instant.usagePattern;
    }
    
    if (instant.electricityUsage) {
      result.meta.homeownerElectricityUsage = typeof instant.electricityUsage === 'number'
        ? instant.electricityUsage
        : parseFloat(String(instant.electricityUsage));
    }
    
    if (instant.retailer) {
      result.meta.homeownerRetailer = instant.retailer;
    }
    
    if (instant.tariffPlan) {
      result.meta.homeownerTariff = instant.tariffPlan;
    }
    
    if (instant.panelBrandPreference) {
      result.meta.homeownerPanelPreference = instant.panelBrandPreference;
    }
    
    if (instant.optimizers !== undefined) {
      result.meta.homeownerOptimizerPreference = Boolean(instant.optimizers);
    }
    
    if (instant.microinverters !== undefined) {
      result.meta.homeownerMicroinverterPreference = Boolean(instant.microinverters);
    }
    
    if (instant.existingSystem !== undefined) {
      result.meta.homeownerExistingSystem = Boolean(instant.existingSystem);
    }
    
    if (instant.propertyType) {
      result.meta.homeownerPropertyType = instant.propertyType;
    }
  }

  return result;
}

/**
 * Deep merge helper for applying mapped data to existing draft
 */
export function mergeQuoteDraft(existing: any, mapped: QuoteDraftPartial): any {
  const merged = { ...existing };
  
  if (mapped.system) {
    merged.system = { ...merged.system, ...mapped.system };
  }
  
  if (mapped.roof) {
    merged.roof = { ...merged.roof, ...mapped.roof };
  }
  
  if (mapped.assumptions) {
    merged.assumptions = { ...merged.assumptions, ...mapped.assumptions };
  }
  
  if (mapped.products) {
    if (mapped.products.battery) {
      merged.products = merged.products || {};
      merged.products.battery = { ...merged.products.battery, ...mapped.products.battery };
    }
    
    if (mapped.products.addons && mapped.products.addons.length > 0) {
      merged.products = merged.products || {};
      // Append addons (avoid duplicates by id)
      const existingAddonIds = new Set((merged.products.addons || []).map((a: any) => a.id));
      const newAddons = mapped.products.addons.filter(a => !existingAddonIds.has(a.id));
      merged.products.addons = [...(merged.products.addons || []), ...newAddons];
    }
  }
  
  if (mapped.pricing) {
    merged.pricing = merged.pricing || {};
    if (mapped.pricing.stc) {
      merged.pricing.stc = { ...merged.pricing.stc, ...mapped.pricing.stc };
    }
  }
  
  if (mapped.meta) {
    merged.meta = { ...merged.meta, ...mapped.meta };
  }
  
  return merged;
}
