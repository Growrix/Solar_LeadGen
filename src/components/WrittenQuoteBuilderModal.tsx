'use client'

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/button';
import { X, Save, Send, Eye, FileText, ChevronDown, ChevronUp, Info, Download } from 'lucide-react';
import { calcQuoteTotals, DEFAULT_ASSUMPTIONS, QuoteInputs } from '@/utils/quoteCalculator';
import { parseBudgetRange } from '@/lib/mappers/instant-to-bid';
import SavingsChart from './SavingsChart';
import HomeownerPreviewModal from './HomeownerPreviewModal';
import BidEvaluationModal from './BidEvaluationModal';
import { LeadData, InstantQuoteResults } from '@/types/lead';

// Import all section components
import SystemSelection, { SystemSelectionData } from './quote-builder/SystemSelection';
import RoofSiteDetails, { RoofSiteDetailsData } from './quote-builder/RoofSiteDetails';
import ProductConfiguration, { ProductConfigurationData } from './quote-builder/ProductConfiguration';
import PricingEngine, { PricingEngineData } from './quote-builder/PricingEngine';
import ComplianceDocs, { ComplianceDocsData } from './quote-builder/ComplianceDocs';
import CustomerPreview, { CustomerPreviewData, QuoteOption } from './quote-builder/CustomerPreview';
import HomeownerContext from './quote-builder/HomeownerContext';
import HomeownerInstantQuoteDetails from './quote-builder/HomeownerInstantQuoteDetails';
import LeadTechnicalDetails from './quote-builder/LeadTechnicalDetails';
import InstantQuoteResult from './quote-builder/InstantQuoteResult';
import { PRESET_BUNDLES } from './quote-builder/Presets';
import type { GetWrittenQuotesResponse } from '@/types/written-quote';

// --- Types ---
interface Lead {
  id: string | number;
  name: string;
  location: string;
  propertyType: string;
  systemSize: string;
  estimatedUsage: string;
  budget: string;
  quoteData?: any; // Instant Quote data from homeowner
  batteryRequired?: boolean; // Battery required flag from InstantQuote
  status?: string; // Lead status for purchase checking
  purchasedAt?: string | null; // Purchase timestamp for purchase checking
}

interface WrittenQuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSubmitQuote: (leadId: string, quoteData: any) => Promise<boolean>;
  mode?: 'quote' | 'bid';
}

interface QuoteDraft {
  mode: 'quote' | 'bid' | 'config';
  system: SystemSelectionData;
  roof: RoofSiteDetailsData;
  products: ProductConfigurationData;
  pricing: PricingEngineData;
  compliance: ComplianceDocsData;
  preview: CustomerPreviewData;
  assumptions: {
    yield_kWh_per_kW_per_day: number;
    selfConsumption: number;
    retailPrice: number;
    feedInTariff: number;
    annualOpex: number;
    degradationPercentPerYear: number;
    escalationPercentPerYear: number;
  };
  meta: {
    version: number;
    lastSavedAt: string;
    autosaveStatus: 'idle' | 'saving' | 'saved';
    importedAt?: string;
    importSource?: 'instant-quote';
    prefilledFields?: string[];
    // Homeowner Context (Phase 12 - T111/T112)
    homeownerBudget?: string;
    homeownerOffset?: number;
    homeownerUsagePattern?: string;
    homeownerElectricityUsage?: number;
    homeownerRetailer?: string;
    homeownerTariff?: string;
    homeownerPanelPreference?: string;
    homeownerOptimizerPreference?: boolean;
    homeownerMicroinverterPreference?: boolean;
    homeownerExistingSystem?: boolean;
    homeownerPropertyType?: string;
  };
}

const WrittenQuoteBuilderModal: React.FC<WrittenQuoteBuilderModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSubmitQuote,
  mode = 'quote'
}) => {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  // Full lead data state (fetched from API for complete data)
  const [fullLeadData, setFullLeadData] = useState<LeadData | null>(null);
  const [isLoadingFullLead, setIsLoadingFullLead] = useState(false);
  const [leadFetchError, setLeadFetchError] = useState<string | null>(null);

  // Negotiation panel state (Phase 13W)
  const [negotiationQuote, setNegotiationQuote] = useState<GetWrittenQuotesResponse['writtenQuotes'][number] | null>(null);
  const [isLoadingNegotiation, setIsLoadingNegotiation] = useState(false);
  const [isRefreshingNegotiation, setIsRefreshingNegotiation] = useState(false);
  const [negotiationFetchError, setNegotiationFetchError] = useState<string | null>(null);
  const [revisedAmount, setRevisedAmount] = useState<string>('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [isFinalizingDeal, setIsFinalizingDeal] = useState(false);
  const [isExtendingNegotiation, setIsExtendingNegotiation] = useState(false);
  const [isRequestingAdminExtension, setIsRequestingAdminExtension] = useState(false);
  const hasLoadedNegotiationRef = useRef(false);
  const negotiationSignatureRef = useRef<string | null>(null);

  // Collapsible section state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    system: true,
    roof: false,
    products: false,
    pricing: false,
    compliance: false,
    preview: true,
    customerPreview: false,
    leadDetails: false
  });

  // Main quote draft state
  const [quoteDraft, setQuoteDraft] = useState<QuoteDraft>({
    mode: mode,
    system: {
      systemType: 'grid-connected',
      systemSize: 6.6,
      projectType: 'Residential',
      desiredPriceRange: undefined
    },
    roof: {
      roofType: '',
      pitchDeg: 22,
      arrays: 1,
      orientations: [],
      shadingLevel: 0,
      phaseType: 'single',
      switchboardUpgrade: false,
      smartMeterRequired: false,
      distanceToSwitchboardM: 10,
      notes: '',
      photos: [],
      arrayLayoutNotes: '',
      roofAccessNotes: '',
      structuralNotes: '',
      mountingSystemPreferred: '',
      conduitRunComplexity: 'medium' as 'low' | 'medium' | 'high',
      inverterLocationNotes: ''
    },
    products: {
      panels: {
        brand: '',
        model: '',
        wattage: 430,
        efficiency: 21.5,
        qty: 16,
        productWarranty: 12,
        performanceWarranty: 25,
        tier1: false
      },
      inverter: {
        brand: '',
        model: '',
        type: '',
        capacityKw: 5,
        mppts: 2,
        warranty: 10
      },
      battery: undefined,
      addons: []
    },
    pricing: {
      lineItems: [],
      stc: {
        eligible: true,
        zone: 'Zone 3',
        stcCount: 90,
        stcPrice: 40
      },
      vic: {
        rebateEligible: false,
        rebateAmount: 1400,
        interestFreeLoan: false,
        batteryLoan: false
      },
      discounts: [],
      installerCostMode: false
    },
    compliance: {
      docs: [],
      cecAccreditation: '',
      electricalLicence: '',
      insurance: ''
    },
    preview: {
      options: []
    },
    assumptions: {
      yield_kWh_per_kW_per_day: DEFAULT_ASSUMPTIONS.yield_kWh_per_kW_per_day,
      selfConsumption: DEFAULT_ASSUMPTIONS.selfConsumption,
      retailPrice: DEFAULT_ASSUMPTIONS.retailPrice,
      feedInTariff: DEFAULT_ASSUMPTIONS.feedInTariff,
      annualOpex: DEFAULT_ASSUMPTIONS.annualOpex,
      degradationPercentPerYear: DEFAULT_ASSUMPTIONS.degradationPercentPerYear,
      escalationPercentPerYear: DEFAULT_ASSUMPTIONS.escalationPercentPerYear
    },
    meta: {
      version: 1,
      lastSavedAt: new Date().toISOString(),
      autosaveStatus: 'idle'
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isBidEvaluationOpen, setIsBidEvaluationOpen] = useState(false);
  const [isBudgetHintDismissed, setIsBudgetHintDismissed] = useState(false);
  const [didRestoreDraft, setDidRestoreDraft] = useState(false);
  const [isAcceptingDeal, setIsAcceptingDeal] = useState(false);
  const [isRejectingDeal, setIsRejectingDeal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastAutosavedSnapshotRef = useRef<string | null>(null);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNegotiationStatusLabel = (negotiationStatus?: string | null) => {
    switch (negotiationStatus) {
      case 'HOMEOWNER_COUNTERED':
        return 'Homeowner countered (action needed)';
      case 'INSTALLER_RESPONDED':
        return 'You revised the offer';
      case 'PENDING_ACCEPTANCE':
        return 'Done deal pending acceptance';
      case 'AGREED':
        return 'Finalized (Done deal)';
      case 'NEGOTIATION_EXPIRED':
        return 'Negotiation expired';
      case 'PENDING':
      default:
        return 'Not started';
    }
  };

  const getTimestamp = (value: unknown): number => {
    if (!value) return 0;
    const t = new Date(value as any).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const isBothPartiesOnline = React.useMemo(() => {
    if (!negotiationQuote) return false;
    const now = Date.now();
    const homeownerAt = getTimestamp((negotiationQuote as any).homeownerModalActiveAt);
    const installerAt = getTimestamp((negotiationQuote as any).installerModalActiveAt);
    if (!homeownerAt || !installerAt) return false;
    return now - homeownerAt <= 15_000 && now - installerAt <= 15_000;
  }, [negotiationQuote]);

  // Presence heartbeat while modal is open
  useEffect(() => {
    if (!isOpen || !negotiationQuote) return;
    const writtenQuoteId = negotiationQuote.id;

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
  }, [isOpen, negotiationQuote]);

  const getLastOfferAmount = (quote: any) => {
    if (quote?.negotiationStatus === 'PENDING_ACCEPTANCE' && quote?.agreedAmount) {
      return quote.agreedAmount;
    }
    return (
      quote?.installerRevisedAmount ||
      quote?.homeownerCounterAmount ||
      quote?.agreedAmount ||
      quote?.finalTotal ||
      quote?.amount ||
      0
    );
  };

  const getNegotiationTimeline = (quote: any) => {
    if (!quote) return [] as Array<{ label: string; actor: string; amount: number; at: string }>;
    const events: Array<{ label: string; actor: string; amount: number; at: string }> = [];

    events.push({
      label: 'Initial offer submitted',
      actor: 'Installer',
      amount: quote.finalTotal || quote.amount,
      at: quote.createdAt
    });

    if (quote.homeownerCounterAt && quote.homeownerCounterAmount) {
      events.push({
        label: 'Counter offer received',
        actor: 'Homeowner',
        amount: quote.homeownerCounterAmount,
        at: quote.homeownerCounterAt
      });
    }

    if (quote.installerRevisedAt && quote.installerRevisedAmount) {
      events.push({
        label: 'Offer revised',
        actor: 'Installer',
        amount: quote.installerRevisedAmount,
        at: quote.installerRevisedAt
      });
    }

    if (quote.agreedAt && quote.agreedAmount) {
      events.push({
        label: quote.negotiationStatus === 'PENDING_ACCEPTANCE' ? 'Done deal requested' : 'Done deal',
        actor: quote.negotiationStatus === 'PENDING_ACCEPTANCE' ? 'Pending' : 'Finalized',
        amount: quote.agreedAmount,
        at: quote.agreedAt
      });
    }

    return events;
  };

  const fetchNegotiationQuote = React.useCallback(async (opts?: { background?: boolean }) => {
    if (!lead?.id) return;
    const installerId = session?.user?.id;
    if (!installerId) return;

    const isBackground = !!opts?.background;
    const showBlockingLoader = !isBackground && !hasLoadedNegotiationRef.current;

    if (showBlockingLoader) {
      setIsLoadingNegotiation(true);
      setNegotiationFetchError(null);
    } else if (isBackground) {
      setIsRefreshingNegotiation(true);
    }

    try {
      const response = await fetch(`/api/written-quotes?leadId=${lead.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch written quotes: ${response.status} ${response.statusText}`);
      }

      const data: GetWrittenQuotesResponse = await response.json();
      const ownQuote = (data.writtenQuotes || []).find((q: any) => q.installerId === installerId) || null;

      const signature = ownQuote
        ? JSON.stringify({
            id: ownQuote.id,
            negotiationStatus: ownQuote.negotiationStatus,
            amount: ownQuote.amount,
            homeownerCounterAmount: ownQuote.homeownerCounterAmount,
            homeownerCounterAt: ownQuote.homeownerCounterAt,
            installerRevisedAmount: ownQuote.installerRevisedAmount,
            installerRevisedAt: ownQuote.installerRevisedAt,
            agreedAmount: ownQuote.agreedAmount,
            agreedAt: ownQuote.agreedAt,
            agreedBy: ownQuote.agreedBy,
            negotiationDeadlineAt: (ownQuote as any).negotiationDeadlineAt,
            negotiationExpiredAt: (ownQuote as any).negotiationExpiredAt,
            homeownerModalActiveAt: (ownQuote as any).homeownerModalActiveAt,
            installerModalActiveAt: (ownQuote as any).installerModalActiveAt,
            homeownerExtensionUsed: (ownQuote as any).homeownerExtensionUsed,
            installerExtensionUsed: (ownQuote as any).installerExtensionUsed,
            adminExtensionCount: (ownQuote as any).adminExtensionCount,
            adminLastExtendedAt: (ownQuote as any).adminLastExtendedAt,
            adminLastExtendedBy: (ownQuote as any).adminLastExtendedBy
          })
        : 'null';

      if (signature !== negotiationSignatureRef.current) {
        setNegotiationQuote(ownQuote);
        negotiationSignatureRef.current = signature;
      }

      hasLoadedNegotiationRef.current = true;
      if (!isBackground) setNegotiationFetchError(null);
    } catch (error) {
      console.error('[WrittenQuoteBuilderModal] Error fetching negotiation quote:', error);
      setNegotiationFetchError(error instanceof Error ? error.message : 'Failed to load negotiation data');
      // Keep the last known negotiationQuote on background refresh errors to avoid UI blinking.
      if (!hasLoadedNegotiationRef.current) {
        setNegotiationQuote(null);
      }
    } finally {
      if (showBlockingLoader) setIsLoadingNegotiation(false);
      if (isBackground) setIsRefreshingNegotiation(false);
    }
  }, [lead?.id, session?.user?.id]);

  const handleReviseOffer = async () => {
    if (!negotiationQuote) return;
    const parsed = Number(revisedAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setNegotiationFetchError('Enter a valid revised amount greater than 0.');
      return;
    }
    if (negotiationQuote.negotiationStatus === 'AGREED') return;
    if (negotiationQuote.negotiationStatus === 'PENDING_ACCEPTANCE') return;
    if (negotiationQuote.negotiationStatus === 'NEGOTIATION_EXPIRED' || !!(negotiationQuote as any).negotiationExpiredAt) return;

    setIsSubmittingRevision(true);
    setNegotiationFetchError(null);
    try {
      const response = await fetch(`/api/written-quotes/${negotiationQuote.id}/revise`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisedAmount: parsed })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to revise offer');
      }

      setRevisedAmount('');
      await fetchNegotiationQuote();
    } catch (error) {
      console.error('[WrittenQuoteBuilderModal] Error revising offer:', error);
      setNegotiationFetchError(error instanceof Error ? error.message : 'Failed to revise offer');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleDoneDeal = async () => {
    if (!negotiationQuote) return;
    if (negotiationQuote.negotiationStatus === 'AGREED') return;
    if (negotiationQuote.negotiationStatus === 'PENDING_ACCEPTANCE') return;
    if (negotiationQuote.negotiationStatus === 'NEGOTIATION_EXPIRED' || !!(negotiationQuote as any).negotiationExpiredAt) return;

    const userId = session?.user?.id;
    if (!userId) {
      setNegotiationFetchError('Unable to finalize deal: missing user session.');
      return;
    }

    setIsFinalizingDeal(true);
    setNegotiationFetchError(null);
    try {
      const response = await fetch(`/api/written-quotes/${negotiationQuote.id}/agree`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreedBy: userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to finalize negotiation');
      }

      await fetchNegotiationQuote();
    } catch (error) {
      console.error('[WrittenQuoteBuilderModal] Error finalizing deal:', error);
      setNegotiationFetchError(error instanceof Error ? error.message : 'Failed to finalize negotiation');
    } finally {
      setIsFinalizingDeal(false);
    }
  };

  const handleAcceptDeal = async () => {
    if (!negotiationQuote) return;

    setIsAcceptingDeal(true);
    setNegotiationFetchError(null);
    try {
      const response = await fetch(`/api/written-quotes/${negotiationQuote.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept done-deal');
      }

      await fetchNegotiationQuote();
    } catch (error) {
      console.error('[WrittenQuoteBuilderModal] Error accepting done-deal:', error);
      setNegotiationFetchError(error instanceof Error ? error.message : 'Failed to accept done-deal');
    } finally {
      setIsAcceptingDeal(false);
    }
  };

  const handleRejectDeal = async () => {
    if (!negotiationQuote) return;

    setIsRejectingDeal(true);
    setNegotiationFetchError(null);
    try {
      const response = await fetch(`/api/written-quotes/${negotiationQuote.id}/deal-reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject done-deal');
      }

      await fetchNegotiationQuote();
    } catch (error) {
      console.error('[WrittenQuoteBuilderModal] Error rejecting done-deal:', error);
      setNegotiationFetchError(error instanceof Error ? error.message : 'Failed to reject done-deal');
    } finally {
      setIsRejectingDeal(false);
    }
  };

  const handleExtendNegotiation = async () => {
    if (!negotiationQuote) return;
    setNegotiationFetchError(null);
    setIsExtendingNegotiation(true);
    try {
      const response = await fetch(`/api/written-quotes/${negotiationQuote.id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extend negotiation');
      }

      await fetchNegotiationQuote();
    } catch (error) {
      console.error('[WrittenQuoteBuilderModal] Error extending negotiation:', error);
      setNegotiationFetchError(error instanceof Error ? error.message : 'Failed to extend negotiation');
    } finally {
      setIsExtendingNegotiation(false);
    }
  };

  const handleRequestAdminExtension = async () => {
    if (!negotiationQuote) return;
    setNegotiationFetchError(null);
    setIsRequestingAdminExtension(true);
    try {
      const response = await fetch(`/api/written-quotes/${negotiationQuote.id}/request-admin-extension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request admin extension');
      }

      await fetchNegotiationQuote();
    } catch (error) {
      console.error('[WrittenQuoteBuilderModal] Error requesting admin extension:', error);
      setNegotiationFetchError(error instanceof Error ? error.message : 'Failed to request admin extension');
    } finally {
      setIsRequestingAdminExtension(false);
    }
  };

  // Generate preview options based on current config
  const generatePreviewOptions = (): QuoteOption[] => {
    const { system, products, pricing, assumptions } = quoteDraft;
    
    // Prepare inputs for calculator
    const calculatorInputs: QuoteInputs = {
      systemSize_kW: system.systemSize,
      lineItems: pricing.lineItems.map(item => ({
        description: item.description,
        qty: item.qty,
        unitPrice: item.unitPrice,
        taxable: item.taxGst
      })),
      includeGst: true, // Always include GST, controlled per line item
      gstPercent: DEFAULT_ASSUMPTIONS.gstPercent,
      includeIncentive: true,
      incentiveAmount: (pricing.stc.eligible ? pricing.stc.stcCount * pricing.stc.stcPrice : 0) +
                       (pricing.vic.rebateEligible ? pricing.vic.rebateAmount : 0) +
                       pricing.discounts.reduce((acc, d) => acc + d.amount, 0),
      yield_kWh_per_kW_per_day: assumptions.yield_kWh_per_kW_per_day,
      selfConsumption: assumptions.selfConsumption,
      retailPrice: assumptions.retailPrice,
      feedInTariff: assumptions.feedInTariff,
      annualOpex: assumptions.annualOpex
    };

    // Calculate totals using the calculator
    const totals = calcQuoteTotals(calculatorInputs);
    const co2OffsetTonnesPerYear = system.systemSize * 1.5;

    return [
      {
        id: 'current',
        name: 'Balanced',
        label: 'Current Configuration',
        systemSize: system.systemSize,
        panels: `${products.panels.brand} ${products.panels.model} (${products.panels.qty} panels)`,
        inverter: `${products.inverter.brand} ${products.inverter.model}`,
        battery: products.battery
          ? `${products.battery.brand} ${products.battery.model} (${products.battery.usableKwh}kWh)`
          : undefined,
        addons: products.addons.length > 0 ? products.addons.map(a => a.label) : undefined,
        totalPrice: totals.total,
        pricePerWatt: totals.pricePerWatt,
        estimatedSavingsPerYear: totals.annualSavings,
        paybackYears: totals.paybackYears === 'N/A' ? Infinity : totals.paybackYears,
        warrantyYears: products.panels.performanceWarranty,
        co2OffsetTonnesPerYear
      }
    ];
  };

  // Effects
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    lastAutosavedSnapshotRef.current = null;
  }, [isOpen, lead?.id, mode]);

  // UI-only: prevent background scroll while modal is open
  useEffect(() => {
    if (!isOpen || !isMounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isMounted]);

  // Fetch full lead data from API (same pattern as BidEvaluationModal)
  useEffect(() => {
    if (!isOpen || !lead?.id) return;

    const fetchFullLeadData = async () => {
      setIsLoadingFullLead(true);
      setLeadFetchError(null);

      try {
        const response = await fetch(`/api/leads/${lead.id}`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Lead not found' : 'Failed to fetch lead details');
        }

        const data = await response.json();
        setFullLeadData(data.lead);
      } catch (error) {
        console.error('[WrittenQuoteBuilderModal] Error fetching lead:', error);
        setLeadFetchError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoadingFullLead(false);
      }
    };

    fetchFullLeadData();
  }, [isOpen, lead?.id]); // All dependencies included

  // Autosave effect (debounced): only save when meaningful data changes.
  useEffect(() => {
    if (!isOpen || !lead) return;

    const installerKey = session?.user?.id ?? 'unknown-installer';
    const draftKey =
      mode === 'quote'
        ? `writtenQuote:draft:${lead.id}:${installerKey}`
        : `quote:draft:${lead.id}:${installerKey}`;

    // Exclude `preview` and autosave-related `meta` fields to avoid save loops.
    const snapshot = JSON.stringify({
      mode: quoteDraft.mode,
      system: quoteDraft.system,
      roof: quoteDraft.roof,
      products: quoteDraft.products,
      pricing: quoteDraft.pricing,
      compliance: quoteDraft.compliance,
      assumptions: quoteDraft.assumptions
    });

    if (snapshot === lastAutosavedSnapshotRef.current) return;

    const saveDraft = () => {
      setIsSaving(true);
      
      const draftData = {
        ...quoteDraft,
        meta: {
          ...quoteDraft.meta,
          lastSavedAt: new Date().toISOString()
        }
      };

      localStorage.setItem(draftKey, JSON.stringify(draftData));

      lastAutosavedSnapshotRef.current = snapshot;
      setIsSaving(false);
      setLastSaved(new Date());
    };

    const timer = setTimeout(saveDraft, 750);
    return () => clearTimeout(timer);
  }, [isOpen, lead, mode, quoteDraft, session?.user?.id]);

  // Load draft on mount
  useEffect(() => {
    if (!isOpen || !lead) return;

    setDidRestoreDraft(false);

    const installerKey = session?.user?.id ?? 'unknown-installer';
    const draftKey =
      mode === 'quote'
        ? `writtenQuote:draft:${lead.id}:${installerKey}`
        : `quote:draft:${lead.id}:${installerKey}`;
    const draft = localStorage.getItem(draftKey);

    if (draft) {
      try {
        const data = JSON.parse(draft) as QuoteDraft;
        // Merge with current state to ensure all required properties exist
        setQuoteDraft(prev => ({
          ...prev,
          ...data,
          system: { ...prev.system, ...(data.system || {}) },
          roof: { ...prev.roof, ...(data.roof || {}) },
          products: { ...prev.products, ...(data.products || {}) },
          pricing: { ...prev.pricing, ...(data.pricing || {}) },
          compliance: { ...prev.compliance, ...(data.compliance || {}) },
          preview: { ...prev.preview, ...(data.preview || {}) },
          assumptions: { ...prev.assumptions, ...(data.assumptions || {}) },
          meta: { ...prev.meta, ...(data.meta || {}) }
        }));

        // Only show the restoration banner if we actually restored a previously-saved draft.
        setDidRestoreDraft(true);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [isOpen, lead, mode, session?.user?.id]);

  // Update preview options when relevant data changes (T020 - Real-time preview)
  useEffect(() => {
    const options = generatePreviewOptions();
    setQuoteDraft((prev) => ({
      ...prev,
      preview: { options }
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteDraft.system, quoteDraft.products, quoteDraft.pricing?.lineItems, quoteDraft.assumptions]);

  // Auto-sync addons to pricing engine line items (T018)
  useEffect(() => {
    const addonLineItems = quoteDraft.products.addons.map(addon => ({
      id: Date.now() + Math.random(), // Ensure unique ID
      category: 'Addons',
      description: addon.label,
      qty: addon.qty,
      unitPrice: addon.unitPrice,
      taxGst: true
    }));

    // Get non-addon line items
    const nonAddonItems = quoteDraft.pricing.lineItems.filter(item => item.category !== 'Addons');
    
    // Combine non-addon items with current addon items
    const updatedLineItems = [...nonAddonItems, ...addonLineItems];

    // Only update if line items changed
    if (JSON.stringify(quoteDraft.pricing.lineItems) !== JSON.stringify(updatedLineItems)) {
      setQuoteDraft((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          lineItems: updatedLineItems
        }
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteDraft.products.addons]);

  // Refresh negotiation state when modal opens / lead changes
  useEffect(() => {
    if (isOpen && lead?.id) {
      fetchNegotiationQuote();
    }
  }, [isOpen, lead?.id, fetchNegotiationQuote]);

  // Keep negotiation panel in sync while modal is open (lightweight polling).
  useEffect(() => {
    if (!isOpen || !lead?.id) return;
    const interval = window.setInterval(() => {
      fetchNegotiationQuote({ background: true });
    }, 3000);
    return () => window.clearInterval(interval);
  }, [isOpen, lead?.id, fetchNegotiationQuote]);

  // Handlers
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateSystem = (data: Partial<SystemSelectionData>) => {
    setQuoteDraft((prev) => ({
      ...prev,
      system: { ...prev.system, ...data }
    }));
  };

  const updateRoof = (data: Partial<RoofSiteDetailsData>) => {
    setQuoteDraft((prev) => ({
      ...prev,
      roof: { ...prev.roof, ...data }
    }));
  };

  const updateProducts = (data: Partial<ProductConfigurationData>) => {
    setQuoteDraft((prev) => ({
      ...prev,
      products: { ...prev.products, ...data }
    }));
  };

  const updatePricing = (data: Partial<PricingEngineData>) => {
    setQuoteDraft((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, ...data }
    }));
  };

  const updateCompliance = (data: Partial<ComplianceDocsData>) => {
    setQuoteDraft((prev) => ({
      ...prev,
      compliance: { ...prev.compliance, ...data }
    }));
  };

  const updatePreview = (data: Partial<CustomerPreviewData>) => {
    setQuoteDraft((prev) => ({
      ...prev,
      preview: { ...prev.preview, ...data }
    }));
  };

  const updateAssumptions = (data: Partial<QuoteDraft['assumptions']>) => {
    setQuoteDraft((prev) => ({
      ...prev,
      assumptions: { ...prev.assumptions, ...data }
    }));
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!lead) return;

    setIsSubmitting(true);

    try {
      // WrittenQuoteBuilderModal is used for WRITTEN_QUOTE leads.
      // For this modal, `mode="quote"` means submit a written quote via `/api/written-quotes`.
      if (mode === 'quote') {
        // Calculate totals from pricing data
        const subtotal = quoteDraft.pricing.lineItems.reduce(
          (acc, item) => acc + item.qty * item.unitPrice,
          0
        );
        const gstAmount = quoteDraft.pricing.lineItems
          .filter((item) => item.taxGst)
          .reduce((acc, item) => acc + item.qty * item.unitPrice * 0.1, 0);
        const stcDeduction = quoteDraft.pricing.stc.eligible
          ? quoteDraft.pricing.stc.stcCount * quoteDraft.pricing.stc.stcPrice
          : 0;
        const vicDeduction = quoteDraft.pricing.vic.rebateEligible
          ? quoteDraft.pricing.vic.rebateAmount
          : 0;
        const totalDiscounts = quoteDraft.pricing.discounts.reduce(
          (acc, d) => acc + d.amount,
          0
        );
        const totalIncentives = stcDeduction + vicDeduction + totalDiscounts;
        const finalTotal = subtotal + gstAmount - totalIncentives;

        const financialTotals = calcQuoteTotals({
          systemSize_kW: quoteDraft.system.systemSize,
          lineItems: quoteDraft.pricing.lineItems.map(item => ({
            description: item.description,
            qty: item.qty,
            unitPrice: item.unitPrice,
            taxable: item.taxGst
          })),
          includeGst: true,
          gstPercent: DEFAULT_ASSUMPTIONS.gstPercent,
          includeIncentive: true,
          incentiveAmount: totalIncentives,
          yield_kWh_per_kW_per_day: quoteDraft.assumptions.yield_kWh_per_kW_per_day,
          selfConsumption: quoteDraft.assumptions.selfConsumption,
          retailPrice: quoteDraft.assumptions.retailPrice,
          feedInTariff: quoteDraft.assumptions.feedInTariff,
          annualOpex: quoteDraft.assumptions.annualOpex
        });

        // Map QuoteDraft to comprehensive Written Quote payload (Phase 13W - Full JSON fields)
        const writtenQuotePayload = {
          leadId: String(lead.id),
          // API contract: `amount` is the base amount; server computes GST and finalTotal.
          amount: subtotal,
          capacityOffer: quoteDraft.system.systemSize,
          expectedInstallDate: null, // TODO: Add to UI if needed
          notes: quoteDraft.roof.notes || null,
          
          // Legacy equipment details (backward compatible)
          panelBrand: quoteDraft.products.panels.brand || null,
          inverterBrand: quoteDraft.products.inverter.brand || null,
          batteryBrand: quoteDraft.products.battery?.brand || null,
          batteryCapacity: quoteDraft.products.battery?.usableKwh || null,
          
          // Financial details
          includeGst: true,
          gstPercent: 10.0,
          gstAmount,
          includeIncentive: totalIncentives > 0,
          incentiveAmount: totalIncentives,
          finalTotal,
          
          // Phase 13W - Comprehensive JSON fields for homeowner comparison
          systemData: {
            capacityKw: quoteDraft.system.systemSize,
            systemType: quoteDraft.system.systemType,
            solarPanelsArray: [{
              quantity: quoteDraft.products.panels.qty,
              wattage: quoteDraft.products.panels.wattage,
              totalKw: quoteDraft.system.systemSize
            }]
          },
          
          productsData: {
            solarPanels: [{
              brand: quoteDraft.products.panels.brand,
              model: quoteDraft.products.panels.model || 'Standard',
              wattage: quoteDraft.products.panels.wattage,
              quantity: quoteDraft.products.panels.qty,
              efficiency: quoteDraft.products.panels.efficiency || 20,
              warranty: `${quoteDraft.products.panels.performanceWarranty || 25} years`
            }],
            inverter: {
              brand: quoteDraft.products.inverter.brand,
              model: quoteDraft.products.inverter.model || 'Standard',
              capacityKw: quoteDraft.products.inverter.capacityKw,
              type: quoteDraft.products.inverter.type,
              warranty: `${quoteDraft.products.inverter.warranty || 10} years`,
              phaseType: quoteDraft.roof.phaseType
            },
            battery: quoteDraft.products.battery ? {
              brand: quoteDraft.products.battery.brand,
              model: quoteDraft.products.battery.model || 'Standard',
              capacityKwh: quoteDraft.products.battery.usableKwh,
              warranty: `${quoteDraft.products.battery.warranty || 10} years`,
              chemistry: 'lithium-ion'
            } : undefined
          },
          
          lineItems: quoteDraft.pricing.lineItems.map(item => ({
            category: item.category,
            description: item.description,
            quantity: item.qty,
            unitPrice: item.unitPrice,
            totalPrice: item.qty * item.unitPrice,
            gstIncluded: item.taxGst
          })),
          
          assumptions: {
            feedInTariffCentsKwh: quoteDraft.assumptions.feedInTariff * 100,
            dailyUsageKwh: (quoteDraft.system.systemSize * quoteDraft.assumptions.yield_kWh_per_kW_per_day) || 0,
            solarOffsetPercent: quoteDraft.assumptions.selfConsumption * 100,
            annualPriceIncrease: quoteDraft.assumptions.escalationPercentPerYear,
            paybackYears: 7,
            systemLifespanYears: 25,
            notes: ''
          },
          
          roofData: {
            roofType: quoteDraft.roof.roofType,
            pitchDeg: quoteDraft.roof.pitchDeg,
            arrays: quoteDraft.roof.arrays,
            orientations: quoteDraft.roof.orientations,
            shadingLevel: quoteDraft.roof.shadingLevel,
            phaseType: quoteDraft.roof.phaseType,
            switchboardUpgrade: quoteDraft.roof.switchboardUpgrade,
            smartMeterRequired: quoteDraft.roof.smartMeterRequired,
            distanceToSwitchboardM: quoteDraft.roof.distanceToSwitchboardM,
            notes: quoteDraft.roof.notes,
            photos: [] // TODO: Add photo upload support
          },
          
          calculations: {
            subtotal: subtotal,
            gstPercent: 10.0,
            gstAmount: gstAmount,
            includeIncentive: quoteDraft.pricing.stc.eligible,
            incentiveAmount: totalIncentives,
            finalTotal: finalTotal,
            pricePerWatt: subtotal / (quoteDraft.system.systemSize * 1000),
            estimatedAnnualSavings: Math.max(0, Number(financialTotals.annualSavings) || 0),
            paybackYears:
              typeof financialTotals.paybackYears === 'number' &&
              isFinite(financialTotals.paybackYears) &&
              financialTotals.paybackYears > 0
                ? financialTotals.paybackYears
                : 0
          }
        };

        // Call written quote submission API
        const response = await fetch('/api/written-quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(writtenQuotePayload)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to Submit Written Quote');
        }

        // Clear draft on success
        const installerKey = session?.user?.id ?? 'unknown-installer';
        const draftKey = `writtenQuote:draft:${lead.id}:${installerKey}`;
        localStorage.removeItem(draftKey);

        // Show success message
        alert(`Written Quote submitted successfully! Quote ID: ${data.writtenQuoteId}`);
        onClose();
      } else {
        // For quotes, use the existing onSubmitQuote handler
        const quoteData = {
          ...quoteDraft,
          leadId: lead.id
        };
        
        const success = await onSubmitQuote(String(lead.id), quoteData);
        
        if (success) {
          const installerKey = session?.user?.id ?? 'unknown-installer';
          const draftKey = `quote:draft:${lead.id}:${installerKey}`;
          localStorage.removeItem(draftKey);
          onClose();
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply preset
  const applyPreset = (presetName: string) => {
    const preset = PRESET_BUNDLES.find((p) => p.name === presetName);
    if (!preset) return;

    setQuoteDraft((prev) => ({
      ...prev,
      system: {
        ...prev.system,
        systemType: preset.systemType,
        systemSize: preset.systemSize
      },
      products: {
        panels: { ...preset.panels, datasheetKey: undefined },
        inverter: { ...preset.inverter, datasheetKey: undefined },
        battery: preset.battery
          ? { ...preset.battery, datasheetKey: undefined, backupCircuitRequired: false }
          : undefined,
        addons: []
      },
      pricing: {
        ...prev.pricing,
        lineItems: preset.lineItems.map((item, idx) => ({
          ...item,
          id: Date.now() + idx,
          taxGst: item.tax
        }))
      }
    }));
  };

  if (!isOpen || !lead || !isMounted) return null;

  // Restoration banner should be based on actual restore, not existence of current-session autosaves.
  const hasDraft = didRestoreDraft;

  // Calculate budget hint banner visibility
  const budgetRange = lead.quoteData?.budgetRange 
    ? parseBudgetRange(lead.quoteData.budgetRange) 
    : null;
  const currentTotals = calcQuoteTotals({
    systemSize_kW: quoteDraft.system.systemSize,
    lineItems: quoteDraft.pricing.lineItems.map(item => ({
      description: item.description,
      qty: item.qty,
      unitPrice: item.unitPrice,
      taxable: item.taxGst
    })),
    includeGst: true,
    gstPercent: DEFAULT_ASSUMPTIONS.gstPercent,
    includeIncentive: true,
    incentiveAmount: (quoteDraft.pricing.stc.eligible ? quoteDraft.pricing.stc.stcCount * quoteDraft.pricing.stc.stcPrice : 0),
    yield_kWh_per_kW_per_day: quoteDraft.assumptions.yield_kWh_per_kW_per_day,
    selfConsumption: quoteDraft.assumptions.selfConsumption,
    retailPrice: quoteDraft.assumptions.retailPrice,
    feedInTariff: quoteDraft.assumptions.feedInTariff,
    annualOpex: quoteDraft.assumptions.annualOpex
  });
  const showBudgetHint = !isBudgetHintDismissed && 
    budgetRange && 
    currentTotals.total > budgetRange.max * 1.1; // Show if >10% over budget

  return createPortal(
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1400] flex items-center justify-center p-0 md:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-background relative w-full h-full md:max-w-[98vw] md:max-h-[98vh] md:rounded-2xl flex flex-col animate-scale-in shadow-neu-outset-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Draft Restoration Banner */}
        {hasDraft && (
          <div className="flex-shrink-0 bg-warning/10 border-b border-warning px-4 py-2 flex items-center justify-center gap-2">
            <FileText className="h-4 w-4 text-warning" />
            <span className="text-body-small text-warning">
              Draft restored from previous session (v{quoteDraft.meta?.version || 1})
            </span>
          </div>
        )}

        {/* Budget Hint Banner */}
        {showBudgetHint && (
          <div className="flex-shrink-0 bg-accent/10 border-b border-accent px-4 py-2 flex items-center justify-between gap-2" data-testid="budget-exceed-banner">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-accent" />
              <span className="text-body-small text-accent">
                Current total (${currentTotals.total.toLocaleString()}) exceeds homeowner budget (${budgetRange?.max.toLocaleString()}). 
                Consider adjusting system size or components.
              </span>
            </div>
            <Button
              onClick={() => setIsBudgetHintDismissed(true)}
              variant="minimal"
              className="p-1 text-accent hover:text-accent/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Header */}
        <header className="flex-shrink-0 p-4 border-b border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2
                  className="text-heading-4 text-foreground"
                  data-testid={mode === 'quote' ? 'written-quote-builder-heading' : 'quote-builder-heading'}
                >
                  {mode === 'quote' ? 'Written Quote Builder' : `Quote Builder: ${lead.name}`}
                </h2>
                <div className="flex items-center gap-4 text-caption text-muted-foreground mt-1">
                  <span>Lead #{lead.id}</span>
                  <span>{lead.location}</span>
                  <div className="flex items-center gap-1.5">
                    Status: <span className="text-warning">Draft</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5">
                    {isSaving
                      ? 'Saving...'
                      : lastSaved
                      ? `Saved at ${lastSaved.toLocaleTimeString()}`
                      : 'Unsaved changes'}
                  </div>
                </div>
                <p className="text-caption text-info mt-2">
                  📝 Note: Homeowner will review & negotiate your quote via their dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <Button
                onClick={() => setIsBidEvaluationOpen(true)}
                variant="secondary"
                className="flex-1 md:flex-initial px-4 py-2"
              >
                <Info className="h-4 w-4" /> Lead Details
              </Button>
              <Button
                onClick={() => setIsPreviewModalOpen(true)}
                variant="secondary"
                className="flex-1 md:flex-initial px-4 py-2"
              >
                <Eye className="h-4 w-4" /> Preview
              </Button>
              <Button
                onClick={() => alert('Save Draft clicked')}
                variant="minimal"
                className="flex-1 md:flex-initial px-4 py-2"
              >
                <Save className="h-4 w-4" /> Save Draft
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                variant="primary" 
                className="flex-1 md:flex-initial px-4 py-2"
              >
                <Send className="h-4 w-4" /> 
                {isSubmitting 
                  ? 'Submitting...' 
                  : mode === 'quote' ? 'Submit Written Quote' : 'Send Quote'}
              </Button>
              <Button
                onClick={onClose}
                variant="minimal"
                className="hidden md:flex p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preset Quick Apply */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-caption text-muted-foreground self-center">Quick Presets:</span>
            {PRESET_BUNDLES.map((preset) => (
              <Button
                key={preset.name}
                onClick={() => applyPreset(preset.name)}
                variant="secondary"
                className="text-body-small px-4 py-1.5"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </header>

        {/* Main Content - Two Column Layout */}
        <div className="flex-grow overflow-hidden flex gap-4 p-4 md:p-6">
          {/* Left Column - 70% - Form Sections */}
          <div className="w-[70%] overflow-y-auto pr-2 space-y-6">
            {/* Homeowner Requirements (Phase 12 - T112) */}
            <HomeownerContext meta={quoteDraft.meta} />

            {/* System Selection */}
            <CollapsibleSection
              title="System Selection"
              expanded={expandedSections.system}
              onToggle={() => toggleSection('system')}
            >
              <SystemSelection
                systemType={quoteDraft.system.systemType}
                systemSize={quoteDraft.system.systemSize}
                projectType={quoteDraft.system.projectType}
                desiredPriceRange={quoteDraft.system.desiredPriceRange}
                prefilledFields={quoteDraft.meta?.prefilledFields || []}
                onUpdate={updateSystem}
              />
            </CollapsibleSection>

            {/* Roof & Site Details */}
            <CollapsibleSection
              title="Roof & Site Details"
              expanded={expandedSections.roof}
              onToggle={() => toggleSection('roof')}
            >
              <RoofSiteDetails
                roofType={quoteDraft.roof.roofType}
                pitchDeg={quoteDraft.roof.pitchDeg}
                arrays={quoteDraft.roof.arrays}
                orientations={quoteDraft.roof.orientations}
                shadingLevel={quoteDraft.roof.shadingLevel}
                phaseType={quoteDraft.roof.phaseType}
                switchboardUpgrade={quoteDraft.roof.switchboardUpgrade}
                smartMeterRequired={quoteDraft.roof.smartMeterRequired}
                distanceToSwitchboardM={quoteDraft.roof.distanceToSwitchboardM}
                notes={quoteDraft.roof.notes}
                photos={quoteDraft.roof.photos}
                arrayLayoutNotes={quoteDraft.roof.arrayLayoutNotes}
                roofAccessNotes={quoteDraft.roof.roofAccessNotes}
                structuralNotes={quoteDraft.roof.structuralNotes}
                mountingSystemPreferred={quoteDraft.roof.mountingSystemPreferred}
                conduitRunComplexity={quoteDraft.roof.conduitRunComplexity}
                inverterLocationNotes={quoteDraft.roof.inverterLocationNotes}
                prefilledFields={quoteDraft.meta?.prefilledFields || []}
                onUpdate={updateRoof}
              />
            </CollapsibleSection>

            {/* Product Configuration */}
            <CollapsibleSection
              title="Product Configuration"
              expanded={expandedSections.products}
              onToggle={() => toggleSection('products')}
            >
              <ProductConfiguration
                panels={quoteDraft.products.panels}
                inverter={quoteDraft.products.inverter}
                battery={quoteDraft.products.battery}
                addons={quoteDraft.products.addons}
                onUpdate={updateProducts}
              />
            </CollapsibleSection>

            {/* Pricing Engine */}
            <CollapsibleSection
              title="Pricing Engine"
              expanded={expandedSections.pricing}
              onToggle={() => toggleSection('pricing')}
            >
              <PricingEngine
                lineItems={quoteDraft.pricing.lineItems}
                stc={quoteDraft.pricing.stc}
                vic={quoteDraft.pricing.vic}
                discounts={quoteDraft.pricing.discounts}
                installerCostMode={quoteDraft.pricing.installerCostMode}
                systemSize={quoteDraft.system.systemSize}
                panelWattage={quoteDraft.products.panels.wattage}
                assumptions={quoteDraft.assumptions}
                prefilledFields={quoteDraft.meta?.prefilledFields || []}
                onUpdate={updatePricing}
                onUpdateAssumptions={updateAssumptions}
              />
            </CollapsibleSection>

            {/* Compliance Documents */}
            <CollapsibleSection
              title="Compliance Documents"
              expanded={expandedSections.compliance}
              onToggle={() => toggleSection('compliance')}
            >
              <ComplianceDocs
                docs={quoteDraft.compliance.docs}
                cecAccreditation={quoteDraft.compliance.cecAccreditation}
                electricalLicence={quoteDraft.compliance.electricalLicence}
                insurance={quoteDraft.compliance.insurance}
                onUpdate={updateCompliance}
              />
            </CollapsibleSection>
          </div>

          {/* Right Column - 30% - Customer Preview & Lead Details (Sticky) */}
          <div className="w-[30%] overflow-y-auto pl-2">
            <div className="sticky top-0 space-y-6">
                {/* Negotiation Panel (Phase 13W) */}
                <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-heading-4 text-foreground">Negotiation</h3>
                    {isRefreshingNegotiation && negotiationQuote ? (
                      <span className="text-caption text-muted-foreground">Updating…</span>
                    ) : null}
                  </div>

                  {isLoadingNegotiation && !negotiationQuote ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <p className="text-body-small text-muted-foreground">Loading negotiation status...</p>
                    </div>
                  ) : !negotiationQuote ? (
                    <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                      <p className="text-body-small text-info">
                        No negotiation yet. Submit your written quote to start.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {negotiationFetchError ? (
                        <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                          <p className="text-body-small text-error">{negotiationFetchError}</p>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-body-small text-muted-foreground">Status</span>
                          <span className="text-body-small text-foreground">
                            {getNegotiationStatusLabel(negotiationQuote.negotiationStatus)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body-small text-muted-foreground">
                            {negotiationQuote.negotiationStatus === 'PENDING_ACCEPTANCE' ? 'Deal price' : 'Last offer'}
                          </span>
                          <span className="text-body-small text-foreground">
                            ${getLastOfferAmount(negotiationQuote).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body-small text-muted-foreground">Live status</span>
                          <span className={`text-body-small ${isBothPartiesOnline ? 'text-success' : 'text-muted-foreground'}`}>
                            {isBothPartiesOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body-small text-muted-foreground">Deadline</span>
                          <span className="text-body-small text-foreground">
                            {(negotiationQuote as any).negotiationDeadlineAt
                              ? formatDateTime((negotiationQuote as any).negotiationDeadlineAt)
                              : '—'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-label text-foreground">History</div>
                        <div className="space-y-2">
                          {getNegotiationTimeline(negotiationQuote).map((evt, idx) => (
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

                      {negotiationQuote.negotiationStatus === 'NEGOTIATION_EXPIRED' || !!(negotiationQuote as any).negotiationExpiredAt ? (
                        <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                          <p className="text-body-small text-error">Negotiation has expired and is now closed.</p>
                        </div>
                      ) : negotiationQuote.negotiationStatus === 'PENDING_ACCEPTANCE' ? (
                        (() => {
                          const userId = session?.user?.id;
                          const proposerId = (negotiationQuote as any)?.agreedBy || null;
                          const isProposer = !!userId && !!proposerId && userId === proposerId;

                          if (isProposer) {
                            return (
                              <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                                <p className="text-body-small text-info">Done deal requested. Waiting for homeowner to accept or reject.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-3">
                              <div className="text-label text-foreground">Done deal requested</div>
                              <Button
                                variant="secondary"
                                onClick={handleRejectDeal}
                                disabled={isRejectingDeal}
                                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
                              >
                                {isRejectingDeal ? 'Rejecting...' : 'Reject Deal'}
                              </Button>
                              <Button
                                variant="primary"
                                onClick={handleAcceptDeal}
                                disabled={isAcceptingDeal}
                                className="w-full"
                              >
                                {isAcceptingDeal ? 'Accepting...' : 'Accept Deal'}
                              </Button>
                            </div>
                          );
                        })()
                      ) : negotiationQuote.negotiationStatus !== 'AGREED' ? (
                        <div className="space-y-3">
                          <div className="text-label text-foreground">Revise your offer</div>
                          <input
                            value={revisedAmount}
                            onChange={(e) => setRevisedAmount(e.target.value)}
                            type="number"
                            min={0}
                            inputMode="numeric"
                            placeholder="Enter revised amount"
                            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                          />
                          <Button
                            variant="secondary"
                            onClick={handleReviseOffer}
                            disabled={isSubmittingRevision}
                            className="w-full"
                          >
                            {isSubmittingRevision ? 'Updating...' : 'Send Updated Offer'}
                          </Button>

                          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border">
                            <Button
                              variant="secondary"
                              onClick={handleExtendNegotiation}
                              disabled={
                                isExtendingNegotiation ||
                                (negotiationQuote as any).installerExtensionUsed
                              }
                              className="w-full"
                            >
                              {isExtendingNegotiation
                                ? 'Extending...'
                                : (negotiationQuote as any).installerExtensionUsed
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

                          <Button
                            variant="primary"
                            onClick={handleDoneDeal}
                            disabled={isFinalizingDeal}
                            className="w-full"
                          >
                            {isFinalizingDeal ? 'Requesting...' : 'Done deal'}
                          </Button>
                        </div>
                      ) : null}

                      {negotiationQuote.negotiationStatus === 'AGREED' && (
                        <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                          <p className="text-body-small text-success">Negotiation finalized.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              {/* Customer Preview - Collapsible */}
              <CollapsibleSection
                title="Customer Preview"
                expanded={expandedSections.customerPreview}
                onToggle={() => toggleSection('customerPreview')}
              >
                <CustomerPreview
                  options={quoteDraft.preview.options}
                  systemSize={quoteDraft.system.systemSize}
                  onUpdate={updatePreview}
                />

                {/* Financial Projections Graph */}
                {quoteDraft.preview.options.length > 0 && (
                  <div className="mt-4">
                    <SavingsChart
                      finalPrice={quoteDraft.preview.options[0].totalPrice}
                      annualSavings={quoteDraft.preview.options[0].estimatedSavingsPerYear}
                      currentAnnualBill={quoteDraft.preview.options[0].estimatedSavingsPerYear + (quoteDraft.preview.options[0].estimatedSavingsPerYear * 0.3)}
                    />
                  </div>
                )}
              </CollapsibleSection>

              {/* Lead Details - InstantQuote Data - Collapsible */}
              {(fullLeadData?.quoteData || lead?.quoteData) && (
                <CollapsibleSection
                  title="Lead Details - InstantQuote Data"
                  expanded={expandedSections.leadDetails}
                  onToggle={() => toggleSection('leadDetails')}
                >
                  {isLoadingFullLead ? (
                    <div className="bg-surface rounded-xl p-6 text-center">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                      </div>
                      <p className="text-body-small text-muted-foreground mt-4">
                        Loading lead details...
                      </p>
                    </div>
                  ) : leadFetchError ? (
                    <div className="bg-error/10 border border-error/20 rounded-xl p-4">
                      <p className="text-body-small text-error">
                        Error loading lead details: {leadFetchError}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <HomeownerInstantQuoteDetails 
                        quoteData={fullLeadData?.quoteData || lead?.quoteData!}
                        batteryRequired={fullLeadData?.batteryRequired || lead?.batteryRequired}
                      />
                      <LeadTechnicalDetails 
                        lead={fullLeadData || lead} 
                        isPurchased={!!(lead.status === 'PURCHASED' && lead.purchasedAt)} 
                      />
                      <InstantQuoteResult quoteData={fullLeadData?.quoteData || lead?.quoteData!} />
                    </div>
                  )}
                </CollapsibleSection>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bid Evaluation Modal */}
      {lead && (
        <BidEvaluationModal
          isOpen={isBidEvaluationOpen}
          onClose={() => setIsBidEvaluationOpen(false)}
          leadId={String(lead.id)}
          bids={[]}
          yourBidId={undefined}
          isPurchased={!!(lead.status === 'PURCHASED' && lead.purchasedAt)} // T13I-4: Pass purchase status
        />
      )}

      {/* Homeowner Preview Modal */}
      {quoteDraft.preview.options.length > 0 && (
        <HomeownerPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          onEdit={() => {
            setIsPreviewModalOpen(false);
            // Modal closes and user continues editing
          }}
          onConfirmSubmit={handleSubmit}
          quoteData={{
            systemSize: quoteDraft.system.systemSize,
            total: quoteDraft.preview.options[0].totalPrice,
            pricePerWatt: quoteDraft.preview.options[0].pricePerWatt,
            subtotal: quoteDraft.preview.options[0].totalPrice - (quoteDraft.preview.options[0].totalPrice * 0.1), // Estimate
            gst: quoteDraft.preview.options[0].totalPrice * 0.1,
            incentives: (quoteDraft.pricing.stc.eligible ? quoteDraft.pricing.stc.stcCount * quoteDraft.pricing.stc.stcPrice : 0) +
                       (quoteDraft.pricing.vic.rebateEligible ? quoteDraft.pricing.vic.rebateAmount : 0),
            annualProduction: quoteDraft.system.systemSize * quoteDraft.assumptions.yield_kWh_per_kW_per_day * 365,
            annualSavings: quoteDraft.preview.options[0].estimatedSavingsPerYear,
            paybackYears: quoteDraft.preview.options[0].paybackYears,
            panelBrand: quoteDraft.products.panels.brand,
            panelModel: quoteDraft.products.panels.model,
            panelWattage: quoteDraft.products.panels.wattage,
            panelQty: quoteDraft.products.panels.qty,
            panelWarranty: quoteDraft.products.panels.performanceWarranty,
            inverterBrand: quoteDraft.products.inverter.brand,
            inverterModel: quoteDraft.products.inverter.model,
            inverterCapacity: quoteDraft.products.inverter.capacityKw,
            inverterWarranty: quoteDraft.products.inverter.warranty,
            batteryBrand: quoteDraft.products.battery?.brand,
            batteryModel: quoteDraft.products.battery?.model,
            batteryCapacity: quoteDraft.products.battery?.usableKwh,
            batteryWarranty: quoteDraft.products.battery?.warranty,
            lineItems: quoteDraft.pricing.lineItems.map(item => ({
              description: item.description,
              qty: item.qty,
              unitPrice: item.unitPrice,
              category: item.category
            })),
            addons: quoteDraft.products.addons.map(addon => ({
              label: addon.label,
              price: addon.qty * addon.unitPrice
            }))
          }}
          installerInfo={{
            name: 'Installer Name',
            cecAccreditation: quoteDraft.compliance.cecAccreditation || 'Provided',
            electricalLicence: quoteDraft.compliance.electricalLicence || 'Provided'
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  , document.body);
};

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
        className="w-full flex items-center justify-between px-6 py-3 bg-background-alt rounded-lg hover:bg-primary/5 transition-colors"
      >
        <span className="text-heading-6 text-foreground">{title}</span>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {expanded && <div className="animate-fade-in">{children}</div>}
    </div>
  );
};

export default WrittenQuoteBuilderModal;
