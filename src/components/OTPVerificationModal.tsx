/**
 * T037: OTP Verification Modal Component
 * 
 * Modal for entering and verifying 6-digit OTP code
 * - Displays countdown timer (10 minutes)
 * - Shows remaining attempts
 * - Allows resending OTP
 * - Rate limiting feedback
 */

'use client'

import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, ShieldCheck, X } from 'lucide-react';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  verificationId: string;
  expiresAt: Date;
  onVerificationSuccess: () => void;
  onResendOTP: () => Promise<{ success: boolean; verificationId?: string; expiresAt?: Date; error?: string; retryAfter?: number }>;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  verificationId: initialVerificationId,
  expiresAt: initialExpiresAt,
  onVerificationSuccess,
  onResendOTP
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verificationId, setVerificationId] = useState(initialVerificationId);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync verificationId and expiresAt when props change
  useEffect(() => {
    setVerificationId(initialVerificationId);
    setExpiresAt(initialExpiresAt);
  }, [initialVerificationId, initialExpiresAt]);

  // Calculate time remaining until expiry
  useEffect(() => {
    if (!isOpen || !expiresAt) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, expiry - now);
      let remaining = Math.floor(diff / 1000); // seconds
      
      // If time is expired or invalid, set to 10 minutes (600 seconds) as fallback
      if (remaining === 0) {
        console.log('[OTP Modal] Date parsing issue detected, using 10 min default');
        remaining = 600; // 10 minutes
      }
      
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [isOpen, expiresAt]);

  // Countdown for rate limit retry
  useEffect(() => {
    if (rateLimitRetryAfter <= 0) return;

    const interval = setInterval(() => {
      setRateLimitRetryAfter(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitRetryAfter]);

  // Countdown for resend cooldown (prevent spam)
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newCode.every(digit => digit !== '') && !isVerifying) {
      handleVerify(newCode);
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only accept 6-digit numbers
    if (!/^\d{6}$/.test(pastedData)) return;

    const newCode = pastedData.split('');
    setCode(newCode);
    setError(null);

    // Focus last input
    inputRefs.current[5]?.focus();

    // Auto-submit
    if (!isVerifying) {
      handleVerify(newCode);
    }
  };

  // Verify OTP
  const handleVerify = async (codeToVerify: string[] = code) => {
    const fullCode = codeToVerify.join('');
    
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/verification/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          code: fullCode
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success!
        onVerificationSuccess();
      } else {
        // Failed verification
        setError(data.error || 'Invalid code. Please try again.');
        setRemainingAttempts(data.remainingAttempts ?? null);
        
        // Clear code inputs
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('[OTPVerificationModal] Verify error:', err);
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0 || rateLimitRetryAfter > 0) return;

    setIsResending(true);
    setError(null);

    try {
      const result = await onResendOTP();

      if (result.success && result.verificationId && result.expiresAt) {
        // Update verification ID and expiry
        setVerificationId(result.verificationId);
        setExpiresAt(result.expiresAt);
        
        // Clear code
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();

        // Set cooldown to prevent spam (30 seconds)
        setResendCooldown(30);
        setRemainingAttempts(3); // Reset attempts for new code
      } else if (result.retryAfter) {
        // Rate limited
        setRateLimitRetryAfter(result.retryAfter);
        setError(result.error || 'Too many requests. Please wait before resending.');
      } else {
        setError(result.error || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      console.error('[OTPVerificationModal] Resend error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Keyboard shortcuts
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

  // Focus first input on mount
  useEffect(() => {
    if (isOpen) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isExpired = timeRemaining === 0;
  const canResend = !isResending && resendCooldown === 0 && rateLimitRetryAfter === 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-md animate-scale-in"
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
            className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors p-2 rounded-lg"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </DialogClose>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <ShieldCheck className="h-12 w-12" />
          </div>
        </div>

        {/* Header */}
        <DialogTitle className="text-heading-2 text-foreground text-center mb-2">
          Verify Your Phone
        </DialogTitle>
        <DialogDescription className="text-muted text-center mb-6">
          Enter the 6-digit code sent to<br />
          <span className="text-foreground">{phoneNumber}</span>
        </DialogDescription>

        {/* OTP Input Fields */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInputChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              disabled={isVerifying || isExpired}
              className={`w-12 h-14 text-center text-heading-2 border-2 rounded-lg 
                ${error 
                  ? 'border-destructive' 
                  : 'border-border focus:border-primary'
                }
                bg-surface text-foreground
                focus:outline-none focus:ring-2 focus:ring-primary/20
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors`}
            />
          ))}
        </div>

        {/* Timer */}
        {!isExpired ? (
          <div className="text-center mb-4">
            <p className="text-body-small text-muted">
              Code expires in{' '}
              <span className={` ${timeRemaining < 60 ? 'text-destructive' : 'text-primary'}`}>
                {formatTime(timeRemaining)}
              </span>
            </p>
          </div>
        ) : (
          <div className="text-center mb-4">
            <p className="text-body-small text-destructive">
              Code has expired
            </p>
          </div>
        )}

        {/* Remaining Attempts */}
        {remainingAttempts !== null && remainingAttempts < 3 && (
          <div className="text-center mb-4">
            <p className="text-body-small text-warning">
              {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-3 mb-4 flex items-start gap-2">
            <div className="text-destructive flex-shrink-0 mt-0.5">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="text-body-small text-error">{error}</p>
          </div>
        )}

        {/* Resend Button */}
        <div className="text-center mb-4">
          {rateLimitRetryAfter > 0 ? (
            <p className="text-body-small text-muted">
              Too many requests. Try again in {formatTime(rateLimitRetryAfter)}
            </p>
          ) : resendCooldown > 0 ? (
            <p className="text-body-small text-muted">
              Resend available in {resendCooldown}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={!canResend || isVerifying}
              className={`text-label ${
                canResend && !isVerifying
                  ? 'text-primary hover:text-primary-hover'
                  : 'text-muted cursor-not-allowed'
              } transition-colors`}
            >
              {isResending ? 'Sending...' : 'Didn\'t receive a code? Resend'}
            </button>
          )}
        </div>

        {/* Verify Button */}
        <Button
          onClick={() => handleVerify()}
          disabled={isVerifying || code.some(d => !d) || isExpired}
          variant="secondary"
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify Code'}
        </Button>

        {/* Help Text */}
        <p className="text-caption text-muted text-center mt-4">
          This helps us ensure the security of your account and prevents spam submissions.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationModal;