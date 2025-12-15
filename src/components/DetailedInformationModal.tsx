'use client'

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button';
import { X, User, Phone, MapPin } from 'lucide-react';

interface DetailedInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    phone: string;
    address: string;
  }) => Promise<void>;
}

const DetailedInformationModal: React.FC<DetailedInformationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('+61 '); // Start with +61 prefix
      setAddress('');
      setErrors({});
      setApiError(null);
    }
  }, [isOpen]);

  // Close modal on Escape key
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

  // Validate Australian phone number in E.164 format
  const validatePhone = (phoneNumber: string): boolean => {
    // Remove all spaces and special characters
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // E.164 format: +614XXXXXXXX (12 digits starting with +614)
    const e164Pattern = /^\+614\d{8}$/;
    
    return e164Pattern.test(cleaned);
  };

  // Format phone number as user types - Always use E.164 format (+61)
  const formatPhone = (value: string): string => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If user types 0 as first digit, convert to +614
    if (cleaned.startsWith('0') && !cleaned.startsWith('+')) {
      cleaned = '+614' + cleaned.slice(1);
    }
    
    // If starts with 4 (without 0), add +61
    if (cleaned.match(/^4\d/) && !cleaned.startsWith('+')) {
      cleaned = '+61' + cleaned;
    }
    
    // Ensure it starts with +61
    if (!cleaned.startsWith('+61') && cleaned.length > 0) {
      // If user somehow entered other digits, assume they want +61
      cleaned = '+61' + cleaned;
    }
    
    // Format: +61 4XX XXX XXX
    if (cleaned.startsWith('+61')) {
      const digits = cleaned.slice(3);
      if (digits.length === 0) return '+61 ';
      if (digits.length <= 1) return '+61 ' + digits;
      if (digits.length <= 4) return '+61 ' + digits.slice(0, 1) + ' ' + digits.slice(1);
      if (digits.length <= 7) return '+61 ' + digits.slice(0, 1) + ' ' + digits.slice(1, 4) + ' ' + digits.slice(4);
      return '+61 ' + digits.slice(0, 1) + ' ' + digits.slice(1, 4) + ' ' + digits.slice(4, 7);
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    // Clear error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    // Validate phone
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid Australian mobile number (e.g., +61 412 345 678)';
    }

    // Validate address
    if (!address.trim()) {
      newErrors.address = 'Property address is required';
    } else if (address.trim().length < 5) {
      newErrors.address = 'Please enter a complete address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Update user details via API
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/[\s\-\(\)]/g, ''), // Clean phone for storage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user details');
      }

      // Call parent's onSubmit with all collected data
      await onSubmit({
        name: name.trim(),
        phone: phone.replace(/[\s\-\(\)]/g, ''),
        address: address.trim()
      });

      // Success - parent will handle closing modal and next steps
    } catch (error) {
      console.error('Error submitting detailed information:', error);
      setApiError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-20 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="theme-card relative w-full max-w-lg p-8 animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute top-4 right-4 p-2"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="text-center mb-6">
          <h2 className="text-heading-2 text-foreground mb-2">
            Complete Your Profile
          </h2>
          <p className="text-muted-foreground">
            We need a few more details to process your quote request
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-body-small text-foreground mb-2">
              Full Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                className={`theme-input pl-10 ${errors.name ? 'border-destructive' : ''}`}
                placeholder="John Smith"
                disabled={isSubmitting}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-body-small text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Phone Input */}
          <div>
            <label htmlFor="phone" className="block text-body-small text-foreground mb-2">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                className={`theme-input pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                placeholder="+61 412 345 678"
                disabled={isSubmitting}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-body-small text-destructive">{errors.phone}</p>
            )}
            <p className="mt-1 text-caption text-muted-foreground">
              Australian mobile number (auto-formats to +61 4XX XXX XXX)
            </p>
          </div>

          {/* Address Input */}
          <div>
            <label htmlFor="address" className="block text-body-small text-foreground mb-2">
              Property Address <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <textarea
                id="address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                }}
                className={`theme-input pl-10 min-h-[80px] resize-none ${errors.address ? 'border-destructive' : ''}`}
                placeholder="123 Main Street, Sydney NSW 2000"
                disabled={isSubmitting}
                rows={3}
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-body-small text-destructive">{errors.address}</p>
            )}
            <p className="mt-1 text-caption text-muted-foreground">
              Enter the address where you want solar installed
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-body-small text-destructive">{apiError}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Submitting...
              </>
            ) : (
              'Continue to Submit Quote'
            )}
          </Button>
        </form>

        <p className="mt-4 text-caption text-center text-muted-foreground">
          Your information is secure and will only be shared with verified installers
        </p>
      </div>
    </div>
  );
};

export default DetailedInformationModal;
