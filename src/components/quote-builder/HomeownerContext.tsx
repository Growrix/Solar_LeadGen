/**
 * Homeowner Context Section
 * 
 * Purpose: Display homeowner requirements imported from Instant Quote
 * Location: Top of QuoteBuilderModal (above System Selection)
 * Features: Collapsible, 4 subsections, read-only display
 * 
 * Part of: Phase 12 - T112 (Flexible Combo Box Implementation)
 * Date: 2025-12-01
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User } from 'lucide-react';

interface HomeownerContextProps {
  meta?: {
    homeownerBudget?: string;
    homeownerOffset?: number;
    homeownerUsagePattern?: string;
    homeownerElectricityUsage?: number;
    homeownerRetailer?: string;
    homeownerTariff?: string;
    homeownerPanelPreference?: string;
    homeownerOptimizerPreference?: boolean;
    homeownerMicroinverterPreference?: boolean;
    homeownerExistingSystem?: boolean;
    homeownerPropertyType?: string;
  };
}

export default function HomeownerContext({ meta }: HomeownerContextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if any homeowner data exists
  const hasData = meta && (
    meta.homeownerBudget ||
    meta.homeownerOffset !== undefined ||
    meta.homeownerUsagePattern ||
    meta.homeownerElectricityUsage ||
    meta.homeownerRetailer ||
    meta.homeownerTariff ||
    meta.homeownerPanelPreference ||
    meta.homeownerOptimizerPreference !== undefined ||
    meta.homeownerMicroinverterPreference !== undefined ||
    meta.homeownerExistingSystem !== undefined ||
    meta.homeownerPropertyType
  );

  // Don't render if no homeowner data
  if (!hasData) return null;

  // Helper to format usage pattern
  const formatUsagePattern = (pattern: string | undefined): string => {
    if (!pattern) return 'Not specified';
    const map: Record<string, string> = {
      evening: 'Evening Peak',
      daytime: 'Daytime Heavy',
      spread: 'Spread Throughout Day',
    };
    return map[pattern.toLowerCase()] || pattern;
  };

  // Helper to format property type
  const formatPropertyType = (type: string | undefined): string => {
    if (!type) return 'Not specified';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="mb-6">
      <div className="bg-background border border-stroke rounded-lg p-4 shadow-neu-outset-lg">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
          type="button"
        >
          <div className="flex items-center gap-3">
            <User className="text-foreground-secondary" size={20} />
            <div>
              <h3 className="text-heading-sm text-foreground-primary">
                Homeowner Requirements
              </h3>
              <p className="text-caption text-foreground-tertiary">
                Imported from Instant Quote
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="text-foreground-secondary" size={20} />
          ) : (
            <ChevronDown className="text-foreground-secondary" size={20} />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-stroke">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* === Energy Usage === */}
              {(meta.homeownerElectricityUsage || meta.homeownerUsagePattern) && (
                <div>
                  <h4 className="text-label text-foreground-primary mb-3">
                    Energy Usage
                  </h4>
                  <div className="space-y-2">
                    {meta.homeownerElectricityUsage && (
                      <div className="flex justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Electricity Usage:
                        </span>
                        <span className="text-body-sm text-foreground-primary">
                          {meta.homeownerElectricityUsage} kWh/bill
                        </span>
                      </div>
                    )}
                    {meta.homeownerUsagePattern && (
                      <div className="flex justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Usage Pattern:
                        </span>
                        <span className="text-body-sm text-foreground-primary">
                          {formatUsagePattern(meta.homeownerUsagePattern)}
                        </span>
                      </div>
                    )}
                    {meta.homeownerRetailer && (
                      <div className="flex justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Retailer:
                        </span>
                        <span className="text-body-sm text-foreground-primary">
                          {meta.homeownerRetailer}
                        </span>
                      </div>
                    )}
                    {meta.homeownerTariff && (
                      <div className="flex justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Tariff:
                        </span>
                        <span className="text-body-sm text-foreground-primary">
                          {meta.homeownerTariff}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === Budget & Goals === */}
              {(meta.homeownerBudget || meta.homeownerOffset !== undefined) && (
                <div>
                  <h4 className="text-label text-foreground-primary mb-3">
                    Budget & Goals
                  </h4>
                  <div className="space-y-2">
                    {meta.homeownerBudget && (
                      <div className="flex justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Budget Range:
                        </span>
                        <span className="text-body-sm text-foreground-primary">
                          {meta.homeownerBudget}
                        </span>
                      </div>
                    )}
                    {meta.homeownerOffset !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Desired Offset:
                        </span>
                        <span className="text-body-sm text-foreground-primary">
                          {meta.homeownerOffset}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === Property Context === */}
              {(meta.homeownerPropertyType || meta.homeownerExistingSystem !== undefined) && (
                <div>
                  <h4 className="text-label text-foreground-primary mb-3">
                    Property Context
                  </h4>
                  <div className="space-y-2">
                    {meta.homeownerPropertyType && (
                      <div className="flex justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Property Type:
                        </span>
                        <span className="text-body-sm text-foreground-primary">
                          {formatPropertyType(meta.homeownerPropertyType)}
                        </span>
                      </div>
                    )}
                    {meta.homeownerExistingSystem !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Existing System:
                        </span>
                        <span className="text-body-sm text-foreground-primary">
                          {meta.homeownerExistingSystem ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === Product Preferences === */}
              {(meta.homeownerPanelPreference || 
                meta.homeownerOptimizerPreference !== undefined || 
                meta.homeownerMicroinverterPreference !== undefined) && (
                <div>
                  <h4 className="text-label text-foreground-primary mb-3">
                    Product Preferences
                  </h4>
                  <div className="space-y-2">
                    {meta.homeownerPanelPreference && (
                      <div className="flex justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Preferred Panel Brand:
                        </span>
                        <span className="text-body-sm text-foreground-primary">
                          {meta.homeownerPanelPreference}
                        </span>
                      </div>
                    )}
                    {meta.homeownerOptimizerPreference !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Wants Optimizers:
                        </span>
                        <span className="text-body-sm text-foreground-primary">
                          {meta.homeownerOptimizerPreference ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                    {meta.homeownerMicroinverterPreference !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Wants Microinverters:
                        </span>
                        <span className="text-body-sm text-foreground-primary">
                          {meta.homeownerMicroinverterPreference ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
