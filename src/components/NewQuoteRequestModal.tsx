'use client'


import React, { useEffect } from 'react';
import InstantQuoteForm from './InstantQuoteForm';

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface NewQuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuoteCalculated: (data: any) => void;
  onProceedToDetailedQuote: () => void;
  initialData?: Record<string, unknown> | null;
}

const NewQuoteRequestModal: React.FC<NewQuoteRequestModalProps> = ({
  isOpen,
  onClose,
  onQuoteCalculated,
  onProceedToDetailedQuote,
  initialData,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8 sm:py-20 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="theme-card relative w-full max-w-5xl p-4 sm:p-6 lg:p-8 max-h-[95vh] overflow-y-auto animate-slide-in-up"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-subtle hover:text-foreground transition-colors p-2 sm:p-3 rounded-xl bg-background shadow-neu-inset hover:shadow-neu-outset"
          aria-label="Close"
        >
          <XIcon />
        </button>
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-heading-3 sm:text-heading-2 text-foreground mb-2">Request a New Quote</h2>
          <p className="text-muted-foreground text-body-small">Fill out the form below to get a personalized solar quote from verified installers.</p>
        </div>
        <InstantQuoteForm
          onQuoteCalculated={onQuoteCalculated}
          onProceedToDetailedQuote={onProceedToDetailedQuote}
          initialData={initialData ?? null}
        />
      </div>
    </div>
  );
};

export default NewQuoteRequestModal;
