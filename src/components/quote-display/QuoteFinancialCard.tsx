'use client';

import React from 'react';
import { TrendingUp, DollarSign, Calendar, Award } from 'lucide-react';

interface QuoteFinancialCardProps {
  calculations: {
    subtotal?: number;
    incentiveAmount?: number;
    finalTotal?: number;
    pricePerWatt?: number;
    estimatedAnnualSavings?: number;
    paybackYears?: number;
  };
  fallbackAmount?: number;
}

export function QuoteFinancialCard({ calculations, fallbackAmount }: QuoteFinancialCardProps) {
  const subtotal = calculations?.subtotal || fallbackAmount || 0;
  const incentiveAmount = calculations?.incentiveAmount || 0;
  const finalTotal = calculations?.finalTotal || fallbackAmount || 0;
  const pricePerWatt = calculations?.pricePerWatt || 0;
  const annualSavings = calculations?.estimatedAnnualSavings || 0;
  const paybackYears = calculations?.paybackYears || 0;

  return (
    <>
      {/* Pricing Breakdown */}
      <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
        <h4 className="text-heading-4 text-foreground border-b border-border pb-2">
          Investment Breakdown
        </h4>
        
        {/* Totals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body text-muted-foreground">Subtotal</span>
            <span className="text-body text-foreground">
              ${subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body text-success">Incentives & Rebates</span>
            <span className="text-body text-success">
              -${incentiveAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t-2 border-primary/30">
            <span className="text-heading-4 text-foreground">Final Investment</span>
            <span className="text-heading-3 text-primary">
              ${finalTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-caption text-muted-foreground">Price per Watt</span>
            <span className="text-caption text-foreground">
              ${pricePerWatt.toFixed(2)}/W
            </span>
          </div>
        </div>
      </div>

      {/* Financial Projections */}
      <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
        <h4 className="text-heading-4 text-foreground border-b border-border pb-2 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Financial Projections
        </h4>

        <div className="bg-success/10 border border-success/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-success">
            <DollarSign className="h-5 w-5" />
            <span className="text-label">Annual Savings</span>
          </div>
          <p className="text-heading-3 text-success">
            ${annualSavings.toLocaleString()}/year
          </p>
        </div>

        <div className="bg-info/10 border border-info/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-info">
            <Calendar className="h-5 w-5" />
            <span className="text-label">Payback Period</span>
          </div>
          <p className="text-heading-3 text-foreground">
            {paybackYears.toFixed(1)} years
          </p>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Award className="h-5 w-5" />
            <span className="text-label">25-Year Savings</span>
          </div>
          <p className="text-heading-3 text-foreground">
            ${(annualSavings * 25).toLocaleString()}
          </p>
        </div>
      </div>
    </>
  );
}
