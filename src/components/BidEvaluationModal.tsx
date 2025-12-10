'use client';

import React, { useState, useEffect } from 'react';
import { X, Award, DollarSign, Calendar, Battery, Zap, TrendingUp, MapPin, Home, FileText, Clock, Lock, AlertCircle, Calculator, Sun, Plug, Gauge, Grid, Car } from 'lucide-react';
import SavingsChart from './SavingsChart';
import Button from '@/components/ui/button';
import BiddingStatusBadge from '@/components/BiddingStatusBadge';

interface Bid {
  id: string;
  installerName: string; // Anonymized: "Installer A", "Installer B", "You"
  totalPrice: number;
  pricePerWatt: number;
  systemSize: number;
  panelBrand: string;
  inverterBrand: string;
  batteryBrand?: string;
  batteryCapacity?: number;
  warranty: number;
  installationTimeline: string;
  paybackYears: number;
  submittedAt: string;
  isYourBid: boolean;
  status: 'submitted' | 'shortlisted' | 'not_selected';
}

interface InstantQuoteResults {
  quoteType: 'residential' | 'commercial';
  systemSize: number;
  annualProduction: number;
  annualSavings: number;
  currentAnnualBill: number;
  totalCost: number;
  federalRebate: number;
  batteryRebate: number;
  stateRebate: number;
  finalPrice: number;
  simplePaybackYears: number | null;
  selfConsumedKwh?: number;
  exportedKwh?: number;
  co2Reduction?: number;
  roofArea?: number;
  panelsRequired?: number;
  demandChargeSavings?: number;
  energySavings?: number;
  disclaimers?: string[];
  // User selections from InstantQuoteForm
  electricityValue?: string | number;
  electricityUsageType?: 'monthly' | 'quarterly';
  desiredOffset?: number;
  usagePattern?: string;
  panelBrand?: string;
  panelOrientation?: string;
  roofTilt?: string;
  shadingLevel?: string;
  includeOptimizers?: boolean;
  includeMicroinverters?: boolean;
  batteryBrand?: string;
  batteryCapacity?: string;
  customBatteryCapacity?: string;
  backupCritical?: string;
  batteryUsage?: string;
  retailer?: string;
  tariffPlan?: string;
  customRetailRate?: string;
  customFeedInRate?: string;
  includeVPP?: boolean;
  includeEVCharging?: boolean;
  includeSmartHome?: boolean;
  includeGridServices?: boolean;
  hasExistingSystem?: boolean;
  existingSystemSize?: string;
  peakDemand?: string;
  isThreePhase?: boolean;
  projectPriority?: string;
  systemSizeOverride?: string;
}

interface LeadData {
  id: string;
  projectType: string;
  propertyType: string;
  postcode: string;
  location: string;
  state: string;
  address?: string;
  energyBill: number;
  billType: string;
  roofType: string;
  budgetRange: string;
  desiredOffset: number;
  batteryRequired: boolean;
  batteryCapacity?: string;
  timeframe?: string;
  additionalNotes?: string;
  quoteData?: InstantQuoteResults;
  quoteType: string;
  expiresAt?: string;
  leadPrice?: number;
  phoneNumber?: string;
  name?: string;
}

interface BidEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  bids: Bid[];
  yourBidId?: string;
  isPurchased?: boolean; // T13I-4: Flag to show real contact info after purchase
}

export default function BidEvaluationModal({
  isOpen,
  onClose,
  leadId,
  bids,
  yourBidId,
  isPurchased = false // T13I-4: Default to false (masked contacts)
}: BidEvaluationModalProps) {
  const [selectedBids, setSelectedBids] = useState<string[]>([]);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  // Fetch lead data when modal opens
  useEffect(() => {
    if (!isOpen || !leadId) return;

    const fetchLeadData = async () => {
      setIsLoadingLead(true);
      setLeadError(null);

      try {
        const response = await fetch(`/api/leads/${leadId}`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Lead not found' : 'Failed to fetch lead details');
        }

        const data = await response.json();
        setLeadData(data.lead);
      } catch (error) {
        console.error('Error fetching lead:', error);
        setLeadError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoadingLead(false);
      }
    };

    fetchLeadData();
  }, [isOpen, leadId]);

  if (!isOpen) return null;

  // Limit to 3 bids for side-by-side comparison
  const displayBids = bids.slice(0, 3);

  const toggleBidSelection = (bidId: string) => {
    setSelectedBids(prev => 
      prev.includes(bidId) 
        ? prev.filter(id => id !== bidId)
        : prev.length < 3 
          ? [...prev, bidId]
          : prev
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-background relative w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-2xl flex flex-col animate-scale-in shadow-neu-outset-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div>
            <h2 className="text-heading-3 text-foreground">Bid Evaluation</h2>
            <p className="text-body-small text-muted-foreground mt-1">
              Compare anonymous bids for Lead #{leadId}
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

        {/* Bids Comparison Table */}
        <div className="flex-grow overflow-auto p-4 md:p-6 space-y-6">
          {/* Lead Technical Details Section */}
          {isLoadingLead && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-body text-muted-foreground">Loading lead details...</p>
              </div>
            </div>
          )}

          {leadError && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-body text-error mb-1">Error Loading Lead</h4>
                <p className="text-body-small text-error/80">{leadError}</p>
              </div>
            </div>
          )}

          {leadData && (
            <div className="bg-surface rounded-2xl shadow-neu-inset p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-heading-4 text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Lead Technical Details
                </h3>
                <span className="text-caption text-muted-foreground">
                  Lead #{leadId.slice(-8)}
                </span>
              </div>

              {/* Location & Property */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-label text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location & Property
                  </h4>
                  <div className="bg-background rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-body-small">
                      <span className="text-muted-foreground">Location</span>
                      <span className="text-foreground">{leadData.location}, {leadData.state}</span>
                    </div>
                    <div className="flex justify-between text-body-small">
                      <span className="text-muted-foreground">Postcode</span>
                      <span className="text-foreground">{leadData.postcode}</span>
                    </div>
                    <div className="flex justify-between text-body-small">
                      <span className="text-muted-foreground">Property Type</span>
                      <span className="text-foreground capitalize">{leadData.propertyType}</span>
                    </div>
                    <div className="flex justify-between text-body-small">
                      <span className="text-muted-foreground">Project Type</span>
                      <span className="text-foreground capitalize">{leadData.projectType}</span>
                    </div>
                  </div>
                </div>

                {/* Energy & Budget */}
                <div className="space-y-3">
                  <h4 className="text-label text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Energy & Budget
                  </h4>
                  <div className="bg-background rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-body-small">
                      <span className="text-muted-foreground">Energy Bill</span>
                      <span className="text-foreground">${leadData.energyBill} / {leadData.billType}</span>
                    </div>
                    <div className="flex justify-between text-body-small">
                      <span className="text-muted-foreground">Budget Range</span>
                      <span className="text-foreground">{leadData.budgetRange}</span>
                    </div>
                    <div className="flex justify-between text-body-small">
                      <span className="text-muted-foreground">Desired Offset</span>
                      <span className="text-foreground">{leadData.desiredOffset}%</span>
                    </div>
                    {leadData.leadPrice && (
                      <div className="flex justify-between text-body-small pt-2 border-t border-border">
                        <span className="text-muted-foreground">Lead Price</span>
                        <span className="text-primary">${leadData.leadPrice}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* System Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-label text-foreground flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    System Requirements
                  </h4>
                  <div className="bg-background rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-body-small">
                      <span className="text-muted-foreground">Roof Type</span>
                      <span className="text-foreground capitalize">{leadData.roofType}</span>
                    </div>
                    <div className="flex justify-between text-body-small">
                      <span className="text-muted-foreground">Battery Required</span>
                      <span className="text-foreground">{leadData.batteryRequired ? 'Yes' : 'No'}</span>
                    </div>
                    {leadData.batteryRequired && leadData.batteryCapacity && (
                      <div className="flex justify-between text-body-small">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Battery className="h-3 w-3" />
                          Battery Capacity
                        </span>
                        <span className="text-foreground">{leadData.batteryCapacity}</span>
                      </div>
                    )}
                    {leadData.timeframe && (
                      <div className="flex justify-between text-body-small">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Timeframe
                        </span>
                        <span className="text-foreground capitalize">{leadData.timeframe}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="text-label text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Contact Information
                  </h4>
                  {isPurchased ? (
                    // T13I-4: Show real contact info after purchase
                    <div className="bg-success/5 border border-success/20 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-body-small">
                        <span className="text-muted-foreground">Name</span>
                        <span className="text-foreground">{leadData.name || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between text-body-small">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="text-foreground">{leadData.phoneNumber || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between text-body-small">
                        <span className="text-muted-foreground">Address</span>
                        <span className="text-foreground">{leadData.address || `${leadData.location}, ${leadData.state} ${leadData.postcode}`}</span>
                      </div>
                    </div>
                  ) : (
                    // Show "Available After Purchase" message for unpurchased leads
                    <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-body-small text-warning mb-1">
                            Available After Purchase
                          </p>
                          <p className="text-caption text-muted-foreground">
                            Contact details (name, phone, full address) will be unlocked after you submit your bid and homeowner selects you as winner.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {leadData.expiresAt && (
                    <div className="bg-info/5 border border-info/20 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-body-small text-info flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Countdown Expires
                        </span>
                        <span className="text-body-small text-foreground">
                          {new Date(leadData.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              {leadData.additionalNotes && (
                <div className="bg-info/10 border border-info/20 rounded-xl p-4">
                  <h4 className="text-label text-foreground mb-2">Additional Notes</h4>
                  <p className="text-body-small text-foreground whitespace-pre-wrap">{leadData.additionalNotes}</p>
                </div>
              )}

              {/* ===== INSTANTQUOTE DETAILS SECTION ===== */}
              {leadData.quoteData ? (
                <div className="bg-surface rounded-2xl shadow-neu-inset p-5 space-y-4">
                  <h3 className="text-heading-4 text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <FileText className="h-5 w-5 text-primary" />
                    InstantQuote Details
                  </h3>

                  {/* Energy Usage */}
                  <div className="space-y-2">
                    <h4 className="text-label text-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Energy Usage
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {leadData.quoteData.electricityValue && (
                        <div className="bg-background rounded-lg p-2">
                          <span className="text-caption text-muted-foreground block">Electricity Bill</span>
                          <p className="text-body-small text-foreground mt-0.5">
                            ${leadData.quoteData.electricityValue} / {leadData.quoteData.electricityUsageType}
                          </p>
                        </div>
                      )}
                      {leadData.quoteData.currentAnnualBill && (
                        <div className="bg-background rounded-lg p-2">
                          <span className="text-caption text-muted-foreground block">Annual Bill</span>
                          <p className="text-body-small text-foreground mt-0.5">
                            ${leadData.quoteData.currentAnnualBill?.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {leadData.quoteData.desiredOffset && (
                        <div className="bg-background rounded-lg p-2">
                          <span className="text-caption text-muted-foreground block">Desired Offset</span>
                          <p className="text-body-small text-foreground mt-0.5">{leadData.quoteData.desiredOffset}%</p>
                        </div>
                      )}
                      {leadData.quoteData.usagePattern && (
                        <div className="bg-background rounded-lg p-2">
                          <span className="text-caption text-muted-foreground block">Usage Pattern</span>
                          <p className="text-body-small text-foreground mt-0.5 capitalize">{leadData.quoteData.usagePattern}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Solar System Configuration */}
                  <div className="space-y-2">
                    <h4 className="text-label text-foreground flex items-center gap-2">
                      <Sun className="h-4 w-4 text-primary" />
                      Solar System Configuration
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-background rounded-lg p-2">
                        <span className="text-caption text-muted-foreground block">System Size</span>
                        <p className="text-body-small text-primary mt-0.5">
                          {leadData.quoteData.systemSizeOverride || leadData.quoteData.systemSize} kW
                        </p>
                      </div>
                      {leadData.quoteData.panelBrand && (
                        <div className="bg-background rounded-lg p-2">
                          <span className="text-caption text-muted-foreground block">Panel Brand</span>
                          <p className="text-body-small text-foreground mt-0.5 capitalize">
                            {leadData.quoteData.panelBrand.replace(/-/g, ' ')}
                          </p>
                        </div>
                      )}
                      {leadData.quoteData.panelOrientation && (
                        <div className="bg-background rounded-lg p-2">
                          <span className="text-caption text-muted-foreground block">Orientation</span>
                          <p className="text-body-small text-foreground mt-0.5 capitalize">{leadData.quoteData.panelOrientation}</p>
                        </div>
                      )}
                      {leadData.quoteData.roofTilt && (
                        <div className="bg-background rounded-lg p-2">
                          <span className="text-caption text-muted-foreground block">Roof Tilt</span>
                          <p className="text-body-small text-foreground mt-0.5 capitalize">{leadData.quoteData.roofTilt}</p>
                        </div>
                      )}
                      {leadData.quoteData.shadingLevel && (
                        <div className="bg-background rounded-lg p-2">
                          <span className="text-caption text-muted-foreground block">Shading</span>
                          <p className="text-body-small text-foreground mt-0.5 capitalize">{leadData.quoteData.shadingLevel}</p>
                        </div>
                      )}
                      <div className="bg-background rounded-lg p-2">
                        <span className="text-caption text-muted-foreground block">Optimizers</span>
                        <p className="text-body-small text-foreground mt-0.5">{leadData.quoteData.includeOptimizers ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="bg-background rounded-lg p-2">
                        <span className="text-caption text-muted-foreground block">Microinverters</span>
                        <p className="text-body-small text-foreground mt-0.5">{leadData.quoteData.includeMicroinverters ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Battery Configuration (if included) */}
                  {(leadData.batteryRequired || leadData.quoteData.batteryBrand || leadData.quoteData.batteryCapacity || leadData.quoteData.customBatteryCapacity) && (
                    <div className="space-y-2">
                      <h4 className="text-label text-foreground flex items-center gap-2">
                        <Battery className="h-4 w-4 text-primary" />
                        Battery Configuration
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {leadData.quoteData.batteryBrand && (
                          <div className="bg-background rounded-lg p-2">
                            <span className="text-caption text-muted-foreground block">Battery Brand</span>
                            <p className="text-body-small text-foreground mt-0.5 capitalize">{leadData.quoteData.batteryBrand}</p>
                          </div>
                        )}
                        {(leadData.quoteData.batteryCapacity || leadData.quoteData.customBatteryCapacity) && (
                          <div className="bg-background rounded-lg p-2">
                            <span className="text-caption text-muted-foreground block">Battery Capacity</span>
                            <p className="text-body-small text-foreground mt-0.5">
                              {leadData.quoteData.batteryCapacity === 'custom' 
                                ? leadData.quoteData.customBatteryCapacity 
                                : leadData.quoteData.batteryCapacity} kWh
                            </p>
                          </div>
                        )}
                        {leadData.quoteData.backupCritical && (
                          <div className="bg-background rounded-lg p-2">
                            <span className="text-caption text-muted-foreground block">Backup Critical</span>
                            <p className="text-body-small text-foreground mt-0.5 capitalize">{leadData.quoteData.backupCritical}</p>
                          </div>
                        )}
                        {leadData.quoteData.batteryUsage && (
                          <div className="bg-background rounded-lg p-2">
                            <span className="text-caption text-muted-foreground block">Battery Usage</span>
                            <p className="text-body-small text-foreground mt-0.5 capitalize">
                              {leadData.quoteData.batteryUsage.replace(/-/g, ' ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Retailer & Tariff */}
                  {(leadData.quoteData.retailer || leadData.quoteData.tariffPlan || leadData.quoteData.customRetailRate || leadData.quoteData.customFeedInRate) && (
                    <div className="space-y-2">
                      <h4 className="text-label text-foreground flex items-center gap-2">
                        <Plug className="h-4 w-4 text-primary" />
                        Retailer & Tariff
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {leadData.quoteData.retailer && (
                          <div className="bg-background rounded-lg p-2">
                            <span className="text-caption text-muted-foreground block">Retailer</span>
                            <p className="text-body-small text-foreground mt-0.5 capitalize">{leadData.quoteData.retailer}</p>
                          </div>
                        )}
                        {leadData.quoteData.tariffPlan && (
                          <div className="bg-background rounded-lg p-2">
                            <span className="text-caption text-muted-foreground block">Tariff Plan</span>
                            <p className="text-body-small text-foreground mt-0.5 capitalize">{leadData.quoteData.tariffPlan}</p>
                          </div>
                        )}
                        {leadData.quoteData.customRetailRate && (
                          <div className="bg-background rounded-lg p-2">
                            <span className="text-caption text-muted-foreground block">Custom Retail Rate</span>
                            <p className="text-body-small text-foreground mt-0.5">${leadData.quoteData.customRetailRate}/kWh</p>
                          </div>
                        )}
                        {leadData.quoteData.customFeedInRate && (
                          <div className="bg-background rounded-lg p-2">
                            <span className="text-caption text-muted-foreground block">Feed-in Rate</span>
                            <p className="text-body-small text-foreground mt-0.5">${leadData.quoteData.customFeedInRate}/kWh</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Features */}
                  {(leadData.quoteData.includeVPP || leadData.quoteData.includeEVCharging || leadData.quoteData.includeSmartHome || leadData.quoteData.includeGridServices) && (
                    <div className="space-y-2">
                      <h4 className="text-label text-foreground flex items-center gap-2">
                        <Grid className="h-4 w-4 text-primary" />
                        Additional Features
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {leadData.quoteData.includeVPP && <span className="px-3 py-1.5 bg-primary/10 text-primary text-body-small rounded-lg">VPP Integration</span>}
                        {leadData.quoteData.includeEVCharging && <span className="px-3 py-1.5 bg-primary/10 text-primary text-body-small rounded-lg flex items-center gap-1"><Car className="h-3 w-3" />EV Charging</span>}
                        {leadData.quoteData.includeSmartHome && <span className="px-3 py-1.5 bg-primary/10 text-primary text-body-small rounded-lg">Smart Home Integration</span>}
                        {leadData.quoteData.includeGridServices && <span className="px-3 py-1.5 bg-primary/10 text-primary text-body-small rounded-lg">Grid Services</span>}
                      </div>
                    </div>
                  )}

                  {/* Existing System (if applicable) */}
                  {leadData.quoteData.hasExistingSystem && leadData.quoteData.existingSystemSize && (
                    <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                      <h4 className="text-label text-foreground mb-2">Existing Solar System</h4>
                      <p className="text-body-small text-foreground">
                        Has existing {leadData.quoteData.existingSystemSize} kW solar system
                      </p>
                    </div>
                  )}

                  {/* Commercial-Specific Details */}
                  {leadData.quoteData.quoteType === 'commercial' && (
                    <div className="space-y-2">
                      <h4 className="text-label text-foreground flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-primary" />
                        Commercial Details
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {leadData.quoteData.peakDemand && (
                          <div className="bg-background rounded-lg p-2">
                            <span className="text-caption text-muted-foreground block">Peak Demand</span>
                            <p className="text-body-small text-foreground mt-0.5">{leadData.quoteData.peakDemand} kW</p>
                          </div>
                        )}
                        <div className="bg-background rounded-lg p-2">
                          <span className="text-caption text-muted-foreground block">Three-Phase</span>
                          <p className="text-body-small text-foreground mt-0.5">{leadData.quoteData.isThreePhase ? 'Yes' : 'No'}</p>
                        </div>
                        {leadData.quoteData.projectPriority && (
                          <div className="bg-background rounded-lg p-2">
                            <span className="text-caption text-muted-foreground block">Priority</span>
                            <p className="text-body-small text-foreground mt-0.5 capitalize">
                              {leadData.quoteData.projectPriority.replace(/_/g, ' ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* ===== INSTANTQUOTE RESULT SECTION ===== */}
              {leadData.quoteData ? (
                <div className="bg-surface rounded-2xl shadow-neu-inset p-5 space-y-4">
                  <h3 className="text-heading-4 text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <Calculator className="h-5 w-5 text-primary" />
                    InstantQuote Result
                  </h3>

                  {/* System Overview Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 border border-primary/20">
                      <span className="text-caption text-muted-foreground block">System Size</span>
                      <p className="text-heading-3 text-primary mt-1">{leadData.quoteData.systemSize} kW</p>
                    </div>
                    <div className="bg-background rounded-xl p-3">
                      <span className="text-caption text-muted-foreground block">Panels Required</span>
                      <p className="text-heading-3 text-foreground mt-1">{leadData.quoteData.panelsRequired || 'N/A'}</p>
                    </div>
                    <div className="bg-background rounded-xl p-3">
                      <span className="text-caption text-muted-foreground block">Annual Production</span>
                      <p className="text-heading-3 text-foreground mt-1">{(leadData.quoteData.annualProduction / 1000).toFixed(1)}k kWh</p>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-background rounded-xl p-4 space-y-2">
                    <h4 className="text-label text-foreground mb-3">Financial Breakdown</h4>
                    <div className="flex justify-between text-body-small">
                      <span className="text-muted-foreground">Total System Cost</span>
                      <span className="text-foreground">${leadData.quoteData.totalCost?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-body-small text-success">
                      <span>Federal Rebate (STC)</span>
                      <span className="text-body">-${leadData.quoteData.federalRebate?.toLocaleString()}</span>
                    </div>
                    {leadData.quoteData.batteryRebate > 0 && (
                      <div className="flex justify-between text-body-small text-success">
                        <span>Battery Rebate</span>
                        <span className="text-body">-${leadData.quoteData.batteryRebate?.toLocaleString()}</span>
                      </div>
                    )}
                    {leadData.quoteData.stateRebate > 0 && (
                      <div className="flex justify-between text-body-small text-success">
                        <span>State Rebate</span>
                        <span className="text-body">-${leadData.quoteData.stateRebate?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-body pt-2 border-t border-border mt-2">
                      <span className="text-foreground">Final Out-of-Pocket</span>
                      <span className="text-primary text-heading-3">${leadData.quoteData.finalPrice?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-background rounded-xl p-3">
                      <span className="text-caption text-muted-foreground block">Annual Savings</span>
                      <p className="text-body text-success mt-1">${leadData.quoteData.annualSavings?.toLocaleString()}</p>
                    </div>
                    <div className="bg-background rounded-xl p-3">
                      <span className="text-caption text-muted-foreground block">Payback Period</span>
                      <p className="text-body text-foreground mt-1">{leadData.quoteData.simplePaybackYears || 'N/A'} years</p>
                    </div>
                    <div className="bg-background rounded-xl p-3">
                      <span className="text-caption text-muted-foreground block">CO₂ Reduction</span>
                      <p className="text-body text-success mt-1">{leadData.quoteData.co2Reduction || 'N/A'} t/yr</p>
                    </div>
                    <div className="bg-background rounded-xl p-3">
                      <span className="text-caption text-muted-foreground block">Self-Consumed</span>
                      <p className="text-body text-foreground mt-1">{leadData.quoteData.selfConsumedKwh ? (leadData.quoteData.selfConsumedKwh / 1000).toFixed(1) + 'k' : 'N/A'} kWh</p>
                    </div>
                  </div>

                  {/* Energy Breakdown */}
                  {(leadData.quoteData.selfConsumedKwh || leadData.quoteData.exportedKwh) && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                      {leadData.quoteData.selfConsumedKwh && (
                        <div className="bg-background rounded-xl p-3">
                          <span className="text-caption text-muted-foreground block">Self-Consumed Energy</span>
                          <p className="text-body text-foreground mt-1">{leadData.quoteData.selfConsumedKwh.toLocaleString()} kWh/yr</p>
                        </div>
                      )}
                      {leadData.quoteData.exportedKwh && (
                        <div className="bg-background rounded-xl p-3">
                          <span className="text-caption text-muted-foreground block">Exported to Grid</span>
                          <p className="text-body text-foreground mt-1">{leadData.quoteData.exportedKwh.toLocaleString()} kWh/yr</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Commercial-Specific Metrics */}
                  {leadData.quoteData.quoteType === 'commercial' && (leadData.quoteData.demandChargeSavings || leadData.quoteData.energySavings) && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                      {leadData.quoteData.demandChargeSavings && (
                        <div className="bg-background rounded-xl p-3">
                          <span className="text-caption text-muted-foreground block">Demand Charge Savings</span>
                          <p className="text-body text-success mt-1">${leadData.quoteData.demandChargeSavings.toLocaleString()}/yr</p>
                        </div>
                      )}
                      {leadData.quoteData.energySavings && (
                        <div className="bg-background rounded-xl p-3">
                          <span className="text-caption text-muted-foreground block">Energy Cost Savings</span>
                          <p className="text-body text-success mt-1">${leadData.quoteData.energySavings.toLocaleString()}/yr</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Savings Projection Chart */}
                  {leadData.quoteData.finalPrice && leadData.quoteData.annualSavings && leadData.quoteData.currentAnnualBill && (
                    <div className="pt-3 border-t border-border">
                      <SavingsChart 
                        finalPrice={leadData.quoteData.finalPrice}
                        annualSavings={leadData.quoteData.annualSavings}
                        currentAnnualBill={leadData.quoteData.currentAnnualBill}
                      />
                    </div>
                  )}

                  {/* Disclaimers */}
                  {leadData.quoteData.disclaimers && leadData.quoteData.disclaimers.length > 0 && (
                    <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                      <h4 className="text-label text-warning mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Important Notes
                      </h4>
                      <ul className="space-y-1 text-body-small text-foreground">
                        {leadData.quoteData.disclaimers.map((disclaimer: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-warning mt-0.5">•</span>
                            <span>{disclaimer}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                  <p className="text-body-small text-warning">
                    InstantQuote data not available for this lead.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Competitor Bids Section */}
          {leadData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-heading-4 text-foreground flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Competitor Bids Analysis
                </h3>
                <span className="text-caption text-muted-foreground">
                  {bids.length} bid{bids.length !== 1 ? 's' : ''} submitted
                </span>
              </div>

              {displayBids.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Award className="h-16 w-16 text-muted mb-4" />
              <h3 className="text-heading-4 text-foreground mb-2">No Bids Submitted Yet</h3>
              <p className="text-body text-muted-foreground max-w-md">
                Bids from other installers will appear here once they submit their quotes. You&apos;ll be able to see anonymized competitor data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayBids.map((bid) => (
                <div
                  key={bid.id}
                  className={`bg-surface rounded-2xl shadow-neu-inset p-6 space-y-4 border-2 transition-all ${
                    bid.isYourBid 
                      ? 'border-primary/50 shadow-neu-outset' 
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  {/* Installer Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-heading-4 text-foreground">
                        {bid.installerName}
                        {bid.isYourBid && <span className="text-primary ml-2">(You)</span>}
                      </h3>
                      <p className="text-caption text-muted-foreground mt-1">
                        Submitted {new Date(bid.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <BiddingStatusBadge status={bid.status} />
                  </div>

                  {/* Pricing */}
                  <div className="bg-background rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-body-small text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Price
                      </span>
                      <span className="text-heading-4 text-foreground">
                        ${bid.totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-caption text-muted-foreground">Price per Watt</span>
                      <span className="text-body text-foreground">
                        ${bid.pricePerWatt.toFixed(2)}/W
                      </span>
                    </div>
                  </div>

                  {/* System Specs */}
                  <div className="space-y-3">
                    <h4 className="text-label text-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      System Specifications
                    </h4>
                    <div className="space-y-2 text-body-small">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">System Size</span>
                        <span className="text-foreground">{bid.systemSize} kW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Solar Panels</span>
                        <span className="text-foreground">{bid.panelBrand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inverter</span>
                        <span className="text-foreground">{bid.inverterBrand}</span>
                      </div>
                      {bid.batteryBrand && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Battery className="h-3 w-3" />
                              Battery
                            </span>
                            <span className="text-foreground">{bid.batteryBrand}</span>
                          </div>
                          {bid.batteryCapacity && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Capacity</span>
                              <span className="text-foreground">{bid.batteryCapacity} kWh</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-body-small">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Installation
                      </span>
                      <span className="text-foreground">{bid.installationTimeline}</span>
                    </div>
                    <div className="flex items-center justify-between text-body-small">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Warranty
                      </span>
                      <span className="text-foreground">{bid.warranty} years</span>
                    </div>
                    <div className="flex items-center justify-between text-body-small">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Payback Period
                      </span>
                      <span className="text-foreground">{bid.paybackYears} years</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {bid.isYourBid ? (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        // TODO: Open edit modal
                        console.log('Edit bid', bid.id);
                      }}
                    >
                      Edit My Bid
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Competitor Bid
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info Banner */}
          {displayBids.length > 0 && (
            <div className="mt-6 bg-info/10 border border-info/20 rounded-xl p-4">
              <p className="text-body-small text-info">
                <strong>Note:</strong> Installer identities are anonymized. You can see competitor pricing and specifications to ensure your bid is competitive. Final homeowner selection is managed by admin.
              </p>
            </div>
          )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 md:p-6 border-t border-border">
          <div className="text-body-small text-muted-foreground">
            {displayBids.length} bid{displayBids.length !== 1 ? 's' : ''} submitted
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
