'use client';

import React from 'react';
import { FileText, Zap, Sun, Battery, Plug, Grid, Gauge, Car } from 'lucide-react';

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

interface HomeownerInstantQuoteDetailsProps {
  quoteData: InstantQuoteResults;
  batteryRequired?: boolean;
}

const HomeownerInstantQuoteDetails: React.FC<HomeownerInstantQuoteDetailsProps> = ({ 
  quoteData,
  batteryRequired 
}) => {
  return (
    <div className="bg-surface rounded-2xl shadow-neu-inset p-5 space-y-4">
      <h3 className="text-heading-4 text-foreground flex items-center gap-2 border-b border-border pb-3">
        <FileText className="h-5 w-5 text-primary" />
        InstantQuote Details
      </h3>

      {/* Energy Usage */}
      <div className="space-y-2">
        <h4 className="text-label text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Energy Usage
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quoteData.electricityValue && (
            <div className="bg-background rounded-lg p-2">
              <span className="text-caption text-muted-foreground block">Electricity Bill</span>
              <p className="text-body-small text-foreground mt-0.5">
                ${quoteData.electricityValue} / {quoteData.electricityUsageType}
              </p>
            </div>
          )}
          {quoteData.currentAnnualBill && (
            <div className="bg-background rounded-lg p-2">
              <span className="text-caption text-muted-foreground block">Annual Bill</span>
              <p className="text-body-small text-foreground mt-0.5">
                ${quoteData.currentAnnualBill?.toLocaleString()}
              </p>
            </div>
          )}
          {quoteData.desiredOffset && (
            <div className="bg-background rounded-lg p-2">
              <span className="text-caption text-muted-foreground block">Desired Offset</span>
              <p className="text-body-small text-foreground mt-0.5">{quoteData.desiredOffset}%</p>
            </div>
          )}
          {quoteData.usagePattern && (
            <div className="bg-background rounded-lg p-2">
              <span className="text-caption text-muted-foreground block">Usage Pattern</span>
              <p className="text-body-small text-foreground mt-0.5 capitalize">{quoteData.usagePattern}</p>
            </div>
          )}
        </div>
      </div>

      {/* Solar System Configuration */}
      <div className="space-y-2">
        <h4 className="text-label text-foreground flex items-center gap-2">
          <Sun className="h-4 w-4 text-primary" />
          Solar System Configuration
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-background rounded-lg p-2">
            <span className="text-caption text-muted-foreground block">System Size</span>
            <p className="text-body-small text-primary mt-0.5">
              {quoteData.systemSizeOverride || quoteData.systemSize} kW
            </p>
          </div>
          {quoteData.panelBrand && (
            <div className="bg-background rounded-lg p-2">
              <span className="text-caption text-muted-foreground block">Panel Brand</span>
              <p className="text-body-small text-foreground mt-0.5 capitalize">
                {quoteData.panelBrand.replace(/-/g, ' ')}
              </p>
            </div>
          )}
          {quoteData.panelOrientation && (
            <div className="bg-background rounded-lg p-2">
              <span className="text-caption text-muted-foreground block">Orientation</span>
              <p className="text-body-small text-foreground mt-0.5 capitalize">{quoteData.panelOrientation}</p>
            </div>
          )}
          {quoteData.roofTilt && (
            <div className="bg-background rounded-lg p-2">
              <span className="text-caption text-muted-foreground block">Roof Tilt</span>
              <p className="text-body-small text-foreground mt-0.5 capitalize">{quoteData.roofTilt}</p>
            </div>
          )}
          {quoteData.shadingLevel && (
            <div className="bg-background rounded-lg p-2">
              <span className="text-caption text-muted-foreground block">Shading</span>
              <p className="text-body-small text-foreground mt-0.5 capitalize">{quoteData.shadingLevel}</p>
            </div>
          )}
          <div className="bg-background rounded-lg p-2">
            <span className="text-caption text-muted-foreground block">Optimizers</span>
            <p className="text-body-small text-foreground mt-0.5">{quoteData.includeOptimizers ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-background rounded-lg p-2">
            <span className="text-caption text-muted-foreground block">Microinverters</span>
            <p className="text-body-small text-foreground mt-0.5">{quoteData.includeMicroinverters ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Battery Configuration (if included) */}
      {(batteryRequired || quoteData.batteryBrand || quoteData.batteryCapacity || quoteData.customBatteryCapacity) && (
        <div className="space-y-2">
          <h4 className="text-label text-foreground flex items-center gap-2">
            <Battery className="h-4 w-4 text-primary" />
            Battery Configuration
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quoteData.batteryBrand && (
              <div className="bg-background rounded-lg p-2">
                <span className="text-caption text-muted-foreground block">Battery Brand</span>
                <p className="text-body-small text-foreground mt-0.5 capitalize">{quoteData.batteryBrand}</p>
              </div>
            )}
            {(quoteData.batteryCapacity || quoteData.customBatteryCapacity) && (
              <div className="bg-background rounded-lg p-2">
                <span className="text-caption text-muted-foreground block">Battery Capacity</span>
                <p className="text-body-small text-foreground mt-0.5">
                  {quoteData.batteryCapacity === 'custom' 
                    ? quoteData.customBatteryCapacity 
                    : quoteData.batteryCapacity} kWh
                </p>
              </div>
            )}
            {quoteData.backupCritical && (
              <div className="bg-background rounded-lg p-2">
                <span className="text-caption text-muted-foreground block">Backup Critical</span>
                <p className="text-body-small text-foreground mt-0.5 capitalize">{quoteData.backupCritical}</p>
              </div>
            )}
            {quoteData.batteryUsage && (
              <div className="bg-background rounded-lg p-2">
                <span className="text-caption text-muted-foreground block">Battery Usage</span>
                <p className="text-body-small text-foreground mt-0.5 capitalize">
                  {quoteData.batteryUsage.replace(/-/g, ' ')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Retailer & Tariff */}
      {(quoteData.retailer || quoteData.tariffPlan || quoteData.customRetailRate || quoteData.customFeedInRate) && (
        <div className="space-y-2">
          <h4 className="text-label text-foreground flex items-center gap-2">
            <Plug className="h-4 w-4 text-primary" />
            Retailer & Tariff
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quoteData.retailer && (
              <div className="bg-background rounded-lg p-2">
                <span className="text-caption text-muted-foreground block">Retailer</span>
                <p className="text-body-small text-foreground mt-0.5 capitalize">{quoteData.retailer}</p>
              </div>
            )}
            {quoteData.tariffPlan && (
              <div className="bg-background rounded-lg p-2">
                <span className="text-caption text-muted-foreground block">Tariff Plan</span>
                <p className="text-body-small text-foreground mt-0.5 capitalize">{quoteData.tariffPlan}</p>
              </div>
            )}
            {quoteData.customRetailRate && (
              <div className="bg-background rounded-lg p-2">
                <span className="text-caption text-muted-foreground block">Custom Retail Rate</span>
                <p className="text-body-small text-foreground mt-0.5">${quoteData.customRetailRate}/kWh</p>
              </div>
            )}
            {quoteData.customFeedInRate && (
              <div className="bg-background rounded-lg p-2">
                <span className="text-caption text-muted-foreground block">Feed-in Rate</span>
                <p className="text-body-small text-foreground mt-0.5">${quoteData.customFeedInRate}/kWh</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Features */}
      {(quoteData.includeVPP || quoteData.includeEVCharging || quoteData.includeSmartHome || quoteData.includeGridServices) && (
        <div className="space-y-2">
          <h4 className="text-label text-foreground flex items-center gap-2">
            <Grid className="h-4 w-4 text-primary" />
            Additional Features
          </h4>
          <div className="flex flex-wrap gap-2">
            {quoteData.includeVPP && <span className="px-3 py-1.5 bg-primary/10 text-primary text-body-small rounded-lg">VPP Integration</span>}
            {quoteData.includeEVCharging && <span className="px-3 py-1.5 bg-primary/10 text-primary text-body-small rounded-lg flex items-center gap-1"><Car className="h-3 w-3" />EV Charging</span>}
            {quoteData.includeSmartHome && <span className="px-3 py-1.5 bg-primary/10 text-primary text-body-small rounded-lg">Smart Home Integration</span>}
            {quoteData.includeGridServices && <span className="px-3 py-1.5 bg-primary/10 text-primary text-body-small rounded-lg">Grid Services</span>}
          </div>
        </div>
      )}

      {/* Existing System (if applicable) */}
      {quoteData.hasExistingSystem && quoteData.existingSystemSize && (
        <div className="bg-info/10 border border-info/20 rounded-lg p-3">
          <h4 className="text-label text-foreground mb-2">Existing Solar System</h4>
          <p className="text-body-small text-foreground">
            Has existing {quoteData.existingSystemSize} kW solar system
          </p>
        </div>
      )}

      {/* Commercial-Specific Details */}
      {quoteData.quoteType === 'commercial' && (
        <div className="space-y-2">
          <h4 className="text-label text-foreground flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            Commercial Details
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quoteData.peakDemand && (
              <div className="bg-background rounded-lg p-2">
                <span className="text-caption text-muted-foreground block">Peak Demand</span>
                <p className="text-body-small text-foreground mt-0.5">{quoteData.peakDemand} kW</p>
              </div>
            )}
            <div className="bg-background rounded-lg p-2">
              <span className="text-caption text-muted-foreground block">Three-Phase</span>
              <p className="text-body-small text-foreground mt-0.5">{quoteData.isThreePhase ? 'Yes' : 'No'}</p>
            </div>
            {quoteData.projectPriority && (
              <div className="bg-background rounded-lg p-2">
                <span className="text-caption text-muted-foreground block">Priority</span>
                <p className="text-body-small text-foreground mt-0.5 capitalize">
                  {quoteData.projectPriority.replace(/_/g, ' ')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeownerInstantQuoteDetails;
