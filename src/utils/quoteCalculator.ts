// utils/quoteCalculator.ts
// Quote calculation logic for solar quote builder
// Based on: DOC/Features/Quote Builder Modal/Main Plan/ChatGPT_CalculationLogic.md

export type LineItem = { 
  description: string; 
  qty: number; 
  unitPrice: number; 
  taxable?: boolean; 
};

export type QuoteInputs = {
  systemSize_kW: number;
  lineItems: LineItem[];
  includeGst: boolean;
  gstPercent: number;
  includeIncentive: boolean;
  incentiveAmount: number;
  yield_kWh_per_kW_per_day: number; // e.g. 4.2
  selfConsumption: number; // 0..1
  retailPrice: number; // $/kWh
  feedInTariff: number; // $/kWh
  annualOpex: number; // $
}

export type QuoteTotals = {
  subtotal: number;
  tax: number;
  rebate: number;
  total: number;
  pricePerWatt: number;
  annualProduction: number;
  annualSavings: number;
  paybackYears: number | 'N/A';
}

export type CashflowSeries = {
  cashflow: number[];
  annualSavingsArr: number[];
  cumulative: number[];
  breakEvenYear: number | null;
}

export function calcSubtotal(lineItems: LineItem[]) {
  return lineItems.reduce((s, it) => s + (it.qty || 0) * (it.unitPrice || 0), 0);
}

export function calcTax(subtotal: number, includeGst: boolean, gstPercent: number) {
  return includeGst ? subtotal * (gstPercent / 100) : 0;
}

export function calcAnnualProduction(systemSize_kW: number, yield_kWh_per_kW_per_day: number) {
  return systemSize_kW * yield_kWh_per_kW_per_day * 365;
}

export function calcAnnualSavings(
  annualProduction_kWh: number,
  selfConsumption: number,
  retailPrice: number,
  feedInTariff: number,
  annualOpex = 0
) {
  const value = annualProduction_kWh * (selfConsumption * retailPrice + (1 - selfConsumption) * feedInTariff);
  return value - annualOpex;
}

export function calcQuoteTotals(inputs: QuoteInputs): QuoteTotals {
  const subtotal = calcSubtotal(inputs.lineItems);
  const tax = calcTax(subtotal, inputs.includeGst, inputs.gstPercent);
  const rebate = inputs.includeIncentive ? inputs.incentiveAmount : 0;
  const total = subtotal + tax - rebate;
  const pricePerWatt = inputs.systemSize_kW > 0 ? total / (inputs.systemSize_kW * 1000) : 0;
  const annualProduction = calcAnnualProduction(inputs.systemSize_kW, inputs.yield_kWh_per_kW_per_day);
  const annualSavings = calcAnnualSavings(
    annualProduction, 
    inputs.selfConsumption, 
    inputs.retailPrice, 
    inputs.feedInTariff, 
    inputs.annualOpex
  );
  const paybackYears = annualSavings > 0 ? total / annualSavings : 'N/A';

  return {
    subtotal, 
    tax, 
    rebate, 
    total, 
    pricePerWatt, 
    annualProduction, 
    annualSavings, 
    paybackYears
  };
}

// Time-series generator for payback graph
export function generateCashflowSeries(
  totalCapex: number,
  annualProduction_kWh: number,
  selfConsumption: number,
  retailPrice: number,
  feedInTariff: number,
  annualOpex: number,
  degradation = 0.005,
  escalation = 0.03,
  years = 25
): CashflowSeries {
  const cashflow: number[] = [];
  const annualSavingsArr: number[] = [];
  const cumulative: number[] = [];

  // t=0 initial investment
  cashflow.push(-totalCapex);
  cumulative.push(-totalCapex);

  for (let t = 1; t <= years; t++) {
    const prod = annualProduction_kWh * Math.pow(1 - degradation, t - 1);
    const retail_t = retailPrice * Math.pow(1 + escalation, t - 1);
    const fit_t = feedInTariff * Math.pow(1 + escalation, t - 1);
    const savings = prod * (selfConsumption * retail_t + (1 - selfConsumption) * fit_t);
    const netSavings = savings - annualOpex;
    annualSavingsArr.push(netSavings);
    cashflow.push(netSavings);
    cumulative.push(cumulative[cumulative.length - 1] + netSavings);
  }

  // compute break-even (interpolated)
  let breakEvenYear: number | null = null;
  for (let i = 1; i < cumulative.length; i++) {
    if (cumulative[i] >= 0 && cumulative[i - 1] < 0) {
      const frac = -cumulative[i - 1] / (cumulative[i] - cumulative[i - 1]);
      breakEvenYear = (i - 1) + frac;
      break;
    }
  }
  return { cashflow, annualSavingsArr, cumulative, breakEvenYear };
}

// NPV & IRR
export function npv(rate: number, cashflows: number[]) {
  return cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
}

export function irr(cashflows: number[], guess = 0.1, maxIter = 100, tol = 1e-6) {
  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    // Newton-Raphson: rate_next = rate - f(rate) / f'(rate)
    const f = npv(rate, cashflows);
    // derivative f' = Σ (-t * cf / (1+rate)^(t+1))
    const df = cashflows.reduce((acc, cf, t) => acc - (t * cf) / Math.pow(1 + rate, t + 1), 0);
    if (Math.abs(df) < 1e-9) break;
    const next = rate - f / df;
    if (!isFinite(next)) break;
    if (Math.abs(next - rate) < tol) {
      return next;
    }
    rate = next;
  }
  return NaN;
}

// Default assumptions for Australian market
export const DEFAULT_ASSUMPTIONS = {
  yield_kWh_per_kW_per_day: 4.2,
  selfConsumption: 0.5,
  retailPrice: 0.30,
  feedInTariff: 0.08,
  annualOpex: 0,
  degradationPercentPerYear: 0.5,
  escalationPercentPerYear: 3.0,
  analysisYears: 25,
  gstPercent: 10
};
