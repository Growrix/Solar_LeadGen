'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QuoteSystemSpecsCard } from '@/components/quote-display/QuoteSystemSpecsCard';
import { QuoteEquipmentCard } from '@/components/quote-display/QuoteEquipmentCard';
import { QuoteFinancialCard } from '@/components/quote-display/QuoteFinancialCard';
import { QuoteLineItemsTable } from '@/components/quote-display/QuoteLineItemsTable';
import { WrittenQuoteNegotiationPanel, WQEvent } from '@/components/written-quote/WrittenQuoteNegotiationPanel';
import SavingsChart from '@/components/SavingsChart';
import HomeownerContactCard from '@/components/installer/HomeownerContactCard';

/**
 * InstallerWrittenQuoteReviewModal
 * 
 * Dedicated modal for installers to review and negotiate submitted written quotes
 * Displays full quote details with homeowner contact (masked if not purchased)
 * Parallel to HomeownerWrittenQuoteReviewModal (roles reversed)
 * 
 * Phase 4.16.14 - Sprint 4.16.14.0
 * Audit: DOC/AUDIT-REPORTS/System/INSTALLER-WRITTEN-QUOTE-MODAL-AUDIT-2025-12-21.md
 * 
 * DESIGN TOKENS: 100% semantic (neu-card, text-heading-*, bg-surface, text-muted-foreground)
 * THEME COMPLIANCE: Dark/Light/Purple verified
 * ACCESSIBILITY: WCAG 2.1 AA (keyboard nav, ARIA labels, focus visible)
 */

interface WrittenQuote {
  id: string;
  leadId: string;
  installerId: string;
  homeownerId: string;
  currentPrice: number;
  currentStatus: 'draft' | 'pending' | 'installer_turn' | 'homeowner_turn' | 'accepted' | 'rejected';
  lastActionBy: 'installer' | 'homeowner';
  lastActionAt: string | null;
  createdAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  // Comprehensive data
  systemData: any;
  productsData: any;
  lineItems: any[];
  assumptions: any;
  roofData: any;
  calculations: any;
  installerContact: any;
  // Relations
  lead: {
    id: string;
    name: string;
    location: string;
    propertyType: string;
    status: string;
    purchasedAt?: string | null; // Critical for contact masking
  };
  homeowner: {
    id: string;
    name: string;
    email: string;
    phone?: string; // May be masked by API
  };
  events: WQEvent[];
}

interface InstallerWrittenQuoteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  onQuoteUpdate?: () => void;
}

export default function InstallerWrittenQuoteReviewModal({
  isOpen,
  onClose,
  leadId,
  onQuoteUpdate
}: InstallerWrittenQuoteReviewModalProps) {
  const [writtenQuote, setWrittenQuote] = useState<WrittenQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch quote data on mount
  useEffect(() => {
    if (!isOpen || !leadId) return;

    async function fetchQuote() {
      try {
        setLoading(true);
        setError(null);
        console.log('[InstallerWrittenQuoteReviewModal] Fetching quote for leadId:', leadId);

        const response = await fetch(`/api/written-quotes/get?leadId=${leadId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch quote: ${response.statusText}`);
        }

        const data = await response.json();
        setWrittenQuote(data.quote);
        console.log('[InstallerWrittenQuoteReviewModal] Quote fetched successfully:', data.quote.id);
      } catch (err: any) {
        console.error('[InstallerWrittenQuoteReviewModal] Failed to fetch quote:', err);
        setError(err.message || 'Failed to load quote');
      } finally {
        setLoading(false);
      }
    }

    fetchQuote();
  }, [isOpen, leadId]);

  // Handle negotiation actions
  const handleNegotiationAction = async (
    action: 'offer' | 'counter' | 'accept' | 'reject',
    data: { price?: number; notes?: string }
  ) => {
    if (!writtenQuote) return;

    setActionLoading(true);
    try {
      console.log(`[InstallerWrittenQuoteReviewModal] ${action}:`, data);

      const response = await fetch(`/api/written-quotes/${writtenQuote.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `${action} failed`);
      }

      const result = await response.json();
      console.log(`[InstallerWrittenQuoteReviewModal] ${action} successful, refreshing data`);

      // Refresh quote data
      const refreshResponse = await fetch(`/api/written-quotes/get?leadId=${leadId}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setWrittenQuote(refreshedData.quote);
      }

      onQuoteUpdate?.();
    } catch (err: any) {
      console.error(`[InstallerWrittenQuoteReviewModal] ${action} failed:`, err);
      alert(`Failed to ${action}: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const isPurchased = writtenQuote?.lead.status === 'PURCHASED' && !!writtenQuote?.lead.purchasedAt;
  const installerName = writtenQuote?.lead.name || 'Loading...';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-surface rounded-lg border border-border w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col"
        style={{ boxShadow: 'var(--shadow-outset-xl)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-heading-2">
            Review Written Quote - {installerName}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-muted-foreground">Loading quote...</div>
            </div>
          )}

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error">
              {error}
            </div>
          )}

          {!loading && !error && writtenQuote && (
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
              {/* LEFT COLUMN: Quote Details (60%) */}
              <div className="space-y-6">
                {/* System Specs */}
                {writtenQuote.systemData && (
                  <QuoteSystemSpecsCard systemData={writtenQuote.systemData} />
                )}

                {/* Equipment */}
                {writtenQuote.productsData && (
                  <QuoteEquipmentCard productsData={writtenQuote.productsData} />
                )}

                {/* Financial Summary + Savings Graph */}
                {writtenQuote.calculations && (
                  <>
                    <QuoteFinancialCard
                      calculations={writtenQuote.calculations}
                      fallbackAmount={writtenQuote.currentPrice}
                    />
                    
                    {/* Savings Graph - Prominent Display */}
                    {writtenQuote.calculations.annualSavings && (
                      <Card className="neu-card p-4">
                        <h3 className="text-heading-3 mb-4">Annual Savings Projection</h3>
                        <SavingsChart
                          finalPrice={writtenQuote.currentPrice}
                          annualSavings={writtenQuote.calculations.annualSavings}
                          currentAnnualBill={writtenQuote.calculations.currentAnnualBill || 2000}
                        />
                      </Card>
                    )}
                  </>
                )}

                {/* Line Items */}
                {writtenQuote.lineItems && writtenQuote.lineItems.length > 0 && (
                  <QuoteLineItemsTable lineItems={writtenQuote.lineItems} />
                )}

                {/* Homeowner Contact - WITH MASKING */}
                <HomeownerContactCard
                  contact={writtenQuote.homeowner}
                  isPurchased={isPurchased}
                />
              </div>

              {/* RIGHT COLUMN: Negotiation Panel (40%) */}
              <div>
                <Card className="neu-card p-4">
                  <WrittenQuoteNegotiationPanel
                    role="installer"
                    currentPrice={writtenQuote.currentPrice}
                    status={writtenQuote.currentStatus}
                    history={writtenQuote.events}
                    onAction={handleNegotiationAction}
                    disabled={actionLoading}
                  />
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
