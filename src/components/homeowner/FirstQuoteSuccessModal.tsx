'use client';

import React from 'react';
import Button from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { CheckCircle2, Info, ShieldCheck, X } from 'lucide-react';

// --- Icon Components ---
const XIcon = () => <X className="h-6 w-6" />;
const CheckCircleIcon = () => <CheckCircle2 className="h-16 w-16 text-success" />;
const ShieldCheckIcon = () => <ShieldCheck className="h-5 w-5 text-success" />;
const InfoIcon = () => <Info className="h-5 w-5 text-primary" />;

interface FirstQuoteSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyContact: () => void;
  quoteType: 'CALL_VISIT' | 'WRITTEN_QUOTE';
  remainingQuotes: number;
  totalQuoteLimit: number;
}

const FirstQuoteSuccessModal: React.FC<FirstQuoteSuccessModalProps> = ({
  isOpen,
  onClose,
  onVerifyContact,
  remainingQuotes,
  totalQuoteLimit,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="theme-card relative w-full max-w-2xl max-h-modal overflow-y-auto p-0">
        <DialogClose asChild>
          <button
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </DialogClose>

        <div className="flex flex-col items-center justify-center pt-8 pb-6">
          <div className="bg-background p-4 rounded-xl shadow-neu-inset flex items-center justify-center w-20 h-20 mb-4">
            <CheckCircleIcon />
          </div>
          <h2 className="text-heading-1 text-foreground mt-4 mb-2">Quote Request Submitted Successfully!</h2>
          <p className="text-muted-foreground text-center max-w-lg">
            We&apos;re matching you with verified solar installers in your area. You&apos;ll receive quotes soon.
          </p>
        </div>

        <div className="mx-6 mb-6 p-6 bg-surface rounded-xl border border-border shadow-neu-outset">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-heading-4 text-foreground mb-1">Remaining Quote Balance</h3>
              <p className="text-muted-foreground text-body-small">You can submit more free quote requests</p>
            </div>
            <div className="text-right">
              <div className="text-heading-1 text-accent">{remainingQuotes}</div>
              <div className="text-body-small text-muted-foreground">of {totalQuoteLimit} total</div>
            </div>
          </div>
        </div>

        <div className="mx-6 mb-6 space-y-4">
          <div className="p-5 bg-surface rounded-xl border border-success/30 shadow-neu-outset">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                <ShieldCheckIcon />
              </div>
              <div className="flex-1">
                <h4 className="text-success mb-2">Verify Your Contact Number for More Free Quotes</h4>
                <p className="text-body-small text-muted-foreground mb-3">
                  Verify your phone number to unlock additional free quote requests and get priority matching with installers.
                </p>
                <Button onClick={onVerifyContact} variant="primary" className="w-auto">
                  <ShieldCheckIcon />
                  <span>Verify Contact Number</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 px-6 pb-6">
          <DialogClose asChild>
            <Button variant="secondary" className="w-auto">
              Go to Dashboard
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstQuoteSuccessModal;
