// ============================================================================
// ADMIN LEAD DETAIL PAGE
// ============================================================================
// Displays full lead details with admin actions: approve, reject, set price,
// assign installers, and mark as hot lead
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import Button from '@/components/Button';
import QuoteDataDisplay from '@/components/admin/QuoteDataDisplay';
import InstallerSelectorModal from '@/components/admin/InstallerSelectorModal';
import AssignmentHistoryTable from '@/components/admin/AssignmentHistoryTable';
import AdminLeadManagementModal from '@/components/admin/AdminLeadManagementModal';

// ============================================================================
// TYPES
// ============================================================================

interface Lead {
  id: string;
  homeownerId: string;
  installerId: string | null;
  status: string;
  visibility: string;
  phoneVerified: boolean;
  phoneNumber: string | null;
  name: string | null; // Phase 12: Homeowner name from lead form
  quoteType?: 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING'; // Phase 4.12: Quote type
  projectType: string;
  propertyType: string;
  postcode: string;
  location: string;
  state: string;
  address: string | null;
  energyBill: number;
  billType: string;
  roofType: string;
  budgetRange: string;
  desiredOffset: number;
  batteryRequired: boolean;
  batteryCapacity: string | null;
  timeframe: string | null;
  additionalNotes: string | null;
  quoteData: any | null; // Phase 4.5: Complete instant quote data
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  purchasedAt: string | null;
  expiresAt: string | null;
  adminNotes: string | null;
  flaggedReason: string | null;
  moderatedBy: string | null;
  moderatedAt: string | null;
  leadPrice: number | null;
  purchaseStatus: string | null;
  stripePaymentIntentId: string | null;
  // Phase 7: Assignment fields
  archivedAt: string | null;
  assignedAt: string | null;
  assignedBy: string | null;
  assignmentNotes: string | null;
  assignments?: Assignment[];
  homeowner?: {
    id: string;
    name: string | null;
    email: string | null;
    phoneVerified: boolean;
    leadSubmissionLimit: number;
    leadSubmissionCount: number;
  };
  installer?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface Assignment {
  id: string;
  installerId: string;
  installerName: string;
  installerEmail: string;
  assignedAt: string;
  assignedByName: string;
  notes: string | null;
  status: 'pending' | 'accepted' | 'removed';
}

// ============================================================================
// ICONS
// ============================================================================

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const FlameIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const LoadingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminLeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { theme } = useTheme();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [leadPrice, setLeadPrice] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  
  // Action states
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false); // Phase 7
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Phase 3: Countdown timer states
  const [enableCountdown, setEnableCountdown] = useState(true);
  const [countdownDays, setCountdownDays] = useState(7);

  // Phase 24: Admin Lead Management Modal
  const [showManagementModal, setShowManagementModal] = useState(false);
  
  // Phase 7: Additional action states
  const [reselling, setReselling] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [unarchiving, setUnarchiving] = useState(false);
  const [resettingTimer, setResettingTimer] = useState(false);
  const [resetDays, setResetDays] = useState<number>(7);

  // ============================================================================
  // FETCH LEAD DATA
  // ============================================================================

  useEffect(() => {
    fetchLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leads/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lead');
      }
      
      const data = await response.json();
      // API returns { lead: {...} }, so unwrap it
      const leadData = data.lead || data;
      setLead(leadData);
      setLeadPrice(leadData.leadPrice?.toString() || '');
      setAdminNotes(leadData.adminNotes || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // NOTE: handleApprove removed - now handled via AdminLeadManagementModal
  // ============================================================================

  // ============================================================================
  // REJECT LEAD
  // ============================================================================

  const handleReject = async () => {
    if (!lead || !rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setRejecting(true);
      const response = await fetch(`/api/leads/${lead.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: rejectReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject lead');
      }

      // Refresh lead data
      await fetchLead();
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject lead');
    } finally {
      setRejecting(false);
    }
  };

  // ============================================================================
  // UPDATE PRICE
  // ============================================================================

  const handleSavePrice = async () => {
    if (!lead || !leadPrice) {
      alert('Please enter a valid price');
      return;
    }

    try {
      setSavingPrice(true);
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadPrice: parseFloat(leadPrice),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update price');
      }

      await fetchLead();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update price');
    } finally {
      setSavingPrice(false);
    }
  };

  // ============================================================================
  // UPDATE ADMIN NOTES
  // ============================================================================

  const handleSaveNotes = async () => {
    if (!lead) return;

    try {
      setSavingNotes(true);
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update notes');
      }

      await fetchLead();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update notes');
    } finally {
      setSavingNotes(false);
    }
  };

  // ============================================================================
  // PHASE 7: ASSIGN TO INSTALLERS
  // ============================================================================

  const handleAssign = async (data: {
    installerIds: string[];
    mode: 'exclusive' | 'competitive';
    notes?: string;
    notifyInstallers: boolean;
  }) => {
    if (!lead) return;

    try {
      const response = await fetch(`/api/admin/leads/${lead.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign lead');
      }

      alert('Lead assigned successfully!');
      setShowAssignModal(false);
      await fetchLead();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to assign lead');
    }
  };

  // ============================================================================
  // PHASE 7: REMOVE ASSIGNMENT
  // ============================================================================

  const handleRemoveAssignment = async (installerId: string) => {
    if (!lead) return;

    try {
      const response = await fetch(
        `/api/admin/leads/${lead.id}/assign?installerId=${installerId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove assignment');
      }

      alert('Assignment removed successfully');
      await fetchLead();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to remove assignment');
    }
  };

  // ============================================================================
  // PHASE 7: RESELL LEAD
  // ============================================================================

  const handleResell = async () => {
    if (!lead) return;
    if (!confirm('Resell this lead? This will clear the current installer and return it to marketplace.')) return;

    try {
      setReselling(true);
      const response = await fetch(`/api/leads/${lead.id}/resell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toMarketplace: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resell lead');
      }

      alert('Lead resold successfully!');
      await fetchLead();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resell lead');
    } finally {
      setReselling(false);
    }
  };

  // ============================================================================
  // PHASE 7: ARCHIVE/UNARCHIVE LEAD
  // ============================================================================

  const handleArchive = async () => {
    if (!lead) return;
    if (!confirm('Archive this lead? It will be hidden from all views.')) return;

    try {
      setArchiving(true);
      const response = await fetch(`/api/leads/${lead.id}/archive`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to archive lead');
      }

      alert('Lead archived successfully');
      await fetchLead();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive lead');
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchive = async () => {
    if (!lead) return;

    try {
      setUnarchiving(true);
      const response = await fetch(`/api/leads/${lead.id}/unarchive`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unarchive lead');
      }

      alert('Lead unarchived successfully');
      await fetchLead();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unarchive lead');
    } finally {
      setUnarchiving(false);
    }
  };

  // ============================================================================
  // PHASE 7: RESET TIMER
  // ============================================================================

  const handleResetTimer = async () => {
    if (!lead) return;
    if (!resetDays || resetDays < 1 || resetDays > 365) {
      alert('Please enter days between 1 and 365');
      return;
    }

    try {
      setResettingTimer(true);
      const response = await fetch(`/api/leads/${lead.id}/reset-timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: resetDays }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset timer');
      }

      const data = await response.json();
      alert(`Timer extended! New expiry: ${formatDate(data.lead.expiresAt)}`);
      await fetchLead();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reset timer');
    } finally {
      setResettingTimer(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-muted text-muted-foreground',
      APPROVED: 'bg-success text-success-foreground',
      REJECTED: 'bg-error text-error-foreground',
      PURCHASED: 'bg-info text-info-foreground',
      IN_PROGRESS: 'bg-warning text-warning-foreground',
      COMPLETED: 'bg-accent text-accent-foreground',
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  // Phase 4.12: Quote Type helpers
  const getQuoteTypeLabel = (quoteType?: string) => {
    const labels: Record<string, string> = {
      CALL_VISIT: 'Call/Visit',
      WRITTEN_QUOTE: 'Written Quote',
      BIDDING: 'Competitive Bidding',
    };
    return quoteType ? labels[quoteType] || quoteType : 'Not specified';
  };

  const getQuoteTypeIcon = (quoteType?: string) => {
    const icons: Record<string, string> = {
      CALL_VISIT: '📞',
      WRITTEN_QUOTE: '📄',
      BIDDING: '🏆',
    };
    return quoteType ? icons[quoteType] || '❓' : '❓';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIcon />
        <span className="ml-2">Loading lead details...</span>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-error mb-4">{error || 'Lead not found'}</p>
        <button
          onClick={() => router.push('/admin/leads')}
          className="px-4 py-2 bg-primary text-foreground-secondary rounded-lg hover:bg-primary"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/leads')}
          className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon />
          <span>Back to Leads</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-1 mb-2 text-foreground">
              Lead Details
            </h1>
            <div className="flex items-center gap-4">
              <p className="font-mono text-body-small text-muted-foreground">
                Quote ID: <span className="">Q-{lead.id.slice(-8).toUpperCase()}</span>
              </p>
              <span className="text-body-small text-muted-foreground">•</span>
              <p className="text-body-small text-muted-foreground">
                Created: {formatDate(lead.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lead.status === 'PENDING_APPROVAL' ? (
              <Button variant="secondary" className="rounded-full px-4 py-2 text-body-small cursor-default bg-warning text-warning-foreground" disabled>
                Pending Approval
              </Button>
            ) : (
              <span className={`px-4 py-2 rounded-full text-body-small ${getStatusColor(lead.status)}`}>
                {lead.status}
              </span>
            )}
            {lead.phoneVerified && (
              <span className="px-3 py-1 bg-success text-success-foreground rounded-full text-caption">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN - Lead Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* HOMEOWNER INFO */}
          <div className="p-6 rounded-lg bg-surface shadow-neu-outset">
            <h2 className="text-heading-3 mb-4 text-foreground">
              Homeowner Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-body-small text-muted-foreground">Name</p>
                <p className="text-foreground">
                  {lead.name || lead.homeowner?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted-foreground">Email</p>
                <p className="text-foreground">
                  {lead.homeowner?.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted-foreground">Contact Number</p>
                <p className="text-foreground">
                  {lead.phoneNumber || 'Not provided'}
                  {lead.phoneNumber && (
                    <span className="ml-2">
                      {lead.phoneVerified ? (
                        <span className="text-success text-caption">✓ Verified</span>
                      ) : (
                        <span className="text-error text-caption">✗ Not verified</span>
                      )}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted-foreground">Quote Type</p>
                <p className="text-foreground">
                  <span className="mr-2">{getQuoteTypeIcon(lead.quoteType)}</span>
                  {getQuoteTypeLabel(lead.quoteType)}
                </p>
              </div>
              {/* ✅ Property Address Field - Full Width */}
              <div className="col-span-2">
                <p className="text-body-small text-muted-foreground">Property Address</p>
                <p className="text-foreground">
                  {lead.address || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* HOMEOWNER QUOTE QUOTA */}
          {lead.homeowner && (
            <div className="p-6 rounded-lg bg-surface shadow-neu-outset">
              <h2 className="text-heading-3 mb-4 text-foreground">
                📊 Quote Request Quota
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-body-small text-muted-foreground">Total Limit</p>
                    <p className="text-heading-2 text-info">
                      {lead.homeowner.leadSubmissionLimit}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-body-small text-muted-foreground">Submitted</p>
                    <p className="text-heading-2 text-warning">
                      {lead.homeowner.leadSubmissionCount}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-body-small text-muted-foreground">Remaining</p>
                    <p className={`text-heading-2 ${
                      lead.homeowner.leadSubmissionLimit - lead.homeowner.leadSubmissionCount > 0
                        ? 'text-success'
                        : 'text-error'
                    }`}>
                      {Math.max(0, lead.homeowner.leadSubmissionLimit - lead.homeowner.leadSubmissionCount)}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-colors ${
                      lead.homeowner.leadSubmissionCount >= lead.homeowner.leadSubmissionLimit
                        ? 'bg-error'
                        : lead.homeowner.leadSubmissionCount / lead.homeowner.leadSubmissionLimit > 0.8
                        ? 'bg-warning'
                        : 'bg-success'
                    }`}
                    style={{
                      width: `${Math.min(100, (lead.homeowner.leadSubmissionCount / lead.homeowner.leadSubmissionLimit) * 100)}%`
                    }}
                  />
                </div>
                
                {/* Status Message */}
                {lead.homeowner.leadSubmissionCount >= lead.homeowner.leadSubmissionLimit && (
                  <div className="p-3 rounded-lg bg-error text-error-foreground">
                    <p className="text-body-small">⚠️ Quota limit reached</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROJECT DETAILS */}
          <div className="p-6 rounded-lg bg-surface shadow-neu-outset">
            <h2 className="text-heading-3 mb-4 text-foreground">
              Project Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-body-small text-muted-foreground">Project Type</p>
                <p className="text-foreground">
                  {lead.projectType}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted-foreground">Property Type</p>
                <p className="text-foreground">
                  {lead.propertyType}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted-foreground">Location</p>
                <p className="text-foreground">
                  {lead.location}, {lead.state}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted-foreground">Postcode</p>
                <p className="text-foreground">
                  {lead.postcode}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted-foreground">Roof Type</p>
                <p className="text-foreground">
                  {lead.roofType}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted-foreground">Budget Range</p>
                <p className="text-foreground">
                  {lead.budgetRange}
                </p>
              </div>
            </div>
          </div>

          {/* ENERGY DETAILS */}
          <div className="p-6 rounded-lg bg-surface shadow-neu-outset">
            <h2 className="text-heading-3 mb-4 text-foreground">
              Energy Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-body-small text-muted-foreground">Energy Bill</p>
                <p className="text-foreground">
                  £{lead.energyBill.toFixed(2)} / {lead.billType}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted-foreground">Desired Offset</p>
                <p className="text-foreground">
                  {lead.desiredOffset}%
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted-foreground">Battery Required</p>
                <p className="text-foreground">
                  {lead.batteryRequired ? `Yes (${lead.batteryCapacity})` : 'No'}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted-foreground">Timeframe</p>
                <p className="text-foreground">
                  {lead.timeframe || 'N/A'}
                </p>
              </div>
            </div>

            {lead.additionalNotes && (
              <div className="mt-4">
                <p className="text-body-small text-muted-foreground">Additional Notes</p>
                <p className="text-foreground mt-1">
                  {lead.additionalNotes}
                </p>
              </div>
            )}
          </div>

          {/* PURCHASE INFORMATION (Phase 7) */}
          {lead.purchasedAt && (
            <div className="p-6 rounded-lg bg-surface shadow-neu-inset border border-border">
              <h2 className="text-heading-3 mb-4 text-foreground">
                Purchase Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-body-small text-muted-foreground">Purchased By:</span>
                  <span className="text-body-small text-foreground">
                    {lead.installer?.name || 'Unknown Installer'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-small text-muted-foreground">Purchase Date:</span>
                  <span className="text-body-small text-foreground">
                    {formatDate(lead.purchasedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-small text-muted-foreground">Purchase Status:</span>
                  <span className="px-2 py-1 text-caption rounded-full bg-success/10 text-success">
                    {lead.purchaseStatus || 'COMPLETED'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-small text-muted-foreground">Lead Price:</span>
                  <span className="text-body-small text-foreground">
                    ${lead.leadPrice || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* QUOTE DATA (Phase 4.5) */}
          {lead.quoteData && (
            <div className="p-6 rounded-lg bg-surface shadow-neu-outset">
              <h2 className="text-heading-3 mb-4 text-foreground">
                📊 Instant Quote Calculation
              </h2>
              <QuoteDataDisplay quoteData={lead.quoteData} />
            </div>
          )}

          {/* TIMESTAMPS */
          <div className="p-6 rounded-lg bg-surface shadow-neu-outset">
            <h2 className="text-heading-3 mb-4 text-foreground">
              Timeline
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {formatDate(lead.createdAt)}
                </span>
              </div>
              {lead.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="text-foreground">
                    {formatDate(lead.approvedAt)}
                  </span>
                </div>
              )}
              {lead.purchasedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchased</span>
                  <span className="text-foreground">
                    {formatDate(lead.purchasedAt)}
                  </span>
                </div>
              )}
              {lead.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="text-foreground">
                    {formatDate(lead.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        }</div>

        {/* RIGHT COLUMN - Admin Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* PHASE 24: UNIFIED LEAD MANAGEMENT BUTTON */}
          <div className="p-6 rounded-lg bg-surface shadow-neu-outset border border-border">
            <Button
              onClick={() => setShowManagementModal(true)}
              variant="secondary"
              className="w-full"
            >
              ⚙️ Manage Lead
            </Button>
            <p className="text-caption text-center mt-2 text-muted-foreground">
              Approve, price, assign, and manage lifecycle
            </p>
          </div>

          {/* ASSIGNMENT HISTORY (Phase 7) */}
          <div className="p-6 rounded-lg bg-surface shadow-neu-outset">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading-3 text-foreground">
                📋 Assignment History
              </h2>
              {!lead.archivedAt && (
                <Button
                  onClick={() => setShowAssignModal(true)}
                  variant="secondary"
                  className="bg-info text-info-foreground text-body-small"
                >
                  + Assign to Installer
                </Button>
              )}
            </div>
            <AssignmentHistoryTable
              assignments={lead.assignments || []}
              leadId={lead.id}
              onRemoveAssignment={handleRemoveAssignment}
            />
          </div>

          {/* UNARCHIVE SECTION */}
          {lead.archivedAt && (
            <div className="p-6 rounded-lg bg-warning/10 border-2 border-warning">
              <h2 className="text-heading-3 mb-2 text-warning">
                🗄️ Archived
              </h2>
              <p className="text-body-small mb-4 text-warning">
                This lead is archived and hidden from all views.
              </p>
              <p className="text-caption mb-4 text-muted-foreground">
                Archived: {formatDate(lead.archivedAt)}
              </p>
              <Button
                onClick={handleUnarchive}
                disabled={unarchiving}
                variant="secondary"
                className="w-full bg-success text-success-foreground text-body-small"
              >
                {unarchiving ? <LoadingIcon /> : '📤'}
                Restore Lead
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ASSIGN TO INSTALLER MODAL (Phase 7) */}
      {showAssignModal && (
        <InstallerSelectorModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssign}
          leadId={lead.id}
        />
      )}

      {/* PHASE 24: ADMIN LEAD MANAGEMENT MODAL */}
      {showManagementModal && (
        <AdminLeadManagementModal
          isOpen={showManagementModal}
          lead={lead as any}
          onClose={() => setShowManagementModal(false)}
          onApprove={async (data: {
            enableCountdown: boolean;
            countdownDays: number;
            price?: number;
            installerIds: string[];
            mode: 'exclusive' | 'competitive';
            notes?: string;
            notifyInstallers: boolean;
          }) => {
            try {
              // Validate installer selection
              if (!data.installerIds || data.installerIds.length === 0) {
                alert('Please select at least one installer');
                return;
              }

              const response = await fetch(`/api/leads/${lead.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  price: data.price || parseFloat(leadPrice),
                  assignTo: data.installerIds, // ✅ Pass installer IDs
                  enableCountdown: data.enableCountdown,
                  countdownDays: data.countdownDays, // ✅ Use modal value
                  assignmentNotes: data.notes,
                  isHot: false,
                }),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to approve and assign lead');
              }

              const result = await response.json();
              
              // Show success message
              alert(`Lead assigned successfully! Countdown: ${data.countdownDays} days`);
              
              // Refresh lead data to show assignments
              await fetchLead();
              
              // Close modal
              setShowManagementModal(false);
            } catch (err) {
              alert(err instanceof Error ? err.message : 'Failed to approve lead');
              // Don't close modal on error - let user try again
            }
          }}
          onReject={async (reason: string) => {
            // handleReject already uses rejectReason state
            setRejectReason(reason);
            await handleReject();
            setShowManagementModal(false);
          }}
          onSavePrice={async (price: string) => {
            // Update price using the passed parameter
            try {
              const response = await fetch(`/api/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  leadPrice: parseFloat(price),
                }),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update price');
              }

              // Refresh lead data immediately
              await fetchLead();
            } catch (err) {
              throw err;
            }
          }}
          onSaveNotes={async (notes: string) => {
            // Update notes using the passed parameter
            try {
              const response = await fetch(`/api/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNotes: notes }),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update notes');
              }

              // Refresh lead data immediately
              await fetchLead();
            } catch (err) {
              throw err;
            }
          }}
          onUpdateCountdown={async (days: number) => {
            // NEW: Update countdown to specific days
            try {
              const response = await fetch(`/api/leads/${lead.id}/update-countdown`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days }),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update countdown');
              }

              const result = await response.json();
              
              // Show success message
              alert(result.message || `Countdown updated to ${days} days`);
              
              // Refresh lead data
              await fetchLead();
            } catch (err) {
              alert(err instanceof Error ? err.message : 'Failed to update countdown');
              throw err;
            }
          }}
          onAssign={async (data: any) => {
            await handleAssign(data);
            setShowManagementModal(false);
          }}
          onRemoveAssignment={handleRemoveAssignment}
        />
      )}
    </div>
  );
}
