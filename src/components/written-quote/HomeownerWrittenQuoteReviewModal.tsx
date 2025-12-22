'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader, AlertCircle, Building, Mail, Phone, FileText, Zap, Package, Calculator, DollarSign, List, Lock, Info, Lightbulb, TrendingUp } from 'lucide-react';
import { QuoteSystemSpecsCard } from '@/components/quote-display/QuoteSystemSpecsCard';
import { QuoteEquipmentCard } from '@/components/quote-display/QuoteEquipmentCard';
import { QuoteFinancialCard } from '@/components/quote-display/QuoteFinancialCard';
import { QuoteCalculationsSummary } from '@/components/quote-display/QuoteCalculationsSummary';
import { QuoteLineItemsTable } from '@/components/quote-display/QuoteLineItemsTable';
import { WrittenQuoteNegotiationPanel, WQEvent } from '@/components/written-quote/WrittenQuoteNegotiationPanel';
import SavingsChart from '@/components/SavingsChart';
import type { BidSystemData, BidProductsData, BidLineItem, BidCalculations, BidAssumptions, BidRoofData } from '@/types/bid';

/**
 * HomeownerWrittenQuoteReviewModal
 * 
 * Purpose: Display written quote details with negotiation capabilities for homeowners
 * Used in: Homeowner dashboard for WRITTEN_QUOTE leads
 * 
 * Design: 2-column layout (60% quote details | 40% negotiation panel)
 * Data: Fetches WrittenQuote via /api/written-quotes/get?leadId=X
 * 
 * Phase 4.16.13.3 - Sprint T-WQ-1303
 */

interface WrittenQuoteData {
  id: string;
  leadId: string;
  installerId: string;
  homeownerId: string;
  currentPrice: number;
  currentStatus: 'draft' | 'pending' | 'installer_turn' | 'homeowner_turn' | 'accepted' | 'rejected';
  lastActionBy: string | null;
  lastActionAt: string | null;
  createdAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  // Comprehensive quote data (8 JSON fields from Quote Builder)
  systemData?: BidSystemData;
  productsData?: BidProductsData;
  lineItems?: BidLineItem[];
  assumptions?: BidAssumptions;
  roofData?: BidRoofData;
  calculations?: BidCalculations;
  installerContact?: {
    primaryContactName?: string;
    email?: string;
    phone?: string;
  };
  // Relations
  lead?: {
    id: string;
    name: string;
    location: string;
    propertyType?: string;
  };
  installer?: {
    id: string;
    companyName: string;
    email: string;
    phone?: string;
  };
  homeowner?: {
    id: string;
    name: string;
    email: string;
  };
  events: WQEvent[];
  // Masking flag (Sprint 4.16.17.0)
  leadPurchased?: boolean;
}

interface HomeownerWrittenQuoteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  writtenQuoteId: string;
  installerName: string;
}

export default function HomeownerWrittenQuoteReviewModal({
  isOpen,
  onClose,
  leadId,
  writtenQuoteId,
  installerName
}: HomeownerWrittenQuoteReviewModalProps) {
  const [writtenQuote, setWrittenQuote] = useState<WrittenQuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);

  // Fetch written quote data when modal opens
  useEffect(() => {
    if (!isOpen || !leadId) return;

    const fetchQuote = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('[HomeownerWrittenQuoteReviewModal] Fetching quote for leadId:', leadId);
        const response = await fetch(`/api/written-quotes/get?leadId=${leadId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch quote: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.quote) {
          throw new Error('No written quote found for this lead');
        }
        
        console.log('[HomeownerWrittenQuoteReviewModal] Quote fetched successfully:', data.quote.id);
        setWrittenQuote(data.quote);
      } catch (err) {
        console.error('[HomeownerWrittenQuoteReviewModal] Failed to fetch quote:', err);
        setError(err instanceof Error ? err.message : 'Failed to load written quote');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [isOpen, leadId]);

  // Handle negotiation actions (counter, accept, reject)
  const handleNegotiationAction = async (
    action: 'offer' | 'counter' | 'accept' | 'reject',
    data: { price?: number; notes?: string }
  ) => {
    if (!writtenQuoteId) return;

    setIsActing(true);
    try {
      console.log(`[HomeownerWrittenQuoteReviewModal] ${action}:`, data);
      
      // Determine API endpoint
      const endpoint = action === 'accept' || action === 'reject'
        ? `/api/written-quotes/${writtenQuoteId}/done`
        : `/api/written-quotes/${writtenQuoteId}/counter`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          price: data.price,  // Backend expects 'price' not 'priceOffered'
          notes: data.notes
        })
      });

      if (!response.ok) {
        throw new Error(`${action} failed: ${response.statusText}`);
      }

      // Refresh quote data to show updated price and history
      const updatedData = await response.json();
      console.log(`[HomeownerWrittenQuoteReviewModal] ${action} successful, refreshing data`);
      
      // Re-fetch to get latest state with events
      const refreshResponse = await fetch(`/api/written-quotes/get?leadId=${leadId}`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setWrittenQuote(refreshData.quote);
      }

      // If accepted/rejected, show success message and close modal after delay
      if (action === 'accept' || action === 'reject') {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error(`[HomeownerWrittenQuoteReviewModal] ${action} failed:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${action} quote`);
    } finally {
      setIsActing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-neu-outset max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-heading-3 text-foreground">
            Review Written Quote - {installerName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-96">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-body text-muted-foreground">Loading written quote...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-body text-error">Failed to load written quote</p>
                <p className="text-body-small text-error/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Quote Data Loaded */}
          {writtenQuote && !isLoading && !error && (
            <div className="grid grid-cols-3 gap-6">
              {/* LEFT COLUMN (60% - 2/3 of grid) - Quote Details */}
              <div className="col-span-2 space-y-6">
                {/* INSTALLER INFO WITH MASKING (Sprint 4.16.17.0) */}
                {writtenQuote.installer && (
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                    <h3 className="text-heading-4 text-foreground mb-4 flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Installer Information
                    </h3>
                    
                    {!writtenQuote.leadPurchased ? (
                      /* ❌ NOT PURCHASED - MASKED */
                      <div className="space-y-4">
                        {/* Blurred placeholder */}
                        <div className="relative">
                          <div className="blur-md select-none pointer-events-none opacity-50">
                            <div className="space-y-3">
                              <div>
                                <p className="text-label text-muted-foreground mb-1">Company</p>
                                <p className="text-body">Green Energy Solutions Pty Ltd</p>
                              </div>
                              <div>
                                <p className="text-label text-muted-foreground mb-1">Email</p>
                                <p className="text-body">contact@greenenergy.com.au</p>
                              </div>
                              <div>
                                <p className="text-label text-muted-foreground mb-1">Phone</p>
                                <p className="text-body">(02) 9876 5432</p>
                              </div>
                            </div>
                          </div>
                          {/* Lock icon overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="h-10 w-10 text-muted-foreground" />
                          </div>
                        </div>
                        
                        {/* Warning message */}
                        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-body-small text-warning">Contact Details Hidden</p>
                              <p className="text-body-small text-warning/80 mt-1">
                                Installer contact information will be revealed after you accept this quote and the installer purchases the lead.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ✅ PURCHASED - SHOW REAL CONTACT */
                      <div className="space-y-3">
                        {/* Company Name */}
                        <div>
                          <p className="text-label text-muted-foreground mb-1">Company</p>
                          <p className="text-body text-foreground">
                            {writtenQuote.installer.companyName || 'Not provided'}
                          </p>
                        </div>
                        
                        {/* Email */}
                        {writtenQuote.installer.email && (
                          <div>
                            <p className="text-label text-muted-foreground mb-1">Email</p>
                            <a 
                              href={`mailto:${writtenQuote.installer.email}`}
                              className="text-body text-primary hover:underline flex items-center gap-2"
                            >
                              <Mail className="h-4 w-4" />
                              {writtenQuote.installer.email}
                            </a>
                          </div>
                        )}
                        
                        {/* Phone */}
                        {writtenQuote.installer.phone && (
                          <div>
                            <p className="text-label text-muted-foreground mb-1">Phone</p>
                            <a 
                              href={`tel:${writtenQuote.installer.phone}`}
                              className="text-body text-primary hover:underline flex items-center gap-2"
                            >
                              <Phone className="h-4 w-4" />
                              {writtenQuote.installer.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Quote Metadata */}
                <div className="bg-surface rounded-xl p-6 border border-border shadow-neu-inset">
                  <h3 className="text-heading-4 text-foreground mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Quote Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-label text-muted-foreground">Quote #</p>
                      <p className="text-body text-foreground font-mono">
                        {writtenQuote.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-label text-muted-foreground">Submitted</p>
                      <p className="text-body text-foreground">
                        {new Date(writtenQuote.createdAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    {writtenQuote.lead?.propertyType && (
                      <div>
                        <p className="text-label text-muted-foreground">Property Type</p>
                        <p className="text-body text-foreground capitalize">
                          {writtenQuote.lead.propertyType}
                        </p>
                      </div>
                    )}
                    {writtenQuote.lead?.location && (
                      <div>
                        <p className="text-label text-muted-foreground">Location</p>
                        <p className="text-body text-foreground">
                          {writtenQuote.lead.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Specifications */}
                {writtenQuote.systemData && (
                  <QuoteSystemSpecsCard systemData={writtenQuote.systemData} />
                )}

                {/* Equipment Details */}
                {writtenQuote.productsData && (
                  <QuoteEquipmentCard productsData={writtenQuote.productsData || {}} />
                )}

                {/* Price Breakdown */}
                {writtenQuote.calculations && (
                  <QuoteCalculationsSummary
                    calculations={writtenQuote.calculations}
                    fallbackAmount={writtenQuote.currentPrice}
                  />
                )}

                {/* Financial Details */}
                {writtenQuote.calculations && (
                  <QuoteFinancialCard
                    calculations={writtenQuote.calculations || {}}
                    fallbackAmount={writtenQuote.currentPrice}
                  />
                )}

                {/* Savings Graph with Improved Empty State (Sprint 4.16.17.3) */}
                {!writtenQuote.calculations?.estimatedAnnualSavings ? (
                  <div className="bg-info/5 border border-info/20 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-heading-xs text-info mb-2">Savings Estimate Not Included</h4>
                        <p className="text-body-small text-foreground-secondary mb-3">
                          This quote doesn&apos;t include annual savings projections. This is optional and some installers provide it separately during negotiations.
                        </p>
                        
                        {/* Helpful tips */}
                        <div className="bg-surface rounded-lg p-4 border-l-4 border-info">
                          <p className="text-label text-foreground-secondary flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-info" />
                            What you can do:
                          </p>
                          <ul className="text-body-small text-muted-foreground space-y-1.5 list-disc list-inside">
                            <li>Request a savings breakdown when you contact the installer</li>
                            <li>Ask for estimated monthly bill reduction based on your energy usage</li>
                            <li>Compare system output (kWh/year) with your current consumption</li>
                            <li>Inquire about payback period and return on investment</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface rounded-xl p-6 border border-border shadow-neu-inset">
                    <h3 className="text-heading-4 text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      Annual Savings Projection
                    </h3>
                    <SavingsChart
                      finalPrice={writtenQuote.currentPrice}
                      annualSavings={writtenQuote.calculations.estimatedAnnualSavings}
                      currentAnnualBill={2000}
                    />
                  </div>
                )}

                {/* Line Items Table */}
                {writtenQuote.lineItems && writtenQuote.lineItems.length > 0 && (
                  <QuoteLineItemsTable
                    lineItems={writtenQuote.lineItems}
                  />
                )}
              </div>

              {/* RIGHT COLUMN (40% - 1/3 of grid) - Negotiation Panel */}
              <div className="col-span-1">
                <div className="sticky top-0 space-y-6">
                  <WrittenQuoteNegotiationPanel
                    role="homeowner"
                    currentPrice={writtenQuote.currentPrice}
                    status={writtenQuote.currentStatus}
                    history={writtenQuote.events || []}
                    onAction={handleNegotiationAction}
                    disabled={isActing}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-body text-foreground transition-colors shadow-neu-inset hover:shadow-neu-outset"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
