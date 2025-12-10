/**
 * QuoteDataDisplay Component
 * 
 * Purpose: Display complete instant quote calculation data for admins
 * Used in: Admin lead detail page
 * 
 * Phase 4.5: Displays all quote data that was collected during instant quote flow
 */

'use client';

import React from 'react';

interface QuoteDataDisplayProps {
  quoteData: any; // JSON data from InstantQuoteForm
  className?: string;
}

export default function QuoteDataDisplay({ quoteData, className = '' }: QuoteDataDisplayProps) {
  if (!quoteData) {
    return (
      <div className={`rounded-lg border border-warning bg-surface shadow-neu-outset p-4 ${className}`}>
        <p className="text-body-small text-warning">
          ⚠️ No quote data available. This lead was created before Phase 4.5 implementation.
        </p>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return `$${value.toLocaleString()}`;
  };

  // Format percentage
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value}%`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* System Design Section */}
      {quoteData.recommendedSystemSize && (
        <div className="rounded-lg border border-border bg-surface shadow-neu-outset p-6">
          <h3 className="text-heading-4 text-foreground mb-4">
            💡 System Design
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-body-small text-muted-foreground">System Size</p>
              <p className="text-heading-4 text-foreground">
                {quoteData.recommendedSystemSize || 'N/A'} kW
              </p>
            </div>
            <div>
              <p className="text-body-small text-muted-foreground">Number of Panels</p>
              <p className="text-heading-4 text-foreground">
                {quoteData.numberOfPanels || 'N/A'} panels
              </p>
            </div>
            {quoteData.panelWattage && (
              <div>
                <p className="text-body-small text-muted-foreground">Panel Wattage</p>
                <p className="text-heading-4 text-foreground">
                  {quoteData.panelWattage}W each
                </p>
              </div>
            )}
            {quoteData.panelBrand && (
              <div>
                <p className="text-body-small text-muted-foreground">Preferred Panel Brand</p>
                <p className="text-heading-4 text-foreground">
                  {quoteData.panelBrand}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Details Section */}
      {(quoteData.upfrontCost || quoteData.finalCost || quoteData.annualSavings) && (
        <div className="rounded-lg border border-border bg-surface shadow-neu-outset p-6">
          <h3 className="text-heading-4 text-foreground mb-4">
            💰 Financial Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quoteData.upfrontCost && (
              <div>
                <p className="text-body-small text-muted-foreground">Upfront Cost</p>
                <p className="text-heading-4 text-foreground">
                  {formatCurrency(quoteData.upfrontCost)}
                </p>
              </div>
            )}
            {quoteData.governmentIncentive && (
              <div>
                <p className="text-body-small text-muted-foreground">Government Incentive</p>
                <p className="text-heading-4 text-success">
                  -{formatCurrency(quoteData.governmentIncentive)}
                </p>
              </div>
            )}
            {quoteData.finalCost && (
              <div>
                <p className="text-body-small text-muted-foreground">Final Cost</p>
                <p className="text-heading-3 text-info">
                  {formatCurrency(quoteData.finalCost)}
                </p>
              </div>
            )}
            {quoteData.annualSavings && (
              <div>
                <p className="text-body-small text-muted-foreground">Annual Savings</p>
                <p className="text-heading-4 text-success">
                  {formatCurrency(quoteData.annualSavings)}/year
                </p>
              </div>
            )}
            {quoteData.paybackPeriod && (
              <div>
                <p className="text-body-small text-muted-foreground">Payback Period</p>
                <p className="text-heading-4 text-foreground">
                  {quoteData.paybackPeriod} years
                </p>
              </div>
            )}
            {quoteData.roi25Years && (
              <div>
                <p className="text-body-small text-muted-foreground">25-Year ROI</p>
                <p className="text-heading-4 text-success">
                  {formatCurrency(quoteData.roi25Years)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Battery Details Section */}
      {(quoteData.batteryIncluded || quoteData.batteryModel || quoteData.batteryCapacity) && (
        <div className="rounded-lg border border-border bg-surface shadow-neu-outset p-6">
          <h3 className="text-heading-4 text-foreground mb-4">
            🔋 Battery Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quoteData.batteryModel && (
              <div>
                <p className="text-body-small text-muted-foreground">Battery Model</p>
                <p className="text-heading-4 text-foreground">
                  {quoteData.batteryModel}
                </p>
              </div>
            )}
            {quoteData.batteryBrand && (
              <div>
                <p className="text-body-small text-muted-foreground">Preferred Brand</p>
                <p className="text-heading-4 text-foreground">
                  {quoteData.batteryBrand}
                </p>
              </div>
            )}
            {quoteData.batteryCapacity && (
              <div>
                <p className="text-body-small text-muted-foreground">Capacity</p>
                <p className="text-heading-4 text-foreground">
                  {quoteData.batteryCapacity} kWh
                </p>
              </div>
            )}
            {quoteData.batteryCost && (
              <div>
                <p className="text-body-small text-muted-foreground">Battery Cost</p>
                <p className="text-heading-4 text-foreground">
                  {formatCurrency(quoteData.batteryCost)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Property & Roof Details */}
      {(quoteData.roofTilt || quoteData.panelOrientation || quoteData.shadingLevel) && (
        <div className="rounded-lg border border-border bg-surface shadow-neu-outset p-6">
          <h3 className="text-heading-4 text-foreground mb-4">
            🏠 Property Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quoteData.roofTilt && (
              <div>
                <p className="text-body-small text-muted-foreground">Roof Tilt</p>
                <p className="text-heading-4 text-foreground capitalize">
                  {quoteData.roofTilt}
                </p>
              </div>
            )}
            {quoteData.panelOrientation && (
              <div>
                <p className="text-body-small text-muted-foreground">Panel Orientation</p>
                <p className="text-heading-4 text-foreground capitalize">
                  {quoteData.panelOrientation}
                </p>
              </div>
            )}
            {quoteData.shadingLevel && (
              <div>
                <p className="text-body-small text-muted-foreground">Shading Level</p>
                <p className="text-heading-4 text-foreground capitalize">
                  {quoteData.shadingLevel}
                </p>
              </div>
            )}
            {quoteData.usagePattern && (
              <div>
                <p className="text-body-small text-muted-foreground">Usage Pattern</p>
                <p className="text-heading-4 text-foreground capitalize">
                  {quoteData.usagePattern}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Environmental Impact */}
      {(quoteData.co2OffsetAnnual || quoteData.treesEquivalent || quoteData.annualGeneration) && (
        <div className="rounded-lg border border-success bg-surface shadow-neu-outset p-6">
          <h3 className="text-heading-4 text-foreground mb-4">
            🌱 Environmental Impact
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quoteData.annualGeneration && (
              <div>
                <p className="text-body-small text-muted-foreground">Annual Generation</p>
                <p className="text-heading-4 text-foreground">
                  {quoteData.annualGeneration.toLocaleString()} kWh/year
                </p>
              </div>
            )}
            {quoteData.co2OffsetAnnual && (
              <div>
                <p className="text-body-small text-muted-foreground">CO₂ Offset (Annual)</p>
                <p className="text-heading-4 text-success">
                  {quoteData.co2OffsetAnnual} tonnes/year
                </p>
              </div>
            )}
            {quoteData.treesEquivalent && (
              <div>
                <p className="text-body-small text-muted-foreground">Trees Equivalent</p>
                <p className="text-heading-4 text-success">
                  {quoteData.treesEquivalent} trees/year
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Preferences */}
      {(quoteData.includeVPP || quoteData.includeEVCharging || quoteData.includeOptimizers || quoteData.includeMicroinverters) && (
        <div className="rounded-lg border border-border bg-surface shadow-neu-outset p-6">
          <h3 className="text-heading-4 text-foreground mb-4">
            ⚙️ Additional Preferences
          </h3>
          <div className="flex flex-wrap gap-2">
            {quoteData.includeVPP && (
              <span className="px-3 py-1 bg-info text-info-foreground rounded-full text-body-small">
                ✓ VPP Integration
              </span>
            )}
            {quoteData.includeEVCharging && (
              <span className="px-3 py-1 bg-info text-info-foreground rounded-full text-body-small">
                ✓ EV Charging
              </span>
            )}
            {quoteData.includeOptimizers && (
              <span className="px-3 py-1 bg-info text-info-foreground rounded-full text-body-small">
                ✓ Panel Optimizers
              </span>
            )}
            {quoteData.includeMicroinverters && (
              <span className="px-3 py-1 bg-info text-info-foreground rounded-full text-body-small">
                ✓ Microinverters
              </span>
            )}
          </div>
        </div>
      )}

      {/* Retailer & Tariff Details */}
      {(quoteData.retailer || quoteData.tariffPlan) && (
        <div className="rounded-lg border border-border bg-surface shadow-neu-outset p-6">
          <h3 className="text-heading-4 text-foreground mb-4">
            ⚡ Retailer & Tariff
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quoteData.retailer && (
              <div>
                <p className="text-body-small text-muted-foreground">Current Retailer</p>
                <p className="text-heading-4 text-foreground">
                  {quoteData.retailer}
                </p>
              </div>
            )}
            {quoteData.tariffPlan && (
              <div>
                <p className="text-body-small text-muted-foreground">Tariff Plan</p>
                <p className="text-heading-4 text-foreground">
                  {quoteData.tariffPlan}
                </p>
              </div>
            )}
            {quoteData.customRetailRate && (
              <div>
                <p className="text-body-small text-muted-foreground">Retail Rate</p>
                <p className="text-heading-4 text-foreground">
                  ${quoteData.customRetailRate}/kWh
                </p>
              </div>
            )}
            {quoteData.customFeedInRate && (
              <div>
                <p className="text-body-small text-muted-foreground">Feed-in Tariff</p>
                <p className="text-heading-4 text-foreground">
                  ${quoteData.customFeedInRate}/kWh
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}