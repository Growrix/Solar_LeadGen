'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Alert, AlertTriangle, Button, CheckCircle2, CloseButton, Eye, EyeOff, Input, Lock, Mail, Modal, User } from '@/ds';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);


interface InstallerSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToSignIn?: () => void;
}

const InstallerSignupModal: React.FC<InstallerSignupModalProps> = ({ 
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
    if (!isOpen) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) { setError(null); }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '' });
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
      const response = await fetch('/api/auth/register/installer', {
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
        // Registration failed - show error
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
        // Sign in failed after registration - shouldn't happen but handle it
        setError('Account created but automatic login failed. Please sign in manually.');
        setLoading(false);
        return;
      }

      if (signInResult?.ok) {
        // Success! Redirect after short delay
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
      await signIn('google', { callbackUrl: '/installer/leads' });
    } catch (err) {
      setError('Google sign up failed. Please try again.');
      setLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn('apple', { callbackUrl: '/installer/leads' });
    } catch (err) {
      setError('Apple sign up failed. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <Modal open={isOpen} onClose={handleClose} ariaLabel="Installer sign up" className="ui-modal__panel--auth">
        <CloseButton onClick={handleClose} className="absolute top-4 right-4 text-subtle hover:text-foreground" />

        <div className="ui-auth-header">
          <div className="ui-auth-icon">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-heading-2 text-foreground mb-2">
            Create Installer Account
          </h2>
          <p className="text-muted-foreground text-body-small">
            Sign in to access your dashboard.
          </p>
        </div>

        {error && (
          <Alert tone="danger" title="Sign Up Error" icon={<AlertTriangle className="h-5 w-5" />} className="ui-auth-feedback">
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
            onClick={handleGoogleSignup}
            disabled={loading}
            variant="secondary"
            size="lg"
            className="ui-w-full"
          >
            <span className="inline-flex items-center justify-center gap-3">
              <GoogleIcon />
              <span>Continue with Google</span>
            </span>
          </Button>

          <Button
            type="button"
            onClick={handleAppleSignup}
            disabled={loading}
            variant="secondary"
            size="lg"
            className="ui-w-full"
          >
            <span className="inline-flex items-center justify-center gap-3">
              <AppleIcon />
              <span>Continue with Apple</span>
            </span>
          </Button>
        </div>

        <div className="ui-auth-divider">
          <span className="ui-auth-divider__label text-body-small">or continue with email</span>
        </div>

        <form onSubmit={handleSubmit} className="ui-auth-form">
          <div className="ui-search">
            <span className="ui-search__leading" aria-hidden="true">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </span>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              required
              className="ui-search__control"
            />
          </div>

          <div className="ui-search">
            <span className="ui-search__leading" aria-hidden="true">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </span>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              minLength={8}
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

          <div className="ui-search">
            <span className="ui-search__leading" aria-hidden="true">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </span>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm Password"
              required
              minLength={8}
              className="ui-search__control"
            />
            <span className="ui-search__trailing">
              <Button
                type="button"
                variant="icon"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="ui-w-full"
            isLoading={loading}
            loadingText="Creating Account..."
            disabled={!!success}
          >
            Sign Up
          </Button>
        </form>

        <div className="ui-auth-footer">
          <p className="text-muted-foreground text-body-small">
            Already have an account?{' '}
            <Button
              type="button"
              onClick={onSwitchToSignIn}
              variant="text"
              size="sm"
              className="ui-auth-link"
            >
              Sign in
            </Button>
          </p>
        </div>
    </Modal>
  );
};

export default InstallerSignupModal;