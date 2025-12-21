/**
 * Written Quote Type Definitions
 * 
 * Shared types for Written Quote feature (Phase 4.16)
 * Used across API, components, and business logic
 */

/**
 * Financial Assumptions for Written Quotes
 * Used in Quote Builder → Written Quote submission
 * 
 * @example Object Format (Current Standard)
 * {
 *   paybackYears: 7.5,
 *   dailyUsageKWh: 25.5,
 *   solarOffsetPercent: 75,
 *   annualPriceIncrease: 3.5,
 *   systemLifespanYears: 25,
 *   feedInTariffCentsKWh: 8
 * }
 */
export interface FinancialAssumptions {
  /** Years to break even on investment */
  paybackYears?: number;
  
  /** Daily energy usage estimate (kWh) */
  dailyUsageKWh?: number;
  
  /** Percentage of usage offset by solar system */
  solarOffsetPercent?: number;
  
  /** Annual electricity price increase (percentage) */
  annualPriceIncrease?: number;
  
  /** Expected system lifetime (years) */
  systemLifespanYears?: number;
  
  /** Feed-in tariff rate (cents per kWh) */
  feedInTariffCentsKWh?: number;
}

/**
 * Assumptions field can be:
 * - Object: Structured financial data (current standard)
 * - String: Legacy free-text assumptions
 * - Null: No assumptions provided
 * 
 * Frontend MUST handle all three formats
 */
export type AssumptionsData = FinancialAssumptions | string | null;
