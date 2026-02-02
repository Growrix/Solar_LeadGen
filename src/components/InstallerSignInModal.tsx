'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';

// --- Brand Icon Components ---
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

interface InstallerSignInProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenSignup: () => void;
}

const InstallerSignInModal: React.FC<InstallerSignInProps> = ({ isOpen, onClose, onSuccess, onOpenSignup }) => {
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
    if (!isOpen) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Use NextAuth signIn with credentials provider
      const result = await signIn('credentials', {
        redirect: false, // Don't redirect automatically
        email: formData.email,
        password: formData.password,
        role: 'INSTALLER',
      });

      if (result?.error) {
        // Login failed - show error message
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Login successful
        setSuccess('Signed in successfully! Redirecting...');
        setTimeout(() => {
          onSuccess(); // Call parent's success handler
        }, 1000);
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/installer/leads' });
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    await signIn('apple', { callbackUrl: '/installer/leads' });
  };
  
  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address first, then click"Forgot password?"');
      return;
    }
    setSuccess('If an installer account with this email exists, you will receive a password reset link shortly.');
    setError(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogClose asChild>
          <button
            className="absolute top-4 right-4 text-subtle hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </DialogClose>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-surface shadow-neu-outset rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="mb-2">Welcome Back</DialogTitle>
          <DialogDescription className="text-body-small">
            Sign in to access your installer dashboard
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
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                if (typeof onOpenSignup === 'function') onOpenSignup();
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

export default InstallerSignInModal;