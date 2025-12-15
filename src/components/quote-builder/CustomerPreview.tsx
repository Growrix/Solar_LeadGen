'use client'

import React, { useState } from 'react';
import { Eye, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/button';

interface CustomerPreviewProps {
  options: QuoteOption[];
  systemSize: number;
  onUpdate: (data: Partial<CustomerPreviewData>) => void;
}

export interface QuoteOption {
  id: string;
  name: 'Economy' | 'Balanced' | 'Premium';
  label: string;
  systemSize: number;
  panels: string;
  inverter: string;
  battery?: string;
  addons?: string[]; // Array of addon labels
  totalPrice: number;
  pricePerWatt: number;
  estimatedSavingsPerYear: number;
  paybackYears: number;
  warrantyYears: number;
  co2OffsetTonnesPerYear: number;
}

export interface CustomerPreviewData {
  options: QuoteOption[];
}

const CustomerPreview: React.FC<CustomerPreviewProps> = ({
  options,
  systemSize,
  onUpdate
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(
    options.length > 0 ? options[0].id : ''
  );

  const selected = options.find((opt) => opt.id === selectedOption);

  return (
    <div className="bg-background rounded-2xl shadow-neu-inset p-6 space-y-6">
      <h3 className="text-heading-5 text-foreground flex items-center gap-2">
        <Eye className="h-5 w-5 text-primary" />
        Customer Preview
      </h3>

      {options.length === 0 ? (
        <div className="bg-info/10 border border-info/30 rounded-lg p-6 text-center">
          <p className="text-body text-foreground mb-2">No quote options generated yet</p>
          <p className="text-body-small text-muted-foreground">
            Complete the system configuration and pricing sections, then use a preset or manually create quote options to preview.
          </p>
        </div>
      ) : (
        <>
          {/* Option Selector (Comparison Tabs) */}
          <div className="flex flex-wrap gap-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`
                  flex-1 min-w-[150px] transition-all
                  ${selectedOption === option.id
                    ? 'px-6 py-3 rounded-lg text-body bg-primary text-background shadow-neu-inset'
                    : 'selection-btn'
                  }
                `}
              >
                <div className="text-center">
                  <div>{option.label}</div>
                  <div className="text-caption mt-1">
                    ${option.totalPrice.toLocaleString()}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Option Details */}
          {selected && (
            <div className="space-y-6">
              {/* System Overview */}
              <div className="bg-background-alt rounded-xl p-6 space-y-4">
                <h4 className="text-heading-6 text-foreground">{selected.label} System</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-caption text-muted-foreground mb-1">System Size</p>
                    <p className="text-body text-foreground">{selected.systemSize} kW</p>
                  </div>

                  <div>
                    <p className="text-caption text-muted-foreground mb-1">Total Price</p>
                    <p className="text-body text-foreground">
                      ${selected.totalPrice.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-caption text-muted-foreground mb-1">Solar Panels</p>
                    <p className="text-body-small text-foreground">{selected.panels}</p>
                  </div>

                  <div>
                    <p className="text-caption text-muted-foreground mb-1">Inverter</p>
                    <p className="text-body-small text-foreground">{selected.inverter}</p>
                  </div>

                  {selected.battery && (
                    <div className="md:col-span-2">
                      <p className="text-caption text-muted-foreground mb-1">Battery Storage</p>
                      <p className="text-body-small text-foreground">{selected.battery}</p>
                    </div>
                  )}

                  {selected.addons && selected.addons.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-caption text-muted-foreground mb-1">Additional Items</p>
                      <p className="text-body-small text-foreground">{selected.addons.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-background-alt rounded-xl p-6 space-y-4">
                <h4 className="text-heading-6 text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Financial Summary
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-caption text-muted-foreground mb-1">Price per Watt</p>
                    <p className="text-body text-foreground">
                      ${selected.pricePerWatt.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-caption text-muted-foreground mb-1">Annual Savings</p>
                    <p className="text-body text-success">
                      ${selected.estimatedSavingsPerYear.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-caption text-muted-foreground mb-1">Payback Period</p>
                    <p className="text-body text-foreground">
                      {isFinite(selected.paybackYears) ? `${selected.paybackYears.toFixed(1)} years` : 'N/A'}
                    </p>
                    {!isFinite(selected.paybackYears) && (
                      <p className="text-caption text-warning mt-1">
                        Savings too low for payback
                      </p>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-caption text-muted-foreground mb-1">Warranty</p>
                    <p className="text-body text-foreground">
                      {selected.warrantyYears} years
                    </p>
                  </div>
                </div>

                <div className="bg-success/10 border border-success/30 rounded-lg p-4 mt-4">
                  <p className="text-body-small text-foreground">
                    <strong>Environmental Impact:</strong> This system will offset approximately{' '}
                    <span className="text-success">
                      {selected.co2OffsetTonnesPerYear.toFixed(1)} tonnes
                    </span>{' '}
                    of CO₂ per year, equivalent to planting{' '}
                    <span className="text-success">
                      {Math.round(selected.co2OffsetTonnesPerYear * 50)}
                    </span>{' '}
                    trees annually.
                  </p>
                </div>
              </div>

              {/* Simple Layout Graphic (Stub) */}
              <div className="bg-background-alt rounded-xl p-6">
                <h4 className="text-heading-6 text-foreground mb-4">System Layout</h4>
                <div className="aspect-video bg-background rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <p className="text-body text-muted-foreground">
                    System layout diagram (Phase 3)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Comparison View (If multiple options) */}
          {options.length > 1 && (
            <div className="space-y-4">
              <h4 className="text-heading-6 text-foreground">Compare Options</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-caption text-muted-foreground">
                        Feature
                      </th>
                      {options.map((option) => (
                        <th
                          key={option.id}
                          className="text-center py-3 px-4 text-body-small text-foreground"
                        >
                          {option.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-body-small text-muted-foreground">
                        System Size
                      </td>
                      {options.map((option) => (
                        <td
                          key={option.id}
                          className="text-center py-3 px-4 text-body-small text-foreground"
                        >
                          {option.systemSize} kW
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-body-small text-muted-foreground">
                        Total Price
                      </td>
                      {options.map((option) => (
                        <td
                          key={option.id}
                          className="text-center py-3 px-4 text-body-small text-foreground"
                        >
                          ${option.totalPrice.toLocaleString()}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-body-small text-muted-foreground">
                        Price per Watt
                      </td>
                      {options.map((option) => (
                        <td
                          key={option.id}
                          className="text-center py-3 px-4 text-body-small text-foreground"
                        >
                          ${option.pricePerWatt.toFixed(2)}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-body-small text-muted-foreground">
                        Annual Savings
                      </td>
                      {options.map((option) => (
                        <td
                          key={option.id}
                          className="text-center py-3 px-4 text-body-small text-success"
                        >
                          ${option.estimatedSavingsPerYear.toLocaleString()}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-body-small text-muted-foreground">
                        Payback Period
                      </td>
                      {options.map((option) => (
                        <td
                          key={option.id}
                          className="text-center py-3 px-4 text-body-small text-foreground"
                        >
                          {option.paybackYears.toFixed(1)} years
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-body-small text-muted-foreground">
                        Battery Included
                      </td>
                      {options.map((option) => (
                        <td
                          key={option.id}
                          className="text-center py-3 px-4 text-body-small text-foreground"
                        >
                          {option.battery ? '✓' : '—'}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-3 px-4 text-body-small text-muted-foreground">
                        Warranty
                      </td>
                      {options.map((option) => (
                        <td
                          key={option.id}
                          className="text-center py-3 px-4 text-body-small text-foreground"
                        >
                          {option.warrantyYears} years
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Branding Section (Stub for Phase 3) */}
          <div className="bg-info/10 border border-info/30 rounded-lg p-4">
            <p className="text-body-small text-foreground">
              <strong>Phase 3:</strong> Installer branding (logo, company name, ABN, accreditation, signature) will be editable here before export.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerPreview;
