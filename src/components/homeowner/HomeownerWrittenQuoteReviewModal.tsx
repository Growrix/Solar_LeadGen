'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { 
  X, Award, DollarSign, TrendingUp, Calendar, Battery, Zap, 
  CheckCircle, Star, ChevronDown, ChevronUp, Info, Loader, XCircle 
} from 'lucide-react';
import Button from '@/components/ui/button';
import { LiveCountdownBarCompact } from '@/components/LiveCountdownBar';
import { GetWrittenQuotesResponse } from '@/types/written-quote';
import { LeadData } from '@/types/lead';
import HomeownerInstantQuoteDetails from '@/components/quote-builder/HomeownerInstantQuoteDetails';
import LeadTechnicalDetails from '@/components/quote-builder/LeadTechnicalDetails';
import InstantQuoteResult from '@/components/quote-builder/InstantQuoteResult';
import SavingsChart from '@/components/SavingsChart';

// Type alias for individual bid with full data
type WrittenQuoteWithFullData = GetWrittenQuotesResponse['writtenQuotes'][number] & {
  installerName: string;
  installerRating: number;
  pricePerWatt: number;
  isWinner: boolean;
};

interface HomeownerWrittenQuoteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  propertyAddress: string;
  writtenQuotes: WrittenQuoteWithFullData[];
  onSelectWinner?: (writtenQuoteId: string) => Promise<void>;
}

export default function HomeownerWrittenQuoteReviewModal({
  isOpen,
  onClose,
  leadId,
  propertyAddress,
  writtenQuotes: initialWrittenQuotes,
  onSelectWinner
}: HomeownerWrittenQuoteReviewModalProps) {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  // State management
  const [selectedWrittenQuoteId, setSelectedWrittenQuoteId] = useState<string>('');
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [writtenQuotes, setWrittenQuotes] = useState<WrittenQuoteWithFullData[]>(initialWrittenQuotes);
  const [isLoadingWrittenQuotes, setIsLoadingWrittenQuotes] = useState(false);
  const [isRefreshingWrittenQuotes, setIsRefreshingWrittenQuotes] = useState(false);
  const [writtenQuotesError, setWrittenQuotesError] = useState<string | null>(null);
  const writtenQuotesSignatureRef = useRef<string | null>(null);
  const hasLoadedWrittenQuotesRef = useRef(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
  const [isFinalizingDeal, setIsFinalizingDeal] = useState(false);
  const [isAcceptingDeal, setIsAcceptingDeal] = useState(false);
  const [isRejectingDeal, setIsRejectingDeal] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [counterAmount, setCounterAmount] = useState<string>('');
  const [isSubmittingCounter, setIsSubmittingCounter] = useState(false);
  const [negotiationError, setNegotiationError] = useState<string | null>(null);
  const [isExtendingNegotiation, setIsExtendingNegotiation] = useState(false);
  const [isRequestingAdminExtension, setIsRequestingAdminExtension] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    instantQuote: true,
    technical: false,
    results: false
  });

  // Select first written quote by default when writtenQuotes change
  useEffect(() => {
    if (writtenQuotes.length > 0 && !selectedWrittenQuoteId) {
      setSelectedWrittenQuoteId(writtenQuotes[0].id);
    }
  }, [writtenQuotes, selectedWrittenQuoteId]);

  // Fetch written quotes for the lead
  const fetchWrittenQuotes = React.useCallback(async (opts?: { background?: boolean }) => {
    if (!leadId) return;

    const isBackground = !!opts?.background;
    const showBlockingLoader = !isBackground && !hasLoadedWrittenQuotesRef.current;

    if (showBlockingLoader) {
      setIsLoadingWrittenQuotes(true);
      setWrittenQuotesError(null);
    } else if (isBackground) {
      setIsRefreshingWrittenQuotes(true);
    }

    try {
      console.log('[HomeownerWrittenQuoteReviewModal] Fetching written quotes for leadId:', leadId);
      const response = await fetch(`/api/written-quotes?leadId=${leadId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch written quotes: ${response.status} ${response.statusText}`);
      }
      const data: GetWrittenQuotesResponse = await response.json();
      console.log('[HomeownerWrittenQuoteReviewModal] Written quotes fetched:', data.writtenQuotes.length, 'written quotes');
      
      // DEBUG: Log first written quote's structure
      if (data.writtenQuotes.length > 0) {
        console.log('[DEBUG] First written quote structure:', {
          id: data.writtenQuotes[0].id,
          amount: data.writtenQuotes[0].amount,
          finalTotal: data.writtenQuotes[0].finalTotal,
          systemData: data.writtenQuotes[0].systemData,
          productsData: data.writtenQuotes[0].productsData,
          lineItems: data.writtenQuotes[0].lineItems
        });
      }
      
      // Transform API response to match component's expected format
      const transformedQuotes: WrittenQuoteWithFullData[] = data.writtenQuotes.map(writtenQuote => ({
        ...writtenQuote,
        installerName: writtenQuote.installer?.companyName || 'Unknown Installer',
        installerRating: 4.5, // TODO: Get actual rating from installer profile
        pricePerWatt: writtenQuote.systemData?.capacityKw 
          ? writtenQuote.finalTotal / writtenQuote.systemData.capacityKw / 1000
          : 0,
        isWinner: writtenQuote.status === 'SELECTED'
      }));

      const signature = JSON.stringify(
        transformedQuotes.map((q) => ({
          id: q.id,
          negotiationStatus: (q as any).negotiationStatus,
          amount: (q as any).amount,
          finalTotal: (q as any).finalTotal,
          homeownerCounterAmount: (q as any).homeownerCounterAmount,
          homeownerCounterAt: (q as any).homeownerCounterAt,
          installerRevisedAmount: (q as any).installerRevisedAmount,
          installerRevisedAt: (q as any).installerRevisedAt,
          agreedAmount: (q as any).agreedAmount,
          agreedAt: (q as any).agreedAt,
          agreedBy: (q as any).agreedBy,
          purchasedAt: (q as any).purchasedAt,
          rejectedAt: (q as any).rejectedAt,
          negotiationDeadlineAt: (q as any).negotiationDeadlineAt,
          negotiationExpiredAt: (q as any).negotiationExpiredAt,
          homeownerModalActiveAt: (q as any).homeownerModalActiveAt,
          installerModalActiveAt: (q as any).installerModalActiveAt,
          homeownerExtensionUsed: (q as any).homeownerExtensionUsed,
          installerExtensionUsed: (q as any).installerExtensionUsed
        }))
      );

      if (signature !== writtenQuotesSignatureRef.current) {
        setWrittenQuotes(transformedQuotes);
        writtenQuotesSignatureRef.current = signature;
      }

      hasLoadedWrittenQuotesRef.current = true;
      if (!isBackground) setWrittenQuotesError(null);
    } catch (error) {
      console.error('[HomeownerWrittenQuoteReviewModal] Error fetching written quotes:', error);
      setWrittenQuotesError(error instanceof Error ? error.message : 'Failed to load written quotes');
    } finally {
      if (showBlockingLoader) setIsLoadingWrittenQuotes(false);
      if (isBackground) setIsRefreshingWrittenQuotes(false);
    }
  }, [leadId]);

  // Fetch written quotes when modal opens
  useEffect(() => {
    if (isOpen && leadId) {
      fetchWrittenQuotes();
    }
  }, [isOpen, leadId, fetchWrittenQuotes]);

  // Background refresh while modal is open (keeps negotiation panel in sync)
  useEffect(() => {
    if (!isOpen || !leadId) return;
    const interval = setInterval(() => {
      fetchWrittenQuotes({ background: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen, leadId, fetchWrittenQuotes]);

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
      console.error('[HomeownerWrittenQuoteReviewModal] Error fetching lead:', error);
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

  const selectedWrittenQuote = writtenQuotes.find(wq => wq.id === selectedWrittenQuoteId);

  const getTimestamp = (value: unknown): number => {
    if (!value) return 0;
    const t = new Date(value as any).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const isBothPartiesOnline = React.useMemo(() => {
    if (!selectedWrittenQuote) return false;
    const now = Date.now();
    const homeownerAt = getTimestamp((selectedWrittenQuote as any).homeownerModalActiveAt);
    const installerAt = getTimestamp((selectedWrittenQuote as any).installerModalActiveAt);
    if (!homeownerAt || !installerAt) return false;
    return now - homeownerAt <= 15_000 && now - installerAt <= 15_000;
  }, [selectedWrittenQuote]);

  // Presence heartbeat while modal is open
  useEffect(() => {
    if (!isOpen || !selectedWrittenQuote) return;
    const writtenQuoteId = selectedWrittenQuote.id;

    let cancelled = false;
    const beat = async () => {
      try {
        await fetch(`/api/written-quotes/${writtenQuoteId}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        // Best-effort heartbeat only
      }
    };

    void beat();
    const interval = setInterval(() => {
      if (cancelled) return;
      void beat();
    }, 10_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOpen, selectedWrittenQuote]);

  const handleExtendNegotiation = async () => {
    if (!selectedWrittenQuote) return;
    setNegotiationError(null);
    setIsExtendingNegotiation(true);
    try {
      const response = await fetch(`/api/written-quotes/${selectedWrittenQuote.id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extend negotiation');
      }

      await fetchWrittenQuotes();
    } catch (error) {
      console.error('[HomeownerWrittenQuoteReviewModal] Error extending negotiation:', error);
      setNegotiationError(error instanceof Error ? error.message : 'Failed to extend negotiation');
    } finally {
      setIsExtendingNegotiation(false);
    }
  };

  const handleRequestAdminExtension = async () => {
    if (!selectedWrittenQuote) return;
    setNegotiationError(null);
    setIsRequestingAdminExtension(true);
    try {
      const response = await fetch(`/api/written-quotes/${selectedWrittenQuote.id}/request-admin-extension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request admin extension');
      }

      await fetchWrittenQuotes();
    } catch (error) {
      console.error('[HomeownerWrittenQuoteReviewModal] Error requesting admin extension:', error);
      setNegotiationError(error instanceof Error ? error.message : 'Failed to request admin extension');
    } finally {
      setIsRequestingAdminExtension(false);
    }
  };

  const projections = React.useMemo(() => {
    if (!selectedWrittenQuote) {
      return {
        finalPrice: 0,
        annualSavings: 0,
        paybackYears: 0,
        currentAnnualBill: 0
      };
    }

    const finalPrice = Number(
      (selectedWrittenQuote as any).finalTotal ||
        (selectedWrittenQuote as any).calculations?.finalTotal ||
        (selectedWrittenQuote as any).amount ||
        0
    );

    const storedAnnualSavings = Number((selectedWrittenQuote as any).calculations?.estimatedAnnualSavings || 0);
    const storedPaybackYears = Number((selectedWrittenQuote as any).calculations?.paybackYears || 0);

    const annualSavings =
      storedAnnualSavings > 0
        ? storedAnnualSavings
        : storedPaybackYears > 0 && finalPrice > 0
          ? finalPrice / storedPaybackYears
          : 0;

    const paybackYears =
      storedPaybackYears > 0
        ? storedPaybackYears
        : annualSavings > 0 && finalPrice > 0
          ? finalPrice / annualSavings
          : 0;

    const leadAny = leadData as any;
    const currentAnnualBillFromLead = Number(
      leadAny?.quoteData?.currentAnnualBill ||
        (leadAny?.billType === 'monthly'
          ? leadAny?.energyBill * 12
          : leadAny?.billType === 'quarterly'
            ? leadAny?.energyBill * 4
            : leadAny?.energyBill) ||
        0
    );

    const currentAnnualBill =
      currentAnnualBillFromLead > 0
        ? currentAnnualBillFromLead
        : annualSavings > 0
          ? annualSavings * 1.3
          : 0;

    return {
      finalPrice,
      annualSavings,
      paybackYears,
      currentAnnualBill
    };
  }, [selectedWrittenQuote, leadData]);

  const sortedWrittenQuotes = [...writtenQuotes].sort((a, b) => {
    // Winner first, then shortlisted, then by price
    if (a.isWinner && !b.isWinner) return -1;
    if (b.isWinner && !a.isWinner) return 1;
    if (a.status === 'shortlisted' && b.status !== 'shortlisted') return -1;
    if (b.status === 'shortlisted' && a.status !== 'shortlisted') return 1;
    return a.finalTotal - b.finalTotal;
  });

  const handleDoneDealClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDoneDeal = async () => {
    if (!selectedWrittenQuote) return;

    const userId = session?.user?.id;
    if (!userId) {
      setNegotiationError('Unable to finalize deal: missing user session. Please refresh and try again.');
      return;
    }

    setIsFinalizingDeal(true);
    setNegotiationError(null);
    try {
      const response = await fetch(`/api/written-quotes/${selectedWrittenQuote.id}/agree`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreedBy: userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to finalize negotiation');
      }

      setShowConfirmation(false);
      await fetchWrittenQuotes();
    } catch (error) {
      console.error('[HomeownerWrittenQuoteReviewModal] Error requesting done-deal:', error);
      setNegotiationError(error instanceof Error ? error.message : 'Failed to request done-deal');
    } finally {
      setIsFinalizingDeal(false);
    }
  };

  const handleAcceptDeal = async () => {
    if (!selectedWrittenQuote) return;

    setIsAcceptingDeal(true);
    setNegotiationError(null);
    try {
      const response = await fetch(`/api/written-quotes/${selectedWrittenQuote.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept done-deal');
      }

      await fetchWrittenQuotes();
    } catch (error) {
      console.error('[HomeownerWrittenQuoteReviewModal] Error accepting done-deal:', error);
      setNegotiationError(error instanceof Error ? error.message : 'Failed to accept done-deal');
    } finally {
      setIsAcceptingDeal(false);
    }
  };

  const handleRejectDeal = async () => {
    if (!selectedWrittenQuote) return;

    setIsRejectingDeal(true);
    setNegotiationError(null);
    try {
      const response = await fetch(`/api/written-quotes/${selectedWrittenQuote.id}/deal-reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject done-deal');
      }

      await fetchWrittenQuotes();
    } catch (error) {
      console.error('[HomeownerWrittenQuoteReviewModal] Error rejecting done-deal:', error);
      setNegotiationError(error instanceof Error ? error.message : 'Failed to reject done-deal');
    } finally {
      setIsRejectingDeal(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectConfirmation(true);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!selectedWrittenQuote) return;

    setIsRejecting(true);
    setNegotiationError(null);
    try {
      const response = await fetch(`/api/written-quotes/${selectedWrittenQuote.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason || undefined })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject quote');
      }

      setShowRejectConfirmation(false);
      setRejectReason('');

      await fetchWrittenQuotes();
    } catch (error) {
      console.error('[HomeownerWrittenQuoteReviewModal] Error rejecting quote:', error);
      setNegotiationError(error instanceof Error ? error.message : 'Failed to reject quote');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSubmitCounter = async () => {
    if (!selectedWrittenQuote) return;
    setNegotiationError(null);

    const parsed = Number(counterAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setNegotiationError('Enter a valid counter amount greater than 0.');
      return;
    }

    setIsSubmittingCounter(true);
    try {
      const response = await fetch(`/api/written-quotes/${selectedWrittenQuote.id}/counter`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counterAmount: parsed })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit counter offer');
      }

      setCounterAmount('');
      await fetchWrittenQuotes();
    } catch (error) {
      console.error('[HomeownerWrittenQuoteReviewModal] Error submitting counter:', error);
      setNegotiationError(error instanceof Error ? error.message : 'Failed to submit counter offer');
    } finally {
      setIsSubmittingCounter(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLastOfferAmount = (writtenQuote: WrittenQuoteWithFullData) => {
    if (writtenQuote.negotiationStatus === 'PENDING_ACCEPTANCE' && writtenQuote.agreedAmount) {
      return writtenQuote.agreedAmount;
    }
    
    let amount = writtenQuote.finalTotal || writtenQuote.amount || 0;
    let lastTime = new Date(writtenQuote.createdAt || 0).getTime();

    if (writtenQuote.installerRevisedAt && writtenQuote.installerRevisedAmount) {
      const t = new Date(writtenQuote.installerRevisedAt).getTime();
      if (t > lastTime) {
        lastTime = t;
        amount = writtenQuote.installerRevisedAmount;
      }
    }

    if (writtenQuote.homeownerCounterAt && writtenQuote.homeownerCounterAmount) {
      const t = new Date(writtenQuote.homeownerCounterAt).getTime();
      if (t > lastTime) {
        lastTime = t;
        amount = writtenQuote.homeownerCounterAmount;
      }
    }

    return amount;
  };

  const getNegotiationStatusLabel = (writtenQuote: WrittenQuoteWithFullData) => {
    switch (writtenQuote.negotiationStatus) {
      case 'HOMEOWNER_COUNTERED':
        return 'Waiting on installer response';
      case 'INSTALLER_RESPONDED':
        return 'Installer updated the offer';
      case 'PENDING_ACCEPTANCE':
        return 'Done deal pending acceptance';
      case 'AGREED':
        return 'Finalized (Done deal)';
      case 'REJECTED':
        return 'Rejected';
      case 'NEGOTIATION_EXPIRED':
        return 'Negotiation expired';
      case 'PENDING':
      default:
        return 'Not started';
    }
  };

  const getNegotiationTimeline = (writtenQuote: WrittenQuoteWithFullData) => {
    const events: Array<{ label: string; actor: string; amount: number; at: string }> = [];

    events.push({
      label: 'Initial offer submitted',
      actor: 'Installer',
      amount: writtenQuote.finalTotal || writtenQuote.amount,
      at: writtenQuote.createdAt
    });

    if (writtenQuote.homeownerCounterAt && writtenQuote.homeownerCounterAmount) {
      events.push({
        label: 'Counter offer submitted',
        actor: 'Homeowner',
        amount: writtenQuote.homeownerCounterAmount,
        at: writtenQuote.homeownerCounterAt
      });
    }

    if (writtenQuote.installerRevisedAt && writtenQuote.installerRevisedAmount) {
      events.push({
        label: 'Offer revised',
        actor: 'Installer',
        amount: writtenQuote.installerRevisedAmount,
        at: writtenQuote.installerRevisedAt
      });
    }

    if (writtenQuote.agreedAt && writtenQuote.agreedAmount) {
      events.push({
        label: writtenQuote.negotiationStatus === 'PENDING_ACCEPTANCE' ? 'Done deal requested' : 'Done deal',
        actor: writtenQuote.negotiationStatus === 'PENDING_ACCEPTANCE' ? 'Pending' : 'Finalized',
        amount: writtenQuote.agreedAmount,
        at: writtenQuote.agreedAt
      });
    }

    return events;
  };

  // Helper functions to safely access bid data with fallbacks
  const getSystemSize = (writtenQuote: WrittenQuoteWithFullData) => writtenQuote.systemData?.capacityKw || 0;
  const getSystemType = (writtenQuote: WrittenQuoteWithFullData) => writtenQuote.systemData?.systemType || 'N/A';
  const getAnnualProduction = (writtenQuote: WrittenQuoteWithFullData) => {
    const systemSize = getSystemSize(writtenQuote);
    // Use simple calculation since yield_kWh_per_kW_per_day doesn't exist in BidAssumptions
    const yieldFactor = 4.5; // Average kWh/kW/day
    return Math.round(systemSize * yieldFactor * 365);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // UI-only: prevent background scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1400] flex items-center justify-center p-0 md:p-4 animate-fade-in"
      onClick={() => {
        if (showConfirmation || showRejectConfirmation) return;
        onClose();
      }}
    >
      <div 
        className="bg-background relative w-full h-full md:max-w-[95vw] md:h-[95vh] md:rounded-2xl flex flex-col animate-fade-in shadow-neu-outset-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div>
            <h2 className="text-heading-3 text-foreground">Review Written Quotes & Negotiate</h2>
            <p className="text-body-small text-muted-foreground mt-1">
              {propertyAddress} • {writtenQuotes.length} quote{writtenQuotes.length !== 1 ? 's' : ''} received
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
          {isLoadingWrittenQuotes ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader className="h-16 w-16 animate-spin text-primary mb-4" />
              <h3 className="text-heading-4 text-foreground mb-2">Loading Written Quotes...</h3>
              <p className="text-body text-muted-foreground max-w-md">
                Please wait while we fetch all submitted written quotes for this lead.
              </p>
            </div>
          ) : writtenQuotesError ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Info className="h-16 w-16 text-error mb-4" />
              <h3 className="text-heading-4 text-foreground mb-2">Error Loading Written Quotes</h3>
              <p className="text-body text-muted-foreground max-w-md mb-4">
                {writtenQuotesError}
              </p>
              <Button onClick={() => fetchWrittenQuotes()} variant="primary">
                Retry
              </Button>
            </div>
          ) : sortedWrittenQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Award className="h-16 w-16 text-muted mb-4" />
              <h3 className="text-heading-4 text-foreground mb-2">No Written Quotes Received Yet</h3>
              <p className="text-body text-muted-foreground max-w-md">
                Installers are preparing their written quotes. You&apos;ll be notified when quotes are submitted for your review.
              </p>
            </div>
          ) : (
            <>
              {/* Installer Selector Dropdown */}
              <div className="mb-6 space-y-2">
                <label className="text-label text-foreground block">
                  Select Quote to Review:
                </label>
                <select 
                  value={selectedWrittenQuoteId} 
                  onChange={(e) => setSelectedWrittenQuoteId(e.target.value)}
                  className="w-full md:w-auto px-4 py-3 bg-surface border border-border rounded-lg text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                >
                  {sortedWrittenQuotes.map((writtenQuote, index) => (
                    <option key={writtenQuote.id} value={writtenQuote.id}>
                      {writtenQuote.isWinner && '🏆 '}
                      {writtenQuote.status === 'shortlisted' && '⭐ '}
                      {writtenQuote.installerName} - ${writtenQuote.finalTotal.toLocaleString()} ({writtenQuote.systemData?.capacityKw || 0} kW)
                    </option>
                  ))}
                </select>
                <p className="text-caption text-muted-foreground">
                  {writtenQuotes.length} quote{writtenQuotes.length !== 1 ? 's' : ''} received • Compare offers side-by-side
                </p>
              </div>

              {/* 2 Column Grid */}
              {selectedWrittenQuote && (
                <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
                  {/* LEFT COLUMN: Written Quote Details */}
                  <div className="space-y-6 overflow-y-auto">
                    {/* Quote Header */}
                    <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-label text-muted-foreground">Quote #</span>
                            <span className="text-heading-4 text-foreground font-mono">
                              {selectedWrittenQuote.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-label text-muted-foreground">Date Submitted:</span>
                            <span className="text-body text-foreground">
                              {formatDate(selectedWrittenQuote.createdAt)}
                            </span>
                          </div>
                        </div>
                        {selectedWrittenQuote.isWinner && (
                          <span className="bg-success/20 text-success px-3 py-1 rounded-full text-label flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Winner Selected
                          </span>
                        )}
                        {selectedWrittenQuote.status === 'shortlisted' && !selectedWrittenQuote.isWinner && (
                          <span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-label flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="border-t border-border pt-4">
                        <h3 className="text-heading-3 text-foreground">{selectedWrittenQuote.installerName}</h3>
                        <div className="flex items-center gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(selectedWrittenQuote.installerRating)
                                  ? 'fill-warning text-warning'
                                  : 'text-muted'
                              }`}
                            />
                          ))}
                          <span className="text-caption text-muted-foreground ml-1">
                            {selectedWrittenQuote.installerRating.toFixed(1)} / 5.0
                          </span>
                        </div>
                        
                        {/* Phase 13W.2: Installer Contact Info - visible after purchase */}
                        {selectedWrittenQuote.purchasedAt ? (
                          <div className="mt-4 pt-4 border-t border-success/30 bg-success/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle className="h-5 w-5 text-success" />
                              <span className="text-label text-success">Installer Contact Details</span>
                            </div>
                            <div className="space-y-2 text-body">
                              {selectedWrittenQuote.installer.companyName && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Company:</span>
                                  <span className="text-foreground">{selectedWrittenQuote.installer.companyName}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Email:</span>
                                <a href={`mailto:${selectedWrittenQuote.installer.email}`} className="text-info hover:underline">
                                  {selectedWrittenQuote.installer.email}
                                </a>
                              </div>
                              {selectedWrittenQuote.installer.phone && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Phone:</span>
                                  <a href={`tel:${selectedWrittenQuote.installer.phone}`} className="text-info hover:underline">
                                    {selectedWrittenQuote.installer.phone}
                                  </a>
                                </div>
                              )}
                              {selectedWrittenQuote.installer.businessAddress && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Address:</span>
                                  <span className="text-foreground">{selectedWrittenQuote.installer.businessAddress}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : selectedWrittenQuote.negotiationStatus === 'AGREED' && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Info className="h-4 w-4" />
                              <span className="text-caption">Contact details will be available after payment is completed.</span>
                            </div>
                          </div>
                        )}
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
                              {selectedWrittenQuote.systemData?.systemType || 'Grid-Tied'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body text-muted-foreground">System Size</td>
                            <td className="py-2 text-body text-foreground text-right">
                              {selectedWrittenQuote.systemData?.capacityKw || 0} kW
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body text-muted-foreground">Total Panels</td>
                            <td className="py-2 text-body text-foreground text-right">
                              {selectedWrittenQuote.systemData?.solarPanelsArray?.reduce((sum: number, arr: any) => sum + arr.quantity, 0) || 0} panels
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body text-muted-foreground">Annual Production (Est.)</td>
                            <td className="py-2 text-body text-foreground text-right">
                              {getAnnualProduction(selectedWrittenQuote).toLocaleString()} kWh/year
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
                      {selectedWrittenQuote.productsData?.solarPanels && selectedWrittenQuote.productsData.solarPanels.length > 0 && (
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
                                  {selectedWrittenQuote.productsData.solarPanels[0].brand} {selectedWrittenQuote.productsData.solarPanels[0].model}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Wattage</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedWrittenQuote.productsData.solarPanels[0].wattage}W
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Quantity</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedWrittenQuote.productsData.solarPanels[0].quantity} panels
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Warranty</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedWrittenQuote.productsData.solarPanels[0].warranty}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Inverter */}
                      {selectedWrittenQuote.productsData?.inverter && (
                        <div className="space-y-2">
                          <h5 className="text-label text-foreground">Inverter</h5>
                          <table className="w-full">
                            <tbody className="divide-y divide-border/50">
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Brand & Model</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedWrittenQuote.productsData.inverter.brand} {selectedWrittenQuote.productsData.inverter.model}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Type</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedWrittenQuote.productsData.inverter.type}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Capacity</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedWrittenQuote.productsData.inverter.capacityKw} kW
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Warranty</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedWrittenQuote.productsData.inverter.warranty}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Battery (if included) */}
                      {selectedWrittenQuote.productsData?.battery && (
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
                                  {selectedWrittenQuote.productsData.battery.brand} {selectedWrittenQuote.productsData.battery.model}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Capacity</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedWrittenQuote.productsData.battery.capacityKwh} kWh
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-body-small text-muted-foreground">Warranty</td>
                                <td className="py-1.5 text-body-small text-foreground text-right">
                                  {selectedWrittenQuote.productsData.battery.warranty}
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
                      {selectedWrittenQuote.lineItems && selectedWrittenQuote.lineItems.length > 0 && (
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
                              {selectedWrittenQuote.lineItems.map((item: any, index: number) => (
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
                                ${(selectedWrittenQuote.calculations?.subtotal || selectedWrittenQuote.amount).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-body text-success">Incentives & Rebates</span>
                              <span className="text-body text-success">
                                -${(selectedWrittenQuote.calculations?.incentiveAmount || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t-2 border-primary/30">
                              <span className="text-heading-4 text-foreground">Final Investment</span>
                              <span className="text-heading-3 text-primary">
                                ${(selectedWrittenQuote.calculations?.finalTotal || selectedWrittenQuote.amount).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-caption text-muted-foreground">Price per Watt</span>
                              <span className="text-caption text-foreground">
                                ${(selectedWrittenQuote.calculations?.pricePerWatt || 0).toFixed(2)}/W
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
                            ${projections.annualSavings.toLocaleString()}/year
                          </p>
                      </div>

                      <div className="bg-info/10 border border-info/30 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-info">
                          <Calendar className="h-5 w-5" />
                          <span className="text-label">Payback Period</span>
                        </div>
                        <p className="text-heading-3 text-foreground">
                          {projections.paybackYears > 0 ? `${projections.paybackYears.toFixed(1)} years` : 'N/A'}
                        </p>
                      </div>

                      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Award className="h-5 w-5" />
                          <span className="text-label">25-Year Savings</span>
                        </div>
                          <p className="text-heading-3 text-foreground">
                            ${(projections.annualSavings * 25).toLocaleString()}
                          </p>
                      </div>

                      {projections.finalPrice > 0 &&
                        projections.annualSavings > 0 &&
                        projections.currentAnnualBill > 0 && (
                          <div className="pt-3 border-t border-border">
                            <SavingsChart
                              finalPrice={projections.finalPrice}
                              annualSavings={projections.annualSavings}
                              currentAnnualBill={projections.currentAnnualBill}
                            />
                          </div>
                        )}
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
                              {selectedWrittenQuote.roofData?.roofType || 'N/A'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body-small text-muted-foreground">Roof Pitch</td>
                            <td className="py-2 text-body-small text-foreground text-right">
                              {selectedWrittenQuote.roofData?.pitchDeg || 0}°
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body-small text-muted-foreground">Arrays</td>
                            <td className="py-2 text-body-small text-foreground text-right">
                              {selectedWrittenQuote.roofData?.arrays || 1}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body-small text-muted-foreground">Orientations</td>
                            <td className="py-2 text-body-small text-foreground text-right">
                              {selectedWrittenQuote.roofData?.orientations?.join(', ') || 'N/A'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-body-small text-muted-foreground">Shading Assessment</td>
                            <td className="py-2 text-body-small text-foreground text-right">
                              {selectedWrittenQuote.roofData?.shadingLevel || 0}% shading
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* T294: Winning Installer Contact (visible after purchase) */}
                  {selectedWrittenQuote && selectedWrittenQuote.isWinner && selectedWrittenQuote.installer && (
                    <div className="bg-success/10 border-2 border-success/30 rounded-xl p-6" data-testid="installer-contact">
                      <h4 className="text-heading-4 text-success mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Winning Installer Contact
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-label text-muted-foreground min-w-[100px]">Company:</span>
                          <span className="text-body text-foreground">
                            {selectedWrittenQuote.installer.companyName}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-label text-muted-foreground min-w-[100px]">Phone:</span>
                          <span className="text-body text-foreground">
                            {selectedWrittenQuote.installer.phone || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-label text-muted-foreground min-w-[100px]">Email:</span>
                          <span className="text-body text-foreground">
                            {selectedWrittenQuote.installer.email || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-label text-muted-foreground min-w-[100px]">Address:</span>
                          <span className="text-body text-foreground">
                            {selectedWrittenQuote.installer.businessAddress || 'Not provided'}
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
                    {/* Negotiation Panel */}
                    <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
                      <h3 className="text-heading-4 text-foreground">Negotiation</h3>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-body-small text-muted-foreground">Status</span>
                          <span className="text-body-small text-foreground">
                            {getNegotiationStatusLabel(selectedWrittenQuote)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body-small text-muted-foreground">
                            {selectedWrittenQuote.negotiationStatus === 'PENDING_ACCEPTANCE' ? 'Deal price' : 'Last offer'}
                          </span>
                          <span className="text-body-small text-foreground">
                            ${getLastOfferAmount(selectedWrittenQuote).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body-small text-muted-foreground">Negotiation turns</span>
                          <span className="text-body-small text-foreground">
                            {(selectedWrittenQuote.negotiationTurnCount ?? 0)}/7
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-label text-foreground">History</div>
                        <div className="space-y-2">
                          {getNegotiationTimeline(selectedWrittenQuote).map((evt, idx) => (
                            <div key={idx} className="bg-background/50 border border-border rounded-lg p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-body-small text-foreground">
                                  {evt.actor}: {evt.label}
                                </div>
                                <div className="text-body-small text-foreground">
                                  ${evt.amount.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-caption text-muted-foreground mt-1">
                                {formatDateTime(evt.at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {negotiationError && (
                        <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                          <p className="text-body-small text-error">{negotiationError}</p>
                        </div>
                      )}

                      {(() => {
                        const homeownerCounterCount = selectedWrittenQuote.homeownerCounterCount ?? 0;
                        const negotiationTurns = selectedWrittenQuote.negotiationTurnCount ?? 0;
                        const isClosed =
                          selectedWrittenQuote.negotiationStatus === 'AGREED' ||
                          selectedWrittenQuote.negotiationStatus === 'REJECTED' ||
                          selectedWrittenQuote.negotiationStatus === 'PENDING_ACCEPTANCE' ||
                          selectedWrittenQuote.negotiationStatus === 'NEGOTIATION_EXPIRED' ||
                          !!(selectedWrittenQuote as any).negotiationExpiredAt ||
                          !!selectedWrittenQuote.purchasedAt;

                        const canCounter = !isClosed && homeownerCounterCount < 3 && negotiationTurns < 7;

                        if (!canCounter) {
                          if (selectedWrittenQuote.negotiationStatus === 'AGREED') {
                             return (
                                <div className="bg-success/10 border border-success/20 rounded-lg p-4 animate-in fade-in zoom-in duration-300">
                                    <div className="flex flex-col items-center text-center space-y-2">
                                        <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center mb-2">
                                            <CheckCircle className="h-6 w-6 text-success" />
                                        </div>
                                        <h4 className="text-heading-5 text-success">Deal Accepted!</h4>
                                        <p className="text-body-small text-muted-foreground">
                                            Deal accepted by <span className="text-foreground">{(selectedWrittenQuote as any).agreedBy === session?.user?.id ? 'You' : 'Installer'}</span> at
                                        </p>
                                        <div className="text-heading-3 text-foreground">
                                            ${(selectedWrittenQuote.agreedAmount || 0).toLocaleString()}
                                        </div>
                                        <p className="text-caption text-muted-foreground">
                                            {selectedWrittenQuote.agreedAt ? formatDateTime(selectedWrittenQuote.agreedAt) : ''}
                                        </p>
                                    </div>
                                </div>
                             );
                          }

                          const reason = isClosed
                            ? selectedWrittenQuote.negotiationStatus === 'PENDING_ACCEPTANCE'
                              ? 'Done deal is pending acceptance. Negotiation is temporarily locked.'
                              : selectedWrittenQuote.negotiationStatus === 'NEGOTIATION_EXPIRED' || !!(selectedWrittenQuote as any).negotiationExpiredAt
                              ? 'This negotiation has expired and is now closed.'
                              : 'This negotiation is closed.'
                            : negotiationTurns >= 7
                            ? 'Negotiation limit reached (7 total turns).'
                            : 'Counter offer limit reached (3 total).';

                          return (
                            <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                              <p className="text-body-small text-info">{reason}</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            <div className="text-label text-foreground">
                              Your counter offer ({homeownerCounterCount}/3 used)
                              <span className="text-caption text-muted-foreground"> · Total turns: {negotiationTurns}/7</span>
                            </div>
                            <input
                              value={counterAmount}
                              onChange={(e) => setCounterAmount(e.target.value)}
                              type="number"
                              min={0}
                              inputMode="numeric"
                              placeholder="Enter amount"
                              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                            />
                            <Button
                              variant="secondary"
                              onClick={handleSubmitCounter}
                              disabled={isSubmittingCounter}
                              className="w-full"
                            >
                              {isSubmittingCounter ? 'Submitting...' : 'Send Counter Offer'}
                            </Button>
                          </div>
                        );
                      })()}

                      {/* Presence + time window + extension controls */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-body-small text-muted-foreground">Live status</span>
                          <span className={`text-body-small ${isBothPartiesOnline ? 'text-success' : 'text-muted-foreground'}`}>
                            {isBothPartiesOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body-small text-muted-foreground">Deadline</span>
                          {(selectedWrittenQuote as any).negotiationDeadlineAt ? (
                            <LiveCountdownBarCompact
                              expiresAt={(selectedWrittenQuote as any).negotiationDeadlineAt}
                              leadId={String(leadId)}
                              initialDays={3}
                            />
                          ) : (
                            <span className="text-body-small text-foreground">—</span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <Button
                            variant="secondary"
                            onClick={handleExtendNegotiation}
                            disabled={
                              isExtendingNegotiation ||
                              (selectedWrittenQuote as any).homeownerExtensionUsed ||
                              selectedWrittenQuote.negotiationStatus === 'AGREED' ||
                              selectedWrittenQuote.negotiationStatus === 'REJECTED' ||
                              selectedWrittenQuote.negotiationStatus === 'PENDING_ACCEPTANCE' ||
                              selectedWrittenQuote.negotiationStatus === 'NEGOTIATION_EXPIRED' ||
                              !!(selectedWrittenQuote as any).negotiationExpiredAt ||
                              !!selectedWrittenQuote.purchasedAt
                            }
                            className="w-full"
                          >
                            {isExtendingNegotiation
                              ? 'Extending...'
                              : (selectedWrittenQuote as any).homeownerExtensionUsed
                              ? 'Extend (already used)'
                              : 'Extend by 2 days (one-time)'}
                          </Button>

                          <Button
                            variant="minimal"
                            onClick={handleRequestAdminExtension}
                            disabled={isRequestingAdminExtension}
                            className="w-full"
                          >
                            {isRequestingAdminExtension ? 'Requesting...' : 'Request admin extension'}
                          </Button>
                        </div>
                      </div>
                    </div>

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
            {selectedWrittenQuote && (
              <>
                Reviewing: {selectedWrittenQuote.installerName} • 
                ${selectedWrittenQuote.finalTotal.toLocaleString()} • 
                {selectedWrittenQuote.systemData?.capacityKw || 0} kW
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
            
            {selectedWrittenQuote &&
              selectedWrittenQuote.negotiationStatus !== 'AGREED' &&
              selectedWrittenQuote.negotiationStatus !== 'REJECTED' &&
              selectedWrittenQuote.negotiationStatus !== 'PENDING_ACCEPTANCE' && (
              <Button 
                variant="secondary"
                onClick={handleRejectClick}
                disabled={isRejecting}
                className="border-destructive text-destructive hover:bg-destructive hover:text-white"
              >
                {isRejecting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            )}
            
            {selectedWrittenQuote && selectedWrittenQuote.negotiationStatus === 'REJECTED' && (
              <Button 
                variant="secondary"
                disabled
                className="border-destructive/50 text-destructive/50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejected
              </Button>
            )}

            {selectedWrittenQuote && selectedWrittenQuote.negotiationStatus === 'PENDING_ACCEPTANCE' ? (
              (() => {
                const userId = session?.user?.id;
                const proposerId = selectedWrittenQuote.agreedBy || null;
                const isProposer = !!userId && !!proposerId && userId === proposerId;

                if (isProposer) {
                  return (
                    <Button variant="primary" disabled>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Waiting for acceptance...
                    </Button>
                  );
                }

                return (
                  <>
                    <Button
                      variant="secondary"
                      onClick={handleRejectDeal}
                      disabled={isRejectingDeal}
                      className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                    >
                      {isRejectingDeal ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Deal
                        </>
                      )}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleAcceptDeal}
                      disabled={isAcceptingDeal}
                    >
                      {isAcceptingDeal ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Deal
                        </>
                      )}
                    </Button>
                  </>
                );
              })()
            ) : (
              selectedWrittenQuote && (
                <Button 
                  variant="primary" 
                  onClick={handleDoneDealClick}
                  disabled={
                    selectedWrittenQuote.negotiationStatus === 'AGREED' ||
                    selectedWrittenQuote.negotiationStatus === 'REJECTED' ||
                    selectedWrittenQuote.negotiationStatus === 'PENDING_ACCEPTANCE' ||
                    isFinalizingDeal
                  }
                >
                  {selectedWrittenQuote.negotiationStatus === 'AGREED' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Done Deal
                    </>
                  ) : isFinalizingDeal ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Done deal
                    </>
                  )}
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedWrittenQuote && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1410] flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-background rounded-2xl p-6 max-w-md w-full space-y-4 shadow-neu-outset-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-heading-4 text-foreground">Confirm Done Deal</h3>
            <p className="text-body text-muted-foreground">
              Are you sure you want to proceed with the final price of <span className="text-foreground">${getLastOfferAmount(selectedWrittenQuote).toLocaleString()}</span>?
            </p>
            <p className="text-body-small text-info">This will notify the installer and temporarily lock negotiation until they accept or reject.</p>
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
                onClick={handleConfirmDoneDeal}
                disabled={isFinalizingDeal}
                className="flex-1"
              >
                {isFinalizingDeal ? 'Confirming...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirmation && selectedWrittenQuote && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1410] flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-background rounded-2xl p-6 max-w-md w-full space-y-4 shadow-neu-outset-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-heading-4 text-destructive">Reject Quote</h3>
            <p className="text-body text-muted-foreground">
              Are you sure you want to reject the quote from <strong className="text-foreground">{selectedWrittenQuote.installerName}</strong>?
            </p>
            <p className="text-body-small text-warning">This will notify the installer that you have declined their offer.</p>
            
            <div className="space-y-2">
              <label className="text-label text-foreground">Reason (optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Let the installer know why (optional)"
                className="w-full px-3 py-2 bg-background-alt border border-border rounded-lg text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/30 resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex items-center gap-3 pt-4">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowRejectConfirmation(false);
                  setRejectReason('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="flex-1 bg-destructive hover:bg-destructive/90"
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  , document.body);
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
