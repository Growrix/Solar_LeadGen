'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button';

// --- Icon Components ---
const CheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const XCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>;
const Building = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline h-4 w-4 mr-2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="9" x2="9" y1="22" y2="4"/><line x1="15" x2="15" y1="22" y2="4"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const FileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline h-4 w-4 mr-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const MapPin = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline h-4 w-4 mr-2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const ArrowRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const AlertCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;

interface EligibilityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onEligible: () => void;
}

interface FormData {
  cecAccredited: string;
  hasABN: string;
  providesInstallation: string;
}

const InstallerEligibilityModal: React.FC<EligibilityFormProps> = ({ isOpen, onClose, onEligible }) => {
  const [formData, setFormData] = useState<FormData>({
    cecAccredited: '', hasABN: '', providesInstallation: ''
  });
  const [eligibilityStatus, setEligibilityStatus] = useState<'idle' | 'ineligible'>('idle');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (eligibilityStatus === 'ineligible') {
        setEligibilityStatus('idle');
    }
  };

  const handleCheckEligibility = () => {
    const isReady = formData.cecAccredited && formData.hasABN && formData.providesInstallation;
    if (!isReady) return;

    const eligible = formData.cecAccredited === 'yes' &&
                    formData.hasABN === 'yes' &&
                    formData.providesInstallation === 'yes';

    if (eligible) {
      onEligible();
    } else {
      setEligibilityStatus('ineligible');
    }
  };

  const resetForm = () => {
    setFormData({ cecAccredited: '', hasABN: '', providesInstallation: '' });
    setEligibilityStatus('idle');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-20 animate-fade-in" onClick={handleClose}>
      <div 
        className="theme-card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-heading-2 text-foreground">Become a Partner</h2>
            <p className="text-muted-foreground">Step 1: Check your eligibility</p>
          </div>
          <button onClick={handleClose} className="text-subtle hover:text-foreground transition-colors p-2 rounded-lg -mr-2"><XCircle /></button>
        </div>

        <div className="p-6">
          {eligibilityStatus === 'idle' && (
            <div className="animate-fade-in">
              <h3 className="text-heading-3 text-foreground mb-6">Eligibility Requirements</h3>
              <div className="space-y-6">
                {[
                  { id: 'cecAccredited', label: 'Are you a CEC-accredited installer? *', icon: <FileText /> },
                  { id: 'hasABN', label: 'Do you have an ABN (Australian Business Number)? *', icon: <Building /> },
                  { id: 'providesInstallation', label: 'Do you provide installation services in Australia? *', icon: <MapPin /> }
                ].map(q => (
                  <div key={q.id}>
                    <label className="block text-muted-foreground text-label mb-3">{q.icon}{q.label}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleInputChange(q.id as keyof FormData, 'yes')} className={`eligibility-button p-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-neu-inset ${formData[q.id as keyof FormData] === 'yes' ? 'selected-yes border-2 border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'bg-surface/50 text-muted-foreground hover:bg-surface'}`}>
                        <CheckCircle /> <span className="text-label">Yes</span>
                      </button>
                      <button onClick={() => handleInputChange(q.id as keyof FormData, 'no')} className={`eligibility-button p-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-neu-inset ${formData[q.id as keyof FormData] === 'no' ? 'selected-no border-2 border-destructive bg-error/10 text-destructive' : 'bg-surface/50 text-muted-foreground hover:bg-surface'}`}>
                        <XCircle /> <span className="text-label">No</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-8">
                <Button
                  onClick={handleCheckEligibility}
                  disabled={!formData.cecAccredited || !formData.hasABN || !formData.providesInstallation}
                  variant="primary"
                  className="px-5 py-2 flex items-center space-x-2"
                >
                  <span>Check Eligibility</span><ArrowRight />
                </Button>
              </div>
            </div>
          )}

          {eligibilityStatus === 'ineligible' && (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6"><XCircle /></div>
              <h3 className="text-heading-2 text-foreground mb-4">Not Eligible</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">Unfortunately, your company doesn&apos;t meet our current eligibility requirements. To join our partner network, you must be a CEC-accredited installer with an ABN providing services in Australia.</p>
              <div className="bg-error/10 shadow-neu-inset border border-destructive/30 rounded-xl p-6 mb-8">
                <h4 className="text-destructive mb-3 flex items-center justify-center space-x-2"><AlertCircle /><span>Requirements Not Met</span></h4>
                <ul className="text-destructive text-body-small space-y-2 text-left">
                  {formData.cecAccredited !== 'yes' && <li>• CEC accreditation required</li>}
                  {formData.hasABN !== 'yes' && <li>• Valid ABN required</li>}
                  {formData.providesInstallation !== 'yes' && <li>• Must provide installation services in Australia</li>}
                </ul>
              </div>
              <div className="space-y-4">
                <button onClick={resetForm} className="bg-surface hover:bg-surface-hover text-foreground px-6 py-3 rounded-xl shadow-neu-outset transition-colors">Try Again</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallerEligibilityModal;