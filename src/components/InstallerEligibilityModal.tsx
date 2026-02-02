'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  MapPin,
  X,
  XCircle,
} from 'lucide-react';


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
    return () => resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="theme-card max-w-2xl w-full max-h-modal overflow-y-auto p-0 border-0">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-heading-2 text-foreground">Become a Partner</h2>
            <p className="text-muted-foreground">Step 1: Check your eligibility</p>
          </div>
          <DialogClose asChild>
            <button className="text-subtle hover:text-foreground transition-colors p-2 rounded-lg -mr-2" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </DialogClose>
        </div>

        <div className="p-6">
          {eligibilityStatus === 'idle' && (
            <div className="animate-fade-in">
              <h3 className="text-heading-3 text-foreground mb-6">Eligibility Requirements</h3>
              <div className="space-y-6">
                {[
                  { id: 'cecAccredited', label: 'Are you a CEC-accredited installer? *', icon: <FileText className="inline h-4 w-4 mr-2" /> },
                  { id: 'hasABN', label: 'Do you have an ABN (Australian Business Number)? *', icon: <Building2 className="inline h-4 w-4 mr-2" /> },
                  { id: 'providesInstallation', label: 'Do you provide installation services in Australia? *', icon: <MapPin className="inline h-4 w-4 mr-2" /> }
                ].map(q => (
                  <div key={q.id}>
                    <label className="block text-muted-foreground text-label mb-3">{q.icon}{q.label}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleInputChange(q.id as keyof FormData, 'yes')} className={`eligibility-button p-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-neu-inset ${formData[q.id as keyof FormData] === 'yes' ? 'selected-yes border-2 border-success bg-success/10 text-success' : 'bg-surface/50 text-muted-foreground hover:bg-surface'}`}>
                        <CheckCircle2 className="h-5 w-5" /> <span className="text-label">Yes</span>
                      </button>
                      <button onClick={() => handleInputChange(q.id as keyof FormData, 'no')} className={`eligibility-button p-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-neu-inset ${formData[q.id as keyof FormData] === 'no' ? 'selected-no border-2 border-destructive bg-error/10 text-destructive' : 'bg-surface/50 text-muted-foreground hover:bg-surface'}`}>
                        <XCircle className="h-5 w-5" /> <span className="text-label">No</span>
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
                  <span>Check Eligibility</span><ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {eligibilityStatus === 'ineligible' && (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6"><XCircle className="h-5 w-5" /></div>
              <h3 className="text-heading-2 text-foreground mb-4">Not Eligible</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">Unfortunately, your company doesn&apos;t meet our current eligibility requirements. To join our partner network, you must be a CEC-accredited installer with an ABN providing services in Australia.</p>
              <div className="bg-error/10 shadow-neu-inset border border-destructive/30 rounded-xl p-6 mb-8">
                <h4 className="text-destructive mb-3 flex items-center justify-center space-x-2"><AlertCircle className="h-5 w-5" /><span>Requirements Not Met</span></h4>
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
      </DialogContent>
    </Dialog>
  );
};

export default InstallerEligibilityModal;