import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import { useSession } from 'next-auth/react';

interface ContactVerificationModalProps {
  isOpen: boolean;
  defaultPhone?: string;
  onClose: () => void;
  onOTPRequested: (payload: {
    phoneNumber: string;
    verificationId: string;
    expiresAt: Date;
    remainingAttempts: number;
  }) => void;
}

type SendOtpResponse = {
  success: boolean;
  message: string;
  verificationId: string;
  expiresAt: string;
  remainingAttempts: number;
};

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-12 w-12"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ContactVerificationModal: React.FC<ContactVerificationModalProps> = ({
  isOpen,
  defaultPhone,
  onClose,
  onOTPRequested,
}) => {
  const { data: session, update: updateSession } = useSession();
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState<number>(0);

  // Format phone number to E.164 - handles legacy 04XX format from database
  const formatToE164 = (value: string): string => {
    if (!value) return '';
    
    // Remove all spaces and special characters
    let cleaned = value.replace(/[\s\-\(\)]/g, '');
    
    // If starts with 04, convert to +614
    if (cleaned.startsWith('04')) {
      return '+614' + cleaned.slice(2);
    }
    
    // If already in E.164 format, return as-is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // If starts with 4 (mobile), add +61
    if (cleaned.startsWith('4')) {
      return '+61' + cleaned;
    }
    
    return value; // Return original if can't parse
  };

  useEffect(() => {
    if (isOpen) {
      // Auto-convert legacy phone formats (04XX) to E.164 (+614XX)
      const formattedPhone = formatToE164(defaultPhone ?? '');
      setPhoneNumber(formattedPhone);
      setError(null);
      setStatusMessage(null);
      setIsSubmitting(false);
      setRetrySeconds(0);
    }
  }, [isOpen, defaultPhone]);

  useEffect(() => {
    if (retrySeconds <= 0) return;
    const timer = setInterval(() => {
      setRetrySeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [retrySeconds]);

  if (!isOpen) {
    return null;
  }

  const validatePhone = (value: string) => {
    if (!value) {
      return 'Phone number is required';
    }
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(value)) {
      return 'Enter a valid phone number in E.164 format (e.g. +61412345678)';
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validatePhone(phoneNumber.trim());
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatusMessage(null);

    try {
      const trimmedPhone = phoneNumber.trim();
      
      // Check if phone number has changed from the current user's phone
      const phoneHasChanged = session?.user?.phone !== trimmedPhone;
      
      // If phone number changed, update it in the database first
      if (phoneHasChanged && session?.user?.phone !== null) {
        const updateResponse = await fetch('/api/user/update-phone', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: trimmedPhone }),
        });

        const updateData = await updateResponse.json();

        if (!updateResponse.ok || !updateData.success) {
          setError(updateData.error ?? 'Failed to update phone number. Please try again.');
          return;
        }

        // Update the session with the new phone number
        await updateSession({
          phone: trimmedPhone,
          phoneVerified: false // Reset verification status
        });

        setStatusMessage('Phone number updated. Sending verification code...');
      }

      // Send OTP to the (possibly updated) phone number
      const response = await fetch('/api/verification/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: trimmedPhone }),
      });

      const data: Partial<SendOtpResponse> & { error?: string; retryAfter?: number } = await response.json();

      if (!response.ok || !data.success || !data.verificationId || !data.expiresAt) {
        if (response.status === 429 && typeof data.retryAfter === 'number') {
          setRetrySeconds(data.retryAfter);
          setError(data.error ?? 'Too many attempts. Please wait before trying again.');
        } else {
          setError(data.error ?? 'Failed to send verification code. Please try again.');
        }
        return;
      }

      setStatusMessage('Verification code sent!');
      onOTPRequested({
        phoneNumber: trimmedPhone,
        verificationId: data.verificationId,
        expiresAt: new Date(data.expiresAt),
        remainingAttempts: data.remainingAttempts ?? 3,
      });
    } catch (err) {
      console.error('[ContactVerificationModal] send OTP failed:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-verification-title"
      onClick={onClose}
    >
      <div
        className="theme-card relative w-full max-w-lg p-6 sm:p-8 animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted transition-colors hover:bg-slate-100 hover:text-foreground"
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldIcon />
          </div>
        </div>

        <header className="text-center">
          <h2 id="contact-verification-title" className="text-heading-2 text-foreground">
            Verify your phone number
          </h2>
          <p className="mt-2 text-body-small text-muted">
            Confirming your contact details keeps the marketplace safe and lets installers reach you quickly. We will send a one-time passcode to the number you provide.
          </p>
          <p className="mt-3 text-caption text-muted">
            You can skip verification and complete it later from your dashboard.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="phoneNumber" className="block text-body-small text-foreground">
              Mobile number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-body text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="+61412345678"
              disabled={isSubmitting || retrySeconds > 0}
              aria-describedby="phoneNumber-helper"
            />
            <p id="phoneNumber-helper" className="mt-1 text-caption text-muted">
              Use E.164 format with country code. Example: +61 for Australia, +1 for the United States.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-error bg-error/10 p-3 text-body-small text-error">
              {error}
            </div>
          )}

          {statusMessage && !error && (
            <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-body-small text-success">
              {statusMessage}
            </div>
          )}

          {retrySeconds > 0 && (
            <p className="text-caption text-muted">
              Please wait {retrySeconds} seconds before requesting another code.
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || retrySeconds > 0}
            variant="secondary"
            className="w-full rounded-xl px-4 py-3 text-label"
          >
            {isSubmitting ? 'Sending code…' : 'Send verification code'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ContactVerificationModal;
