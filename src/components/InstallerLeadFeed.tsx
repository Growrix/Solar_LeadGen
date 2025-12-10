'use client'

import React, { useState, useEffect, useCallback } from 'react';
import QuoteBuilderModal from './QuoteBuilderModal';
import BidEvaluationModal from './BidEvaluationModal';
import BiddingStatusBadge from './BiddingStatusBadge';
import { LiveCountdownBar } from '@/components/LiveCountdownBar';
import Button from '@/components/ui/button';
import QuoteDataDisplay from '@/components/admin/QuoteDataDisplay';

// --- Icon Components ---
const FilterIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3z"/></svg>;
const SearchIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const RefreshIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;
const MapPinIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalendarIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const BoltIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/></svg>;
const DollarSignIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const LockIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const UnlockIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>;
const PhoneIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const FileTextIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>;
const CreditCardIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const CheckCircleIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ClockIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const AlertCircleIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;
const XIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>;
const SendIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>;
const EyeIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const TrophyIcon = ({ className = "h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const InfoIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;

// --- Types ---
export type LeadType = 'call_visit' | 'written' | 'bidding';
export type LeadStatus = 'new' | 'unlocked' | 'submitted' | 'expired' | 'contacted' | 'APPROVED' | 'PURCHASED';

export interface Lead {
  id: string;
  homeownerId: string;
  type: LeadType;
  status: LeadStatus;
  dateSubmitted: Date;
  location: {
    suburb: string;
    postcode: string;
    state: string;
  };
  systemDetails: {
    estimatedSize: string;
    roofType: string;
    propertyType: string;
    budget: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  unlockPrice: number;
  isUnlocked: boolean;
  isPurchasedByAnother?: boolean;
  unlockedBy: number[];
  quotesReceived: number;
  expiresAt: Date; // TODO: Change to string (ISO) for countdown timer integration with real API
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  // Extended fields from API
  address?: string | null;
  energyBill?: number | null;
  billType?: string | null;
  desiredOffset?: number | null;
  batteryRequired?: boolean | null;
  batteryCapacity?: string | null;
  timeframe?: string | null;
  additionalNotes?: string | null;
  phoneNumber?: string | null;
  phoneVerified?: boolean | null;
  createdAt?: string;
  approvedAt?: string | null;
  purchasedAt?: string | null;
  quoteData?: any | null;
  installerId?: string | null;
  // Bidding fields
  bids?: Array<{
    id: string;
    installerId: string;
    status: string;
    amount: number;
    selectedAt?: Date | null;
    purchasedAt?: Date | null;
  }>;
}

export interface InstallerProfile {
  id: number;
  companyName: string;
  email: string;
  phone: string;
  serviceAreas: string[];
  isApproved: boolean;
  creditBalance: number;
  totalUnlocks: number;
  successRate: number;
}

interface LeadFilters {
  leadType: 'all' | LeadType;
  status: 'all' | LeadStatus;
  postcode: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  priceRange: 'all' | 'low' | 'medium' | 'high';
}

interface InstallerLeadFeedProps {
  installer: InstallerProfile;
  leads?: Lead[]; // Optional: use provided leads or fallback to empty array
  onUnlockLead: (leadId: string) => Promise<boolean>;
  onSubmitQuote: (leadId: string, quoteData: any) => Promise<boolean>;
  onStartChat: (leadId: string) => void;
}

// --- Stripe Payment Modal Component ---
const StripeUnlockModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onUnlockLead: (leadId: string) => Promise<boolean>;
  onPaymentSuccess: (leadId: string) => void;
  installer: InstallerProfile;
}> = ({ isOpen, onClose, lead, onUnlockLead, onPaymentSuccess, installer }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handlePayment = async () => {
    if (!lead) return;
    
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // MOCK PAYMENT (Stripe placeholder)
      // TODO: When Stripe available, add here:
      // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
      // const { error } = await stripe.confirmCardPayment(clientSecret);
      
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call real purchase API
      const success = await onUnlockLead(lead.id);
      
      if (!success) {
        setPaymentStatus('error');
        setTimeout(() => setPaymentStatus('idle'), 3000);
        return;
      }
      
      setPaymentStatus('success');
      setTimeout(() => {
        onPaymentSuccess(lead.id);
        onClose();
        setPaymentStatus('idle');
      }, 1500);
    } catch (error) {
      console.error('Purchase error:', error);
      setPaymentStatus('error');
      setTimeout(() => setPaymentStatus('idle'), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="theme-card relative w-full max-w-md mx-4 p-6">
        <Button 
          onClick={onClose}
          variant="minimal"
          className="absolute top-4 right-4 p-2"
        >
          <XIcon />
        </Button>

        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCardIcon className="h-8 w-8 text-primary" />
          </div>
          
          <h3 className="text-heading-3 text-foreground mb-2">
            Unlock Lead Contact
          </h3>
          
          <p className="text-muted-foreground mb-6">
            Unlock contact details for this call/visit lead in {lead.location.suburb}, {lead.location.state}
          </p>

          {/* Lead Summary */}
          <div className="bg-surface/50 shadow-neu-inset rounded-lg p-4 mb-6 text-left border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-small text-muted-foreground">Location:</span>
              <span className="text-body-small text-foreground">
                {lead.location.suburb}, {lead.location.postcode}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-small text-muted-foreground">System Size:</span>
              <span className="text-body-small text-foreground">{lead.systemDetails.estimatedSize}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-small text-muted-foreground">Unlock Price:</span>
              <span className="text-heading-4 text-primary">${lead.unlockPrice}</span>
            </div>
          </div>

          {paymentStatus === 'idle' && (
            <div className="space-y-4">
              <div className="text-body-small text-muted-foreground">
                Credit Balance: <span className="text-foreground">
                  ${installer.creditBalance}
                </span>
              </div>
              
              {installer.creditBalance >= lead.unlockPrice ? (
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  variant="primary"
                  className="w-full py-3"
                >
                  {isProcessing ? 'Processing...' : `Pay $${lead.unlockPrice} to Unlock`}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="text-body-small text-destructive">
                    Insufficient credit balance. Please top up your account.
                  </div>
                  <Button 
                    disabled 
                    variant="secondary"
                    className="w-full py-3 cursor-not-allowed"
                  >
                    Insufficient Credits
                  </Button>
                </div>
              )}
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Processing payment...</p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-success">Payment successful!</p>
              <p className="text-body-small text-muted-foreground mt-2">
                Contact details are now unlocked
              </p>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="text-center">
              <AlertCircleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive">Payment failed</p>
              <p className="text-body-small text-muted-foreground mt-2">
                Please try again or contact support
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- View Details Modal Component ---
const ViewDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}> = ({ isOpen, onClose, lead }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-outset-lg)' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-heading-3 text-foreground">Lead Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Lead ID & Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption text-muted-foreground">Lead ID</p>
              <p className="text-body text-foreground">#{lead.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-caption rounded-full ${
                lead.status === 'new' ? 'bg-success/10 text-success' :
                lead.status === 'unlocked' ? 'bg-info/10 text-info' :
                lead.status === 'submitted' ? 'bg-primary/10 text-primary' :
                lead.status === 'contacted' ? 'bg-warning/10 text-warning' :
                'bg-destructive/10 text-destructive'
              }`}>
                {lead.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-surface rounded-lg shadow-neu-inset border border-border p-4">
            <h3 className="text-heading-4 text-foreground mb-3">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Name:</span>
                <span className="text-body-small text-foreground">{lead.contact.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Phone:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-body-small text-foreground">{lead.contact.phone}</span>
                  {lead.phoneVerified !== null && (
                    <span className={`text-caption ${
                      lead.phoneVerified ? 'text-success' : 'text-error'
                    }`}>
                      {lead.phoneVerified ? '? Verified' : '? Not verified'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Email:</span>
                <span className="text-body-small text-foreground">{lead.contact.email}</span>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-surface rounded-lg shadow-neu-inset border border-border p-4">
            <h3 className="text-heading-4 text-foreground mb-3">Property Details</h3>
            <div className="space-y-2">
              {lead.address && (
                <div className="flex items-start justify-between pb-2 border-b border-border">
                  <span className="text-body-small text-muted-foreground">Full Address:</span>
                  <span className="text-body-small text-foreground text-right max-w-[60%]">{lead.address}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Location:</span>
                <span className="text-body-small text-foreground">{lead.location.suburb}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Postcode:</span>
                <span className="text-body-small text-foreground">{lead.location.postcode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">State:</span>
                <span className="text-body-small text-foreground">{lead.location.state}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Property Type:</span>
                <span className="text-body-small text-foreground">{lead.systemDetails.propertyType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Roof Type:</span>
                <span className="text-body-small text-foreground">{lead.systemDetails.roofType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Budget Range:</span>
                <span className="text-body-small text-foreground">{lead.systemDetails.budget}</span>
              </div>
            </div>
          </div>

          {/* Energy Details */}
          {(lead.energyBill !== null || lead.desiredOffset !== null || lead.batteryRequired !== null || lead.timeframe) && (
            <div className="bg-surface rounded-lg shadow-neu-inset border border-border p-4">
              <h3 className="text-heading-4 text-foreground mb-3">Energy Details</h3>
              <div className="space-y-2">
                {lead.energyBill !== null && lead.billType && (
                  <div className="flex items-center justify-between">
                    <span className="text-body-small text-muted-foreground">Energy Bill:</span>
                    <span className="text-body-small text-foreground">${lead.energyBill!.toFixed(2)} / {lead.billType}</span>
                  </div>
                )}
                {lead.desiredOffset !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-body-small text-muted-foreground">Desired Offset:</span>
                    <span className="text-body-small text-foreground">{lead.desiredOffset}%</span>
                  </div>
                )}
                {lead.batteryRequired !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-body-small text-muted-foreground">Battery Required:</span>
                    <span className="text-body-small text-foreground">
                      {lead.batteryRequired ? `Yes${lead.batteryCapacity ? ` (${lead.batteryCapacity})` : ''}` : 'No'}
                    </span>
                  </div>
                )}
                {lead.timeframe && (
                  <div className="flex items-center justify-between">
                    <span className="text-body-small text-muted-foreground">Timeframe:</span>
                    <span className="text-body-small text-foreground">{lead.timeframe}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lead Metadata */}
          <div className="bg-surface rounded-lg shadow-neu-inset border border-border p-4">
            <h3 className="text-heading-4 text-foreground mb-3">Lead Information</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Quote Type:</span>
                <span className="px-2 py-1 text-caption rounded-full bg-primary/10 text-primary">
                  {lead.type === 'call_visit' ? 'Call/Visit' : lead.type === 'written' ? 'Written Quote' : 'Bidding'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">System Size:</span>
                <span className="text-body-small text-foreground">{lead.systemDetails.estimatedSize}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Lead Price:</span>
                <span className="text-body-small text-foreground">${lead.unlockPrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Submitted:</span>
                <span className="text-body-small text-foreground">{new Date(lead.dateSubmitted).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Expires:</span>
                <span className="text-body-small text-foreground">{new Date(lead.expiresAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Quotes Received:</span>
                <span className="text-body-small text-foreground">{lead.quotesReceived}</span>
              </div>
            </div>
          </div>

          {/* Timeline/Timestamps */}
          <div className="bg-surface rounded-lg shadow-neu-inset border border-border p-4">
            <h3 className="text-heading-4 text-foreground mb-3">Timeline</h3>
            <div className="space-y-2">
              {lead.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-body-small text-muted-foreground">Created:</span>
                  <span className="text-body-small text-foreground">{new Date(lead.createdAt).toLocaleString()}</span>
                </div>
              )}
              {lead.approvedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-body-small text-muted-foreground">Approved:</span>
                  <span className="text-body-small text-foreground">{new Date(lead.approvedAt).toLocaleString()}</span>
                </div>
              )}
              {lead.purchasedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-body-small text-muted-foreground">Purchased:</span>
                  <span className="text-body-small text-foreground">{new Date(lead.purchasedAt).toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-body-small text-muted-foreground">Expires:</span>
                <span className="text-body-small text-foreground">{new Date(lead.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* InstantQuote Data */}
          {lead.quoteData && (
            <div className="bg-surface rounded-lg shadow-neu-inset border border-border p-4">
              <h3 className="text-heading-4 text-foreground mb-3">?? Instant Quote Calculation</h3>
              <QuoteDataDisplay quoteData={lead.quoteData} />
            </div>
          )}

          {/* Homeowner Additional Notes */}
          {lead.additionalNotes && (
            <div className="bg-surface rounded-lg shadow-neu-inset border border-border p-4">
              <h3 className="text-heading-4 text-foreground mb-2">Homeowner Notes</h3>
              <p className="text-body-small text-foreground whitespace-pre-wrap">{lead.additionalNotes}</p>
            </div>
          )}

          {/* Notes (if available) */}
          {lead.notes && (
            <div className="bg-surface rounded-lg shadow-neu-inset border border-border p-4">
              <h3 className="text-heading-4 text-foreground mb-2">Notes</h3>
              <p className="text-body-small text-muted-foreground">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface border-t border-border p-6">
          <Button
            onClick={onClose}
            variant="secondary"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Lead Card Component ---
const LeadCard: React.FC<{
  lead: Lead;
  installer: InstallerProfile;
  onUnlock: (leadId: string) => void;
  onSubmitQuote: (leadId: string, quoteData: any) => Promise<boolean>;
  onStartChat: (leadId: string) => void;
}> = ({ lead, installer, onUnlock, onSubmitQuote, onStartChat }) => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isBidEvaluationOpen, setIsBidEvaluationOpen] = useState(false);
  const [quoteMode, setQuoteMode] = useState<'quote' | 'bid'>('quote'); // Track if opening for quote or bid
  
  const isUnlockedByInstaller = lead.isUnlocked;
  const isPurchasedByAnother = lead.isPurchasedByAnother || false;
  
  // T196: Determine if this installer is the winner (selected but not paid yet)
  const myBid = lead.bids?.find((b: any) => b.installerId === installer.id);
  const isWinner = myBid?.status === 'SELECTED';
  const isPaid = lead.status === 'PURCHASED' && lead.purchasedAt;
  const isLoser = myBid?.status === 'REJECTED';
  
  const canUnlock = lead.type === 'call_visit' && !isUnlockedByInstaller && !isPurchasedByAnother && lead.status === 'new';
  const canQuote = lead.type === 'written' || isUnlockedByInstaller;
  // T13I-2: Hide "Place Bid" button for purchased bidding leads
  const canBid = lead.type === 'bidding' && !isPaid; // Bidding leads allow bids ONLY if not yet purchased

  const getStatusBadge = () => {
    const baseClasses ="px-2 py-1 text-caption rounded-full";
    
    switch (lead.status) {
      case 'new':
        return `${baseClasses} bg-success/10 text-success`;
      case 'unlocked':
        return `${baseClasses} bg-info/10 text-info`;
      case 'submitted':
        return `${baseClasses} bg-primary/10 text-primary`;
      case 'contacted':
        return `${baseClasses} bg-warning/10 text-warning`;
      case 'expired':
        return `${baseClasses} bg-destructive/10 text-destructive`;
      default:
        return `${baseClasses} bg-muted text-muted-foreground`;
    }
  };

  const getPriorityColor = () => {
    switch (lead.priority) {
      case 'high': return 'border-l-destructive';
      case 'medium': return 'border-l-warning';
      case 'low': return 'border-l-success';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      <div className={`theme-card border-l-4 ${getPriorityColor()} p-6 transition-colors duration-200 ${isPurchasedByAnother ? 'opacity-50' : ''}`}>
      
      {/* T196: Winner banner - shown when installer won but hasn't paid yet */}
      {isWinner && !isPaid && (
        <div className="bg-success/10 border-2 border-success/30 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <TrophyIcon className="h-8 w-8 text-warning flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-h6 text-success mb-1">
                🎉 Congratulations! You won this bid!
              </h4>
              <p className="text-body text-muted-foreground mb-3">
                The homeowner has selected your bid. Proceed to payment to unlock full contact details and begin installation.
              </p>
              <Button
                variant="primary"
                className="text-heading-6 px-6 py-3 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={async () => {
                  // T196: Call payment endpoint directly
                  if (!myBid?.id) return;
                  if (!confirm('Complete payment to unlock homeowner contact details? (Dev mode: no actual charge)')) {
                    return;
                  }
                  try {
                    const response = await fetch(`/api/bids/${myBid.id}/purchase`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    });
                    if (!response.ok) {
                      const error = await response.json();
                      alert(error.error || 'Payment failed');
                      return;
                    }
                    const data = await response.json();
                    alert('✅ Payment successful! Contact details unlocked. Refreshing page...');
                    window.location.reload(); // Refresh to show unlocked contacts
                  } catch (error) {
                    console.error('Payment error:', error);
                    alert('Payment failed. Please try again.');
                  }
                }}
              >
                <LockIcon className="h-5 w-5" />
                <span>Proceed to Payment</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* T194: Loser banner - shown when installer's bid was rejected */}
      {isLoser && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <InfoIcon className="h-5 w-5 text-warning" />
            <p className="text-body text-warning">
              The bid was won by another installer. Better luck next time!
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {lead.type === 'call_visit' ? (
              <PhoneIcon className="h-5 w-5 text-info" />
            ) : lead.type === 'bidding' ? (
              <TrophyIcon className="h-5 w-5 text-warning" />
            ) : (
              <FileTextIcon className="h-5 w-5 text-primary" />
            )}
            <span className="text-foreground">
              {lead.type === 'call_visit' 
                ? 'Call/Visit Lead' 
                : lead.type === 'bidding'
                ? 'Competitive Bidding'
                : 'Written Quote Lead'}
            </span>
          </div>
          
          {/* Bidding Status Badge */}
          {lead.type === 'bidding' && (
            <BiddingStatusBadge 
              status={(() => {
                // Check localStorage for draft or submitted bid
                if (typeof window !== 'undefined') {
                  const draftKey = `bid:draft:${lead.id}:${installer.id}`;
                  const submittedKey = `bid:submitted:${lead.id}:${installer.id}`;
                  
                  if (localStorage.getItem(submittedKey)) {
                    return 'submitted';
                  } else if (localStorage.getItem(draftKey)) {
                    return 'draft';
                  }
                }
                return 'no_bids';
              })()}
            />
          )}
          
          {canUnlock && (
            <div className="flex items-center space-x-1 text-warning">
              <LockIcon className="h-4 w-4" />
              <span className="text-caption">Unlock Required</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={getStatusBadge()}>
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </span>
          <span className="text-caption text-muted-foreground">
            {formatTimeAgo(lead.dateSubmitted)}
          </span>
        </div>
      </div>

      {/* Lead Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-body-small">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {lead.location.suburb}, {lead.location.postcode}, {lead.location.state}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-body-small">
            <BoltIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {lead.systemDetails.estimatedSize} � {lead.systemDetails.roofType} Roof
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-body-small">
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              Budget: {lead.systemDetails.budget}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {/* Countdown timer - Show for active marketplace leads */}
          {lead.status === 'new' && (
            <div className="flex items-center space-x-2 text-body-small">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <LiveCountdownBar
                expiresAt={lead.expiresAt.toISOString()}
                leadId={String(lead.id)}
                leadStatus={lead.status}
                quoteType={lead.type === 'call_visit' ? 'CALL_VISIT' : lead.type === 'bidding' ? 'BIDDING' : 'WRITTEN_QUOTE'}
                position="inline"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-body-small">
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {lead.quotesReceived} quotes received
            </span>
          </div>
          
          {lead.type === 'call_visit' && (
            <div className="flex items-center space-x-2 text-body-small">
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                Unlock: ${lead.unlockPrice}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* T197 & T13I-3: Contact Info (if unlocked AND paid for bidding leads) */}
      {isUnlockedByInstaller && (lead.type !== 'bidding' || isPaid) && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4 shadow-neu-inset">
          <div className="flex items-center space-x-2 mb-2">
            <UnlockIcon className="h-4 w-4 text-success" />
            <span className="text-label text-success">
              Contact Details Unlocked
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-body-small">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2 text-foreground">{lead.contact.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>
              <span className="ml-2 text-foreground">{lead.contact.phone}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2 text-foreground">{lead.contact.email}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* T197: Locked contact details for winner awaiting payment */}
      {lead.type === 'bidding' && isWinner && !isPaid && (
        <div className="bg-muted/50 border border-muted rounded-lg p-4 mb-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <LockIcon className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-body text-foreground mb-1">
                Contact Details Locked
              </p>
              <p className="text-body-small text-muted-foreground">
                Complete payment to unlock homeowner name, phone, and email
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* T295-T296: View Full Details button for BIDDING leads (opens BidEvaluationModal, repositioned) */}
        {lead.type === 'bidding' && (
          <Button
            onClick={() => setIsBidEvaluationOpen(true)}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <EyeIcon className="h-4 w-4" />
            <span>View Full Details</span>
          </Button>
        )}
        
        {canUnlock && (
          <Button
            onClick={() => onUnlock(lead.id)}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <LockIcon className="h-4 w-4" />
            <span>Unlock Lead (${lead.unlockPrice})</span>
          </Button>
        )}

        {canQuote && (
          <Button
            onClick={() => {
              setQuoteMode('quote');
              setIsQuoteModalOpen(true);
            }}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <SendIcon className="h-4 w-4" />
            <span>Submit Quote</span>
          </Button>
        )}

        {canBid && (
          <>
            <Button
              onClick={() => setIsBidEvaluationOpen(true)}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <EyeIcon className="h-4 w-4" />
              <span>Lead Details</span>
            </Button>
            
            {/* Show draft button if draft exists */}
            {typeof window !== 'undefined' && localStorage.getItem(`bid:draft:${lead.id}:${installer.id}`) && (
              <Button
                onClick={() => {
                  setQuoteMode('bid');
                  setIsQuoteModalOpen(true);
                }}
                variant="secondary"
                className="flex items-center space-x-2 border-warning text-warning"
              >
                <FileTextIcon className="h-4 w-4" />
                <span>Draft Saved � Click to Edit</span>
              </Button>
            )}
            
            <Button
              onClick={() => {
                setQuoteMode('bid');
                setIsQuoteModalOpen(true);
              }}
              variant="primary"
              className="flex items-center space-x-2 bg-warning hover:bg-warning/90"
            >
              <TrophyIcon className="h-4 w-4" />
              <span>Place Bid</span>
            </Button>
          </>
        )}

        {isUnlockedByInstaller && (
          <Button
            onClick={() => onStartChat(lead.id)}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <PhoneIcon className="h-4 w-4" />
            <span>Start Chat</span>
          </Button>
        )}

        {lead.type === 'written' && !canQuote && (
          <div className="text-body-small text-muted-foreground italic">
            Available for written quotes only
          </div>
        )}
      </div>
      </div>

      {/* Quote Builder Modal */}
      <QuoteBuilderModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        lead={{
          id: lead.id,
          name: lead.contact?.name || '***LOCKED***',
          location: lead.location
            ? `${lead.location.suburb}, ${lead.location.state} ${lead.location.postcode}`
            : '',
          propertyType: lead.systemDetails?.propertyType || '',
          systemSize: lead.systemDetails?.estimatedSize || '0',
          estimatedUsage: lead.systemDetails?.estimatedSize || '',
          budget: lead.systemDetails?.budget || '',
          quoteData: lead.quoteData, // Pass through quoteData for Import feature
          status: lead.status, // T13I-4: Pass status for purchase checking
          purchasedAt: lead.purchasedAt // T13I-4: Pass purchasedAt for purchase checking
        }}
        onSubmitQuote={onSubmitQuote}
        mode={quoteMode}
      />

      {/* Bid Evaluation Modal */}
      <BidEvaluationModal
        isOpen={isBidEvaluationOpen}
        onClose={() => setIsBidEvaluationOpen(false)}
        leadId={String(lead.id)}
        bids={[]}
        yourBidId={undefined}
        isPurchased={!!isPaid} // T13I-4: Pass purchase status as boolean
      />

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        lead={lead}
      />
    </>
  );
};

// --- Main Component ---
const InstallerLeadFeed: React.FC<InstallerLeadFeedProps> = ({
  installer,
  leads: propLeads,
  onUnlockLead,
  onSubmitQuote,
  onStartChat
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>({
    leadType: 'all',
    status: 'all',
    postcode: '',
    dateRange: 'all',
    priceRange: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Ensure lastUpdated is set only on the client to avoid SSR hydration mismatch
  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  // Initialize leads from props only (no mock fallback)
  useEffect(() => {
    if (propLeads) {
      setLeads(propLeads);
    } else {
      setLeads([]);
    }
    setLoading(false);
  }, [propLeads]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter and search leads
  const filteredLeads = leads.filter(lead => {
    if (filters.leadType !== 'all' && lead.type !== filters.leadType) return false;
    if (filters.status !== 'all' && lead.status !== filters.status) return false;
    if (filters.postcode && !lead.location.postcode.includes(filters.postcode)) return false;
    
    const now = new Date();
    const leadDate = lead.dateSubmitted;
    switch (filters.dateRange) {
      case 'today':
        if (now.toDateString() !== leadDate.toDateString()) return false;
        break;
      case 'week':
        if (now.getTime() - leadDate.getTime() > 7 * 24 * 60 * 60 * 1000) return false;
        break;
      case 'month':
        if (now.getTime() - leadDate.getTime() > 30 * 24 * 60 * 60 * 1000) return false;
        break;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchable = `${lead.location.suburb} ${lead.location.postcode} ${lead.systemDetails.estimatedSize} ${lead.systemDetails.propertyType}`.toLowerCase();
      if (!searchable.includes(query)) return false;
    }
    
    return true;
  });

  const handleUnlockLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setShowUnlockModal(true);
    }
  };

  // Placeholder: real purchase logic will update via parent callback after backend integration
  const handlePaymentSuccess = (leadId: string) => {
    setShowUnlockModal(false);
    setSelectedLead(null);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-2 text-foreground">Lead Feed</h1>
          <p className="text-muted-foreground">
            Available leads for {installer.companyName}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <RefreshIcon className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
          
          <div className="text-body-small text-muted-foreground">
            Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : ''}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="theme-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-small text-muted-foreground">Available Leads</p>
              <p className="text-heading-2 text-foreground">{filteredLeads.length}</p>
            </div>
            <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
              <FileTextIcon className="h-5 w-5 text-info" />
            </div>
          </div>
        </div>

        <div className="theme-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-small text-muted-foreground">Unlocked Today</p>
              <p className="text-heading-2 text-foreground">3</p>
            </div>
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <UnlockIcon className="h-5 w-5 text-success" />
            </div>
          </div>
        </div>

        <div className="theme-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-small text-muted-foreground">Credit Balance</p>
              <p className="text-heading-2 text-foreground">${installer.creditBalance}</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="theme-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-small text-muted-foreground">Success Rate</p>
              <p className="text-heading-2 text-foreground">{installer.successRate}%</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="theme-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by location, system size, or property type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input w-full pl-10 pr-4 py-2 rounded-xl bg-surface text-foreground shadow-neu-inset border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.leadType}
              onChange={(e) => setFilters(prev => ({ ...prev, leadType: e.target.value as any }))}
              className="form-input px-3 py-2 rounded-xl bg-surface text-foreground shadow-neu-inset border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Types</option>
              <option value="call_visit">Call/Visit</option>
              <option value="written">Written</option>
              <option value="bidding">Competitive Bidding</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="form-input px-3 py-2 rounded-xl bg-surface text-foreground shadow-neu-inset border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="unlocked">Unlocked</option>
              <option value="submitted">Submitted</option>
            </select>

            <input
              type="text"
              placeholder="Postcode"
              value={filters.postcode}
              onChange={(e) => setFilters(prev => ({ ...prev, postcode: e.target.value }))}
              className="form-input w-24 px-3 py-2 rounded-xl bg-surface text-foreground shadow-neu-inset border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
              className="form-input px-3 py-2 rounded-xl bg-surface text-foreground shadow-neu-inset border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lead Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="theme-card text-center py-12">
            <AlertCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-heading-4 text-foreground mb-2">
              No leads found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new leads.
            </p>
          </div>
        ) : (
          filteredLeads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              installer={installer}
              onUnlock={handleUnlockLead}
              onSubmitQuote={onSubmitQuote}
              onStartChat={onStartChat}
            />
          ))
        )}
      </div>

      {/* Stripe Unlock Modal */}
      <StripeUnlockModal
        isOpen={showUnlockModal}
        onClose={() => {
          setShowUnlockModal(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        onUnlockLead={onUnlockLead}
        onPaymentSuccess={handlePaymentSuccess}
        installer={installer}
      />
    </div>
  );
};

export default InstallerLeadFeed;