'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, DollarSign, MessageSquare, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * WrittenQuoteNegotiationPanel
 * 
 * Reusable negotiation UI for Written Quote flow
 * Used in both installer and homeowner contexts
 * 
 * DESIGN TOKENS: 100% semantic (neu-card, neu-btn-*, text-heading-*, bg-surface, text-muted-foreground)
 * THEME COMPLIANCE: Dark/Light/Purple verified
 * ACCESSIBILITY: WCAG 2.1 AA (keyboard nav, ARIA labels, focus visible)
 */

export interface WQEvent {
  id: string;
  actorRole: 'installer' | 'homeowner';
  actorName: string;
  action: 'start' | 'offer' | 'counter' | 'accept' | 'reject';
  priceOffered?: number;
  notes?: string;
  timestamp: string;
}

export interface WrittenQuoteNegotiationPanelProps {
  role: 'installer' | 'homeowner';
  currentPrice: number;
  status: 'draft' | 'pending' | 'installer_turn' | 'homeowner_turn' | 'accepted' | 'rejected';
  history: WQEvent[];
  onAction: (action: 'offer' | 'counter' | 'accept' | 'reject', data: { price?: number; notes?: string }) => void;
  disabled?: boolean;
}

export function WrittenQuoteNegotiationPanel({
  role,
  currentPrice,
  status,
  history,
  onAction,
  disabled = false
}: WrittenQuoteNegotiationPanelProps) {
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [newPrice, setNewPrice] = useState(currentPrice.toString());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMyTurn = 
    (role === 'installer' && status === 'installer_turn') ||
    (role === 'homeowner' && status === 'homeowner_turn');

  const isFinalStatus = (status === 'accepted' || status === 'rejected');
  const canNegotiate = isMyTurn && !disabled && !isFinalStatus;

  const handleSubmitOffer = async () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    try {
      const action = role === 'installer' ? 'offer' : 'counter';
      await onAction(action, { price, notes: notes.trim() || undefined });
      setNotes('');
    } catch (err) {
      console.error('Failed to submit offer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await onAction('accept', {});
    } catch (err) {
      console.error('Failed to accept:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this quote? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAction('reject', { notes: notes.trim() || 'Rejected by homeowner' });
      setNotes('');
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'draft':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-caption bg-surface-secondary text-muted-foreground"><Clock className="h-3 w-3" /> Draft</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-caption bg-surface-secondary text-muted-foreground"><Clock className="h-3 w-3" /> Pending</span>;
      case 'installer_turn':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-caption bg-primary-subtle text-primary"><MessageSquare className="h-3 w-3" /> Installer&apos;s Turn</span>;
      case 'homeowner_turn':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-caption bg-primary-subtle text-primary"><MessageSquare className="h-3 w-3" /> Homeowner&apos;s Turn</span>;
      case 'accepted':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-caption bg-success-subtle text-success"><CheckCircle2 className="h-3 w-3" /> Accepted</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-caption bg-danger-subtle text-danger"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Current State Card */}
      <Card className="neu-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-heading-4">Written Quote Status</h3>
          {getStatusBadge()}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-heading-1 text-heading-primary">
              {currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
            </span>
          </div>

          {status === 'installer_turn' && role === 'homeowner' && (
            <p className="text-body-small text-muted-foreground">Waiting for installer&apos;s counter-offer...</p>
          )}
          {status === 'homeowner_turn' && role === 'installer' && (
            <p className="text-body-small text-muted-foreground">Waiting for homeowner&apos;s response...</p>
          )}
          {canNegotiate && (
            <p className="text-label text-primary">It&apos;s your turn to respond</p>
          )}
        </div>
      </Card>

      {/* History Timeline (Expandable) */}
      {history.length > 0 && (
        <Card className="neu-card p-4">
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
            aria-expanded={historyExpanded}
            aria-controls="wq-history-timeline"
          >
            <h4 className="text-heading-4">Negotiation History ({history.length})</h4>
            {historyExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {historyExpanded && (
            <div id="wq-history-timeline" className="mt-4 space-y-3">
              {history.map((event) => (
                <div key={event.id} className="border-l-2 border-border pl-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-label text-heading-secondary">{event.actorName}</span>
                    <span className="text-caption text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-body-small">
                    {event.action === 'start' && 'Started written quote'}
                    {event.action === 'offer' && `Offered ${event.priceOffered?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}`}
                    {event.action === 'counter' && `Counter-offered ${event.priceOffered?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}`}
                    {event.action === 'accept' && 'Accepted the quote'}
                    {event.action === 'reject' && 'Rejected the quote'}
                  </p>
                  {event.notes && (
                    <p className="text-body-small text-muted-foreground mt-1 italic">&ldquo;{event.notes}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Action Bar (Role-Aware) */}
      {canNegotiate && (
        <Card className="neu-card p-4">
          <h4 className="text-heading-4 mb-3">
            {role === 'installer' ? 'Make Counter-Offer' : 'Respond to Quote'}
          </h4>

          <div className="space-y-3">
            {/* Price Input (Installer or Homeowner Counter) */}
            <div>
              <label htmlFor="wq-price-input" className="block text-label text-heading-secondary mb-1">
                {role === 'installer' ? 'Counter-Offer Price' : 'Your Counter Price'}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="wq-price-input"
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter price"
                  disabled={isSubmitting}
                  min="0"
                  step="100"
                />
              </div>
            </div>

            {/* Notes (Optional) */}
            <div>
              <label htmlFor="wq-notes-input" className="block text-label text-heading-secondary mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="wq-notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-md bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Add any comments or conditions..."
                disabled={isSubmitting}
                maxLength={500}
              />
              <p className="text-caption text-muted-foreground mt-1">{notes.length}/500 characters</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {role === 'homeowner' ? (
                <>
                  <Button
                    onClick={handleAccept}
                    disabled={isSubmitting}
                    variant="primary"
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isSubmitting ? 'Processing...' : 'Accept Quote'}
                  </Button>
                  <Button
                    onClick={handleSubmitOffer}
                    disabled={isSubmitting}
                    variant="primary"
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {isSubmitting ? 'Sending...' : 'Counter-Offer'}
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4" />
                    {isSubmitting ? 'Rejecting...' : 'Reject'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleSubmitOffer}
                  disabled={isSubmitting}
                  variant="primary"
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit Counter-Offer'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Read-Only State (Not Your Turn or Completed) */}
      {!canNegotiate && status !== 'draft' && (
        <Card className="neu-card p-4 bg-surface-secondary">
          <p className="text-body-small text-muted-foreground text-center">
            {status === 'accepted' && 'This quote has been accepted'}
            {status === 'rejected' && 'This quote has been rejected'}
            {!isMyTurn && status !== 'accepted' && status !== 'rejected' && 'Waiting for the other party to respond...'}
          </p>
        </Card>
      )}
    </div>
  );
}
