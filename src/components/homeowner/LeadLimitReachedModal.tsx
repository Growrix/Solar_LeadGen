
'use client';

import React from 'react';
import { AlertCircle, BarChart3, Mail, X } from 'lucide-react';
import Button from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';

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
  const handleContactSupport = () => {
    window.location.href = 'mailto:support@solarmatch.com.au?subject=Request%20Additional%20Quote%20Limit';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="w-full max-w-2xl max-h-modal overflow-y-auto bg-surface shadow-neu-outset-md text-foreground animate-slide-in-up p-0">
        <div className="card bg-surface shadow-neu-outset-md text-foreground">
          {/* Close Button */}
          <DialogClose asChild>
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </DialogClose>

        {/* Warning Icon */}
        <div className="flex flex-col items-center justify-center pt-8 pb-6">
          <AlertCircle className="h-16 w-16 text-warning" />
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
              <BarChart3 className="h-5 w-5 text-primary" />
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
            <BarChart3 className="h-5 w-5 text-primary" />
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
          <DialogClose asChild>
            <Button variant="primary" className="flex-1">
              Close
            </Button>
          </DialogClose>
          {/* Use semantic Button component instead of legacy class */}
          <Button
            onClick={handleContactSupport}
            variant="secondary"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Mail className="h-5 w-5 text-primary" />
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
      </DialogContent>
    </Dialog>
  );
};

export default LeadLimitReachedModal;
