'use client'

import React, { useEffect } from 'react';
import Button from '@/components/ui/button';

// --- Icon Components ---
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-primary-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface QuoteSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDashboardClick: () => void;
}

const QuoteSuccessModal: React.FC<QuoteSuccessModalProps> = ({ isOpen, onClose, onDashboardClick }) => {
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-20 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="theme-card relative w-full max-w-lg p-8 animate-slide-in-up text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute top-4 right-4 p-2"
          aria-label="Close"
        >
          <XIcon />
        </Button>
        
        <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
          <CheckCircleIcon />
        </div>
        
        <h2 className="text-heading-2 text-foreground mb-4">
          Success! Your Quote Request is Submitted.
        </h2>
        
        <p className="text-muted-foreground mb-6">
          Our verified installers will review your details shortly. You&apos;ll receive email notifications and can track all updates directly from your new dashboard.
        </p>

        <div className="mt-8 mb-6 p-4 bg-muted/50 rounded-xl text-left">
            <p className="text-body-small text-muted-foreground">
                <strong>Explore your dashboard to unlock exclusive features:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Live bidding from installers</li>
                    <li>Direct chat with professionals</li>
                    <li>Full quote request history</li>
                    <li>And much more!</li>
                </ul>
            </p>
        </div>

        <Button
          onClick={onDashboardClick}
          variant="primary"
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default QuoteSuccessModal;

