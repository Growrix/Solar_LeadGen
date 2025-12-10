# Quote calculation logic & payback/statistics formulas (complete, ready-to-implement)

Below you’ll find:

1. A **clear list of inputs** (what you must collect in the modal).
2. **Per-field formulas** for subtotal, GST, incentives, price-per-watt, annual production, annual savings, and payback.
3. A **typescript calculation module** you can drop into your app (Prisma/React stack).
4. **Payback time-series generation** (year-by-year cashflow, cumulative cashflow, break-even year) including degradation & electricity escalation.
5. Optional **NPV & IRR** functions for more advanced investment metrics.
6. A worked **numeric example** (digit-by-digit verified).

---

# 1 — Required inputs (collected in modal)

* `systemSize_kW` (number) — e.g. 6.6
* `lineItems[]` (each: `{ description, qty, unitPrice, taxable }`)
* `includeGst` (boolean)
* `gstPercent` (number, e.g. 10 for 10%)
* `includeIncentive` (boolean) — e.g. STC or state rebate
* `incentiveAmount` (number, total rebate dollars to subtract)
* `postcode` (string) — for accurate STC estimate if implemented
* `assumptions` for production calc:

  * `yield_kWh_per_kW_per_day` (number) — typical AU value ~ 4.0–4.5 (use 4.2 as default)
  * `selfConsumptionFraction` (0–1) — fraction used on-site (typical 0.4–0.7)
  * `retailElectricityPrice` ($/kWh) — e.g. 0.30
  * `feedInTariff` ($/kWh) — e.g. 0.08
  * `annualDegradationPercent` — e.g. 0.5 (% per year)
  * `electricityEscalationPercent` — e.g. 3% per year (price inflation)
  * `annualOpex` ($/year) — maintenance & insurance (may be fixed or %)

---

# 2 — Core formulas (plain math)

### Subtotal

```
subtotal = Σ (qty_i × unitPrice_i)  for all line items
```

### GST (tax)

```
tax = includeGst ? subtotal × (gstPercent / 100) : 0
```

### Incentives (rebates/STC)

* If `includeIncentive`:

```
rebate = incentiveAmount
```

* (If you implement STC calc from postcode & systemSize, compute STC value and set rebate = STC_value.)

### Total (customer pays)

```
total = subtotal + tax - rebate
```

### Price per Watt

```
price_per_watt = total / (systemSize_kW × 1000)   // $ / W
```

### Annual generation (kWh/year)

(using the simple daily-yield model)

```
annualProduction_kWh = systemSize_kW × yield_kWh_per_kW_per_day × 365
```

### Annual savings (year 0 / base year)

Modeling self-consumption and export:

```
annualSavings = annualProduction_kWh × (
    selfConsumptionFraction × retailElectricityPrice +
    (1 - selfConsumptionFraction) × feedInTariff
) - annualOpex
```

(You may model OPEX as a yearly fixed subtraction or as %.)

### Payback (simple)

```
paybackYears = netCost / annualSavings
where netCost = total   (already had rebates removed)
```

> This simple payback gives years until the system cost is recovered by annual savings (does not discount future cash flows).

---

# 3 — Time-series & payback graph logic (recommended model)

To build a payback graph you need year-by-year cashflow and cumulative cashflow arrays.

Parameters:

* `nYears` (analysis horizon) — e.g. 25
* `degradation` (annual fraction, e.g. 0.005)
* `escalation` (electricity price growth, e.g. 0.03)
* `opex_yearly` ($)
* `initialProduction = annualProduction_kWh` from above

For each year `t` from 0..nYears-1:

1. `production_t = initialProduction × (1 - degradation)^t`
2. `retailPrice_t = retailElectricityPrice × (1 + escalation)^t`
3. `fit_t = feedInTariff × (1 + escalation)^t` (you may or may not escalate FIT)
4. `savings_t = production_t × (selfUse × retailPrice_t + (1 - selfUse) × fit_t)`
5. `netSavings_t = savings_t - opex_yearly`
6. `cashflow_t = -netCost` at t=0 (initial capex) and `+netSavings_t` for t>=1 (or if you want year0 to contain partial savings, add production fraction)
7. `cumulativeCashflow` is cumulative sum of cashflow_t — find first year >=0 to get break-even.

Plot arrays:

* x-axis: years 0..nYears
* y-axis lines: `cumulativeCashflow`, `annualSavings` (bar/line), `production`

Compute payback (years to first non-negative cumulative cashflow). For fractional year, interpolate between years t-1 and t:

```
if cum[t-1] < 0 and cum[t] >= 0:
  fraction = -cum[t-1] / (cum[t] - cum[t-1])
  paybackYears = (t-1) + fraction
```

---

# 4 — NPV & IRR (optional advanced)

* `NPV(rate) = Σ (cashflow_t / (1 + rate)^t)` for t=0..nYears
* `IRR` is rate that makes `NPV(IRR) = 0` (use Newton-Raphson or binary search)

Use discount rate (e.g., 5% real) to compute NPV. IRR tells you the annualized return.

---

# 5 — TypeScript module (drop-in)

```ts
// utils/quoteCalculator.ts
export type LineItem = { description: string; qty: number; unitPrice: number; taxable?: boolean };

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

export function calcQuoteTotals(inputs: QuoteInputs) {
  const subtotal = calcSubtotal(inputs.lineItems);
  const tax = calcTax(subtotal, inputs.includeGst, inputs.gstPercent);
  const rebate = inputs.includeIncentive ? inputs.incentiveAmount : 0;
  const total = subtotal + tax - rebate;
  const pricePerWatt = total / (inputs.systemSize_kW * 1000);
  const annualProduction = calcAnnualProduction(inputs.systemSize_kW, inputs.yield_kWh_per_kW_per_day);
  const annualSavings = calcAnnualSavings(annualProduction, inputs.selfConsumption, inputs.retailPrice, inputs.feedInTariff, inputs.annualOpex);
  const paybackYears = annualSavings > 0 ? total / annualSavings : Infinity;

  return {
    subtotal, tax, rebate, total, pricePerWatt, annualProduction, annualSavings, paybackYears
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
) {
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
```

---

# 6 — Worked numeric example (digit-by-digit verified)

**Inputs**

* `systemSize` = 6.6 kW
* `lineItems subtotal` = $11,000 (sum of all line items)
* `includeGst` = true, `gstPercent` = 10%
* `includeIncentive` = true, `incentiveAmount` = $2,000
* `yield` = 4.2 kWh/kW/day
* `selfConsumption` = 0.5
* `retailPrice` = $0.30/kWh
* `feedInTariff` = $0.08/kWh
* `annualOpex` = $0 (for simplicity here)

Step-by-step:

1. `gst = 11000 × 0.10 = 1,100`

2. `total_before_rebate = 11000 + 1100 = 12,100`

3. `rebate = 2,000`

4. `total = 12,100 - 2,000 = 10,100`  → **net cost to customer $10,100**

5. `pricePerWatt = 10,100 / (6.6 × 1000) = 10,100 / 6,600 = 1.5303030303030303 $/W` ≈ **$1.53/W**

6. `annualProduction = 6.6 × 4.2 × 365`

   * 6.6 × 4.2 = 27.72
   * 27.72 × 365 = 27.72 × (300 + 60 + 5)

     * 27.72 × 300 = 8,316
     * 27.72 × 60 = 1,663.2
     * 27.72 × 5 = 138.6
   * sum = 8,316 + 1,663.2 + 138.6 = **10,117.8 kWh/year**

7. `annualSavings = 10,117.8 × (0.5 × 0.30 + 0.5 × 0.08)`

   * inside = 0.15 + 0.04 = 0.19
   * annualSavings = 10,117.8 × 0.19 = **1,922.3819999999998** ≈ **$1,922.38 / year**

8. `paybackYears = 10,100 / 1,922.382 ≈ 5.2539 years` → **~5.25 years**

(These numbers were computed exactly and verified.)

---

# 7 — UI/graph notes (how to show on frontend)

* Show immediate summary cards: `Total`, `Price/W`, `Annual Production (kWh)`, `Est Annual Savings`, `Payback (yrs)`.
* Provide a toggle: **Simple Payback** (total ÷ annualSavings) vs **Discounted Payback & NPV/IRR** (advanced).
* Graph: left Y-axis = Cumulative cashflow ($), right Y-axis = Annual savings ($) or production (kWh). Use a line for cumulative cashflow and bars for annual savings.
* Mark the break-even year with a vertical line and annotation (e.g., "Break-even at 5.3 yrs").
* Provide scenario toggles: change self-consumption (slider), retail price escalation, and degradation — update graph in real-time.

---

# 8 — Practical tips & accuracy improvements

* Replace `yield_kWh_per_kW_per_day` with a solar-model using location, tilt, orientation, shading and pvlib (if you want higher accuracy).
* Estimate STCs using postcode + systemSize + deeming period (use official STC zone/lookup).
* Distinguish between **retail price** (what homeowner avoids buying) and **marginal price** (banded rates for different usage).
* Consider **time-of-use** and battery charging optimization later — that changes the value of exported vs self-consumed kWh.
* Add `sensitivity` panel to show payback under best/likely/worst cases (e.g., ±10% yield, ±20% electricity price).


