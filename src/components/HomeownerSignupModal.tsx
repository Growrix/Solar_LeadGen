'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AppleIcon, GoogleIcon } from '@/components/icons/auth';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';

interface HomeownerSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToSignIn?: () => void;
}

/**
 * HomeownerSignupModal - Redesigned to match InstallerSignupModal (SOT)
 * Consistent modal structure, styling, and form design
 * Zero hardcoded colors, uses semantic tokens only
 */
const HomeownerSignupModal: React.FC<HomeownerSignupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  onSwitchToSignIn 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      resetForm();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) { setError(null); }
  };
  
  const resetForm = () => {
    setFormData({ 
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      // Call the registration API
      const response = await fetch('/api/auth/register/homeowner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful
      setSuccess('Account created successfully! Redirecting to dashboard...');
      
      // Automatically sign in the user with their new credentials
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInResult?.error) {
        setError('Account created but automatic login failed. Please sign in manually.');
        setLoading(false);
        return;
      }

      if (signInResult?.ok) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('Google sign up failed. Please try again.');
      setLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn('apple', { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('Apple sign up failed. Please try again.');
      setLoading(false);
    }
  };

  // Close modal and reset form
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        className="relative w-full max-w-md max-h-modal"
        onEscapeKeyDown={(event) => {
          // Existing Escape handling is implemented via the component's effect.
          event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault();
          handleClose();
        }}
      >
        <DialogClose asChild>
          <button
            className="absolute top-4 right-4 text-subtle hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </DialogClose>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-surface rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-neu-outset">
            <User className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-heading-2 text-foreground mb-2">Create account</DialogTitle>
          <DialogDescription className="text-body-small text-subtle">
            Join thousands of homeowners who have gone solar
          </DialogDescription>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="bg-destructive/10 shadow-neu-inset border border-destructive/30 px-4 py-3 rounded-2xl text-body-small text-destructive">
              {error}
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="bg-success/10 shadow-neu-inset border border-success/30 px-4 py-3 rounded-2xl text-body-small text-success">
              {success}
            </div>
          )}

          {/* Social Sign Up Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full bg-surface shadow-neu-outset hover:shadow-neu-inset border border-border rounded-xl px-4 py-3 flex items-center justify-center gap-3 text-foreground transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
            
            <button
              type="button"
              onClick={handleAppleSignup}
              disabled={loading}
              className="w-full bg-surface shadow-neu-outset hover:shadow-neu-inset border border-border rounded-xl px-4 py-3 flex items-center justify-center gap-3 text-foreground transition-colors disabled:opacity-50"
            >
              <AppleIcon />
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-subtle text-body-small">Or sign up with email</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input w-full pl-11 pr-4 py-3"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min. 8 characters)"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={8}
                className="form-input w-full pl-11 pr-12 py-3"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="form-input w-full pl-11 pr-4 py-3"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full shadow-neu-outset hover:shadow-neu-inset"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-subtle text-body-small">
            Already have an account?{' '}
            <button
              onClick={onSwitchToSignIn}
              className="text-primary text-body hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerSignupModal;
