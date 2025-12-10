import React from 'react';
import Button from '@/components/ui/button';

interface RequestMoreQuotesCTAProps {
  remaining: number;
  quoteLimit: number;
  totalSubmitted: number;
  requiresVerification: boolean;
  onRequest: () => void;
  onVerifyContact: () => void;
  onLimitReached?: () => void; // New: open limit reached modal
  isProcessing?: boolean;
  className?: string;
}

const RequestMoreQuotesCTA: React.FC<RequestMoreQuotesCTAProps> = ({
  remaining,
  quoteLimit,
  totalSubmitted,
  requiresVerification,
  onRequest,
  onVerifyContact,
  onLimitReached,
  isProcessing = false,
  className = '',
}) => {
  const isFirstQuote = totalSubmitted === 0;
  const used = Math.max(0, quoteLimit - remaining);
  const progress = quoteLimit > 0 ? Math.min(100, (used / quoteLimit) * 100) : 0;
  const hasRemaining = remaining > 0;

  return (
  <section
    className={`bg-background rounded-card p-5 sm:p-6 shadow-neu-outset transition-colors duration-200 hover:shadow-neu-inset focus-within:shadow-neu-inset ${className}`}
    tabIndex={-1}
  >
  <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 shadow-neu-inset rounded-lg p-3 bg-background/80">
        <div>
          <p className="text-caption uppercase tracking-wide text-muted-foreground">Quote Requests</p>
          <h2 className="text-heading-3 text-foreground">
            {isFirstQuote 
              ? 'Request Your First Quote'
              : requiresVerification 
                ? 'Verify your phone to unlock more quotes' 
                : 'Request additional quotes'}
          </h2>
          <p className="text-body-small text-muted-foreground mt-1">
            {isFirstQuote 
              ? 'Get started with your solar journey - request your first quote from verified installers.'
              : `You have used ${used} of your ${quoteLimit} available quote requests.`}
          </p>
        </div>
        {!isFirstQuote && (
          <div className="text-right">
            <p className="text-caption text-muted-foreground">Remaining balance</p>
            <p className="text-heading-2 text-primary">{Math.max(remaining, 0)}</p>
          </div>
        )}
      </header>

      {!isFirstQuote && (
        <div className="mb-4">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-colors"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="mt-2 flex justify-between text-caption text-muted-foreground">
            <span>{used} used</span>
            <span>{remaining} remaining</span>
          </div>
        </div>
      )}

      {isFirstQuote ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="text-body-small text-muted-foreground">
            Welcome! You&apos;re ready to get quotes from verified solar installers. No phone verification required for your first quote.
          </p>
          <Button
            type="button"
            onClick={onRequest}
            disabled={isProcessing}
            variant="secondary"
            className="w-full sm:w-auto px-6 py-2.5"
          >
            {isProcessing ? 'Opening…' : 'Get Started'}
          </Button>
        </div>
      ) : requiresVerification ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="text-body-small text-warning">
            Your phone number must be verified before you can request more quotes. This keeps the marketplace fair and secure.
          </p>
          <Button
            type="button"
            onClick={onVerifyContact}
            disabled={isProcessing}
            variant="secondary"
            className="w-full sm:w-auto px-6 py-2.5 bg-warning/10 text-warning hover:bg-warning/15"
          >
            {isProcessing ? 'Opening…' : 'Verify phone number'}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="text-body-small text-muted-foreground">
            {hasRemaining
              ? 'Ready to explore more installers? Launch the quote request wizard to tailor your next project.'
              : 'You have reached your current quote limit. Increase your allowance or check with support for options.'}
          </p>
          <Button
            type="button"
            onClick={() => {
              if (isProcessing) return;
              if (hasRemaining) {
                onRequest();
              } else {
                if (onLimitReached) {
                  onLimitReached();
                } else {
                  // Fallback: dispatch global event if callback not provided
                  window.dispatchEvent(new CustomEvent('leadLimitReached'));
                }
              }
            }}
            disabled={isProcessing}
            variant="secondary"
            className="w-full sm:w-auto px-6 py-2.5"
          >
            {hasRemaining ? (isProcessing ? 'Opening…' : 'Request more quotes') : 'Limit reached'}
          </Button>
        </div>
      )}
    </section>
  );
};

export default RequestMoreQuotesCTA;
