'use client'

import React from 'react';
import { DollarSign, Plus, Trash2, MapPin } from 'lucide-react';
import Button from '@/components/ui/button';
import { getSTCZoneFromPostcode, calculateSTCCount, DEEMING_FACTORS, STCZone } from '@/utils/stcZones';

interface PricingEngineProps {
  lineItems: LineItemData[];
  stc: STCData;
  vic: VICData;
  discounts: DiscountData[];
  installerCostMode: boolean;
  systemSize: number; // in kW, for price per watt and STC auto-calc
  panelWattage: number; // for STC auto-calc
  assumptions?: {
    yield_kWh_per_kW_per_day: number;
    selfConsumption: number;
    retailPrice: number;
    feedInTariff: number;
    annualOpex: number;
    degradationPercentPerYear: number;
    escalationPercentPerYear: number;
  };
  prefilledFields?: string[];
  onUpdate: (data: Partial<PricingEngineData>) => void;
  onUpdateAssumptions?: (data: Partial<{
    yield_kWh_per_kW_per_day: number;
    selfConsumption: number;
    retailPrice: number;
    feedInTariff: number;
    annualOpex: number;
    degradationPercentPerYear: number;
    escalationPercentPerYear: number;
  }>) => void;
}

export interface LineItemData {
  id: number;
  category: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxGst: boolean;
  costCOGS?: number;
}

export interface STCData {
  eligible: boolean;
  zone: string;
  postcode?: string;
  stcCount: number;
  stcPrice: number;
}

export interface VICData {
  rebateEligible: boolean;
  rebateAmount: number;
  interestFreeLoan: boolean;
  batteryLoan: boolean;
}

export interface DiscountData {
  id: number;
  label: string;
  amount: number;
}

export interface PricingEngineData {
  lineItems: LineItemData[];
  stc: STCData;
  vic: VICData;
  discounts: DiscountData[];
  installerCostMode: boolean;
}

const CATEGORIES = ['Panels', 'Inverter', 'Battery', 'Mounting Structure', 'EV Charger', 'Electrical', 'Labour', 'Addons', 'Other'];

const PricingEngine: React.FC<PricingEngineProps> = ({
  lineItems,
  stc,
  vic,
  discounts,
  installerCostMode,
  systemSize,
  panelWattage,
  assumptions,
  prefilledFields = [],
  onUpdate,
  onUpdateAssumptions
}) => {
  const addLineItem = () => {
    onUpdate({
      lineItems: [
        ...lineItems,
        {
          id: Date.now(),
          category: 'Other',
          description: '',
          qty: 1,
          unitPrice: 0,
          taxGst: true
        }
      ]
    });
  };

  const updateLineItem = (id: number, field: keyof LineItemData, value: any) => {
    onUpdate({
      lineItems: lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const removeLineItem = (id: number) => {
    onUpdate({ lineItems: lineItems.filter((item) => item.id !== id) });
  };

  const addDiscount = () => {
    onUpdate({
      discounts: [
        ...discounts,
        { id: Date.now(), label: 'Discount', amount: 0 }
      ]
    });
  };

  const updateDiscount = (id: number, field: 'label' | 'amount', value: any) => {
    onUpdate({
      discounts: discounts.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    });
  };

  const removeDiscount = (id: number) => {
    onUpdate({ discounts: discounts.filter((d) => d.id !== id) });
  };

  // Calculations
  const subtotal = lineItems.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
  const gstAmount = lineItems
    .filter((item) => item.taxGst)
    .reduce((acc, item) => acc + item.qty * item.unitPrice * 0.1, 0);
  const stcDeduction = stc.eligible ? stc.stcCount * stc.stcPrice : 0;
  const vicDeduction = vic.rebateEligible ? vic.rebateAmount : 0;
  const totalDiscounts = discounts.reduce((acc, d) => acc + d.amount, 0);
  const finalPrice = subtotal + gstAmount - stcDeduction - vicDeduction - totalDiscounts;

  const totalCOGS = installerCostMode
    ? lineItems.reduce((acc, item) => acc + (item.costCOGS || 0) * item.qty, 0)
    : 0;
  const margin = installerCostMode ? finalPrice - totalCOGS : 0;
  const marginPercent = installerCostMode && finalPrice > 0 ? (margin / finalPrice) * 100 : 0;

  // Price per watt (Phase 2.1)
  const pricePerWatt = systemSize > 0 ? finalPrice / (systemSize * 1000) : null;

  // Auto-calculate STC count (Phase 2.2)
  React.useEffect(() => {
    if (stc.eligible && systemSize > 0 && panelWattage > 0) {
      const zone = stc.zone as STCZone;
      const deemingFactor = DEEMING_FACTORS[zone] || 1.382; // Default to Zone 3
      const calculatedSTC = Math.round((systemSize * 1000 / panelWattage) * deemingFactor);
      
      // Only auto-update if STC count differs significantly (avoid infinite loops)
      if (Math.abs(calculatedSTC - stc.stcCount) > 5) {
        onUpdate({ stc: { ...stc, stcCount: calculatedSTC } });
      }
    }
  }, [stc.eligible, stc.zone, systemSize, panelWattage]);

  // Line item validation (Phase 2.3)
  const validateLineItem = (item: LineItemData): string | null => {
    if (!item.description.trim()) return 'Description required';
    if (item.unitPrice <= 0) return 'Unit price must be > 0';
    if (item.qty <= 0) return 'Quantity must be > 0';
    return null;
  };

  // Postcode to zone mapping handler
  const handlePostcodeChange = (postcode: string) => {
    onUpdate({ stc: { ...stc, postcode } });
    
    if (postcode.length >= 4) {
      const detectedZone = getSTCZoneFromPostcode(postcode);
      if (detectedZone) {
        onUpdate({ stc: { ...stc, postcode, zone: detectedZone } });
      }
    }
  };

  return (
    <div className="bg-background rounded-2xl shadow-neu-inset p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-heading-5 text-foreground flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Pricing Engine
        </h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-caption text-muted-foreground">Installer Cost Mode</span>
          <input
            type="checkbox"
            checked={installerCostMode}
            onChange={(e) => onUpdate({ installerCostMode: e.target.checked })}
            className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
          />
        </label>
      </div>

      {/* Line Items Table */}
      <div className="space-y-3">
        <h4 className="text-body text-foreground">Line Items</h4>
        
        {/* Header */}
        <div className={`grid gap-2 text-caption text-muted-foreground pb-2 border-b border-border ${
          installerCostMode 
            ? 'grid-cols-[minmax(100px,1fr)_minmax(120px,2fr)_60px_90px_90px_50px_90px_40px]'
            : 'grid-cols-[minmax(100px,1.5fr)_minmax(150px,3fr)_80px_120px_60px_120px_50px]'
        }`}>
          <div>Category</div>
          <div>Description</div>
          <div className="text-center">Qty</div>
          <div className="text-right">Unit Price</div>
          {installerCostMode && <div className="text-right">COGS</div>}
          <div className="text-center">Tax</div>
          <div className="text-right">Total</div>
          <div></div>
        </div>

        {/* Rows */}
        {lineItems.map((item) => {
          const error = validateLineItem(item);
          
          return (
          <div key={item.id} className="space-y-1">
            <div className={`grid gap-2 items-center ${
              installerCostMode 
                ? 'grid-cols-[minmax(100px,1fr)_minmax(120px,2fr)_60px_90px_90px_50px_90px_40px]'
                : 'grid-cols-[minmax(100px,1.5fr)_minmax(150px,3fr)_80px_120px_60px_120px_50px]'
            }`}>
            <div>
              <select
                value={item.category}
                onChange={(e) => updateLineItem(item.id, 'category', e.target.value)}
                className="form-select w-full px-3 py-2 text-body-small"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                placeholder="Description"
                className={`form-input w-full px-3 py-2 text-body-small ${!item.description.trim() && item.description !== '' ? 'border-error' : ''}`}
              />
            </div>

            <div>
              <input
                type="number"
                min="1"
                value={item.qty}
                onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                className={`form-input w-full px-3 py-2 text-center text-body-small ${item.qty <= 0 ? 'border-error' : ''}`}
              />
            </div>

            <div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) =>
                  updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                }
                className={`form-input w-full px-3 py-2 text-right text-body-small ${item.unitPrice <= 0 ? 'border-error' : ''}`}
              />
            </div>

            {installerCostMode && (
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.costCOGS || 0}
                  onChange={(e) =>
                    updateLineItem(item.id, 'costCOGS', parseFloat(e.target.value) || 0)
                  }
                  className="form-input w-full px-3 py-2 text-right text-body-small"
                />
              </div>
            )}

            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={item.taxGst}
                onChange={(e) => updateLineItem(item.id, 'taxGst', e.target.checked)}
                className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
              />
            </div>

            <div className="text-right text-body-small text-foreground">
              ${(item.qty * item.unitPrice).toLocaleString()}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="btn-delete"
                onClick={() => removeLineItem(item.id)}
                title="Remove line item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Validation error message */}
          {error && (
            <div className="text-caption text-error ml-3">
              {error}
            </div>
          )}
          </div>
          );
        })}

        <Button onClick={addLineItem} variant="secondary" className="mt-3">
          <Plus className="h-4 w-4" />
          Add Line Item
        </Button>
      </div>

      {/* Incentives Section */}
      <div className="space-y-4">
        <h4 className="text-body text-foreground">Incentives & Rebates</h4>

        {/* STC (Small-scale Technology Certificates) */}
        <div className="border border-border rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={stc.eligible}
              onChange={(e) => onUpdate({ stc: { ...stc, eligible: e.target.checked } })}
              className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
            />
            <span className="text-body-small text-foreground">STC Eligible (Federal)</span>
          </label>

          {stc.eligible && (
            <div className="ml-8 space-y-4">
              {/* Postcode Input */}
              <div>
                <label className="text-caption text-muted-foreground mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Postcode (for zone detection)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={stc.postcode || ''}
                  onChange={(e) => handlePostcodeChange(e.target.value)}
                  className="form-input w-full px-3 py-2"
                  placeholder="e.g. 3000"
                />
                <p className="text-caption text-muted-foreground mt-1">
                  Enter postcode to auto-detect STC zone
                </p>
                {prefilledFields.includes('pricing.stc.postcode') && (
                  <p className="text-caption text-accent mt-1" data-testid="stc-postcode-caption">
                    Auto-detected from homeowner postcode
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-caption text-muted-foreground block mb-2">
                    STC Zone
                  </label>
                  <select
                    value={stc.zone}
                    onChange={(e) => onUpdate({ stc: { ...stc, zone: e.target.value } })}
                    className="form-select w-full px-3 py-2"
                  >
                    <option value="Zone 1">Zone 1</option>
                    <option value="Zone 2">Zone 2</option>
                    <option value="Zone 3">Zone 3</option>
                    <option value="Zone 4">Zone 4</option>
                  </select>
                  <p className="text-caption text-muted-foreground mt-1">
                    Manual override available
                  </p>
                </div>

                <div>
                  <label className="text-caption text-muted-foreground block mb-2">
                    STC Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stc.stcCount}
                    onChange={(e) =>
                      onUpdate({ stc: { ...stc, stcCount: parseInt(e.target.value) || 0 } })
                    }
                    className="form-input w-full px-3 py-2"
                    placeholder="e.g. 90"
                  />
                  <p className="text-caption text-muted-foreground mt-1">
                    Auto-calculated from size & zone
                  </p>
                </div>

                <div>
                  <label className="text-caption text-muted-foreground block mb-2">
                    STC Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={stc.stcPrice}
                    onChange={(e) =>
                      onUpdate({ stc: { ...stc, stcPrice: parseFloat(e.target.value) || 0 } })
                    }
                    className="form-input w-full px-3 py-2"
                    placeholder="e.g. 40"
                  />
                  <p className="text-caption text-muted-foreground mt-1">
                    Current market price
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* VIC Rebate */}
        <div className="border border-border rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={vic.rebateEligible}
              onChange={(e) => onUpdate({ vic: { ...vic, rebateEligible: e.target.checked } })}
              className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
            />
            <span className="text-body-small text-foreground">VIC Solar Rebate Eligible</span>
          </label>

          {vic.rebateEligible && (
            <div className="ml-8 space-y-3">
              <div>
                <label className="text-caption text-muted-foreground block mb-2">
                  Rebate Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={vic.rebateAmount}
                  onChange={(e) =>
                    onUpdate({ vic: { ...vic, rebateAmount: parseFloat(e.target.value) || 0 } })
                  }
                  className="form-input w-full md:w-1/3 px-3 py-2"
                  placeholder="e.g. 1400"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vic.interestFreeLoan}
                  onChange={(e) =>
                    onUpdate({ vic: { ...vic, interestFreeLoan: e.target.checked } })
                  }
                  className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <span className="text-body-small text-foreground">
                  Interest-Free Loan ($1,400)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vic.batteryLoan}
                  onChange={(e) => onUpdate({ vic: { ...vic, batteryLoan: e.target.checked } })}
                  className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <span className="text-body-small text-foreground">
                  Battery Loan ($8,800)
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Feed-in Tariff Note */}
        <div className="bg-info/10 border border-info/30 rounded-lg p-4">
          <p className="text-body-small text-foreground">
            <strong>Feed-in Tariff (FiT):</strong> Typically 5-10c/kWh in most states. Check with local retailer for current rates.
          </p>
        </div>
      </div>

      {/* Discounts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-body text-foreground">Discounts</h4>
          <Button onClick={addDiscount} variant="secondary">
            <Plus className="h-4 w-4" />
            Add Discount
          </Button>
        </div>

        {discounts.length > 0 && (
          <>
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-3 text-caption text-muted-foreground pb-2 border-b border-border">
              <div className="col-span-7">Description</div>
              <div className="col-span-3 text-right">Amount ($)</div>
              <div className="col-span-2"></div>
            </div>
            
            {/* Discount Rows */}
            {discounts.map((discount) => (
              <div key={discount.id} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-7">
                  <input
                    type="text"
                    value={discount.label}
                    onChange={(e) => updateDiscount(discount.id, 'label', e.target.value)}
                    placeholder="Discount description"
                    className="form-input w-full px-3 py-2 text-body-small"
                  />
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount.amount}
                    onChange={(e) =>
                      updateDiscount(discount.id, 'amount', parseFloat(e.target.value) || 0)
                    }
                    className="form-input w-full px-3 py-2 text-right text-body-small"
                  />
                </div>

                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => removeDiscount(discount.id)}
                    title="Remove discount"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Assumptions Panel */}
      {assumptions && onUpdateAssumptions && (
        <div className="space-y-4 border-t border-border pt-4">
          <h4 className="text-body text-foreground">Financial Assumptions</h4>
          <p className="text-caption text-muted-foreground">
            These assumptions affect annual savings and payback calculations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-caption text-muted-foreground block mb-2">
                Solar Yield (kWh/kW/day)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={assumptions.yield_kWh_per_kW_per_day}
                onChange={(e) => onUpdateAssumptions({ yield_kWh_per_kW_per_day: parseFloat(e.target.value) || 0 })}
                className="form-input w-full px-3 py-2"
                placeholder="e.g. 4.2"
              />
              <p className="text-caption text-muted-foreground mt-1">
                Typical AU: 4.0-4.5
              </p>
            </div>

            <div>
              <label className="text-caption text-muted-foreground block mb-2">
                Self-Consumption Ratio
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={assumptions.selfConsumption}
                onChange={(e) => onUpdateAssumptions({ selfConsumption: parseFloat(e.target.value) || 0 })}
                className="form-input w-full px-3 py-2"
                placeholder="e.g. 0.5"
              />
              <p className="text-caption text-muted-foreground mt-1">
                0 = export all, 1 = use all (typical: 0.4-0.7)
              </p>
            </div>

            <div>
              <label className="text-caption text-muted-foreground block mb-2">
                Retail Price ($/kWh)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={assumptions.retailPrice}
                onChange={(e) => onUpdateAssumptions({ retailPrice: parseFloat(e.target.value) || 0 })}
                className="form-input w-full px-3 py-2"
                placeholder="e.g. 0.30"
              />
              <p className="text-caption text-muted-foreground mt-1">
                What customer pays for grid electricity
              </p>
              {prefilledFields.includes('assumptions.retailPrice') && (
                <p className="text-caption text-accent mt-1">
                  From homeowner Instant Quote
                </p>
              )}
            </div>

            <div>
              <label className="text-caption text-muted-foreground block mb-2">
                Feed-in Tariff ($/kWh)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={assumptions.feedInTariff}
                onChange={(e) => onUpdateAssumptions({ feedInTariff: parseFloat(e.target.value) || 0 })}
                className="form-input w-full px-3 py-2"
                placeholder="e.g. 0.08"
              />
              <p className="text-caption text-muted-foreground mt-1">
                Payment for exported electricity
              </p>
              {prefilledFields.includes('assumptions.feedInTariff') && (
                <p className="text-caption text-accent mt-1">
                  From homeowner Instant Quote
                </p>
              )}
            </div>

            <div>
              <label className="text-caption text-muted-foreground block mb-2">
                Annual OPEX ($/year)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={assumptions.annualOpex}
                onChange={(e) => onUpdateAssumptions({ annualOpex: parseFloat(e.target.value) || 0 })}
                className="form-input w-full px-3 py-2"
                placeholder="e.g. 0"
              />
              <p className="text-caption text-muted-foreground mt-1">
                Maintenance & insurance costs
              </p>
            </div>

            <div>
              <label className="text-caption text-muted-foreground block mb-2">
                Panel Degradation (%/year)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={assumptions.degradationPercentPerYear}
                onChange={(e) => onUpdateAssumptions({ degradationPercentPerYear: parseFloat(e.target.value) || 0 })}
                className="form-input w-full px-3 py-2"
                placeholder="e.g. 0.5"
              />
              <p className="text-caption text-muted-foreground mt-1">
                Typical: 0.5% per year
              </p>
            </div>

            <div>
              <label className="text-caption text-muted-foreground block mb-2">
                Electricity Escalation (%/year)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={assumptions.escalationPercentPerYear}
                onChange={(e) => onUpdateAssumptions({ escalationPercentPerYear: parseFloat(e.target.value) || 0 })}
                className="form-input w-full px-3 py-2"
                placeholder="e.g. 3.0"
              />
              <p className="text-caption text-muted-foreground mt-1">
                Typical: 3-5% per year
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Totals Summary */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-body-small text-foreground">
          <span>Subtotal</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-body-small text-foreground">
          <span>GST (10%)</span>
          <span>${gstAmount.toLocaleString()}</span>
        </div>

        {stc.eligible && (
          <div className="flex justify-between text-body-small text-success">
            <span>STC Incentive</span>
            <span>-${stcDeduction.toLocaleString()}</span>
          </div>
        )}

        {vic.rebateEligible && (
          <div className="flex justify-between text-body-small text-success">
            <span>VIC Rebate</span>
            <span>-${vicDeduction.toLocaleString()}</span>
          </div>
        )}

        {totalDiscounts > 0 && (
          <div className="flex justify-between text-body-small text-success">
            <span>Discounts</span>
            <span>-${totalDiscounts.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-body text-foreground pt-2 border-t border-border">
          <span>Final Price</span>
          <span>${finalPrice.toLocaleString()}</span>
        </div>

        {pricePerWatt !== null && (
          <div className="flex justify-between text-body-small text-muted-foreground">
            <span>Price per Watt</span>
            <span>${pricePerWatt.toFixed(2)}/W</span>
          </div>
        )}

        {installerCostMode && (
          <div className="mt-4 pt-4 border-t border-border space-y-2 bg-warning/10 rounded-lg p-3">
            <p className="text-caption text-muted-foreground">Installer Cost Analysis (Hidden from Customer)</p>
            <div className="flex justify-between text-body-small text-foreground">
              <span>Total COGS</span>
              <span>${totalCOGS.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-body-small text-foreground">
              <span>Margin</span>
              <span>${margin.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-body text-foreground">
              <span>Margin %</span>
              <span>{marginPercent.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingEngine;
