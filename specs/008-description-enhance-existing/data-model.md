# Data Model – Quote Builder Modal Enhancement

## Entities

### QuoteOption
- name: string (Economy | Balanced | Premium | custom)
- systemSizeKw: number
- lineItems: Array<{ label: string; qty: number; unitPrice: number; gstIncluded?: boolean }>
- incentives: Incentives
- totals: { subtotal: number; gst: number; incentivesTotal: number; total: number; pricePerWatt: number }
- calculator: { annualProductionKWh: number; annualSavingsAUD: number; paybackYears: number | 'N/A' }
- assumptions: Assumptions (snapshot per option)

### Assumptions
- yieldKWhPerKwPerDay: number
- selfConsumptionRatio: number (0..1)
- retailPricePerKWh: number
- feedInTariffPerKWh: number (flat)
- annualOpexAUD: number
- degradationPercentPerYear?: number
- escalationPercentPerYear?: number
- years?: number

### Incentives
- stc: { eligible: boolean; zone?: string; stcCount?: number; stcPrice?: number }
- vic: { rebateEligible?: boolean; rebateAmount?: number; interestFreeLoan?: boolean; batteryLoan?: boolean }

### ComplianceAttachment
- type: 'datasheet' | 'accreditation' | 'licence' | 'insurance' | 'battery-datasheet'
- label: string
- required: boolean
- fileRef: string

## Validation Rules
- systemSizeKw > 0
- lineItems length >= 1 when submitting
- annualSavingsAUD <= 0 → paybackYears = 'N/A'
- total >= 0 (clamped)
- STC value = stcCount × stcPrice when eligible

## Relationships
- Lead has many QuoteOptions
- QuoteOption contains Assumptions and Incentives snapshots
