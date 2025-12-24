/**
 * NegotiationTimeline Component
 * 
 * Displays negotiation history for Written Quote flow
 * Used in both WrittenQuoteBuilderModal (installer) and HomeownerWrittenQuoteReviewModal (homeowner)
 * 
 * Phase 13W - Written Quote Negotiation
 */

'use client';

import React from 'react';
import { format } from 'date-fns';
import type { NegotiationEvent } from '@/types/written-quote';

interface NegotiationTimelineProps {
  writtenQuoteId: string;
  negotiations: NegotiationEvent[];
  currentAmount: number;
}

/**
 * Map action types to icons and labels
 */
const ACTION_CONFIG = {
  SUBMIT: {
    icon: '📋',
    label: 'Initial Quote',
    color: 'text-primary',
  },
  COUNTER: {
    icon: '💬',
    label: 'Counter Offer',
    color: 'text-warning',
  },
  REVISE: {
    icon: '💬',
    label: 'Revised Quote',
    color: 'text-info',
  },
  ACCEPT: {
    icon: '✅',
    label: 'Deal Closed',
    color: 'text-success',
  },
} as const;

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return format(date, 'MMM dd, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return timestamp;
  }
}

export default function NegotiationTimeline({
  writtenQuoteId,
  negotiations,
  currentAmount,
}: NegotiationTimelineProps) {
  if (negotiations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-body text-muted-foreground">
          No negotiation activity yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Amount Display */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-label text-foreground">Current Amount:</span>
          <span className="text-heading-4 text-primary">
            {formatCurrency(currentAmount)}
          </span>
        </div>
      </div>

      {/* Timeline Events */}
      <div className="space-y-3">
        {negotiations.map((event, index) => {
          const config = ACTION_CONFIG[event.action];
          const isLatest = index === negotiations.length - 1;

          return (
            <div
              key={event.id}
              className={`
                relative pl-10 pb-4 border-l-2
                ${isLatest ? 'border-primary' : 'border-border'}
              `}
            >
              {/* Timeline Icon */}
              <div
                className={`
                  absolute left-[-17px] top-0
                  w-8 h-8 rounded-full
                  flex items-center justify-center
                  text-xl
                  ${isLatest ? 'bg-primary' : 'bg-surface'}
                  border-2 border-border
                `}
              >
                {config.icon}
              </div>

              {/* Event Content */}
              <div className="space-y-2">
                {/* Action Label & Role */}
                <div className="flex items-center justify-between">
                  <span className={`text-label ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {event.actorRole === 'INSTALLER' ? 'Installer' : 'Homeowner'}
                  </span>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between">
                  <span className="text-body text-foreground">
                    {formatCurrency(event.amount)}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {formatTimestamp(event.createdAt)}
                  </span>
                </div>

                {/* Optional Message */}
                {event.message && (
                  <div className="mt-2 p-3 bg-surface rounded-lg border border-border">
                    <p className="text-body-small text-foreground italic">
                      &ldquo;{event.message}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline Footer */}
      <div className="pt-4 border-t border-border">
        <p className="text-caption text-muted-foreground text-center">
          {negotiations.length} {negotiations.length === 1 ? 'event' : 'events'} in negotiation history
        </p>
      </div>
    </div>
  );
}
