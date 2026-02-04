'use client';

import React from 'react';
import { X, Edit, Check, Lock, Sun, Zap, Battery, DollarSign, Calendar, Award } from 'lucide-react';
import Button from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import SavingsChart from './SavingsChart';

interface HomeownerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onConfirmSubmit: () => void;
  quoteData: {
    systemSize: number;
    total: number;
    pricePerWatt: number;
    subtotal: number;
    gst: number;
    incentives: number;
    annualProduction: number;
    annualSavings: number;
    paybackYears: number;
    panelBrand: string;
    panelModel: string;
    panelWattage: number;
    panelQty: number;
    panelWarranty: number;
    inverterBrand: string;
    inverterModel: string;
    inverterCapacity: number;
    inverterWarranty: number;
    batteryBrand?: string;
    batteryModel?: string;
    batteryCapacity?: number;
    batteryWarranty?: number;
    lineItems: Array<{
      description: string;
      qty: number;
      unitPrice: number;
      category: string;
    }>;
    addons: Array<{
      label: string;
      price: number;
    }>;
  };
  installerInfo: {
    name: string;
    cecAccreditation: string;
    electricalLicence: string;
  };
  isSubmitting?: boolean;
}

export default function HomeownerPreviewModal({
  isOpen,
  onClose,
  onEdit,
  onConfirmSubmit,
  quoteData,
  installerInfo,
  isSubmitting = false
}: HomeownerPreviewModalProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent
        className="left-0 right-0 top-0 translate-y-0 mx-0 max-w-none w-full h-screen p-0 overflow-hidden bg-background shadow-neu-outset-lg md:left-4 md:right-4 md:top-1/2 md:-translate-y-1/2 md:mx-auto md:max-w-5xl md:max-h-modal md:rounded-2xl animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div>
            <h2 className="text-heading-3 text-foreground">Bid Preview</h2>
            <p className="text-body-small text-muted-foreground mt-1">
              Review your bid as the homeowner will see it
            </p>
          </div>
          <DialogClose asChild>
            <button
              className="p-2 hover:bg-surface rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </DialogClose>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-auto p-4 md:p-6 space-y-6">
          {/* System Overview */}
          <div className="bg-surface rounded-2xl shadow-neu-inset p-6 space-y-4">
            <h3 className="text-heading-4 text-foreground flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              System Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background rounded-xl p-4">
                <p className="text-caption text-muted-foreground mb-1">System Size</p>
                <p className="text-heading-5 text-foreground">{quoteData.systemSize} kW</p>
              </div>
              <div className="bg-background rounded-xl p-4">
                <p className="text-caption text-muted-foreground mb-1">Total Price</p>
                <p className="text-heading-5 text-primary">{formatCurrency(quoteData.total)}</p>
              </div>
              <div className="bg-background rounded-xl p-4">
                <p className="text-caption text-muted-foreground mb-1">Price per Watt</p>
                <p className="text-heading-5 text-foreground">${quoteData.pricePerWatt.toFixed(2)}/W</p>
              </div>
              <div className="bg-background rounded-xl p-4">
                <p className="text-caption text-muted-foreground mb-1">Payback</p>
                <p className="text-heading-5 text-foreground">
                  {isFinite(quoteData.paybackYears) ? `${quoteData.paybackYears.toFixed(1)} yrs` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-surface rounded-2xl shadow-neu-inset p-6 space-y-4">
            <h3 className="text-heading-4 text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Pricing Breakdown
            </h3>
            <div className="space-y-2">
              {quoteData.lineItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-body-small">
                  <span className="text-foreground">
                    {item.description} ({item.category})
                  </span>
                  <span className="text-foreground">{formatCurrency(item.qty * item.unitPrice)}</span>
                </div>
              ))}
              {quoteData.addons.length > 0 && (
                <>
                  <div className="border-t border-border pt-2 mt-2">
                    <p className="text-caption text-muted-foreground mb-2">Additional Items</p>
                  </div>
                  {quoteData.addons.map((addon, idx) => (
                    <div key={idx} className="flex justify-between text-body-small">
                      <span className="text-foreground">{addon.label}</span>
                      <span className="text-foreground">{formatCurrency(addon.price)}</span>
                    </div>
                  ))}
                </>
              )}
              <div className="border-t border-border pt-2 mt-2 flex justify-between text-body">
                <span className="text-foreground">Subtotal</span>
                <span className="text-foreground">{formatCurrency(quoteData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-body-small">
                <span className="text-muted-foreground">GST (10%)</span>
                <span className="text-foreground">{formatCurrency(quoteData.gst)}</span>
              </div>
              {quoteData.incentives > 0 && (
                <div className="flex justify-between text-body-small text-success">
                  <span>Incentives/Rebates</span>
                  <span>-{formatCurrency(quoteData.incentives)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2 flex justify-between text-heading-5">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{formatCurrency(quoteData.total)}</span>
              </div>
            </div>
          </div>

          {/* Equipment Specifications */}
          <div className="bg-surface rounded-2xl shadow-neu-inset p-6 space-y-4">
            <h3 className="text-heading-4 text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Equipment Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Solar Panels */}
              <div className="bg-background rounded-xl p-4 space-y-2">
                <h4 className="text-label text-foreground flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Solar Panels
                </h4>
                <div className="space-y-1 text-body-small">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand & Model</span>
                    <span className="text-foreground">{quoteData.panelBrand} {quoteData.panelModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wattage</span>
                    <span className="text-foreground">{quoteData.panelWattage}W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="text-foreground">{quoteData.panelQty} panels</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Warranty</span>
                    <span className="text-foreground">{quoteData.panelWarranty} years</span>
                  </div>
                </div>
              </div>

              {/* Inverter */}
              <div className="bg-background rounded-xl p-4 space-y-2">
                <h4 className="text-label text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Inverter
                </h4>
                <div className="space-y-1 text-body-small">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand & Model</span>
                    <span className="text-foreground">{quoteData.inverterBrand} {quoteData.inverterModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="text-foreground">{quoteData.inverterCapacity} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Warranty</span>
                    <span className="text-foreground">{quoteData.inverterWarranty} years</span>
                  </div>
                </div>
              </div>

              {/* Battery (if present) */}
              {quoteData.batteryBrand && (
                <div className="bg-background rounded-xl p-4 space-y-2">
                  <h4 className="text-label text-foreground flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    Battery
                  </h4>
                  <div className="space-y-1 text-body-small">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand & Model</span>
                      <span className="text-foreground">{quoteData.batteryBrand} {quoteData.batteryModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="text-foreground">{quoteData.batteryCapacity} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Warranty</span>
                      <span className="text-foreground">{quoteData.batteryWarranty} years</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Projections Graph */}
          <div className="bg-surface rounded-2xl shadow-neu-inset p-6">
            <SavingsChart
              finalPrice={quoteData.total}
              annualSavings={quoteData.annualSavings}
              currentAnnualBill={quoteData.annualSavings + (quoteData.annualSavings * 0.3)}
            />
          </div>

          {/* Installer Information (Masked) */}
          <div className="bg-surface rounded-2xl shadow-neu-inset p-6 space-y-4">
            <h3 className="text-heading-4 text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Installer Information
            </h3>
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-body text-foreground mb-1">Contact Details Protected</p>
                <p className="text-body-small text-muted-foreground">
                  Contact details (name, phone, email, address) will be unlocked after the winner is selected by the homeowner.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background rounded-xl p-4">
                <p className="text-caption text-muted-foreground mb-1">CEC Accreditation</p>
                <p className="text-body text-foreground">{installerInfo.cecAccreditation || 'Provided'}</p>
              </div>
              <div className="bg-background rounded-xl p-4">
                <p className="text-caption text-muted-foreground mb-1">Electrical Licence</p>
                <p className="text-body text-foreground">{installerInfo.electricalLicence || 'Provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 border-t border-border flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            onClick={onEdit}
            variant="secondary"
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            <Edit className="h-4 w-4" />
            Edit Bid
          </Button>
          <Button
            onClick={onConfirmSubmit}
            variant="primary"
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
                Submitting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirm & Submit Bid
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
