'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AppleIcon, GoogleIcon } from '@/components/icons/auth';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';

interface HomeownerSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}

/**
 * HomeownerSignInModal - Redesigned to match InstallerSignInModal (SOT)
 * Consistent modal structure, styling, and form design
 * Zero hardcoded colors, uses semantic tokens only
 */
const HomeownerSignInModal: React.FC<HomeownerSignInModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onSwitchToSignUp 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) { setError(null); }
  };
  
  const resetForm = () => {
    setFormData({ email: '', password: '' });
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setLoading(false);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        role: 'HOMEOWNER',
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result?.ok) {
        setSuccess('Signed in successfully! Redirecting...');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    await signIn('apple', { callbackUrl: '/dashboard' });
  };
  
  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address first, then click"Forgot password?"');
      return;
    }
    setSuccess('If an account with this email exists, you will receive a password reset link shortly.');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        className="max-w-md relative"
        onEscapeKeyDown={(event) => {
          // Existing Escape handling is implemented via the component's effect.
          event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault();
          handleClose();
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-subtle hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-surface shadow-neu-outset rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="mb-2">Welcome Back</DialogTitle>
          <DialogDescription className="text-body-small">
            Sign in to access your dashboard
          </DialogDescription>
        </div>
        
        {error && (
          <div className="bg-destructive/10 shadow-neu-inset border border-destructive/30 rounded-2xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-destructive text-body-small mb-1">Sign In Error</p>
                <p className="text-destructive text-body-small">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-success/10 shadow-neu-inset border border-success/30 rounded-2xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
              <p className="text-success text-body-small">{success}</p>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || !!success}
            className="w-full bg-surface shadow-neu-outset hover:shadow-neu-inset border border-border rounded-xl px-4 py-3 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <button
            onClick={handleAppleSignIn}
            disabled={loading || !!success}
            className="w-full bg-surface shadow-neu-outset hover:shadow-neu-inset border border-border rounded-xl px-4 py-3 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            <AppleIcon />
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-body-small">
            <span className="px-3 bg-background text-subtle">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-subtle" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                className="form-input w-full pl-11 pr-4 py-3"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-subtle" />
              </div>
              <input
                type={showPassword ?"text" :"password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="form-input w-full pl-11 pr-12 py-3"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-subtle hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-body-small">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-primary hover:text-primary/90 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading || !!success}
            className="w-full px-5 py-3"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-body-small text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => {
                handleClose();
                if (typeof onSwitchToSignUp === 'function') onSwitchToSignUp();
              }}
              className="text-primary hover:text-primary/90 transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerSignInModal;
