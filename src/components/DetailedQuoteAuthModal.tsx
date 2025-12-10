'use client'

import React, { useState, useEffect } from 'react';

// --- Icon Components ---
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-foreground-secondary"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 ml-2"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

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

  const baseInputClasses ="w-full bg-surface/5 border border-border/30 rounded-xl px-4 py-3 pl-12 text-foreground placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-20 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="theme-card relative w-full max-w-lg p-8 animate-slide-in-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <XIcon />
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <UserCircleIcon />
          </div>
          <h2 className="text-heading-2 text-foreground mb-2">Almost there!</h2>
          <p className="text-muted text-body-small">
            Just create an account to securely save and track your quote requests.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative flex items-center">
              <div className="absolute left-4"><UserIcon /></div>
              <input type="text" name="fullName" placeholder="Full Name" className={`${baseInputClasses} ${errors.fullName ? 'border-destructive' : ''}`} required onChange={handleInputChange} />
              {errors.fullName && <p className="text-destructive text-caption absolute -bottom-4 left-1">{errors.fullName}</p>}
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-4"><PhoneIcon /></div>
              <input type="tel" name="phone" placeholder="Phone Number" className={`${baseInputClasses} ${errors.phone ? 'border-destructive' : ''}`} required onChange={handleInputChange} />
              {errors.phone && <p className="text-destructive text-caption absolute -bottom-4 left-1">{errors.phone}</p>}
            </div>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-4"><MailIcon /></div>
            <input type="email" name="email" placeholder="Email Address" className={`${baseInputClasses} ${errors.email ? 'border-destructive' : ''}`} required onChange={handleInputChange} />
             {errors.email && <p className="text-destructive text-caption absolute -bottom-4 left-1">{errors.email}</p>}
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-4"><MapPinIcon /></div>
            <input type="text" name="address" placeholder="Property Address" className={`${baseInputClasses} ${errors.address ? 'border-destructive' : ''}`} required onChange={handleInputChange} />
             {errors.address && <p className="text-destructive text-caption absolute -bottom-4 left-1">{errors.address}</p>}
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-4"><LockIcon /></div>
            <input type={showPassword ?"text" :"password"} name="password" placeholder="Password (min. 8 characters)" className={`${baseInputClasses} pr-12 ${errors.password ? 'border-destructive' : ''}`} required onChange={handleInputChange} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground"><EyeIcon /></button>
            {errors.password && <p className="text-destructive text-caption absolute -bottom-4 left-1">{errors.password}</p>}
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-4"><LockIcon /></div>
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
              <ArrowRightIcon />
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted text-body-small">
            Already have an account? 
            <button onClick={onSwitchToSignIn} className="text-primary hover:underline ml-1">Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailedQuoteAuthModal;