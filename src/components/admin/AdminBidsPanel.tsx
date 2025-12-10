'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, Flag, MessageSquare, Award, DollarSign, Star, Phone, Mail, Building } from 'lucide-react';
import Button from '@/components/ui/button';
import BiddingStatusBadge from '@/components/BiddingStatusBadge';

interface AdminBid {
  id: string;
  installerName: string; // Real name (not anonymized for admin)
  installerCompany: string;
  installerEmail: string;
  installerPhone: string;
  installerRating: number;
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
  annualSavings: number;
  submittedAt: string;
  status: 'submitted' | 'shortlisted' | 'not_selected';
  contactRequested: boolean;
  contactApproved: boolean;
  flagged: boolean;
  flagReason?: string;
}

interface AdminBidsPanelProps {
  leadId: string;
  propertyAddress: string;
  bids: AdminBid[];
  onShortlist: (bidId: string) => Promise<void>;
  onReject: (bidId: string) => Promise<void>;
  onApproveContact: (bidId: string) => Promise<void>;
  onFlag: (bidId: string, reason: string) => Promise<void>;
  onUnflag: (bidId: string) => Promise<void>;
}

export default function AdminBidsPanel({
  leadId,
  propertyAddress,
  bids,
  onShortlist,
  onReject,
  onApproveContact,
  onFlag,
  onUnflag
}: AdminBidsPanelProps) {
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [flaggingBid, setFlaggingBid] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');

  const handleShortlist = async (bidId: string) => {
    setActionInProgress(bidId);
    try {
      await onShortlist(bidId);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (bidId: string) => {
    setActionInProgress(bidId);
    try {
      await onReject(bidId);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApproveContact = async (bidId: string) => {
    setActionInProgress(bidId);
    try {
      await onApproveContact(bidId);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleFlag = async (bidId: string) => {
    if (!flagReason.trim()) return;
    setActionInProgress(bidId);
    try {
      await onFlag(bidId, flagReason);
      setFlaggingBid(null);
      setFlagReason('');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUnflag = async (bidId: string) => {
    setActionInProgress(bidId);
    try {
      await onUnflag(bidId);
    } finally {
      setActionInProgress(null);
    }
  };

  const sortedBids = [...bids].sort((a, b) => {
    // Sort by status, then price
    if (a.status === 'shortlisted' && b.status !== 'shortlisted') return -1;
    if (b.status === 'shortlisted' && a.status !== 'shortlisted') return 1;
    if (a.status === 'not_selected' && b.status !== 'not_selected') return 1;
    if (b.status === 'not_selected' && a.status !== 'not_selected') return -1;
    return a.totalPrice - b.totalPrice;
  });

  const stats = {
    total: bids.length,
    shortlisted: bids.filter(b => b.status === 'shortlisted').length,
    rejected: bids.filter(b => b.status === 'not_selected').length,
    contactRequests: bids.filter(b => b.contactRequested && !b.contactApproved).length,
    flagged: bids.filter(b => b.flagged).length
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-surface rounded-2xl shadow-neu-inset p-6">
        <h3 className="text-heading-4 text-foreground mb-4">
          Bid Management: {propertyAddress}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-background rounded-xl p-4">
            <p className="text-caption text-muted-foreground mb-1">Total Bids</p>
            <p className="text-heading-3 text-foreground">{stats.total}</p>
          </div>
          <div className="bg-background rounded-xl p-4">
            <p className="text-caption text-muted-foreground mb-1">Shortlisted</p>
            <p className="text-heading-3 text-success">{stats.shortlisted}</p>
          </div>
          <div className="bg-background rounded-xl p-4">
            <p className="text-caption text-muted-foreground mb-1">Rejected</p>
            <p className="text-heading-3 text-error">{stats.rejected}</p>
          </div>
          <div className="bg-background rounded-xl p-4">
            <p className="text-caption text-muted-foreground mb-1">Contact Requests</p>
            <p className="text-heading-3 text-warning">{stats.contactRequests}</p>
          </div>
          <div className="bg-background rounded-xl p-4">
            <p className="text-caption text-muted-foreground mb-1">Flagged</p>
            <p className="text-heading-3 text-error">{stats.flagged}</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-info/10 border border-info/20 rounded-xl p-4">
        <p className="text-body-small text-info">
          <strong>Admin Controls:</strong> You can view all installer details (names are NOT anonymized for admin). 
          Shortlist the best bids for homeowner review, reject low-quality bids, approve contact requests, and flag suspicious submissions.
        </p>
      </div>

      {/* Bids Table */}
      {sortedBids.length === 0 ? (
        <div className="bg-surface rounded-2xl shadow-neu-inset p-12 text-center">
          <Award className="h-16 w-16 text-muted mx-auto mb-4" />
          <h3 className="text-heading-4 text-foreground mb-2">No Bids Submitted</h3>
          <p className="text-body text-muted-foreground">
            Waiting for installers to submit their quotes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBids.map((bid) => (
            <div
              key={bid.id}
              className={`bg-surface rounded-2xl shadow-neu-inset p-6 border-2 transition-all ${
                bid.flagged
                  ? 'border-error/50'
                  : bid.status === 'shortlisted'
                  ? 'border-success/50'
                  : bid.status === 'not_selected'
                  ? 'border-error/30 opacity-60'
                  : 'border-transparent'
              }`}
            >
              {/* Installer Header */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-heading-4 text-foreground">
                      {bid.installerName}
                    </h4>
                    <BiddingStatusBadge status={bid.status} />
                    {bid.flagged && (
                      <span className="bg-error/20 text-error px-2 py-1 rounded-full text-caption flex items-center gap-1">
                        <Flag className="h-3 w-3" />
                        Flagged
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-body-small text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {bid.installerCompany}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {bid.installerPhone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {bid.installerEmail}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(bid.installerRating)
                              ? 'fill-warning text-warning'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                      <span className="text-caption">
                        {bid.installerRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-caption text-muted-foreground mb-1">Submitted</p>
                  <p className="text-body-small text-foreground">
                    {new Date(bid.submittedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Flag Reason (if flagged) */}
              {bid.flagged && bid.flagReason && (
                <div className="bg-error/10 border border-error/30 rounded-xl p-3 mb-4">
                  <p className="text-body-small text-error">
                    <strong>Flag Reason:</strong> {bid.flagReason}
                  </p>
                </div>
              )}

              {/* Bid Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Pricing */}
                <div className="bg-background rounded-xl p-4">
                  <p className="text-caption text-muted-foreground mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Pricing
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-body-small text-muted-foreground">Total</span>
                      <span className="text-heading-4 text-foreground">
                        ${bid.totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-caption text-muted-foreground">Per Watt</span>
                      <span className="text-body-small text-foreground">
                        ${bid.pricePerWatt.toFixed(2)}/W
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Specs */}
                <div className="bg-background rounded-xl p-4">
                  <p className="text-caption text-muted-foreground mb-2">System Details</p>
                  <div className="space-y-1 text-body-small">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size</span>
                      <span className="text-foreground">{bid.systemSize} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Panels</span>
                      <span className="text-foreground">{bid.panelBrand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inverter</span>
                      <span className="text-foreground">{bid.inverterBrand}</span>
                    </div>
                    {bid.batteryBrand && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Battery</span>
                        <span className="text-foreground">
                          {bid.batteryBrand} ({bid.batteryCapacity} kWh)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial & Timeline */}
                <div className="bg-background rounded-xl p-4">
                  <p className="text-caption text-muted-foreground mb-2">Performance</p>
                  <div className="space-y-1 text-body-small">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Savings</span>
                      <span className="text-success">${bid.annualSavings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payback</span>
                      <span className="text-foreground">{bid.paybackYears} yrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Warranty</span>
                      <span className="text-foreground">{bid.warranty} yrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeline</span>
                      <span className="text-foreground">{bid.installationTimeline}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Request Status */}
              {bid.contactRequested && (
                <div className={`rounded-xl p-4 mb-4 ${
                  bid.contactApproved 
                    ? 'bg-success/10 border border-success/30' 
                    : 'bg-warning/10 border border-warning/30'
                }`}>
                  <p className={`text-body-small flex items-center gap-2 ${
                    bid.contactApproved ? 'text-success' : 'text-warning'
                  }`}>
                    <MessageSquare className="h-4 w-4" />
                    {bid.contactApproved 
                      ? 'Contact Approved - Homeowner can see installer details'
                      : 'Contact Requested - Awaiting Admin Approval'
                    }
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {bid.status === 'submitted' && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => handleShortlist(bid.id)}
                      disabled={actionInProgress === bid.id}
                      className="bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {actionInProgress === bid.id ? 'Shortlisting...' : 'Shortlist'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(bid.id)}
                      disabled={actionInProgress === bid.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {actionInProgress === bid.id ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </>
                )}

                {bid.status === 'shortlisted' && (
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(bid.id)}
                    disabled={actionInProgress === bid.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Remove from Shortlist
                  </Button>
                )}

                {bid.contactRequested && !bid.contactApproved && (
                  <Button
                    variant="primary"
                    onClick={() => handleApproveContact(bid.id)}
                    disabled={actionInProgress === bid.id}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {actionInProgress === bid.id ? 'Approving...' : 'Approve Contact Request'}
                  </Button>
                )}

                {!bid.flagged ? (
                  <Button
                    variant="outline"
                    onClick={() => setFlaggingBid(bid.id)}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Flag as Suspicious
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleUnflag(bid.id)}
                    disabled={actionInProgress === bid.id}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Remove Flag
                  </Button>
                )}
              </div>

              {/* Flag Input (if flagging) */}
              {flaggingBid === bid.id && (
                <div className="mt-4 bg-error/10 border border-error/30 rounded-xl p-4">
                  <label className="text-body-small text-foreground block mb-2">
                    Reason for flagging this bid:
                  </label>
                  <textarea
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="form-input w-full px-4 py-3 mb-3 min-h-[80px]"
                    placeholder="E.g., Suspiciously low price, unverified company, quality concerns..."
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleFlag(bid.id)}
                      disabled={!flagReason.trim() || actionInProgress === bid.id}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Confirm Flag
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFlaggingBid(null);
                        setFlagReason('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
