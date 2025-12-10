'use client'

import React, { useEffect } from 'react';
import SimplifiedQuoteForm from './SimplifiedQuoteForm';

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
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
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="theme-card relative w-full max-w-5xl p-4 sm:p-6 lg:p-8 animate-slide-in-up max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-heading-2 text-foreground">Request More Quotes</h2>
            <p className="text-body-small text-muted-foreground mt-1">
              Review and update your details below to get new quotes from verified installers
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>
        
        <SimplifiedQuoteForm 
          onSubmit={onSubmit}
          initialData={initialData ?? null}
        />
      </div>
    </div>
  );
};

export default SimplifiedQuoteFormModal;
