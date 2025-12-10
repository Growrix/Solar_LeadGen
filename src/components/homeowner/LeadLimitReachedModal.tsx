
'use client';

import React from 'react';
import Button from '@/components/ui/button';

// --- Icon Components ---
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-warning">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

interface LeadLimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  usedQuotes: number;
  totalQuoteLimit: number;
}

const LeadLimitReachedModal: React.FC<LeadLimitReachedModalProps> = ({
  isOpen,
  onClose,
  usedQuotes,
  totalQuoteLimit,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@solarmatch.com.au?subject=Request%20Additional%20Quote%20Limit';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card bg-surface shadow-neu-outset-md text-foreground">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Close"
        >
          <XIcon />
        </button>

        {/* Warning Icon */}
        <div className="flex flex-col items-center justify-center pt-8 pb-6">
          <AlertCircleIcon />
          <h2 className="text-heading-1 text-foreground mt-4 mb-2">
            Quote Request Limit Reached
          </h2>
          <p className="text-muted-foreground text-center max-w-lg">
            You&apos;ve reached your maximum number of free quote requests. Contact us to request additional quotes.
          </p>
        </div>

        {/* Usage Card */}
        <div className="mx-6 mb-6 p-6 card bg-warning/10 border border-warning">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <BarChartIcon />
              <div>
                <h3 className="text-heading-4 text-foreground mb-1">
                  Quote Usage
                </h3>
                <p className="text-muted-foreground text-body-small">
                  All available quote requests have been used
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-heading-1 text-warning">
                {usedQuotes}/{totalQuoteLimit}
              </div>
              <p className="text-body-small text-muted-foreground">quotes used</p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mx-6 mb-6 p-6 card bg-surface border border-border">
          <h3 className="text-heading-4 text-foreground mb-4 flex items-center gap-2">
            <BarChartIcon />
            What happens next?
          </h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Review the quotes you&apos;ve already received from installers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Contact installers directly for follow-up questions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>If you need additional quotes, contact our support team</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>We can discuss options for requesting more quotes</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mx-6 mb-6">
          <Button
            onClick={onClose}
            variant="primary"
            className="flex-1"
          >
            Close
          </Button>
          {/* Use semantic Button component instead of legacy class */}
          <Button
            onClick={handleContactSupport}
            variant="secondary"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <MailIcon />
            Contact Support
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mx-6 mb-6 p-4 card bg-primary/10 border border-primary/20">
          <p className="text-body-small text-muted-foreground text-center">
            <strong className="text-foreground">Need more quotes?</strong> Our team is here to help! 
            Email us at{' '}
            <a href="mailto:support@solarmatch.com.au" className="text-primary hover:underline">
              support@solarmatch.com.au
            </a>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LeadLimitReachedModal;
