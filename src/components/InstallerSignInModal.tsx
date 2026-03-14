'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Alert, AlertTriangle, Button, CheckCircle2, CloseButton, Eye, EyeOff, Input, Lock, Mail, Modal, User } from '@/ds';

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
    <Modal open={isOpen} onClose={handleClose} ariaLabel="Installer sign in" className="ui-modal__panel--auth">
        <CloseButton onClick={handleClose} className="absolute top-4 right-4 text-subtle hover:text-foreground" />

        <div className="ui-auth-header">
          <div className="ui-auth-icon">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-heading-2 text-foreground mb-2">
            Welcome Back
          </h2>
          <p className="text-muted-foreground text-body-small">
            Sign in to access your installer dashboard
          </p>
        </div>
        
        {error && (
          <Alert tone="danger" title="Sign In Error" icon={<AlertTriangle className="h-5 w-5" />} className="ui-auth-feedback">
            {error}
          </Alert>
        )}

        {success && (
          <Alert tone="success" icon={<CheckCircle2 className="h-5 w-5" />} className="ui-auth-feedback">
            {success}
          </Alert>
        )}

        <div className="ui-auth-social">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            variant="secondary"
            size="lg"
            disabled={loading || !!success}
            className="ui-w-full"
          >
            <span className="inline-flex items-center justify-center gap-3">
              <GoogleIcon />
              <span>Continue with Google</span>
            </span>
          </Button>

          <Button
            type="button"
            onClick={handleAppleSignIn}
            variant="secondary"
            size="lg"
            disabled={loading || !!success}
            className="ui-w-full"
          >
            <span className="inline-flex items-center justify-center gap-3">
              <AppleIcon />
              <span>Continue with Apple</span>
            </span>
          </Button>
        </div>

        <div className="ui-auth-divider">
          <span className="ui-auth-divider__label text-body-small">or sign in with email</span>
        </div>

        <form onSubmit={handleSubmit} className="ui-auth-form">
          <div className="ui-search">
            <span className="ui-search__leading" aria-hidden="true">
              <Mail className="h-5 w-5 text-subtle" />
            </span>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email address"
              required
              className="ui-search__control"
            />
          </div>

          <div className="ui-search">
            <span className="ui-search__leading" aria-hidden="true">
              <Lock className="h-5 w-5 text-subtle" />
            </span>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="ui-search__control"
            />
            <span className="ui-search__trailing">
              <Button
                type="button"
                variant="icon"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </span>
          </div>

          <div className="flex items-center justify-between text-body-small">
            <Button
              type="button"
              onClick={handleForgotPassword}
              variant="text"
              size="sm"
              className="ui-auth-link"
            >
              Forgot password?
            </Button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="ui-w-full"
            isLoading={loading}
            loadingText="Signing in..."
            disabled={!!success}
          >
            Sign In
          </Button>
        </form>

        <div className="ui-auth-footer">
          <p className="text-body-small text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Button
              type="button"
              onClick={() => {
                handleClose();
                if (typeof onOpenSignup === 'function') onOpenSignup();
              }}
              variant="text"
              size="sm"
              className="ui-auth-link"
            >
              Sign up
            </Button>
          </p>
        </div>
    </Modal>
  );
};

export default InstallerSignInModal;