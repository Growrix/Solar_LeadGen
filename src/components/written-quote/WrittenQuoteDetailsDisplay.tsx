'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Zap, 
  Sun, 
  Battery, 
  Settings, 
  Package, 
  DollarSign,
  FileText,
  Phone,
  Mail,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { FinancialAssumptions } from '@/types/written-quote';

/**
 * WrittenQuoteDetailsDisplay
 * 
 * Displays comprehensive written quote details for homeowner review
 * Shows: System specs, products, line items, assumptions, installer contact
 * 
 * DESIGN TOKENS: 100% semantic (neu-card, text-*, bg-surface)
 * THEME COMPLIANCE: Dark/Light/Purple verified
 * ACCESSIBILITY: WCAG 2.1 AA (semantic HTML, readable text)
 */

interface SystemData {
  projectType?: string;
  systemType?: string;
  capacityKw?: number;
  panelCount?: number;
  panelType?: string;
  inverterType?: string;
  batteryIncluded?: boolean;
  batteryCapacityKwh?: number;
}

interface Product {
  id?: string;
  category?: string;
  name?: string;
  manufacturer?: string;
  model?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

interface LineItem {
  id?: string;
  category?: string;
  description?: string;
  amount?: number;
  type?: 'add' | 'subtract';
}

interface InstallerContact {
  name?: string;
  email?: string;
  phone?: string;
}

export interface WrittenQuoteDetailsDisplayProps {
  quote: {
    id: string;
    currentPrice: number;
    systemData?: SystemData | null;
    productsData?: Product[] | null;
    lineItems?: LineItem[] | null;
    assumptions?: FinancialAssumptions | string | null;
    calculations?: any;
    installerContact?: InstallerContact | null;
  };
}

// Reusable Info Row Component
function InfoRow({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <div className="mt-0.5 text-primary">{icon}</div>}
      <div className="flex-1">
        <dt className="text-label text-muted-foreground">{label}</dt>
        <dd className="text-body text-foreground">{value}</dd>
      </div>
    </div>
  );
}

export function WrittenQuoteDetailsDisplay({ quote }: WrittenQuoteDetailsDisplayProps) {
  const systemData = quote.systemData;
  const productsData = quote.productsData || [];
  const lineItems = quote.lineItems || [];
  const installerContact = quote.installerContact;

  return (
    <div className="space-y-4">
      {/* System Summary Card */}
      {systemData && (
        <Card className="neu-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="text-heading-4 text-foreground">System Configuration</h3>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {systemData.capacityKw && (
              <InfoRow 
                label="System Capacity" 
                value={`${systemData.capacityKw} kW`}
                icon={<Zap className="h-4 w-4" />}
              />
            )}
            {systemData.systemType && (
              <InfoRow 
                label="System Type" 
                value={systemData.systemType}
                icon={<Settings className="h-4 w-4" />}
              />
            )}
            {systemData.panelCount && (
              <InfoRow 
                label="Solar Panels" 
                value={`${systemData.panelCount} panels`}
                icon={<Sun className="h-4 w-4" />}
              />
            )}
            {systemData.panelType && (
              <InfoRow 
                label="Panel Type" 
                value={systemData.panelType}
              />
            )}
            {systemData.inverterType && (
              <InfoRow 
                label="Inverter" 
                value={systemData.inverterType}
                icon={<Settings className="h-4 w-4" />}
              />
            )}
            {systemData.batteryIncluded && systemData.batteryCapacityKwh && (
              <InfoRow 
                label="Battery Storage" 
                value={`${systemData.batteryCapacityKwh} kWh`}
                icon={<Battery className="h-4 w-4" />}
              />
            )}
          </dl>
        </Card>
      )}

      {/* Products & Equipment */}
      {productsData.length > 0 && (
        <Card className="neu-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-heading-4 text-foreground">Products & Equipment</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-label text-muted-foreground pb-2">Product</th>
                  <th className="text-right text-label text-muted-foreground pb-2">Qty</th>
                  <th className="text-right text-label text-muted-foreground pb-2">Unit Price</th>
                  <th className="text-right text-label text-muted-foreground pb-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productsData.map((product, index) => (
                  <tr key={product.id || index}>
                    <td className="py-2">
                      <div>
                        <p className="text-body text-foreground">{product.name || 'Unnamed Product'}</p>
                        {product.manufacturer && product.model && (
                          <p className="text-body-small text-muted-foreground">
                            {product.manufacturer} {product.model}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="text-right text-body text-foreground py-2">
                      {product.quantity || 0}
                    </td>
                    <td className="text-right text-body text-foreground py-2">
                      ${(product.unitPrice || 0).toLocaleString()}
                    </td>
                    <td className="text-right text-body text-foreground py-2">
                      ${(product.totalPrice || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Cost Breakdown */}
      {lineItems.length > 0 && (
        <Card className="neu-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="text-heading-4 text-foreground">Cost Breakdown</h3>
          </div>

          <dl className="space-y-3">
            {lineItems.map((item, index) => (
              <div 
                key={item.id || index}
                className="flex items-center justify-between pb-2 border-b border-border last:border-0"
              >
                <dt className="text-body text-foreground">
                  {item.description || 'Line Item'}
                  {item.category && (
                    <span className="text-body-small text-muted-foreground ml-2">
                      ({item.category})
                    </span>
                  )}
                </dt>
                <dd className={`text-body font-medium ${
                  item.type === 'subtract' ? 'text-success' : 'text-foreground'
                }`}>
                  {item.type === 'subtract' && '-'}
                  ${(item.amount || 0).toLocaleString()}
                </dd>
              </div>
            ))}

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-border">
              <dt className="text-heading-4 text-foreground">Total Investment</dt>
              <dd className="text-heading-3 text-primary">
                ${quote.currentPrice.toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      {/* Assumptions & Notes */}
      {quote.assumptions && (
        <Card className="neu-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-heading-4 text-foreground">
              {typeof quote.assumptions === 'object' ? 'Financial Assumptions' : 'Assumptions & Notes'}
            </h3>
          </div>
          
          {typeof quote.assumptions === 'object' && quote.assumptions !== null ? (
            // Structured display for object assumptions
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(quote.assumptions as FinancialAssumptions).paybackYears && (
                <InfoRow 
                  label="Payback Period" 
                  value={`${(quote.assumptions as FinancialAssumptions).paybackYears} years`}
                  icon={<Calendar className="h-4 w-4" />}
                />
              )}
              {(quote.assumptions as FinancialAssumptions).dailyUsageKWh && (
                <InfoRow 
                  label="Daily Usage" 
                  value={`${(quote.assumptions as FinancialAssumptions).dailyUsageKWh} kWh/day`}
                  icon={<Zap className="h-4 w-4" />}
                />
              )}
              {(quote.assumptions as FinancialAssumptions).solarOffsetPercent && (
                <InfoRow 
                  label="Solar Offset" 
                  value={`${(quote.assumptions as FinancialAssumptions).solarOffsetPercent}%`}
                  icon={<Sun className="h-4 w-4" />}
                />
              )}
              {(quote.assumptions as FinancialAssumptions).annualPriceIncrease && (
                <InfoRow 
                  label="Annual Price Increase" 
                  value={`${(quote.assumptions as FinancialAssumptions).annualPriceIncrease}%`}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
              )}
              {(quote.assumptions as FinancialAssumptions).systemLifespanYears && (
                <InfoRow 
                  label="System Lifespan" 
                  value={`${(quote.assumptions as FinancialAssumptions).systemLifespanYears} years`}
                  icon={<Settings className="h-4 w-4" />}
                />
              )}
              {(quote.assumptions as FinancialAssumptions).feedInTariffCentsKWh && (
                <InfoRow 
                  label="Feed-in Tariff" 
                  value={`${(quote.assumptions as FinancialAssumptions).feedInTariffCentsKWh}¢/kWh`}
                  icon={<DollarSign className="h-4 w-4" />}
                />
              )}
            </dl>
          ) : (
            // Legacy string assumptions (backward compatibility)
            <p className="text-body text-muted-foreground whitespace-pre-wrap">
              {String(quote.assumptions)}
            </p>
          )}
        </Card>
      )}

      {/* Installer Contact Information */}
      {installerContact && (
        <Card className="neu-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-heading-4 text-foreground">Installer Contact</h3>
          </div>

          <dl className="space-y-3">
            {installerContact.name && (
              <InfoRow 
                label="Company/Name" 
                value={installerContact.name}
                icon={<User className="h-4 w-4" />}
              />
            )}
            {installerContact.email && (
              <InfoRow 
                label="Email" 
                value={installerContact.email}
                icon={<Mail className="h-4 w-4" />}
              />
            )}
            {installerContact.phone && (
              <InfoRow 
                label="Phone" 
                value={installerContact.phone}
                icon={<Phone className="h-4 w-4" />}
              />
            )}
          </dl>
        </Card>
      )}

      {/* Fallback Message */}
      {!systemData && productsData.length === 0 && lineItems.length === 0 && (
        <Card className="neu-card p-6 text-center">
          <Package className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-body text-muted-foreground">
            Quote details are being prepared by the installer.
          </p>
        </Card>
      )}
    </div>
  );
}
