'use client';

import React from 'react';
import type { BidCalculations } from '@/types/bid';

/**
 * QuoteCalculationsSummary Component
 * 
 * Displays detailed pricing breakdown with:
 * - Subtotal
 * - GST (10%)
 * - STC rebate (Small-scale Technology Certificates)
 * - VIC rebate (if applicable)
 * - Discounts (if any)
 * - Final price
 * 
 * Design: Semantic tokens only, multi-theme compliant
 */

interface QuoteCalculationsSummaryProps {
  calculations: BidCalculations;
  fallbackAmount?: number; // Used if calculations incomplete
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export function QuoteCalculationsSummary({ calculations, fallbackAmount }: QuoteCalculationsSummaryProps) {
  // Extract values with fallbacks (mapping to BidCalculations properties)
  const subtotal = calculations.subtotal || fallbackAmount || 0;
  const gst = calculations.gstAmount || 0;
  const incentive = calculations.includeIncentive ? (calculations.incentiveAmount || 0) : 0;
  const finalPrice = calculations.finalTotal || fallbackAmount || 0;

  // Calculate subtotal before GST if GST exists
  const subtotalBeforeGST = gst > 0 ? subtotal / (1 + (calculations.gstPercent || 10) / 100) : subtotal;
  
  return (
    <div className="bg-surface rounded-xl p-6 border border-border shadow-neu-inset">
      <h3 className="text-heading-3 mb-4">Price Breakdown</h3>

      <div className="space-y-3">
        {/* Subtotal (before GST) */}
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <span className="text-body text-muted-foreground">Subtotal (ex GST)</span>
          <span className="text-body text-foreground font-mono">{formatCurrency(subtotalBeforeGST)}</span>
        </div>

        {/* GST */}
        {gst > 0 && (
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-body text-muted-foreground">GST ({calculations.gstPercent || 10}%)</span>
            <span className="text-body text-foreground font-mono">{formatCurrency(gst)}</span>
          </div>
        )}

        {/* STC/Incentive Rebate */}
        {incentive > 0 && (
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-body text-success">STC/Incentive Rebate</span>
            <span className="text-body text-success font-mono">-{formatCurrency(incentive)}</span>
          </div>
        )}

        {/* Final Price */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-heading-3 text-foreground">Final Price</span>
          <span className="text-heading-2 text-primary font-mono">{formatCurrency(finalPrice)}</span>
        </div>

        {/* Price per Watt metric */}
        {calculations.pricePerWatt && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-body-small text-muted-foreground">Price per Watt</span>
              <span className="text-body-small text-foreground font-mono">
                {formatCurrency(calculations.pricePerWatt)}/W
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
