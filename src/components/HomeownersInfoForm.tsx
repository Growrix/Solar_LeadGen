'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { AlertTriangle, User, X } from 'lucide-react';

// --- Icon Components (matching HomeownerSignInModal SOT) ---
const XIcon = () => <X className="h-6 w-6" />;
const UserIcon = () => <User className="h-8 w-8 text-primary" />;
const AlertTriangleIcon = () => <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />;

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
    if (!isOpen) {
      resetForm();
      return;
    }

    return () => resetForm();
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="theme-card relative w-full max-w-md p-8 max-h-modal overflow-y-auto border-0">
        <DialogClose asChild>
          <button
            className="absolute top-4 right-4 text-subtle hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </DialogClose>

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
      </DialogContent>
    </Dialog>
  );
};

export default HomeownersInfoForm;
