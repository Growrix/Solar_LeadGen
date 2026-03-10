'use client'


import React from 'react';
import InstantQuoteForm from './InstantQuoteForm';
import { Button, Modal, X } from '@/ds';

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
  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      ariaLabel="Request a New Quote"
      className="w-full max-w-5xl max-h-[95vh] overflow-y-auto"
    >
      <div className="relative">
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute top-0 right-0"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="text-center mb-6">
          <h2 className="text-heading-2 text-foreground mb-2">Request a New Quote</h2>
          <p className="text-muted-foreground text-body-small">
            Fill out the form below to get a personalized solar quote from verified installers.
          </p>
        </div>

        <InstantQuoteForm
          onQuoteCalculated={onQuoteCalculated}
          onProceedToDetailedQuote={onProceedToDetailedQuote}
          initialData={initialData ?? null}
        />
      </div>
    </Modal>
  );
};

export default NewQuoteRequestModal;
