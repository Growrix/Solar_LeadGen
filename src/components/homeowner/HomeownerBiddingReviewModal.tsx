'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Award, DollarSign, TrendingUp, Calendar, Battery, Zap, 
  CheckCircle, Star, ChevronDown, ChevronUp, Info, Loader 
} from 'lucide-react';
import Button from '@/components/ui/button';
import { GetBidsResponse } from '@/types/bid';
import { LeadData } from '@/types/lead';
import HomeownerInstantQuoteDetails from '@/components/quote-builder/HomeownerInstantQuoteDetails';
import LeadTechnicalDetails from '@/components/quote-builder/LeadTechnicalDetails';
import InstantQuoteResult from '@/components/quote-builder/InstantQuoteResult';

// Type alias for individual bid with full data
type BidWithFullData = GetBidsResponse['bids'][number] & {
  installerName: string;
  installerRating: number;
  pricePerWatt: number;
  isWinner: boolean;
};

interface HomeownerBiddingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  propertyAddress: string;
  bids: BidWithFullData[];
  onSelectWinner?: (bidId: string) => Promise<void>;
}

export default function HomeownerBiddingReviewModal({
  isOpen,
  onClose,
  leadId,
  propertyAddress,
  bids: initialBids,
  onSelectWinner
}: HomeownerBiddingReviewModalProps) {
  // State management
  const [selectedBidId, setSelectedBidId] = useState<string>('');
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [bids, setBids] = useState<BidWithFullData[]>(initialBids);
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [bidsError, setBidsError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    instantQuote: true,
    technical: false,
    results: false
  });

  // Select first bid by default when bids change
  useEffect(() => {
    if (bids.length > 0 && !selectedBidId) {
      setSelectedBidId(bids[0].id);
    }
  }, [bids, selectedBidId]);

  // Fetch bids for the lead
  const fetchBids = React.useCallback(async () => {
    if (!leadId) return;
    setIsLoadingBids(true);
    setBidsError(null);
    try {
      console.log('[HomeownerBiddingReviewModal] Fetching bids for leadId:', leadId);
      const response = await fetch(`/api/bids?leadId=${leadId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch bids: ${response.status} ${response.statusText}`);
      }
      const data: GetBidsResponse = await response.json();
      console.log('[HomeownerBiddingReviewModal] Bids fetched:', data.bids.length, 'bids');
      
      // DEBUG: Log first bid's structure
      if (data.bids.length > 0) {
        console.log('[DEBUG] First bid structure:', {
          id: data.bids[0].id,
          amount: data.bids[0].amount,
          finalTotal: data.bids[0].finalTotal,
          systemData: data.bids[0].systemData,
          productsData: data.bids[0].productsData,
          lineItems: data.bids[0].lineItems
        });
      }
      
      // Transform API response to match component's expected format
      const transformedBids: BidWithFullData[] = data.bids.map(bid => ({
        ...bid,
        installerName: bid.installer?.companyName || 'Unknown Installer',
        installerRating: 4.5, // TODO: Get actual rating from installer profile
        pricePerWatt: bid.systemData?.capacityKw 
          ? bid.finalTotal / bid.systemData.capacityKw / 1000
          : 0,
        isWinner: bid.status === 'SELECTED'
      }));
      
      setBids(transformedBids);
    } catch (error) {
      console.error('[HomeownerBiddingReviewModal] Error fetching bids:', error);
      setBidsError(error instanceof Error ? error.message : 'Failed to load bids');
    } finally {
      setIsLoadingBids(false);
    }
  }, [leadId]);

  // Fetch bids when modal opens
  useEffect(() => {
    if (isOpen && leadId) {
      fetchBids();
    }
  }, [isOpen, leadId, fetchBids]);

  // Fetch full lead data when modal opens
  const fetchLeadData = React.useCallback(async () => {
    if (!leadId) return;
    setIsLoadingLead(true);
    setLeadError(null);
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      if (!response.ok) throw new Error('Failed to fetch lead data');
      const data = await response.json();
      setLeadData(data);
    } catch (error) {
      console.error('[HomeownerBiddingReviewModal] Error fetching lead:', error);
      setLeadError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoadingLead(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadData();
    }
  }, [isOpen, leadId, fetchLeadData]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const selectedBid = bids.find(b => b.id === selectedBidId);

  const sortedBids = [...bids].sort((a, b) => {
    // Winner first, then shortlisted, then by price
    if (a.isWinner && !b.isWinner) return -1;
    if (b.isWinner && !a.isWinner) return 1;
    if (a.status === 'shortlisted' && b.status !== 'shortlisted') return -1;
    if (b.status === 'shortlisted' && a.status !== 'shortlisted') return 1;
    return a.finalTotal - b.finalTotal;
  });

  const handleSelectWinnerClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedBidId || !onSelectWinner) return;
    
    setIsSelecting(true);
    try {
      await onSelectWinner(selectedBidId);
      
      // ✅ T189: Update local state to show winner badge immediately
      setBids(prevBids => prevBids.map(bid =>
        bid.id === selectedBidId
          ? { ...bid, status: 'SELECTED' as const, isWinner: true }
          : { ...bid, status: 'REJECTED' as const, isWinner: false }
      ));
      
      setShowConfirmation(false);
      
      // ✅ T189: Keep modal open for 2 seconds to show winner badge, then close
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('[HomeownerBiddingReviewModal] Error selecting winner:', error);
      // Error handled by parent with toast - no alert needed
    } finally {
      setIsSelecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper functions to safely access bid data with fallbacks
  const getSystemSize = (bid: BidWithFullData) => bid.systemData?.capacityKw || 0;
  const getSystemType = (bid: BidWithFullData) => bid.systemData?.systemType || 'N/A';
  const getAnnualProduction = (bid: BidWithFullData) => {
    const systemSize = getSystemSize(bid);
    // Use simple calculation since yield_kWh_per_kW_per_day doesn't exist in BidAssumptions
    const yieldFactor = 4.5; // Average kWh/kW/day
    return Math.round(systemSize * yieldFactor * 365);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-background relative w-full h-full md:max-w-[95vw] md:h-[95vh] md:rounded-2xl flex flex-col animate-fade-in shadow-neu-outset-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div>
            <h2 className="text-heading-3 text-foreground">Review Solar Bids</h2>
            <p className="text-body-small text-muted-foreground mt-1">
              {propertyAddress} • {bids.length} bid{bids.length !== 1 ? 's' : ''} received
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body - 2 Column Layout */}
        <div className="flex-grow overflow-auto p-4 md:p-6">
          {isLoadingBids ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader className="h-16 w-16 animate-spin text-primary mb-4" />
              <h3 className="text-heading-4 text-foreground mb-2">Loading Bids...</h3>
              <p className="text-body text-muted-foreground max-w-md">
                Please wait while we fetch all submitted bids for this lead.
              </p>
            </div>
          ) : bidsError ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Info className="h-16 w-16 text-error mb-4" />
              <h3 className="text-heading-4 text-foreground mb-2">Error Loading Bids</h3>
              <p className="text-body text-muted-foreground max-w-md mb-4">
                {bidsError}
              </p>
              <Button onClick={fetchBids} variant="primary">
                Retry
              </Button>
            </div>
          ) : sortedBids.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Award className="h-16 w-16 text-muted mb-4" />
              <h3 className="text-heading-4 text-foreground mb-2">No Bids Received Yet</h3>
              <p className="text-body text-muted-foreground max-w-md">
                Installers are preparing their quotes. You&apos;ll be notified when bids are submitted for your review.
              </p>
            </div>
          ) : (
            <>
              {/* Installer Selector Dropdown */}
              <div className="mb-6 space-y-2">
                <label className="text-label text-foreground block">
                  Select Installer to Review:
                </label>
                <select 
                  value={selectedBidId} 
                  onChange={(e) => setSelectedBidId(e.target.value)}
                  className="w-full md:w-auto px-4 py-3 bg-surface border border-border rounded-lg text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                >
                  {sortedBids.map((bid, index) => (
                    <option key={bid.id} value={bid.id}>
                      {bid.isWinner && '🏆 '}
                      {bid.status === 'shortlisted' && '⭐ '}
                      {bid.installerName} - ${bid.finalTotal.toLocaleString()} ({bid.systemData?.capacityKw || 0} kW)
                    </option>
                  ))}
                </select>
                <p className="text-caption text-muted-foreground">
                  {bids.length} bid{bids.length !== 1 ? 's' : ''} received • Compare installers side-by-side
                </p>
              </div>

              {/* 2 Column Grid */}
              {selectedBid && (
                <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
                  {/* LEFT COLUMN: Bid Details (Quotation Style) */}
                  <div className="space-y-6 overflow-y-auto">
                    {/* Quote Header */}
                    <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-label text-muted-foreground">Quote #</span>
                            <span className="text-heading-4 text-foreground font-mono">
                              {selectedBid.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-label text-muted-foreground">Date Submitted:</span>
                            <span className="text-body text-foreground">
                              {formatDate(selectedBid.createdAt)}
                            </span>
                          </div>
                        </div>
                        {selectedBid.isWinner && (
                          <span className="bg-success/20 text-success px-3 py-1 rounded-full text-label flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Winner Selected
                          </span>
                        )}
                        {selectedBid.status === 'shortlisted' && !selectedBid.isWinner && (
                          <span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-label flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="border-t border-border pt-4">
                        <h3 className="text-heading-3 text-foreground">{selectedBid.installerName}</h3>
                        <div className="flex items-center gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(selectedBid.installerRating)
                                  ? 'fill-warning text-warning'
                                  : 'text-muted'
                              }`}
                            />
                          ))}
                          <span className="text-caption text-muted-foreground ml-1">
                            {selectedBid.installerRating.toFixed(1)} / 5.0
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* System Specifications */}
                    <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
                      <h4 className="text-heading-4 text-foreground border-b border-border pb-2">
                        Solar System Specifications
                      </h4>
                      <table className="w-full">
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="py-2 text-body text-muted-foreground">System Type</td>
                            <td className="py-2 text-body text-foreground text-right">
                              {selectedBid.systemData?.systemType || 'Grid-Tied'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body text-muted-foreground">System Size</td>
                            <td className="py-2 text-body text-foreground text-right">
                              {selectedBid.systemData?.capacityKw || 0} kW
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body text-muted-foreground">Total Panels</td>
                            <td className="py-2 text-body text-foreground text-right">
                              {selectedBid.systemData?.solarPanelsArray?.reduce((sum, arr) => sum + arr.quantity, 0) || 0} panels
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body text-muted-foreground">Annual Production (Est.)</td>
                            <td className="py-2 text-body text-foreground text-right">
                              {getAnnualProduction(selectedBid).toLocaleString()} kWh/year
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Equipment Details */}
                    <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
                      <h4 className="text-heading-4 text-foreground border-b border-border pb-2">
                        Equipment & Products
                      </h4>
                      
                      {/* Solar Panels */}
                      {selectedBid.productsData?.solarPanels && selectedBid.productsData.solarPanels.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-label text-foreground flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Solar Panels
                          </h5>
                          <table className="w-full">
                            <tbody className="divide-y divide-border/50">
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Brand & Model</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedBid.productsData.solarPanels[0].brand} {selectedBid.productsData.solarPanels[0].model}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Wattage</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedBid.productsData.solarPanels[0].wattage}W
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Quantity</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedBid.productsData.solarPanels[0].quantity} panels
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Warranty</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedBid.productsData.solarPanels[0].warranty}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Inverter */}
                      {selectedBid.productsData?.inverter && (
                        <div className="space-y-2">
                          <h5 className="text-label text-foreground">Inverter</h5>
                          <table className="w-full">
                            <tbody className="divide-y divide-border/50">
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Brand & Model</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedBid.productsData.inverter.brand} {selectedBid.productsData.inverter.model}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Type</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedBid.productsData.inverter.type}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Capacity</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedBid.productsData.inverter.capacityKw} kW
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Warranty</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedBid.productsData.inverter.warranty}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Battery (if included) */}
                      {selectedBid.productsData?.battery && (
                        <div className="space-y-2">
                          <h5 className="text-label text-foreground flex items-center gap-2">
                            <Battery className="h-4 w-4" />
                            Battery Storage
                          </h5>
                          <table className="w-full">
                            <tbody className="divide-y divide-border/50">
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Brand & Model</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedBid.productsData.battery.brand} {selectedBid.productsData.battery.model}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Capacity</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedBid.productsData.battery.capacityKwh} kWh
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Warranty</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedBid.productsData.battery.warranty}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
                      <h4 className="text-heading-4 text-foreground border-b border-border pb-2">
                        Investment Breakdown
                      </h4>
                      
                      {/* Line Items Table */}
                      {selectedBid.lineItems && selectedBid.lineItems.length > 0 && (
                        <div className="space-y-4">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="py-2 text-label text-muted-foreground text-left">Description</th>
                                <th className="py-2 text-label text-muted-foreground text-right">Qty</th>
                                <th className="py-2 text-label text-muted-foreground text-right">Unit Price</th>
                                <th className="py-2 text-label text-muted-foreground text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {selectedBid.lineItems.map((item: any, index: number) => (
                                <tr key={index}>
                                  <td className="py-2 text-body-small text-foreground">{item.description}</td>
                                  <td className="py-2 text-body-small text-foreground text-right">{item.quantity}</td>
                                  <td className="py-2 text-body-small text-foreground text-right">
                                    ${item.unitPrice?.toLocaleString() || '0'}
                                  </td>
                                  <td className="py-2 text-body-small text-foreground text-right">
                                    ${(item.totalPrice || item.total || 0).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Totals */}
                          <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                              <span className="text-body text-muted-foreground">Subtotal</span>
                              <span className="text-body text-foreground">
                                ${(selectedBid.calculations?.subtotal || selectedBid.amount).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-body text-success">Incentives & Rebates</span>
                              <span className="text-body text-success">
                                -${(selectedBid.calculations?.incentiveAmount || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t-2 border-primary/30">
                              <span className="text-heading-4 text-foreground">Final Investment</span>
                              <span className="text-heading-3 text-primary">
                                ${(selectedBid.calculations?.finalTotal || selectedBid.amount).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-caption text-muted-foreground">Price per Watt</span>
                              <span className="text-caption text-foreground">
                                ${(selectedBid.calculations?.pricePerWatt || 0).toFixed(2)}/W
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
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
                            ${(selectedBid.calculations?.estimatedAnnualSavings || 0).toLocaleString()}/year
                          </p>
                      </div>

                      <div className="bg-info/10 border border-info/30 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-info">
                          <Calendar className="h-5 w-5" />
                          <span className="text-label">Payback Period</span>
                        </div>
                        <p className="text-heading-3 text-foreground">
                          {(selectedBid.calculations?.paybackYears || 0).toFixed(1)} years
                        </p>
                      </div>

                      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Award className="h-5 w-5" />
                          <span className="text-label">25-Year Savings</span>
                        </div>
                          <p className="text-heading-3 text-foreground">
                            ${((selectedBid.calculations?.estimatedAnnualSavings || 0) * 25).toLocaleString()}
                          </p>
                      </div>
                    </div>

                    {/* Installation & Roof Details */}
                    <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
                      <h4 className="text-heading-4 text-foreground border-b border-border pb-2">
                        Installation Details
                      </h4>
                      <table className="w-full">
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="py-2 text-body-small text-muted-foreground">Roof Type</td>
                            <td className="py-2 text-body-small text-foreground text-right">
                              {selectedBid.roofData?.roofType || 'N/A'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body-small text-muted-foreground">Roof Pitch</td>
                            <td className="py-2 text-body-small text-foreground text-right">
                              {selectedBid.roofData?.pitchDeg || 0}°
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body-small text-muted-foreground">Arrays</td>
                            <td className="py-2 text-body-small text-foreground text-right">
                              {selectedBid.roofData?.arrays || 1}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body-small text-muted-foreground">Orientations</td>
                            <td className="py-2 text-body-small text-foreground text-right">
                              {selectedBid.roofData?.orientations?.join(', ') || 'N/A'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body-small text-muted-foreground">Shading Assessment</td>
                            <td className="py-2 text-body-small text-foreground text-right">
                              {selectedBid.roofData?.shadingLevel || 0}% shading
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* T294: Winning Installer Contact (visible after purchase) */}
                  {selectedBid && selectedBid.isWinner && selectedBid.installer && (
                    <div className="bg-success/10 border-2 border-success/30 rounded-xl p-6" data-testid="installer-contact">
                      <h4 className="text-heading-4 text-success mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Winning Installer Contact
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-label text-muted-foreground min-w-[100px]">Company:</span>
                          <span className="text-body text-foreground">
                            {selectedBid.installer.companyName}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-label text-muted-foreground min-w-[100px]">Phone:</span>
                          <span className="text-body text-foreground">
                            {selectedBid.installer.phone || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-label text-muted-foreground min-w-[100px]">Email:</span>
                          <span className="text-body text-foreground">
                            {selectedBid.installer.email || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-label text-muted-foreground min-w-[100px]">Address:</span>
                          <span className="text-body text-foreground">
                            {selectedBid.installer.businessAddress || 'Not provided'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-success/5 rounded-md border border-success/20">
                        <p className="text-caption text-muted-foreground">
                          💡 Contact your winning installer to schedule installation and discuss project details.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* RIGHT COLUMN: Lead Details (InstantQuote Data) */}
                  <div className="space-y-6 lg:sticky lg:top-0 lg:h-fit">
                    <h3 className="text-heading-4 text-foreground border-b border-border pb-2">
                      Original Lead Details
                    </h3>

                    {isLoadingLead ? (
                      <div className="bg-surface rounded-xl p-6 text-center">
                        <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-body-small text-muted-foreground">
                          Loading lead details...
                        </p>
                      </div>
                    ) : leadError ? (
                      <div className="bg-error/10 border border-error/20 rounded-xl p-4">
                        <Info className="h-8 w-8 text-error mx-auto mb-2" />
                        <p className="text-body-small text-error text-center">
                          Unable to load lead details: {leadError}
                        </p>
                      </div>
                    ) : leadData && leadData.quoteData ? (
                      <div className="space-y-4">
                        {/* InstantQuote Details */}
                        <CollapsibleSection
                          title="InstantQuote Details"
                          expanded={expandedSections.instantQuote}
                          onToggle={() => toggleSection('instantQuote')}
                        >
                          <HomeownerInstantQuoteDetails 
                            quoteData={leadData.quoteData}
                            batteryRequired={leadData.batteryRequired}
                          />
                        </CollapsibleSection>

                        {/* Technical Specifications */}
                        <CollapsibleSection
                          title="Technical Specifications"
                          expanded={expandedSections.technical}
                          onToggle={() => toggleSection('technical')}
                        >
                          <LeadTechnicalDetails lead={leadData} />
                        </CollapsibleSection>

                        {/* InstantQuote Results */}
                        <CollapsibleSection
                          title="InstantQuote Results"
                          expanded={expandedSections.results}
                          onToggle={() => toggleSection('results')}
                        >
                          <InstantQuoteResult quoteData={leadData.quoteData} />
                        </CollapsibleSection>
                      </div>
                    ) : (
                      <div className="bg-info/10 border border-info/20 rounded-xl p-4 text-center">
                        <Info className="h-8 w-8 text-info mx-auto mb-2" />
                        <p className="text-body-small text-info">
                          No InstantQuote data available for this lead
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 border-t border-border gap-4">
          <div className="text-body-small text-muted-foreground">
            {selectedBid && (
              <>
                Reviewing: {selectedBid.installerName} • 
                ${selectedBid.finalTotal.toLocaleString()} • 
                {selectedBid.systemData?.capacityKw || 0} kW
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              onClick={onClose}
            >
              Close
            </Button>
            
            {selectedBid && (
              <Button 
                variant="primary" 
                onClick={handleSelectWinnerClick}
                disabled={selectedBid.isWinner || isSelecting}
              >
                {selectedBid.isWinner ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Winner Selected
                  </>
                ) : isSelecting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Selecting...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Select as Winner
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedBid && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full space-y-4 shadow-neu-outset-lg">
            <h3 className="text-heading-4 text-foreground">Confirm Winning Bid Selection</h3>
            <p className="text-body text-muted-foreground">
              Are you sure you want to select <strong className="text-foreground">{selectedBid.installerName}</strong> as the winning installer?
            </p>
            <p className="text-body-small text-info">
              This action will notify the installer and unlock their contact details for you.
            </p>
            <div className="flex items-center gap-3 pt-4">
              <Button 
                variant="secondary" 
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleConfirmSelection}
                disabled={isSelecting}
                className="flex-1"
              >
                {isSelecting ? 'Confirming...' : 'Confirm Selection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  expanded,
  onToggle,
  children
}) => {
  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-background-alt rounded-lg hover:bg-primary/5 transition-colors"
      >
        <span className="text-label text-foreground">{title}</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expanded && <div className="animate-fade-in">{children}</div>}
    </div>
  );
};
