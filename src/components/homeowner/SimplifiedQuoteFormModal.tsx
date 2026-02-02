'use client'

import React from 'react';
import { X } from 'lucide-react';
import SimplifiedQuoteForm from './SimplifiedQuoteForm';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';

interface SimplifiedQuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Record<string, unknown> | null;
}

/**
 * SimplifiedQuoteFormModal
 * 
 * Modal wrapper for SimplifiedQuoteForm - used when homeowners with existing quotes
 * want to request more quotes. Shows a single-page pre-filled form instead of the
 * multi-step InstantQuoteForm.
 * 
 * Flow:
 * - User with 1+ existing quotes clicks"Request more quotes"
 * - This modal opens with their most recent quote data pre-filled
 * - User can edit any fields and recalculate
 * - On submit, opens QuoteTypeDistributionModal for lead submission
 */
const SimplifiedQuoteFormModal: React.FC<SimplifiedQuoteFormModalProps> = ({ 
  isOpen, 
  onClose,
  onSubmit,
  initialData,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="theme-card relative w-full max-w-5xl p-4 sm:p-6 lg:p-8 animate-slide-in-up max-h-modal overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-heading-2 text-foreground">Request More Quotes</h2>
            <p className="text-body-small text-muted-foreground mt-1">
              Review and update your details below to get new quotes from verified installers
            </p>
          </div>
          <DialogClose asChild>
            <button
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </DialogClose>
        </div>
        
        <SimplifiedQuoteForm 
          onSubmit={onSubmit}
          initialData={initialData ?? null}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SimplifiedQuoteFormModal;
