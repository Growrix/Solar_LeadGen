'use client'

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import OTPVerificationModal from './OTPVerificationModal';
import Button from '@/components/ui/button';
import { X } from 'lucide-react';

// --- Icon Components (Migrated: XIcon replaced with lucide-react X) ---
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const AlertCircleIcon = ({ className ="h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;

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
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-20 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="theme-card max-w-3xl w-full p-8 relative animate-slide-in-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Migrated: button ? shadcn Button - preserved onClick, close functionality */}
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
              <PhoneIcon />
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
                  <span className="text-primary"><CheckCircleIcon /></span>
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
              <FileTextIcon />
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
                    <span className="text-primary"><CheckCircleIcon /></span>
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
            <AlertCircleIcon className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-body-small text-destructive/90">{error}</p>
          </div>
        )}
        
        <div className="theme-card mt-6 p-4 text-center">
          <p className="text-muted-foreground text-body-small">
            Both options connect you with our network of verified, licensed solar installers.
            Your information is secure and will only be shared with installers you choose to engage with.
          </p>
        </div>
      </div>

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
    </div>
  );
};

export default QuoteOptionsModal;
