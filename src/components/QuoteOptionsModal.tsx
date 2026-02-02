'use client'

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import OTPVerificationModal from './OTPVerificationModal';
import Button from '@/components/ui/button';
import { X, Phone, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface QuoteOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (type: 'call_visit' | 'written') => void;
  quoteData?: any; // Data from InstantQuoteForm
}

const QuoteOptionsModal: React.FC<QuoteOptionsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectOption,
  quoteData 
}) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpVerificationData, setOtpVerificationData] = useState<{
    phoneNumber: string;
    verificationId: string;
    expiresAt: Date;
  } | null>(null);
  const [pendingQuoteType, setPendingQuoteType] = useState<'call_visit' | 'written' | null>(null);

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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsSubmitting(false);
      setShowOTPModal(false);
      setOtpVerificationData(null);
      setPendingQuoteType(null);
    }
  }, [isOpen]);

  // Handle lead submission - simply pass selection to parent
  // Parent component will handle auth check, lead submission, and OTP flow
  const handleSubmitLead = async (quoteType: 'call_visit' | 'written') => {
    // Always pass to parent - parent will decide whether to show signup or submit directly
    onSelectOption(quoteType);
  };

  // Send OTP for verification
  const handleSendOTP = async (phoneNumber: string) => {
    if (!phoneNumber) {
      setError('Phone number is required.');
      return;
    }

    try {
      const response = await fetch('/api/verification/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Show OTP modal
        setOtpVerificationData({
          phoneNumber: phoneNumber,
          verificationId: data.verificationId,
          expiresAt: new Date(data.expiresAt)
        });
        setShowOTPModal(true);
      } else if (response.status === 429) {
        // Rate limited
        setError(data.error || 'Too many verification requests. Please try again later.');
      } else {
        setError(data.error || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      console.error('[QuoteOptionsModal] Send OTP error:', err);
      setError('Failed to send verification code. Please try again.');
    }
  };

  // Handle OTP verification success
  const handleOTPVerificationSuccess = async () => {
    setShowOTPModal(false);
    setOtpVerificationData(null);

    // Retry lead submission now that user is verified
    if (pendingQuoteType) {
      await handleSubmitLead(pendingQuoteType);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    const phoneNumber = otpVerificationData?.phoneNumber || quoteData?.phone || quoteData?.phoneNumber || '';
    if (!phoneNumber) {
      return { success: false, error: 'Phone number not found' };
    }

    try {
      const response = await fetch('/api/verification/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber
        })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          verificationId: data.verificationId,
          expiresAt: new Date(data.expiresAt)
        };
      } else {
        return {
          success: false,
          error: data.error,
          retryAfter: data.retryAfter
        };
      }
    } catch (err) {
      console.error('[QuoteOptionsModal] Resend OTP error:', err);
      return {
        success: false,
        error: 'Failed to resend verification code'
      };
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl w-full p-8 relative animate-slide-in-up max-h-modal overflow-y-auto">
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute top-4 right-4"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="text-center mb-8">
          <h2 className="text-heading-2 text-foreground mb-4">Choose Your Quote Type</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select how you&apos;d like to receive quotes from our verified solar installers
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Call/Visit Quote Option */}
          <div
            className="bg-background p-6 rounded-2xl shadow-neu-outset hover:shadow-neu-outset-lg transition-colors duration-300 cursor-pointer"
            onClick={() => onSelectOption('call_visit')}
          >
            <div className="bg-background p-4 rounded-xl shadow-neu-inset w-16 h-16 flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-heading-3 text-foreground mb-2">Call/Visit Quote</h3>
            <p className="text-muted-foreground mb-6">
              Speak directly with installers who can call you or schedule a site visit
            </p>
            <ul className="space-y-2 mb-6">
              {[
                "Phone or on-site consultation",
                "Speak directly with installers",
                "Faster quote turnaround",
                "Personalized attention"
              ].map(item => (
                <li key={item} className="flex items-start space-x-2">
                  <span className="text-primary"><CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" /></span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="primary"
              onClick={(e) => { e.stopPropagation(); handleSubmitLead('call_visit'); }}
              disabled={isSubmitting}
              className="w-full mt-6"
            >
              {isSubmitting && pendingQuoteType === 'call_visit' ? 'Submitting...' : 'Select Call/Visit Quote'}
            </Button>
          </div>
          {/* Written Quote Option */}
          <div
            className="bg-background p-6 rounded-2xl shadow-neu-outset hover:shadow-neu-outset-lg transition-colors duration-300 cursor-pointer"
            onClick={() => !isSubmitting && handleSubmitLead('written')}
          >
            <div className="bg-background p-4 rounded-xl shadow-neu-inset w-16 h-16 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-heading-3 text-foreground mb-2">Written Quote</h3>
            <p className="text-muted-foreground mb-6">
              Receive detailed written quotes through our secure platform
            </p>
            <ul className="space-y-2 mb-6">
              {[ 
                "No phone calls required",
                "Receive detailed written quotes",
                "Compare at your convenience",
                "Option to open bidding & negotiate"
              ].map(item => (
                <li key={item} className="flex items-start space-x-2">
                  <span className="text-primary"><CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" /></span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="primary"
              onClick={(e) => { e.stopPropagation(); handleSubmitLead('written'); }}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting && pendingQuoteType === 'written' ? 'Submitting...' : 'Select Written Quote'}
            </Button>
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <div className="mt-6 rounded-xl p-4 shadow-neu-inset bg-destructive/10 border border-destructive/30 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-body-small text-destructive/90">{error}</p>
          </div>
        )}
        <div className="theme-card mt-6 p-4 text-center">
          <p className="text-muted-foreground text-body-small">
            Both options connect you with our network of verified, licensed solar installers.
            Your information is secure and will only be shared with installers you choose to engage with.
          </p>
        </div>
      </DialogContent>
      {/* OTP Verification Modal */}
      {showOTPModal && otpVerificationData && (
        <OTPVerificationModal
          isOpen={showOTPModal}
          onClose={() => {
            setShowOTPModal(false);
            setOtpVerificationData(null);
          }}
          phoneNumber={otpVerificationData.phoneNumber}
          verificationId={otpVerificationData.verificationId}
          expiresAt={otpVerificationData.expiresAt}
          onVerificationSuccess={handleOTPVerificationSuccess}
          onResendOTP={handleResendOTP}
        />
      )}
    </Dialog>
  );
};

export default QuoteOptionsModal;
