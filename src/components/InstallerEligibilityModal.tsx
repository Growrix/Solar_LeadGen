'use client';

import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Building, Button, CheckCircle, CloseButton, FileText, MapPin, Modal, XCircle } from '@/ds';

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

const ELIGIBILITY_QUESTIONS: Array<{ id: keyof FormData; label: string; Icon: typeof FileText }> = [
  { id: 'cecAccredited', label: 'Are you a CEC-accredited installer? *', Icon: FileText },
  { id: 'hasABN', label: 'Do you have an ABN (Australian Business Number)? *', Icon: Building },
  { id: 'providesInstallation', label: 'Do you provide installation services in Australia? *', Icon: MapPin },
];

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
  
  // Modal shell is handled by DS Modal; keep component state reset via handleClose.

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      ariaLabel="Become a Partner"
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0"
    >
      <div>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-heading-2 text-foreground">Become a Partner</h2>
            <p className="text-muted-foreground">Step 1: Check your eligibility</p>
          </div>
          <CloseButton onClick={handleClose} className="-mr-2 text-subtle hover:text-foreground" />
        </div>

        <div className="p-6">
          {eligibilityStatus === 'idle' && (
            <div className="animate-fade-in">
              <h3 className="text-heading-3 text-foreground mb-6">Eligibility Requirements</h3>
              <div className="space-y-6">
                {ELIGIBILITY_QUESTIONS.map(({ id, label, Icon }) => (
                  <div key={id}>
                    <label className="block text-muted-foreground text-label mb-3">
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        onClick={() => handleInputChange(id, 'yes')}
                        variant="secondary"
                        aria-pressed={formData[id] === 'yes'}
                        className={`w-full justify-center ${formData[id] === 'yes' ? 'ui-button--toggle border-success/30 bg-success/10 text-success' : 'text-muted-foreground'}`}
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-label">Yes</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleInputChange(id, 'no')}
                        variant="secondary"
                        aria-pressed={formData[id] === 'no'}
                        className={`w-full justify-center ${formData[id] === 'no' ? 'ui-button--toggle border-error/30 bg-error/10 text-error' : 'text-muted-foreground'}`}
                      >
                        <XCircle className="h-5 w-5" />
                        <span className="text-label">No</span>
                      </Button>
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
              <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6"><XCircle className="h-8 w-8" /></div>
              <h3 className="text-heading-2 text-foreground mb-4">Not Eligible</h3>
              <p className="text-muted-foreground mb-8">Unfortunately, your company doesn&apos;t meet our current eligibility requirements. To join our partner network, you must be a CEC-accredited installer with an ABN providing services in Australia.</p>
              <div className="bg-error/10 shadow-inner border border-destructive/30 rounded-xl p-6 mb-8">
                <h4 className="text-destructive mb-3 flex items-center justify-center space-x-2"><AlertCircle className="h-5 w-5" /><span>Requirements Not Met</span></h4>
                <ul className="text-destructive text-body-small space-y-2 text-left">
                  {formData.cecAccredited !== 'yes' && <li>• CEC accreditation required</li>}
                  {formData.hasABN !== 'yes' && <li>• Valid ABN required</li>}
                  {formData.providesInstallation !== 'yes' && <li>• Must provide installation services in Australia</li>}
                </ul>
              </div>
              <div className="space-y-4">
                <Button onClick={resetForm} variant="secondary">Try Again</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InstallerEligibilityModal;