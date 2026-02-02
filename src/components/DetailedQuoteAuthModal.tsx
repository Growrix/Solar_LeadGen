'use client'

import React, { useState, useEffect } from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, Eye, Lock, Mail, MapPin, Phone, CircleUser, User, X } from 'lucide-react';

interface DetailedQuoteAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupAndSubmit: (formData: any) => void;
  onSwitchToSignIn: () => void;
}

const DetailedQuoteAuthModal: React.FC<DetailedQuoteAuthModalProps> = ({ isOpen, onClose, onSignupAndSubmit, onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setIsRecaptchaVerified(false);
      setFormData({
        fullName: '', email: '', phone: '', address: '', password: '', confirmPassword: ''
      });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(errors[e.target.name]) {
        setErrors(prev => ({...prev, [e.target.name]: ''}));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName ="Full name is required.";
    if (!formData.email) newErrors.email ="Email is required.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email ="Email is invalid.";
    if (!formData.phone) newErrors.phone ="Phone number is required.";
    if (!formData.address) newErrors.address ="Address is required.";
    if (formData.password.length < 8) newErrors.password ="Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword ="Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = validate();
    if (!isRecaptchaVerified) {
        setErrors(prev => ({...prev, recaptcha: 'Please complete the verification.'}));
        return;
    }
    if (isFormValid) {
      onSignupAndSubmit(formData);
    }
  };

  if (!isOpen) return null;

  const baseInputClasses ="w-full bg-surface/5 border border-border/30 rounded-xl px-4 py-3 pl-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="relative w-full max-w-lg max-h-modal"
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
            className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </DialogClose>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <CircleUser className="h-8 w-8 text-foreground-secondary" />
          </div>
          <DialogTitle className="text-heading-2 text-foreground mb-2">Almost there!</DialogTitle>
          <DialogDescription className="text-muted text-body-small">
            Just create an account to securely save and track your quote requests.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative flex items-center">
              <div className="absolute left-4"><User className="h-5 w-5 text-muted" /></div>
              <input type="text" name="fullName" placeholder="Full Name" className={`${baseInputClasses} ${errors.fullName ? 'border-destructive' : ''}`} required onChange={handleInputChange} />
              {errors.fullName && <p className="text-destructive text-caption absolute -bottom-4 left-1">{errors.fullName}</p>}
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-4"><Phone className="h-5 w-5 text-muted" /></div>
              <input type="tel" name="phone" placeholder="Phone Number" className={`${baseInputClasses} ${errors.phone ? 'border-destructive' : ''}`} required onChange={handleInputChange} />
              {errors.phone && <p className="text-destructive text-caption absolute -bottom-4 left-1">{errors.phone}</p>}
            </div>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-4"><Mail className="h-5 w-5 text-muted" /></div>
            <input type="email" name="email" placeholder="Email Address" className={`${baseInputClasses} ${errors.email ? 'border-destructive' : ''}`} required onChange={handleInputChange} />
             {errors.email && <p className="text-destructive text-caption absolute -bottom-4 left-1">{errors.email}</p>}
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-4"><MapPin className="h-5 w-5 text-muted" /></div>
            <input type="text" name="address" placeholder="Property Address" className={`${baseInputClasses} ${errors.address ? 'border-destructive' : ''}`} required onChange={handleInputChange} />
             {errors.address && <p className="text-destructive text-caption absolute -bottom-4 left-1">{errors.address}</p>}
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-4"><Lock className="h-5 w-5 text-muted" /></div>
            <input type={showPassword ?"text" :"password"} name="password" placeholder="Password (min. 8 characters)" className={`${baseInputClasses} pr-12 ${errors.password ? 'border-destructive' : ''}`} required onChange={handleInputChange} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground"><Eye className="h-5 w-5" /></button>
            {errors.password && <p className="text-destructive text-caption absolute -bottom-4 left-1">{errors.password}</p>}
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-4"><Lock className="h-5 w-5 text-muted" /></div>
            <input type={showPassword ?"text" :"password"} name="confirmPassword" placeholder="Confirm Password" className={`${baseInputClasses} pr-12 ${errors.confirmPassword ? 'border-destructive' : ''}`} required onChange={handleInputChange} />
             {errors.confirmPassword && <p className="text-destructive text-caption absolute -bottom-4 left-1">{errors.confirmPassword}</p>}
          </div>

          <div className="pt-4">
            <div className="flex items-center space-x-3 bg-surface/50 p-3 rounded-xl border border-border">
                <input 
                    type="checkbox"
                    id="recaptcha"
                    checked={isRecaptchaVerified}
                    onChange={(e) => {
                        setIsRecaptchaVerified(e.target.checked);
                        if (errors.recaptcha) {
                           setErrors(prev => ({ ...prev, recaptcha: '' }));
                        }
                    }}
                    className="h-6 w-6 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="recaptcha" className="text-body-small text-foreground">I&apos;m not a robot</label>
                <div className="ml-auto text-center text-muted text-caption">
                    reCAPTCHA
                </div>
            </div>
            {errors.recaptcha && <p className="text-destructive text-caption mt-1">{errors.recaptcha}</p>}
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center bg-primary hover:bg-primary/90 text-foreground-secondary py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
            >
              Create Account & Submit Request
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted text-body-small">
            Already have an account? 
            <button onClick={onSwitchToSignIn} className="text-primary hover:underline ml-1">Sign In</button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailedQuoteAuthModal;