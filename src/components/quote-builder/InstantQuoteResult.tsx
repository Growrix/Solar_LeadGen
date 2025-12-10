'use client';

import React from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import SavingsChart from '../SavingsChart';

interface InstantQuoteResults {
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

interface InstantQuoteResultProps {
  quoteData: InstantQuoteResults;
}

const InstantQuoteResult: React.FC<InstantQuoteResultProps> = ({ quoteData }) => {
  return (
    <div className="bg-surface rounded-2xl shadow-neu-inset p-5 space-y-4">
      <h3 className="text-heading-4 text-foreground flex items-center gap-2 border-b border-border pb-3">
        <Calculator className="h-5 w-5 text-primary" />
        InstantQuote Result
      </h3>

      {/* System Overview Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 border border-primary/20">
          <span className="text-caption text-muted-foreground block">System Size</span>
          <p className="text-heading-3 text-primary mt-1">{quoteData.systemSize} kW</p>
        </div>
        <div className="bg-background rounded-xl p-3">
          <span className="text-caption text-muted-foreground block">Panels Required</span>
          <p className="text-heading-3 text-foreground mt-1">{quoteData.panelsRequired || 'N/A'}</p>
        </div>
        <div className="bg-background rounded-xl p-3">
          <span className="text-caption text-muted-foreground block">Annual Production</span>
          <p className="text-heading-3 text-foreground mt-1">{(quoteData.annualProduction / 1000).toFixed(1)}k kWh</p>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="bg-background rounded-xl p-4 space-y-2">
        <h4 className="text-label text-foreground mb-3">Financial Breakdown</h4>
        <div className="flex justify-between text-body-small">
          <span className="text-muted-foreground">Total System Cost</span>
          <span className="text-foreground">${quoteData.totalCost?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-body-small text-success">
          <span>Federal Rebate (STC)</span>
          <span className="text-body">-${quoteData.federalRebate?.toLocaleString()}</span>
        </div>
        {quoteData.batteryRebate > 0 && (
          <div className="flex justify-between text-body-small text-success">
            <span>Battery Rebate</span>
            <span className="text-body">-${quoteData.batteryRebate?.toLocaleString()}</span>
          </div>
        )}
        {quoteData.stateRebate > 0 && (
          <div className="flex justify-between text-body-small text-success">
            <span>State Rebate</span>
            <span className="text-body">-${quoteData.stateRebate?.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-body pt-2 border-t border-border mt-2">
          <span className="text-foreground">Final Out-of-Pocket</span>
          <span className="text-primary text-heading-3">${quoteData.finalPrice?.toLocaleString()}</span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-background rounded-xl p-3">
          <span className="text-caption text-muted-foreground block">Annual Savings</span>
          <p className="text-body text-success mt-1">${quoteData.annualSavings?.toLocaleString()}</p>
        </div>
        <div className="bg-background rounded-xl p-3">
          <span className="text-caption text-muted-foreground block">Payback Period</span>
          <p className="text-body text-foreground mt-1">{quoteData.simplePaybackYears || 'N/A'} years</p>
        </div>
        <div className="bg-background rounded-xl p-3">
          <span className="text-caption text-muted-foreground block">CO₂ Reduction</span>
          <p className="text-body text-success mt-1">{quoteData.co2Reduction || 'N/A'} t/yr</p>
        </div>
        <div className="bg-background rounded-xl p-3">
          <span className="text-caption text-muted-foreground block">Self-Consumed</span>
          <p className="text-body text-foreground mt-1">{quoteData.selfConsumedKwh ? (quoteData.selfConsumedKwh / 1000).toFixed(1) + 'k' : 'N/A'} kWh</p>
        </div>
      </div>

      {/* Energy Breakdown */}
      {(quoteData.selfConsumedKwh || quoteData.exportedKwh) && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          {quoteData.selfConsumedKwh && (
            <div className="bg-background rounded-xl p-3">
              <span className="text-caption text-muted-foreground block">Self-Consumed Energy</span>
              <p className="text-body text-foreground mt-1">{quoteData.selfConsumedKwh.toLocaleString()} kWh/yr</p>
            </div>
          )}
          {quoteData.exportedKwh && (
            <div className="bg-background rounded-xl p-3">
              <span className="text-caption text-muted-foreground block">Exported to Grid</span>
              <p className="text-body text-foreground mt-1">{quoteData.exportedKwh.toLocaleString()} kWh/yr</p>
            </div>
          )}
        </div>
      )}

      {/* Commercial-Specific Metrics */}
      {quoteData.quoteType === 'commercial' && (quoteData.demandChargeSavings || quoteData.energySavings) && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          {quoteData.demandChargeSavings && (
            <div className="bg-background rounded-xl p-3">
              <span className="text-caption text-muted-foreground block">Demand Charge Savings</span>
              <p className="text-body text-success mt-1">${quoteData.demandChargeSavings.toLocaleString()}/yr</p>
            </div>
          )}
          {quoteData.energySavings && (
            <div className="bg-background rounded-xl p-3">
              <span className="text-caption text-muted-foreground block">Energy Cost Savings</span>
              <p className="text-body text-success mt-1">${quoteData.energySavings.toLocaleString()}/yr</p>
            </div>
          )}
        </div>
      )}

      {/* Savings Projection Chart */}
      {quoteData.finalPrice && quoteData.annualSavings && quoteData.currentAnnualBill && (
        <div className="pt-3 border-t border-border">
          <SavingsChart 
            finalPrice={quoteData.finalPrice}
            annualSavings={quoteData.annualSavings}
            currentAnnualBill={quoteData.currentAnnualBill}
          />
        </div>
      )}

      {/* Disclaimers */}
      {quoteData.disclaimers && quoteData.disclaimers.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
          <h4 className="text-label text-warning mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Important Notes
          </h4>
          <ul className="space-y-1 text-body-small text-foreground">
            {quoteData.disclaimers.map((disclaimer: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>{disclaimer}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InstantQuoteResult;
