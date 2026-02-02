'use client'


import React, { useEffect } from 'react';
import InstantQuoteForm from './InstantQuoteForm';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="relative w-full max-w-5xl p-4 sm:p-6 lg:p-8 max-h-modal"
        onEscapeKeyDown={(event) => {
          // Existing Escape handling is implemented via the component's effect.
          event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        <DialogClose asChild>
          <button
            className="absolute top-4 right-4 text-subtle hover:text-foreground transition-colors p-2 sm:p-3 rounded-xl bg-background shadow-neu-inset hover:shadow-neu-outset"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </DialogClose>

        <div className="text-center mb-6 sm:mb-8">
          <DialogTitle className="text-heading-3 text-foreground mb-2">Request a New Quote</DialogTitle>
          <DialogDescription className="text-body-small text-muted-foreground">
            Fill out the form below to get a personalized solar quote from verified installers.
          </DialogDescription>
        </div>
        <InstantQuoteForm
          onQuoteCalculated={onQuoteCalculated}
          onProceedToDetailedQuote={onProceedToDetailedQuote}
          initialData={initialData ?? null}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewQuoteRequestModal;
