'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LeadStatus as LeadStatusEnum } from '@prisma/client';
import { useTheme, type Theme } from '@/components/ThemeProvider';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { toast } from 'sonner';
import HomeownerBottomNavBar from '@/components/HomeownerBottomNavBar';
import HomeownerMobileSidebarMenu from '@/components/HomeownerMobileSidebarMenu';
import NewQuoteRequestModal from '@/components/NewQuoteRequestModal';
import SimplifiedQuoteFormModal from '@/components/homeowner/SimplifiedQuoteFormModal';
import QuoteOptionsModal from '@/components/QuoteOptionsModal';
import QuoteTypeDistributionModal from '@/components/homeowner/QuoteTypeDistributionModal';
import HomeownerBiddingReviewModal from '@/components/homeowner/HomeownerBiddingReviewModal'; // Phase 3: Bidding review
import HomeownersInfoForm from '@/components/HomeownersInfoForm'; // ✅ Phase 12: Reuse guest flow component for consistency
import MessagingModal from '@/components/MessagingModal';
import ProfileManagement from '@/components/ProfileManagement';
import type { LeadData } from '@/types/lead';
import VerifiedBadge from '@/components/VerifiedBadge';
import RequestMoreQuotesCTA from '@/components/homeowner/RequestMoreQuotesCTA';
import LeadLimitReachedModal from '@/components/homeowner/LeadLimitReachedModal';
import ContactVerificationModal from '@/components/homeowner/ContactVerificationModal';
import OTPVerificationModal from '@/components/OTPVerificationModal';
import FirstQuoteSuccessModal from '@/components/homeowner/FirstQuoteSuccessModal';
import LeadEditModal from '@/components/homeowner/LeadEditModal';
import LeadPreviewModal from '@/components/homeowner/LeadPreviewModal';
import { LiveCountdownBar } from '@/components/LiveCountdownBar';
import Button from '@/components/ui/button';
import HomeownerSidebar from '@/components/homeowner/HomeownerSidebar';
import { HomeownerDashboardHeader } from '@/components/homeowner/HomeownerDashboardHeader';

// --- Icon Components ---
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const LayoutDashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>;
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${className || ''}`}><path d="m6 9 6 6 6-6"/></svg>;
const PhoneCallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const FileSignatureIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M12 18h.01"/><path d="M16 12.5a2.5 2.5 0 0 0-5 0"/><path d="m15 18-2-2-2 2"/></svg>;
const GavelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m14 12-8.5 8.5"/><path d="m18 16 1-1"/><path d="m17 11 4.3 4.3c.6.6.6 1.5 0 2.1l-2.1 2.1c-.6.6-1.5.6-2.1 0L12.8 16"/><path d="m3 3 8.5 8.5"/><path d="m13 7 4-4"/><path d="m14 11-4 4"/></svg>;
const MessageSquareIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5"}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>;
const HelpCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const HomeIconNav = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>;
const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5"}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const Home = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const Building = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>;

// Import helper functions (client-safe utilities)
import { canCancelLead } from '@/lib/utils/lead-helpers';

// Phase 20: Helper function to get property type display info (Residential/Commercial)
const getPropertyTypeInfo = (propertyType: string): { icon: React.ReactNode; label: string; color: string } => {
  if (propertyType === 'commercial') {
    return {
      icon: <Building className="h-4 w-4" />,
      label: 'Commercial',
      color: 'text-primary'
    };
  }
  return {
    icon: <Home className="h-4 w-4" />,
    label: 'Residential',
    color: 'text-success'
  };
};



// NavItem Component - Neumorphic collapsible design
const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  isActive: boolean; 
  onClick: () => void; 
  badgeCount?: number; 
  isCollapsed?: boolean;
}> = ({ icon, title, isActive, onClick, badgeCount, isCollapsed = false }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg transition-colors duration-300 text-body-small group relative ${
    isActive 
      ? 'bg-primary/10 text-primary shadow-neu-inset' 
      : 'text-muted-foreground hover:bg-surface hover:text-primary hover:shadow-neu-outset-sm'
    }`}
    title={isCollapsed ? title : undefined}
  >
    <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
      <span className={isCollapsed ? '' : 'flex-shrink-0'}>{icon}</span>
      {!isCollapsed && <span className="truncate">{title}</span>}
    </div>
    {!isCollapsed && badgeCount && badgeCount > 0 && (
      <span
        className="bg-error text-error-foreground text-caption w-5 h-5 rounded-full flex items-center justify-center shadow-neu-outset-sm"
      >
        {badgeCount}
      </span>
    )}
  </button>
);

type QuoteTypeOption = 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING';

type LeadStatus = (typeof LeadStatusEnum)[keyof typeof LeadStatusEnum];

interface RecentLeadSummary {
  id: string;
  quoteType: QuoteTypeOption;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  leadPrice: number | null;
  purchaseStatus: string | null;
  purchasedAt: string | null;
  visibility: string;
  quoteData: Record<string, unknown> | null;
  phoneVerified: boolean; // Phase 4.13: Verification status
  expiresAt: string | null; // Countdown timer feature
  phoneNumber: string | null; // Lead phone number (may differ from user phone)
  // Phase 1: Add all form fields for LeadEditModal prefill
  energyBill: number;
  billType: string;
  address: string | null; // Maps to propertyAddress in form
  postcode: string; // Maps to propertyPostcode in form
  location: string;
  state: string;
  propertyType: string;
  roofType: string;
  budgetRange: string;
  desiredOffset: number;
  batteryRequired: boolean;
  batteryCapacity: string | null;
  timeframe: string | null;
  additionalNotes: string | null;
}

interface HomeownerDashboardSummary {
  totalSubmitted: number;
  quoteLimit: number;
  remainingLeadAllowance: number;
  phoneVerified: boolean;
  phoneNumber: string | null; // Phase 12: Phone from most recent lead for verification modal prefill
  userPhone: string | null; // User's actual phone number for sync detection
  requiresVerification: boolean;
  verificationThreshold: number;
  lastSubmissionAt: string | null;
  statusBreakdown: Record<LeadStatus, number>;
  recentLeads: RecentLeadSummary[];
  biddingLeadsSubmitted: number; // T263: BIDDING quota usage count (0 or 1)
  biddingQuotaRemaining: number; // T263: BIDDING quota remaining (0 or 1)
}

interface PendingOTPState {
  phoneNumber: string;
  verificationId: string;
  expiresAt: Date;
  remainingAttempts: number;
}

const QUOTE_TYPE_LABELS: Record<QuoteTypeOption, string> = {
  CALL_VISIT: 'Call or Site Visit',
  WRITTEN_QUOTE: 'Written Quote',
  BIDDING: 'Competitive Bidding',
};

const STATUS_LABELS: Record<LeadStatus, { label: string | ((lead?: { quoteType?: string }) => string); description: string; accent: string }> = {
  [LeadStatusEnum.DRAFT]: {
    label: 'Draft',
    description: 'Awaiting submission',
      accent: 'bg-background border border-border text-foreground',
  },
  [LeadStatusEnum.PENDING_PHONE]: {
    label: 'Needs Verification',
    description: 'Verify your phone to continue',
    accent: 'bg-warning/10 text-warning border border-warning/30',
  },
  [LeadStatusEnum.PENDING_APPROVAL]: {
    label: 'Awaiting Review',
    description: 'Admin is reviewing your lead',
  accent: '',
  },
  [LeadStatusEnum.APPROVED]: {
    label: 'Approved',
    description: 'Visible to installers',
    accent: 'bg-success/10 text-success border border-success/30',
  },
  [LeadStatusEnum.PURCHASED]: {
    // T290: Conditional label based on quote type
    // BIDDING leads: "Bid Awarded" (homeowner selected winner)
    // Other types: "Responded by Installer" (generic purchase)
    label: (lead?: { quoteType?: string }) => lead?.quoteType === 'BIDDING' ? 'Bid Awarded' : 'Responded by Installer',
    description: 'An installer has responded to your request',
    accent: 'bg-primary/10 text-primary border border-primary/30',
  },
  [LeadStatusEnum.QUOTED]: {
    label: 'Quotes Received',
    description: 'Installers have responded',
    accent: 'bg-secondary/10 text-secondary border border-secondary/30',
  },
  [LeadStatusEnum.ACCEPTED]: {
    label: 'Accepted',
    description: 'You selected a winning quote',
    accent: 'bg-success text-success-foreground border border-success',
  },
  [LeadStatusEnum.REJECTED]: {
    label: 'Rejected',
    description: 'Marked as not suitable',
    accent: 'bg-error/10 text-error border border-error/30',
  },
  [LeadStatusEnum.EXPIRED]: {
    label: 'Expired',
    description: 'No activity for 30 days',
    accent: 'bg-background border border-border text-muted-foreground',
  },
  [LeadStatusEnum.CANCELLED]: {
    label: 'Cancelled',
    description: 'Removed by homeowner',
    accent: 'bg-background border border-border text-muted-foreground',
  },
  [LeadStatusEnum.FLAGGED]: {
    label: 'Flagged',
    description: 'Pending admin review',
    accent: 'bg-warning text-warning-foreground border border-warning',
  },
};

const formatCurrency = (value: number | null | undefined): string => {
  if (typeof value !== 'number') return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    return `$${value.toFixed(0)}`;
  }
};

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeTime = (value: string | null | undefined): string => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(Math.round(diffMinutes), 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, 'day');
  }

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) {
    return rtf.format(diffMonths, 'month');
  }

  const diffYears = Math.round(diffMonths / 12);
  return rtf.format(diffYears, 'year');
};

// Phase 4.11: Helper to get quote type icon
const getQuoteTypeIcon = (quoteType: QuoteTypeOption) => {
  switch (quoteType) {
    case 'CALL_VISIT':
      return <PhoneCallIcon />;
    case 'WRITTEN_QUOTE':
      return <FileSignatureIcon />;
    case 'BIDDING':
      return <TrophyIcon />;
    default:
      return null;
  }
};

// Collapse Icon Component
const CollapseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ExpandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

// DashboardHeader component now extracted to src/components/homeowner/HomeownerDashboardHeader.tsx

// PlaceholderContent Component
const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex items-center justify-center h-full min-h-[400px] rounded-2xl border-2 border-dashed border-border animate-fade-in">
      <div className="text-center">
        <h2 className="text-heading-3 text-muted-foreground">{title}</h2>
        <p className="text-muted-foreground mt-2">This feature is under construction. Check back soon!</p>
      </div>
    </div>
);

// Dashboard Overview Content
interface DashboardOverviewContentProps {
  summary: HomeownerDashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  onRequestMoreQuotes: () => void;
  onVerifyContact: () => void;
  onEditLead: (lead: RecentLeadSummary) => void;
  onPreviewLead: (lead: RecentLeadSummary) => void;
  onCancelLead: (lead: RecentLeadSummary) => void;
  onLimitReached?: () => void;
  setSelectedBiddingLeadId: (id: string) => void;
  setIsBiddingReviewModalOpen: (open: boolean) => void;
}

const DashboardOverviewContent: React.FC<DashboardOverviewContentProps> = ({
  summary,
  isLoading,
  error,
  onRequestMoreQuotes,
  onVerifyContact,
  onEditLead,
  onPreviewLead,
  onCancelLead,
  onLimitReached,
  setSelectedBiddingLeadId,
  setIsBiddingReviewModalOpen,
}) => {
  const StatCard: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    value: string; 
    change: string; 
    actionText: string; 
    onClick?: () => void;
  }> = ({ icon, title, value, change, actionText, onClick }) => (
  <div
    className="bg-background rounded-card p-4 flex flex-col shadow-neu-outset transition-colors duration-200 hover:shadow-neu-inset focus-within:shadow-neu-inset"
    tabIndex={-1}
  >
    <div className="flex justify-between items-start mb-3">
      <p className="text-body-small text-muted-foreground">{title}</p>
      <div className="p-2.5 bg-background rounded-lg shadow-neu-inset transition-colors duration-200">
        {icon}
      </div>
    </div>
    <p className="text-heading-2 sm:text-heading-1 text-foreground mb-1">{value}</p>
    <p className="text-caption text-muted-foreground mb-4">{change}</p>
    <div className="flex-grow" />
    <div className="flex w-full justify-start">
      <Button
        onClick={onClick}
        variant="ghost"
        className="w-auto px-0 py-0 text-caption text-primary text-left"
        style={{boxShadow: 'none', background: 'none'}}>
        {actionText} →
      </Button>
    </div>
  </div>
);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-background rounded-card p-4" style={{
                boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)'
              }}>
                <div className="h-16 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
  <div className="bg-background rounded-card p-8 text-center" style={{
          boxShadow: '8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light)'
        }}>
          <div className="text-error mb-3">
            <svg className="h-14 w-14 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-heading-4 text-foreground mb-2">Failed to load dashboard</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="secondary"
            className="px-6 py-2.5"
          >
            Reload page
          </Button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="animate-fade-in">
  <div className="bg-background rounded-card p-8 text-center" style={{
          boxShadow: '8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light)'
        }}>
          <p className="text-muted-foreground">No dashboard data available</p>
        </div>
      </div>
    );
  }

  const activeLeads = summary.statusBreakdown[LeadStatusEnum.APPROVED] + 
                    summary.statusBreakdown[LeadStatusEnum.PURCHASED] + 
                    summary.statusBreakdown[LeadStatusEnum.QUOTED];

  const pendingLeads = summary.statusBreakdown[LeadStatusEnum.PENDING_APPROVAL] + 
                      summary.statusBreakdown[LeadStatusEnum.PENDING_PHONE];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-body-large sm:text-heading-4 text-foreground">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <VerifiedBadge 
              verified={summary.phoneVerified} 
              variant="inline" 
              size="sm" 
            />
            {summary.requiresVerification && (
              <span className="text-caption text-warning">
                Verification required for more quotes
              </span>
            )}
          </div>
        </div>
      </div>

      <RequestMoreQuotesCTA
        remaining={summary.remainingLeadAllowance}
        quoteLimit={summary.quoteLimit}
        totalSubmitted={summary.totalSubmitted}
        requiresVerification={summary.requiresVerification}
        onRequest={onRequestMoreQuotes}
        onVerifyContact={onVerifyContact}
        onLimitReached={onLimitReached}
        className="mb-6"
      />

      {/* Phase 4.11: Bidding Quota Indicator */}
  <div className="bg-background rounded-card border-2 border-warning/30 p-5 mb-6" style={{
        boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/20 rounded-lg text-warning" style={{
              boxShadow: 'inset 3px 3px 6px var(--shadow-inset-dark), inset -3px -3px 6px var(--shadow-inset-light)'
            }}>
              <TrophyIcon />
            </div>
            <div>
              <h3 className="text-heading-4 text-foreground">
                Competitive Bidding Quota
              </h3>
              <p className="text-caption text-muted-foreground mt-0.5">
                One-time bidding request per homeowner
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-heading-1 text-warning">
              {summary.biddingLeadsSubmitted ?? 0} / 1
            </div>
            <div className="text-caption text-muted-foreground mt-1">
              {(summary.biddingQuotaRemaining ?? 0) === 1 ? 'Available' : 'Used'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard 
          icon={<FileTextIcon />} 
          title="Quote Requests" 
          value={summary.totalSubmitted.toString()} 
          change={`${summary.remainingLeadAllowance} remaining`}
          actionText="View All Requests" 
          onClick={() => {/* Navigate to requests */}}
        />
        <StatCard 
          icon={<GavelIcon />} 
          title="Active Leads" 
          value={activeLeads.toString()} 
          change={pendingLeads > 0 ? `${pendingLeads} pending review` : 'All approved'}
          actionText="Go to Bidding Room" 
          onClick={() => {/* Navigate to bidding */}}
        />
        <StatCard 
          icon={<MessageSquareIcon />} 
          title="Messages" 
          value="0" 
          change="No new messages"
          actionText="Open Inbox" 
          onClick={() => {/* Open messages */}}
        />
        <StatCard 
          icon={<SparklesIcon />} 
          title="Last Activity" 
          value={summary.lastSubmissionAt ? formatRelativeTime(summary.lastSubmissionAt) : 'Never'} 
          change="Quote submission"
          actionText="View Timeline" 
          onClick={() => {/* View activity */}}
        />
      </div>

  <div className="bg-background rounded-card p-5 sm:p-6" style={{
        boxShadow: '8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light)'
      }}>
        <h3 className="text-body-large sm:text-heading-4 text-foreground mb-5" style={{
          textShadow: '2px 2px 4px var(--shadow-dark), -1px -1px 2px var(--shadow-light)'
        }}>Recent Quote Requests</h3>
        {summary.recentLeads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No quote requests yet.</p>
            <Button 
              onClick={onRequestMoreQuotes}
              variant="secondary"
              className="px-6 py-2.5"
            >
              Create your first request →
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {summary.recentLeads.map((lead) => {
              const statusInfo = STATUS_LABELS[lead.status as LeadStatus];
              // T290: Handle label as function for conditional "Bid Awarded" (BIDDING + PURCHASED)
              const statusLabel = typeof statusInfo.label === 'function' 
                ? statusInfo.label(lead) 
                : statusInfo.label;
              const canEdit = lead.status === LeadStatusEnum.PENDING_APPROVAL;
              const isActuallyCancellable = canCancelLead(lead);
              const canPreview = [LeadStatusEnum.APPROVED as string, LeadStatusEnum.PURCHASED as string, LeadStatusEnum.QUOTED as string, LeadStatusEnum.ACCEPTED as string].includes(lead.status);
              const isPhoneOutOfSync = lead.phoneNumber && summary.userPhone && lead.phoneNumber !== summary.userPhone;

              return (
                    <div
                      key={lead.id}
                      className="flex items-center gap-3 p-3 rounded-full bg-background shadow-neu-outset transition-colors duration-normal min-h-[80px]"
                      style={{ position: 'relative' }}
                    >
                      {/* Left circular icon with strong neumorphic shadow */}
                      <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-background shadow-neu-outset border-4 border-background relative z-10">
                        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-surface shadow-neu-inset text-primary text-heading-2">
                          {getQuoteTypeIcon(lead.quoteType)}
                        </span>
                      </div>
                      {/* Main card content area */}
                      <div className="flex-1 flex flex-col justify-center min-w-0 pr-3">
                        <div className="rounded-full bg-background shadow-neu-inset border border-border px-6 py-3 flex flex-col gap-2">
                          <div className="flex items-center gap-4" style={{ width: '100%' }}>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-body-small text-foreground truncate">
                                {QUOTE_TYPE_LABELS[lead.quoteType]}
                              </span>
                              <span className="text-caption text-muted-foreground truncate">
                                Created {formatDateTime(lead.createdAt)}
                              </span>
                            </div>
                            {/* Action buttons (right side, minimal, icon-focused) */}
                            <div className="flex items-center gap-1">
                              {/* Phase 13I-A: Trophy Badge + Bid Awarded visual for PURCHASED BIDDING leads (T291) */}
                              {lead.quoteType === 'BIDDING' && lead.status === LeadStatusEnum.PURCHASED && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-success/10 border border-success/30 rounded-md" title="Winner selected">
                                  <TrophyIcon className="h-4 w-4 text-success" />
                                  <span className="text-caption text-success">Bid Awarded</span>
                                </div>
                              )}
                              
                              {/* Phase 13I-A: Start Chat button for PURCHASED BIDDING leads (T292) */}
                              {lead.quoteType === 'BIDDING' && lead.status === LeadStatusEnum.PURCHASED && (
                                <Button
                                  onClick={() => {
                                    // TODO: Implement chat modal with winning installer
                                    alert('Chat feature coming soon! You can contact the winning installer via their details in the Review Bids modal.');
                                  }}
                                  variant="minimal"
                                  className="flex items-center gap-1 px-2 py-1 text-caption text-success hover:text-success/80 bg-transparent shadow-none"
                                  title="Chat with winning installer"
                                >
                                  <MessageSquareIcon className="h-4 w-4" />
                                  <span className="hidden sm:inline">Start Chat</span>
                                </Button>
                              )}
                              
                              {/* Phase 3: Review Bids button for BIDDING leads (APPROVED or PURCHASED) */}
                              {lead.quoteType === 'BIDDING' && [LeadStatusEnum.APPROVED as string, LeadStatusEnum.PURCHASED as string].includes(lead.status) && (
                                <Button
                                  onClick={() => {
                                    setSelectedBiddingLeadId(lead.id);
                                    setIsBiddingReviewModalOpen(true);
                                  }}
                                  variant="minimal"
                                  className="flex items-center gap-1 px-2 py-1 text-caption text-warning hover:text-warning/80 bg-transparent shadow-none"
                                  title="Review bids from installers"
                                >
                                  <TrophyIcon />
                                  <span className="hidden sm:inline">Review Bids</span>
                                </Button>
                              )}
                              {canEdit && (
                                <Button
                                  onClick={() => onEditLead(lead)}
                                  variant="minimal"
                                  className="flex items-center gap-1 px-2 py-1 text-caption text-muted-foreground hover:text-primary bg-transparent shadow-none"
                                  title="Edit lead"
                                >
                                  <EditIcon />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>
                              )}
                              {canPreview && (
                                <Button
                                  onClick={() => onPreviewLead(lead)}
                                  variant="minimal"
                                  className="flex items-center gap-1 px-2 py-1 text-caption text-muted-foreground hover:text-primary bg-transparent shadow-none"
                                  title="Preview lead"
                                >
                                  <EyeIcon />
                                  <span className="hidden sm:inline">Preview</span>
                                </Button>
                              )}
                              {isActuallyCancellable && (
                                <Button
                                  onClick={() => onCancelLead(lead)}
                                  variant="minimal"
                                  className="flex items-center gap-1 px-2 py-1 text-caption text-muted-foreground hover:text-error bg-transparent shadow-none"
                                  title="Cancel lead"
                                >
                                  <XCircleIcon />
                                  <span className="hidden sm:inline">Cancel</span>
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {/* Phase 20: Property Type Badge (Residential/Commercial) */}
                            {(() => {
                              const propTypeInfo = getPropertyTypeInfo(lead.propertyType);
                              return (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface shadow-neu-inset text-caption ${propTypeInfo.color}`} title={`${propTypeInfo.label} Property`}>
                                  {propTypeInfo.icon}
                                  <span className="hidden sm:inline">{propTypeInfo.label}</span>
                                </span>
                              );
                            })()}
                            {/* Verification badge */}
                            {lead.phoneVerified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-success/10 text-success shadow-neu-inset text-caption" title="Verified Contact">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                <span className="">Verified</span>
                              </span>
                            )}
                            {/* Phone not synced warning badge */}
                            {isPhoneOutOfSync && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-warning/10 text-warning shadow-neu-inset text-caption" title="Lead phone differs from profile phone">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                </svg>
                                <span className="">Phone Not Synced</span>
                              </span>
                            )}
                            {/* Status badge */}
                            <span className={`px-2.5 py-0.5 rounded-lg shadow-neu-inset text-caption ${statusInfo.accent}`}>
                              {statusLabel}
                            </span>
                            {/* Live Countdown Timer - Only for APPROVED leads (not PURCHASED) */}
                            {lead.expiresAt && lead.status === LeadStatusEnum.APPROVED && (
                              <LiveCountdownBar
                                expiresAt={lead.expiresAt}
                                leadId={lead.id}
                                position="inline"
                                leadStatus={lead.status}
                                quoteType={lead.quoteType}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function HomeownerDashboardPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session, update: updateSession } = useSession();
  const [activePage, setActivePage] = useState('Dashboard Overview');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modal states
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [isSimplifiedQuoteModalOpen, setIsSimplifiedQuoteModalOpen] = useState(false);
  const [isQuoteOptionsModalOpen, setIsQuoteOptionsModalOpen] = useState(false);
  const [isQuoteTypeDistributionModalOpen, setIsQuoteTypeDistributionModalOpen] = useState(false);
  const [isDetailedInfoModalOpen, setIsDetailedInfoModalOpen] = useState(false); // ✅ Phase 12: Added for first-quote contact info
  const [isBiddingReviewModalOpen, setIsBiddingReviewModalOpen] = useState(false); // Phase 3: Bidding review modal
  const [selectedBiddingLeadId, setSelectedBiddingLeadId] = useState<string | null>(null); // Phase 3: Track which lead to review
  const [homeownerInfo, setHomeownerInfo] = useState<{ name: string; phone: string; address: string } | null>(null); // ✅ Phase 12: Store homeowner contact info
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);
  const [showContactVerificationModal, setShowContactVerificationModal] = useState(false);
  const [pendingOTP, setPendingOTP] = useState<PendingOTPState | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [pendingQuoteData, setPendingQuoteData] = useState<any>(null);
  const [selectedQuoteType, setSelectedQuoteType] = useState<'CALL_VISIT' | 'WRITTEN_QUOTE' | null>(null);
  const [showFirstQuoteSuccessModal, setShowFirstQuoteSuccessModal] = useState(false);
  const [firstQuoteSuccessData, setFirstQuoteSuccessData] = useState<{
    quoteType: 'CALL_VISIT' | 'WRITTEN_QUOTE';
    remainingQuotes: number;
    totalQuoteLimit: number;
  } | null>(null);

  const [dashboardSummary, setDashboardSummary] = useState<HomeownerDashboardSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [quoteFormInitialData, setQuoteFormInitialData] = useState<Record<string, unknown> | null>(null);

  // Phase 4.11: Lead CRUD modal states
  const [editLeadModalOpen, setEditLeadModalOpen] = useState(false);
  const [previewLeadModalOpen, setPreviewLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<RecentLeadSummary | null>(null);
  const [isLeadLimitModalOpen, setIsLeadLimitModalOpen] = useState(false);
  
  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Aliases for component compatibility
  const isLoading = isLoadingSummary;
  const error = summaryError;

  // User profile state
  const [userProfile, setUserProfile] = useState({
    fullName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+61 412 345 678',
    address: '123 Solar Street, Sydney NSW 2000',
    avatar: 'https://picsum.photos/seed/homeowner-avatar/200'
  });

  const handleProfileUpdate = (updatedProfile: typeof userProfile) => {
    setUserProfile(updatedProfile);
    // Here you would typically save to backend
    console.log('Profile updated:', updatedProfile);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
      console.log('Account deletion requested');
      // Typically: call API, then redirect to home
      router.push('/');
    }
  };

  // Fetch dashboard summary
  const fetchDashboardSummary = useCallback(async (): Promise<HomeownerDashboardSummary | null> => {
    setIsLoadingSummary(true);
    setSummaryError(null);

    try {
      const response = await fetch('/api/homeowner/dashboard', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-store',
        },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to load dashboard summary');
      }

      const summary = (await response.json()) as HomeownerDashboardSummary;
      setDashboardSummary(summary);
      return summary;
    } catch (error) {
      console.error('[HomeownerDashboard] Failed to load summary:', error);
      setSummaryError(error instanceof Error ? error.message : 'Failed to load summary');
      return null;
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  const getLatestQuoteData = useCallback(
    (summary: HomeownerDashboardSummary | null): Record<string, unknown> | null =>
      summary?.recentLeads?.[0]?.quoteData ?? null,
    [],
  );

  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary]);

  // Listen for global lead limit reached events (fallback trigger from CTA button)
  useEffect(() => {
    const handler = () => setIsLeadLimitModalOpen(true);
    window.addEventListener('leadLimitReached', handler);
    return () => window.removeEventListener('leadLimitReached', handler);
  }, []);

  // Debug: Log modal states
  useEffect(() => {
    console.log('[Modal States]', {
      isNewQuoteModalOpen,
      isSimplifiedQuoteModalOpen,
      isQuoteOptionsModalOpen,
    });
  }, [isNewQuoteModalOpen, isSimplifiedQuoteModalOpen, isQuoteOptionsModalOpen]);

  // Scroll logic for header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 80) {
        setIsHeaderVisible(true);
      } else if (Math.abs(currentScrollY - lastScrollY) > 5) {
        setIsHeaderVisible(currentScrollY < lastScrollY);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    // Clear authentication state using NextAuth
    await signOut({ redirect: false });
    // Redirect to guest homepage
    router.push('/');
  };

  const handleHomeClick = () => {
    router.push('/'); // Navigate to guest homepage
  };

  const handleNewQuoteClick = () => {
    if (!dashboardSummary) {
      return;
    }

    setQuoteFormInitialData(getLatestQuoteData(dashboardSummary));

    if (dashboardSummary.requiresVerification) {
      setShowContactVerificationModal(true);
      return;
    }

    // Check if this is the first quote (0 submissions) or subsequent quotes
    if (dashboardSummary.totalSubmitted === 0) {
      // First quote: Show InstantQuoteForm (multi-step modal)
      setIsNewQuoteModalOpen(true);
    } else {
      // Subsequent quotes: Show SimplifiedQuoteForm (single-page pre-filled form)
      setIsSimplifiedQuoteModalOpen(true);
    }
  };

  const handleMessagesClick = () => {
    setIsMessagingModalOpen(true);
  };

  const handleOTPRequested = (payload: PendingOTPState) => {
    setPendingOTP(payload);
    setShowContactVerificationModal(false);
    setShowOTPModal(true);
  };

  const handleOTPVerificationSuccess = async () => {
    setShowOTPModal(false);
    setPendingOTP(null);
    
    // Update session to reflect phone verification success
    await updateSession({
      phoneVerified: true,
    });
    
    // Refresh dashboard summary
    const updatedSummary = await fetchDashboardSummary();
    setQuoteFormInitialData(getLatestQuoteData(updatedSummary ?? dashboardSummary));
    
    // Check if this is the first quote or subsequent quotes
    if ((updatedSummary ?? dashboardSummary)?.totalSubmitted === 0) {
      setIsNewQuoteModalOpen(true);
    } else {
      setIsSimplifiedQuoteModalOpen(true);
    }
  };

  const handleRequestMoreQuotes = () => {
    console.log('[handleRequestMoreQuotes] Dashboard Summary:', dashboardSummary);
    console.log('[handleRequestMoreQuotes] totalSubmitted:', dashboardSummary?.totalSubmitted);
    console.log('[handleRequestMoreQuotes] Condition check (totalSubmitted === 0):', dashboardSummary?.totalSubmitted === 0);
    
    setQuoteFormInitialData(getLatestQuoteData(dashboardSummary ?? null));

    if (dashboardSummary?.requiresVerification) {
      console.log('[handleRequestMoreQuotes] → Opening ContactVerificationModal (verification required)');
      setShowContactVerificationModal(true);
    } else {
      // Check if this is the first quote (0 submissions) or subsequent quotes
      if (dashboardSummary?.totalSubmitted === 0) {
        // First quote: Show InstantQuoteForm (multi-step modal)
        console.log('[handleRequestMoreQuotes] → Opening InstantQuoteForm (first quote, totalSubmitted = 0)');
        setIsNewQuoteModalOpen(true);
      } else {
        // Subsequent quotes: Show SimplifiedQuoteForm (single-page pre-filled form)
        console.log('[handleRequestMoreQuotes] → Opening SimplifiedQuoteForm (returning user, totalSubmitted =', dashboardSummary?.totalSubmitted, ')');
        setIsSimplifiedQuoteModalOpen(true);
      }
    }
  };

  // Phase 4.11: Distribution handler for second+ quotes
  const handleDistributionSubmit = async (distributions: Array<{type: 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING'; count: number}>) => {
    console.log('[handleDistributionSubmit] Distributions:', distributions);
    console.log('[handleDistributionSubmit] Pending quote data:', pendingQuoteData);
    
    setIsQuoteTypeDistributionModalOpen(false);
    setIsSubmittingRequest(true);

    try {
      const totalLeadsToCreate = distributions.reduce((sum, d) => sum + d.count, 0);
      console.log(`[handleDistributionSubmit] Creating ${totalLeadsToCreate} leads...`);

      // Create leads sequentially for each distribution
      const createdLeads = [];
      for (const distribution of distributions) {
        const { type: quoteType, count } = distribution;
        
        for (let i = 0; i < count; i++) {
          const payload = {
            quoteType,
            quoteData: pendingQuoteData,
            propertyPostcode: pendingQuoteData?.postcode || '',
            location: pendingQuoteData?.location || '',
            state: pendingQuoteData?.state || '',
            propertyType: pendingQuoteData?.propertyType || 'residential',
            roofType: pendingQuoteData?.roofType || '',
            energyBill: Number(pendingQuoteData?.electricityValue) || 0, // FIX: Use electricityValue not electricityUsage
            billType: pendingQuoteData?.electricityUsageType || 'quarterly',
            budgetRange: pendingQuoteData?.budgetRange || '',
            desiredOffset: pendingQuoteData?.desiredOffset || 100,
            batteryRequired: pendingQuoteData?.batteryIncluded || false,
            batteryCapacity: pendingQuoteData?.batteryCapacity || '',
          };
          
          console.log(`[handleDistributionSubmit] Creating lead ${i + 1}/${count} for ${quoteType}`, payload);

          const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (!response.ok) {
            // Handle verification required
            if (result.requiresVerification) {
              alert('Phone verification required. Please verify your phone number to submit more quotes.');
              setShowContactVerificationModal(true);
              throw new Error('Verification required');
            }

            // Handle limit reached
            if (result.limitReached) {
              alert(`You have reached your quote limit (${result.quoteLimit} total).`);
              throw new Error('Limit reached');
            }

            // Handle BIDDING quota exhausted
            if (result.biddingQuotaExhausted) {
              alert('You have already submitted a BIDDING lead. Only 1 bidding lead allowed per homeowner.');
              throw new Error('Bidding quota exhausted');
            }

            throw new Error(result.error || 'Failed to submit lead');
          }

          createdLeads.push(result);
          console.log(`✅ Lead ${i + 1}/${count} created successfully:`, result);
        }
      }

      // Success! Refresh dashboard
      console.log(`✅ All ${totalLeadsToCreate} leads created successfully:`, createdLeads);
      alert(`Successfully created ${totalLeadsToCreate} quote request(s)! We'll match you with verified installers soon.`);
      
      await fetchDashboardSummary();
      setPendingQuoteData(null);
    } catch (error) {
      console.error('[handleDistributionSubmit] Failed to submit leads:', error);
      if (error instanceof Error && error.message !== 'Verification required' && error.message !== 'Limit reached') {
        alert(error.message || 'Failed to submit quote requests. Please try again.');
      }
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Phase 4.11: Lead CRUD handlers
  const handleEditLead = (lead: RecentLeadSummary) => {
    setSelectedLead(lead);
    setEditLeadModalOpen(true);
  };

  const handlePreviewLead = (lead: RecentLeadSummary) => {
    setSelectedLead(lead);
    setPreviewLeadModalOpen(true);
  };

  const handleCancelLead = async (lead: RecentLeadSummary) => {
    if (!confirm(`Are you sure you want to cancel this ${QUOTE_TYPE_LABELS[lead.quoteType]} request? This action cannot be undone.`)) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation (optional):');

    try {
      const response = await fetch(`/api/leads/${lead.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'Cancelled by homeowner' }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to cancel lead: ${error.error || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      alert(result.quotaRestored
        ? '✅ Lead cancelled successfully! Your quote allowance has been restored.'
        : '✅ Lead cancelled successfully!');

      // Refresh dashboard
      await fetchDashboardSummary();
    } catch (error) {
      console.error('[handleCancelLead] Error:', error);
      alert('Failed to cancel lead. Please try again.');
    }
  };

  const handleLeadEditSuccess = async () => {
    setEditLeadModalOpen(false);
    setSelectedLead(null);
    // Refresh dashboard to show updated lead
    await fetchDashboardSummary();
  };

  const handleResendOTP = async (): Promise<{
    success: boolean;
    verificationId?: string;
    expiresAt?: Date;
    error?: string;
    retryAfter?: number;
  }> => {
    if (!pendingOTP) {
      return {
        success: false,
        error: 'No pending verification',
      };
    }

    try {
      const response = await fetch('/api/verification/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: pendingOTP.phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          return {
            success: false,
            error: data.error,
            retryAfter: data.retryAfter,
          };
        }
        return {
          success: false,
          error: data.error || 'Failed to resend code',
        };
      }

      return {
        success: true,
        verificationId: data.verificationId,
        expiresAt: new Date(data.expiresAt),
      };
    } catch (error) {
      console.error('[Resend OTP] Error:', error);
      return {
        success: false,
        error: 'Failed to resend code. Please try again.',
      };
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'Dashboard Overview':
        return (
          <DashboardOverviewContent 
            summary={dashboardSummary}
            isLoading={isLoading}
            error={error}
            onRequestMoreQuotes={handleRequestMoreQuotes}
            onVerifyContact={() => setShowContactVerificationModal(true)}
            onEditLead={handleEditLead}
            onPreviewLead={handlePreviewLead}
            onCancelLead={handleCancelLead}
            onLimitReached={() => setIsLeadLimitModalOpen(true)}
            setSelectedBiddingLeadId={setSelectedBiddingLeadId}
            setIsBiddingReviewModalOpen={setIsBiddingReviewModalOpen}
          />
        );
      case 'Call/Visit Quotes':
        return <PlaceholderContent title="Call/Visit Quotes" />;
      case 'Written Quotes':
        return <PlaceholderContent title="Written Quotes" />;
      case 'Bidding Room':
        return <PlaceholderContent title="Bidding Room" />;
      case 'AI Insights':
        return <PlaceholderContent title="AI Insights" />;
      case 'Messages':
        return <PlaceholderContent title="Messages" />;
      case 'My Profile':
        return <ProfileManagement onDeleteClick={handleDeleteAccount} />;
      default:
        return (
          <DashboardOverviewContent 
            summary={dashboardSummary}
            isLoading={isLoading}
            error={error}
            onRequestMoreQuotes={handleRequestMoreQuotes}
            onVerifyContact={() => setShowContactVerificationModal(true)}
            onEditLead={handleEditLead}
            onPreviewLead={handlePreviewLead}
            onCancelLead={handleCancelLead}
            onLimitReached={() => setIsLeadLimitModalOpen(true)}
            setSelectedBiddingLeadId={setSelectedBiddingLeadId}
            setIsBiddingReviewModalOpen={setIsBiddingReviewModalOpen}
          />
        );
    }
  };

  return (
    <>
      {renderContent()}

      {/* Modals */}
      <NewQuoteRequestModal
        isOpen={isNewQuoteModalOpen}
        onClose={() => setIsNewQuoteModalOpen(false)}
        onQuoteCalculated={(data) => {
          console.log('[Dashboard - Phase 12] Quote calculated:', data);
          // Store quote data for later submission
          setPendingQuoteData(data);
          // Don't close modal yet - results will display inside modal
        }}
        onProceedToDetailedQuote={() => {
          console.log('[Dashboard - Phase 12] User clicked "Get Detailed Quotes from Installers"');
          // Close InstantQuoteForm modal and open QuoteOptionsModal
          setIsNewQuoteModalOpen(false);
          setIsQuoteOptionsModalOpen(true);
        }}
        initialData={quoteFormInitialData}
      />

      {/* SimplifiedQuoteFormModal for returning users (1+ quotes) */}
      <SimplifiedQuoteFormModal
        isOpen={isSimplifiedQuoteModalOpen}
        onClose={() => setIsSimplifiedQuoteModalOpen(false)}
        onSubmit={(data) => {
          console.log('Simplified quote form submitted:', data);
          // Store quote data and open QuoteTypeDistributionModal for second+ quotes
          setPendingQuoteData(data);
          setIsSimplifiedQuoteModalOpen(false);
          setIsQuoteTypeDistributionModalOpen(true); // Changed from QuoteOptionsModal
        }}
        initialData={quoteFormInitialData}
      />

      <QuoteOptionsModal
        isOpen={isQuoteOptionsModalOpen}
        onClose={() => {
          setIsQuoteOptionsModalOpen(false);
          setPendingQuoteData(null);
        }}
        onSelectOption={async (quoteType: 'call_visit' | 'written') => {
          console.log('[Dashboard - Phase 12] Quote type selected (raw):', quoteType);
          
          // Transform to API format: 'call_visit' -> 'CALL_VISIT', 'written' -> 'WRITTEN_QUOTE'
          const apiQuoteType: 'CALL_VISIT' | 'WRITTEN_QUOTE' = 
            quoteType === 'call_visit' ? 'CALL_VISIT' : 'WRITTEN_QUOTE';
          
          console.log('[Dashboard - Phase 12] Quote type (transformed):', apiQuoteType);
          console.log('[Dashboard - Phase 12] Pending quote data:', pendingQuoteData);
          
          // ✅ Phase 12 Fix: Store selected quote type and open HomeownersInfoForm
          // Reuse guest flow component for UI consistency
          setSelectedQuoteType(apiQuoteType);
          setIsQuoteOptionsModalOpen(false);
          setIsDetailedInfoModalOpen(true); // Open HomeownersInfoForm (same as guest flow)
          
          console.log('[Dashboard - Phase 12] Opening HomeownersInfoForm for contact info collection');
        }}
      />

      {/* ✅ Phase 12: HomeownersInfoForm for first-quote contact info collection (reused from guest flow) */}
      <HomeownersInfoForm
        isOpen={isDetailedInfoModalOpen}
        onClose={() => {
          setIsDetailedInfoModalOpen(false);
          setPendingQuoteData(null);
          setSelectedQuoteType(null);
          setHomeownerInfo(null);
        }}
        onContinue={async (info: { name: string; phone: string; address: string }) => {
          console.log('[Dashboard - Phase 12] Homeowner info received:', info);
          console.log('[Dashboard - Phase 12] Selected quote type:', selectedQuoteType);
          console.log('[Dashboard - Phase 12] Pending quote data:', pendingQuoteData);
          
          // Store homeowner info
          setHomeownerInfo(info);
          setIsDetailedInfoModalOpen(false);
          setIsSubmittingRequest(true);

          try {
            // DEBUG: Log what we receive from form
            console.log('[Dashboard] pendingQuoteData keys:', Object.keys(pendingQuoteData));
            console.log('[Dashboard] electricityValue:', pendingQuoteData?.electricityValue);
            console.log('[Dashboard] electricityUsageType:', pendingQuoteData?.electricityUsageType);
            
            const payload = {
              quoteType: selectedQuoteType,
              quoteData: pendingQuoteData,
              propertyPostcode: pendingQuoteData?.postcode || '',
              location: pendingQuoteData?.location || '',
              state: pendingQuoteData?.state || '',
              propertyType: pendingQuoteData?.propertyType || 'residential',
              roofType: pendingQuoteData?.roofType || '',
              // FIX: Convert to Number - electricityValue comes as string from form
              energyBill: Number(pendingQuoteData?.electricityValue) || Number(pendingQuoteData?.electricityUsage) || 0,
              billType: pendingQuoteData?.electricityUsageType || 'quarterly',
              budgetRange: pendingQuoteData?.budgetRange || '',
              desiredOffset: pendingQuoteData?.desiredOffset || 100,
              batteryRequired: pendingQuoteData?.batteryIncluded || false,
              batteryCapacity: pendingQuoteData?.batteryCapacity || '',
              // ✅ Phase 12: Add contact fields from HomeownersInfoForm (same as guest flow)
              name: info.name,
              phoneNumber: info.phone,
              address: info.address,
              propertyAddress: info.address,
            };
            
            console.log('[Dashboard - Phase 12] Submitting payload with contact info:', payload);

            // Submit lead with complete contact information
            const response = await fetch('/api/leads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            // ✅ CRITICAL FIX: Check response.ok BEFORE parsing JSON to prevent crashes
            if (!response.ok) {
              // Try to parse error as JSON, fallback to text if HTML error page
              let errorMessage = 'Failed to submit quote request';
              try {
                const result = await response.json();
                errorMessage = result.error || errorMessage;
                
                // Handle verification required
                if (result.requiresVerification) {
                  alert('Phone verification required. Please verify your phone number to submit more quotes.');
                  setShowContactVerificationModal(true);
                  return;
                }

                // Handle limit reached
                if (result.limitReached) {
                  alert(`You have reached your quote limit (${result.quoteLimit} total).`);
                  return;
                }
              } catch (parseError) {
                // Response is not JSON (likely HTML error page)
                const responseText = await response.text();
                console.error('[Dashboard - Phase 12] Non-JSON error response:', responseText.substring(0, 200));
                errorMessage = `Server error (${response.status}). Please try again or contact support.`;
              }
              
              throw new Error(errorMessage);
            }

            // Now safe to parse JSON
            const result = await response.json();

            // Success! Refresh dashboard
            console.log('✅ [Phase 12] Lead submitted successfully with contact info:', result);
            
            // Check if this was the first quote submission
            const isFirstQuote = result.leadSubmissionCount === 1;
            
            if (isFirstQuote && selectedQuoteType && result.remainingLeadAllowance !== undefined && result.quoteLimit) {
              // Show first quote success modal with details
              setFirstQuoteSuccessData({
                quoteType: selectedQuoteType,
                remainingQuotes: result.remainingLeadAllowance,
                totalQuoteLimit: result.quoteLimit,
              });
              setShowFirstQuoteSuccessModal(true);
            } else {
              // Show regular success message for subsequent quotes
              alert('Quote request submitted successfully! We\'ll match you with verified installers soon.');
            }
            
            await fetchDashboardSummary();
            setPendingQuoteData(null);
            setSelectedQuoteType(null);
            setHomeownerInfo(null);
          } catch (error) {
            console.error('[Dashboard - Phase 12] Failed to submit lead:', error);
            alert(error instanceof Error ? error.message : 'Failed to submit quote request. Please try again.');
          } finally {
            setIsSubmittingRequest(false);
          }
        }}
      />

      {/* Phase 4.11: Quote Type Distribution Modal for second+ quotes */}
      <QuoteTypeDistributionModal
        isOpen={isQuoteTypeDistributionModalOpen}
        onClose={() => {
          setIsQuoteTypeDistributionModalOpen(false);
          setPendingQuoteData(null);
        }}
        onSubmit={handleDistributionSubmit}
        remainingQuota={dashboardSummary?.remainingLeadAllowance || 0}
        quoteData={pendingQuoteData}
        userAlreadyHasBiddingLead={(dashboardSummary?.biddingQuotaRemaining ?? 1) === 0}
      />

      <MessagingModal
        isOpen={isMessagingModalOpen}
        onClose={() => setIsMessagingModalOpen(false)}
      />

      <ContactVerificationModal
        isOpen={showContactVerificationModal}
        defaultPhone={dashboardSummary?.phoneNumber || homeownerInfo?.phone || session?.user?.phone || ''}
        onClose={() => setShowContactVerificationModal(false)}
        onOTPRequested={handleOTPRequested}
      />

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phoneNumber={pendingOTP?.phoneNumber || session?.user?.phone || ''}
        verificationId={pendingOTP?.verificationId || ''}
        expiresAt={pendingOTP?.expiresAt || new Date()}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onResendOTP={handleResendOTP}
      />

      {isLeadLimitModalOpen && (
        <LeadLimitReachedModal
          isOpen={isLeadLimitModalOpen}
          onClose={() => setIsLeadLimitModalOpen(false)}
          usedQuotes={dashboardSummary?.totalSubmitted || 0}
          totalQuoteLimit={dashboardSummary?.quoteLimit || 0}
        />
      )}

      {/* First Quote Success Modal */}
      {firstQuoteSuccessData && (
        <FirstQuoteSuccessModal
          isOpen={showFirstQuoteSuccessModal}
          onClose={() => {
            setShowFirstQuoteSuccessModal(false);
            setFirstQuoteSuccessData(null);
          }}
          onVerifyContact={() => {
            setShowFirstQuoteSuccessModal(false);
            setShowContactVerificationModal(true);
          }}
          quoteType={firstQuoteSuccessData.quoteType}
          remainingQuotes={firstQuoteSuccessData.remainingQuotes}
          totalQuoteLimit={firstQuoteSuccessData.totalQuoteLimit}
        />
      )}

      {/* Phase 4.11: Lead Edit Modal */}
      {selectedLead && (
        <LeadEditModal
          isOpen={editLeadModalOpen}
          onClose={() => {
            setEditLeadModalOpen(false);
            setSelectedLead(null);
          }}
          leadId={selectedLead.id}
          initialData={{
            // Merge quoteData (has form inputs) with top-level fields (has database values)
            // This ensures SimplifiedQuoteForm prefill can find energyBill/billType
            ...selectedLead.quoteData,
            ...selectedLead, // Top-level fields override quoteData
          }}
          onSaveSuccess={handleLeadEditSuccess}
        />
      )}

      {/* Phase 4.11: Lead Preview Modal */}
      {selectedLead && (
        <LeadPreviewModal
          isOpen={previewLeadModalOpen}
          onClose={() => {
            setPreviewLeadModalOpen(false);
            setSelectedLead(null);
          }}
          lead={{
            id: selectedLead.id,
            quoteType: selectedLead.quoteType,
            status: selectedLead.status,
            createdAt: selectedLead.createdAt,
            updatedAt: selectedLead.updatedAt,
            quoteData: selectedLead.quoteData || {},
          }}
        />
      )}

      {/* Phase 3: Homeowner Bidding Review Modal */}
      {isBiddingReviewModalOpen && selectedBiddingLeadId && (
        <HomeownerBiddingReviewModal
          isOpen={isBiddingReviewModalOpen}
          onClose={() => {
            setIsBiddingReviewModalOpen(false);
            setSelectedBiddingLeadId(null);
          }}
          leadId={selectedBiddingLeadId}
          propertyAddress="Loading..." 
          bids={[]}
          onSelectWinner={async (bidId: string) => {
            try {
              console.log('[Phase 13G] Selecting winner bid:', bidId);
              
              // Call backend API to select winner
              const response = await fetch(`/api/bids/${bidId}/select`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: selectedBiddingLeadId })
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to select winner');
              }

              const result = await response.json();
              console.log('[Phase 13G] Winner selected successfully:', result);

              // ✅ T187: Use toast instead of alert
              toast.success('Winner Selected!', {
                description: 'The installer has been notified and will contact you shortly to complete the purchase and begin installation.',
                duration: 5000
              });

              // ✅ T188: Close modal - parent will refetch on next open
              setSelectedBiddingLeadId(null);
              setIsBiddingReviewModalOpen(false);
              
            } catch (error) {
              console.error('[Phase 13G] Error selecting winner:', error);
              const message = error instanceof Error ? error.message : 'Unknown error';
              
              // ✅ T187: Use toast for errors too
              toast.error('Failed to Select Winner', {
                description: message,
                duration: 5000,
                action: {
                  label: 'Retry',
                  onClick: () => {
                    // Modal stays open for retry
                    console.log('[Phase 13G] User requested retry');
                  }
                }
              });
              
              throw error; // Re-throw so modal handles loading state
            }
          }}
        />
      )}
    </>
  );
}