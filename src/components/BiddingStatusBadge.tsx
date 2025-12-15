import React from 'react';

interface BiddingStatusBadgeProps {
  status: 'no_bids' | 'draft' | 'submitted' | 'shortlisted' | 'not_selected';
  count?: number;
}

export default function BiddingStatusBadge({ status, count }: BiddingStatusBadgeProps) {
  const configs = {
    no_bids: {
      label: 'No Bids Yet',
      className: 'bg-muted/20 text-muted border border-muted/30'
    },
    draft: {
      label: 'Draft Saved',
      className: 'bg-warning/20 text-warning border border-warning/30'
    },
    submitted: {
      label: 'Bid Submitted',
      className: 'bg-info/20 text-info border border-info/30'
    },
    shortlisted: {
      label: 'Shortlisted',
      className: 'bg-success/20 text-success border border-success/30'
    },
    not_selected: {
      label: 'Not Selected',
      className: 'bg-error/20 text-error border border-error/30'
    }
  };

  const config = configs[status];

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-caption ${config.className}`}>
      {config.label}
      {count !== undefined && count > 0 && <span className="text-body">({count} bids)</span>}
    </span>
  );
}
