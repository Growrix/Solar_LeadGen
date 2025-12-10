'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button';

// --- Icon Components (matching HomeownerSignInModal SOT) ---
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>;

interface HomeownersInfoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: { name: string; phone: string; address: string }) => void;
}

/**
 * HomeownersInfoForm - Collects user info before signup in guest flow
 * Design copied exactly from HomeownerSignInModal (SOT)
 * Zero hardcoded colors, uses semantic tokens only
 */
const HomeownersInfoForm: React.FC<HomeownersInfoFormProps> = ({ 
  isOpen, 
  onClose, 
  onContinue 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) { setError(null); }
  };
  
  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '' });
    setError(null);
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

    // Client-side validation
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please enter your contact number.');
      setLoading(false);
      return;
    }

    // Basic phone validation (Australian format)
    const phoneRegex = /^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid Australian phone number.');
      setLoading(false);
      return;
    }

    if (!formData.address.trim()) {
      setError('Please enter your address.');
      setLoading(false);
      return;
    }

    // Pass data to parent and proceed to signup
    onContinue(formData);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-20 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="theme-card relative w-full max-w-md p-8 max-h-[90vh] overflow-y-auto animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-subtle hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <XIcon />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-surface shadow-neu-outset rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <UserIcon />
          </div>
          <h2 className="text-heading-2 text-foreground mb-2">
            Your Contact Information
          </h2>
          <p className="text-muted-foreground text-body-small">
            Help installers reach you with the best quotes
          </p>
        </div>
        
        {error && (
          <div className="bg-destructive/10 shadow-neu-inset border border-destructive/30 rounded-2xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangleIcon />
              <div>
                <p className="text-destructive text-body-small mb-1">Validation Error</p>
                <p className="text-destructive text-body-small">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-foreground text-body-small mb-2"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-surface shadow-neu-inset border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              placeholder="John Smith"
              required
              disabled={loading}
            />
          </div>

          {/* Phone Field */}
          <div>
            <label 
              htmlFor="phone" 
              className="block text-foreground text-body-small mb-2"
            >
              Contact Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-surface shadow-neu-inset border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              placeholder="0412 345 678"
              required
              disabled={loading}
            />
            <p className="text-muted-foreground text-body-extra-small mt-1">
              Australian format: 04XX XXX XXX or +61 4XX XXX XXX
            </p>
          </div>

          {/* Address Field */}
          <div>
            <label 
              htmlFor="address" 
              className="block text-foreground text-body-small mb-2"
            >
              Property Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full bg-surface shadow-neu-inset border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              placeholder="123 Main Street, Sydney NSW 2000"
              required
              disabled={loading}
            />
            <p className="text-muted-foreground text-body-extra-small mt-1">
              Full address including suburb and postcode
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Please wait...' : 'Continue'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-body-extra-small">
            Your information will only be shared with verified solar installers you choose to engage with.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeownersInfoForm;
