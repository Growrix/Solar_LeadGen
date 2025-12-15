// utils/stcZones.ts
// STC (Small-scale Technology Certificate) zone mapping for Australian postcodes
// Based on: DOC/Features/Quote Builder Modal/Main Plan/ChatGPT_CalculationLogic.md

export type STCZone = 'Zone 1' | 'Zone 2' | 'Zone 3' | 'Zone 4';

// STC Deeming Factors (2025) by Zone
export const DEEMING_FACTORS: Record<STCZone, number> = {
  'Zone 1': 1.622,
  'Zone 2': 1.536,
  'Zone 3': 1.382,
  'Zone 4': 1.185
};

// Simplified postcode to STC zone mapping for Australian regions
// Zone 1: Darwin, Northern Territory (highest solar irradiance)
// Zone 2: Queensland, Northern WA, Northern NSW
// Zone 3: Perth, Adelaide, Sydney, Southern QLD (most populated regions)
// Zone 4: Melbourne, Hobart, Southern regions (lower solar irradiance)

const POSTCODE_RANGES: Array<{ start: number; end: number; zone: STCZone }> = [
  // Northern Territory - Zone 1
  { start: 800, end: 899, zone: 'Zone 1' },
  
  // Queensland - mostly Zone 2/3
  { start: 4000, end: 4299, zone: 'Zone 3' }, // Brisbane and surrounds - Zone 3
  { start: 4300, end: 4999, zone: 'Zone 2' }, // North/Central QLD - Zone 2
  
  // New South Wales - mostly Zone 3
  { start: 2000, end: 2249, zone: 'Zone 3' }, // Sydney metro
  { start: 2250, end: 2599, zone: 'Zone 3' }, // Central Coast, Hunter
  { start: 2600, end: 2619, zone: 'Zone 4' }, // Canberra (ACT) - Zone 4
  { start: 2620, end: 2899, zone: 'Zone 3' }, // Southern NSW
  { start: 2900, end: 2999, zone: 'Zone 2' }, // Northern NSW
  
  // Victoria - Zone 4
  { start: 3000, end: 3999, zone: 'Zone 4' },
  
  // South Australia - Zone 3
  { start: 5000, end: 5799, zone: 'Zone 3' },
  
  // Western Australia
  { start: 6000, end: 6199, zone: 'Zone 3' }, // Perth metro - Zone 3
  { start: 6200, end: 6699, zone: 'Zone 2' }, // Northern WA - Zone 2
  { start: 6700, end: 6999, zone: 'Zone 3' }, // Southern WA - Zone 3
  
  // Tasmania - Zone 4
  { start: 7000, end: 7999, zone: 'Zone 4' },
];

export function getSTCZoneFromPostcode(postcode: string | number): STCZone | null {
  const postcodeNum = typeof postcode === 'string' ? parseInt(postcode, 10) : postcode;
  
  if (isNaN(postcodeNum) || postcodeNum < 800 || postcodeNum > 7999) {
    return null; // Invalid postcode
  }
  
  for (const range of POSTCODE_RANGES) {
    if (postcodeNum >= range.start && postcodeNum <= range.end) {
      return range.zone;
    }
  }
  
  return null; // Postcode not mapped
}

export function calculateSTCCount(
  systemSize_kW: number,
  zone: STCZone,
  deemingPeriodYears: number = 10 // As of 2025, typically 10 years
): number {
  const deemingFactor = DEEMING_FACTORS[zone];
  // STC count = system size (kW) × deeming factor × deeming period years
  return Math.round(systemSize_kW * deemingFactor * deemingPeriodYears);
}

export function calculateSTCValue(
  systemSize_kW: number,
  zone: STCZone,
  stcPrice: number,
  deemingPeriodYears: number = 10
): number {
  const stcCount = calculateSTCCount(systemSize_kW, zone, deemingPeriodYears);
  return stcCount * stcPrice;
}
