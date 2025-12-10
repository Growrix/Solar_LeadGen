'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/button';
import { z } from 'zod';
import { useMultiFileUpload } from '@/hooks/useFileUpload';

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VerificationFormData) => void;
  isSubmitting?: boolean;
  existingVerification?: Partial<VerificationFormData>;
  onSubmitSuccess?: (phone: string) => void;
}

// Consolidated validation schema
const verificationSchema = z.object({
  // Company & Representative
  companyName: z.string().min(2, 'Company name is required'),
  representativeName: z.string().min(2, 'Representative name is required'),
  designation: z.string().min(2, 'Designation is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().regex(/^\+61[0-9]{9}$/, 'Phone must be in E.164 format (+61XXXXXXXXX)'),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
  // Business Legal
  abnOrLicense: z.string().min(5, 'ABN or License number is required'),
  establishedYear: z.number().min(1900).max(new Date().getFullYear(), 'Valid year required'),
  employeeCount: z.number().min(1, 'At least 1 employee required'),
  licenseDocKey: z.string().optional(),
  abnDocKey: z.string().optional(),
  // Services & Coverage
  services: z.array(z.string()).min(1, 'Select at least one service'),
  serviceAreas: z.array(z.string()).min(1, 'Select at least one service area'),
  postcodes: z.array(z.string()).min(1, 'Enter at least one postcode'),
  // Additional Information
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
  companyDescription: z.string().optional(),
  logoKey: z.string().optional(),
});

export type VerificationFormData = z.infer<typeof verificationSchema>;

const VerificationModal: React.FC<VerificationModalProps> = ({ open, onClose, onSubmit, isSubmitting = false, existingVerification, onSubmitSuccess }) => {
  const [formData, setFormData] = useState<Partial<VerificationFormData>>({
    phone: '+61 ',
    address: '',
    services: [],
    serviceAreas: [],
    postcodes: [],
    socialLinks: { facebook: '', instagram: '', linkedin: '', youtube: '' },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sectionErrors, setSectionErrors] = useState<Record<string, string[]>>({});
  const [rawPostcodesInput, setRawPostcodesInput] = useState<string>('');
  
  // File upload refs and state
  const licenseFileRef = useRef<HTMLInputElement>(null);
  const abnFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const { uploadStates, upload: uploadFile } = useMultiFileUpload();

  // Pre-fill form data when existingVerification is provided
  useEffect(() => {
    if (open && existingVerification) {
      setFormData({
        companyName: existingVerification.companyName || '',
        representativeName: existingVerification.representativeName || '',
        designation: existingVerification.designation || '',
        email: existingVerification.email || '',
        phone: existingVerification.phone ? `+61 ${existingVerification.phone.slice(3)}` : '+61 ',
        address: existingVerification.address || '',
        abnOrLicense: existingVerification.abnOrLicense || '',
        establishedYear: existingVerification.establishedYear,
        employeeCount: existingVerification.employeeCount,
        licenseDocKey: existingVerification.licenseDocKey,
        abnDocKey: existingVerification.abnDocKey,
        services: existingVerification.services || [],
        serviceAreas: existingVerification.serviceAreas || [],
        postcodes: existingVerification.postcodes || [],
        website: existingVerification.website || '',
        socialLinks: {
          facebook: existingVerification.socialLinks?.facebook || '',
          instagram: existingVerification.socialLinks?.instagram || '',
          linkedin: existingVerification.socialLinks?.linkedin || '',
          youtube: existingVerification.socialLinks?.youtube || '',
        },
        companyDescription: existingVerification.companyDescription || '',
        logoKey: existingVerification.logoKey,
      });
      setRawPostcodesInput((existingVerification.postcodes || []).join(', '));
    } else if (open && !existingVerification) {
      // Reset to defaults when opening fresh
      setFormData({
        phone: '+61 ',
        services: [],
        serviceAreas: [],
        postcodes: [],
        socialLinks: { facebook: '', instagram: '', linkedin: '', youtube: '' },
      });
      setRawPostcodesInput('');
    }
  }, [open, existingVerification]);

  // Format phone to E.164 on change
  const handlePhoneChange = (value: string) => {
    let formatted = value;
    if (!formatted.startsWith('+61')) {
      formatted = '+61 ' + formatted.replace(/^\+?61\s?/, '');
    }
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  // File upload handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, uploadId: string, fileType: 'document' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = await uploadFile(uploadId, file, fileType);
    if (key) {
      // Store key in form data
      if (uploadId === 'license') {
        setFormData(prev => ({ ...prev, licenseDocKey: key }));
      } else if (uploadId === 'abn') {
        setFormData(prev => ({ ...prev, abnDocKey: key }));
      } else if (uploadId === 'logo') {
        setFormData(prev => ({ ...prev, logoKey: key }));
      }
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Validate entire form and categorize errors by section
  const validateForm = () => {
    setErrors({});
    setSectionErrors({});
    
    try {
      verificationSchema.parse({
        ...formData,
        phone: formData.phone?.replace(/\s/g, ''),
      });
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        const newSectionErrors: Record<string, string[]> = {
          company: [],
          legal: [],
          services: [],
          additional: [],
        };

        err.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          newErrors[field] = issue.message;

          // Categorize by section
          if (['companyName', 'representativeName', 'designation', 'email', 'phone'].includes(field)) {
            newSectionErrors.company.push(issue.message);
          } else if (['abnOrLicense', 'establishedYear', 'employeeCount', 'licenseDocKey', 'abnDocKey'].includes(field)) {
            newSectionErrors.legal.push(issue.message);
          } else if (['services', 'serviceAreas', 'postcodes'].includes(field)) {
            newSectionErrors.services.push(issue.message);
          } else if (['website', 'socialLinks', 'companyDescription', 'logoKey'].includes(field)) {
            newSectionErrors.additional.push(issue.message);
          }
        });

        setErrors(newErrors);
        setSectionErrors(newSectionErrors);
      }
      return false;
    }
  };

  const handleSubmitForm = () => {
    if (validateForm()) {
      // Remove spaces from phone for E.164 format and clean up empty strings
      const submitData = {
        ...formData,
        phone: formData.phone?.replace(/\s/g, '') || '',
        website: formData.website?.trim() || null,
        companyDescription: formData.companyDescription?.trim() || null,
        socialLinks: {
          facebook: formData.socialLinks?.facebook?.trim() || null,
          instagram: formData.socialLinks?.instagram?.trim() || null,
          linkedin: formData.socialLinks?.linkedin?.trim() || null,
          youtube: formData.socialLinks?.youtube?.trim() || null,
        },
      };
      onSubmit(submitData as VerificationFormData);
      
      // Call success callback with phone number if provided
      if (onSubmitSuccess && submitData.phone) {
        onSubmitSuccess(submitData.phone);
      }
    }
  };

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setErrors({});
      setSectionErrors({});
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-modal-title"
    >
      <div
        className="bg-surface border border-border rounded-xl shadow-neu-outset max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 id="verification-modal-title" className="text-heading-3 text-foreground">
              Installer Verification Application
            </h2>
            <p className="text-body-small text-muted-foreground">
              Complete all required sections below
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-icon hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - 4 Static Sections */}
        <div className="px-6 py-6 space-y-8">
          
          {/* Section 1: Company & Representative */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-neu-inset space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-heading-4 text-foreground">Company & Representative</h3>
              <p className="text-body-small text-muted-foreground">Primary contact and company information</p>
              {sectionErrors.company && sectionErrors.company.length > 0 && (
                <div className="mt-2 p-3 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-body-small text-error">Please complete all required fields in this section</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="companyName" className="block text-body-small text-foreground mb-2">
                Company Name <span className="text-error">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                value={formData.companyName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Solar Solutions Pty Ltd"
              />
              {errors.companyName && <p className="text-error text-body-small mt-1">{errors.companyName}</p>}
            </div>

            <div>
              <label htmlFor="representativeName" className="block text-body-small text-foreground mb-2">
                Representative Name <span className="text-error">*</span>
              </label>
              <input
                id="representativeName"
                type="text"
                value={formData.representativeName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, representativeName: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="John Smith"
              />
              {errors.representativeName && <p className="text-error text-body-small mt-1">{errors.representativeName}</p>}
            </div>

            <div>
              <label htmlFor="designation" className="block text-body-small text-foreground mb-2">
                Designation <span className="text-error">*</span>
              </label>
              <input
                id="designation"
                type="text"
                value={formData.designation || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Managing Director"
              />
              {errors.designation && <p className="text-error text-body-small mt-1">{errors.designation}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-body-small text-foreground mb-2">
                Email <span className="text-error">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="contact@solarsolutions.com.au"
              />
              {errors.email && <p className="text-error text-body-small mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-body-small text-foreground mb-2">
                Contact Number <span className="text-error">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+61 4XX XXX XXX"
              />
              {errors.phone && <p className="text-error text-body-small mt-1">{errors.phone}</p>}
              <p className="text-body-small text-muted-foreground mt-1">
                Format: +61 4XX XXX XXX
              </p>
            </div>

            <div>
              <label htmlFor="address" className="block text-body-small text-foreground mb-2">
                Business Address <span className="text-error">*</span>
              </label>
              <textarea
                id="address"
                rows={3}
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Street address, city, state, postcode"
              />
              {errors.address && <p className="text-error text-body-small mt-1">{errors.address}</p>}
              <p className="text-body-small text-muted-foreground mt-1">
                Your business or office address
              </p>
            </div>
          </div>

          {/* Section 2: Business Legal Information */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-neu-inset space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-heading-4 text-foreground">Business Legal Information</h3>
              <p className="text-body-small text-muted-foreground">Company registration and legal details</p>
              {sectionErrors.legal && sectionErrors.legal.length > 0 && (
                <div className="mt-2 p-3 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-body-small text-error">Please complete all required fields in this section</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="abnOrLicense" className="block text-body-small text-foreground mb-2">
                ABN / License Number <span className="text-error">*</span>
              </label>
              <input
                id="abnOrLicense"
                type="text"
                value={formData.abnOrLicense || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, abnOrLicense: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="12 345 678 901"
              />
              {errors.abnOrLicense && <p className="text-error text-body-small mt-1">{errors.abnOrLicense}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="establishedYear" className="block text-body-small text-foreground mb-2">
                  Established Year <span className="text-error">*</span>
                </label>
                <input
                  id="establishedYear"
                  type="number"
                  value={formData.establishedYear || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, establishedYear: parseInt(e.target.value) }))}
                  className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
                {errors.establishedYear && <p className="text-error text-body-small mt-1">{errors.establishedYear}</p>}
              </div>

              <div>
                <label htmlFor="employeeCount" className="block text-body-small text-foreground mb-2">
                  Employee Count <span className="text-error">*</span>
                </label>
                <input
                  id="employeeCount"
                  type="number"
                  value={formData.employeeCount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeCount: parseInt(e.target.value) }))}
                  className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="5"
                  min="1"
                />
                {errors.employeeCount && <p className="text-error text-body-small mt-1">{errors.employeeCount}</p>}
              </div>
            </div>

            <div>
              <label className="block text-body-small text-foreground mb-2">
                Upload License Document (Optional)
              </label>
              <input
                ref={licenseFileRef}
                type="file"
                accept="application/pdf,image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileSelect(e, 'license', 'document')}
                style={{ display: 'none' }}
              />
              <div 
                onClick={() => licenseFileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-surface shadow-neu-inset hover:border-primary transition-colors cursor-pointer"
              >
                {uploadStates.license?.uploading ? (
                  <>
                    <div className="mx-auto h-12 w-12 relative">
                      <svg className="animate-spin h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <p className="text-body-small text-foreground mt-2">Uploading... {Math.round(uploadStates.license.progress)}%</p>
                  </>
                ) : uploadStates.license?.key ? (
                  <>
                    <svg className="mx-auto h-12 w-12 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-body-small text-success mt-2">Uploaded successfully</p>
                    <p className="text-caption text-muted-foreground">Click to replace</p>
                  </>
                ) : uploadStates.license?.error ? (
                  <>
                    <svg className="mx-auto h-12 w-12 text-error" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-body-small text-error mt-2">{uploadStates.license.error}</p>
                    <p className="text-caption text-muted-foreground">Click to retry</p>
                  </>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-body-small text-muted-foreground mt-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-caption text-muted-foreground">
                      PDF, JPG, PNG (max 5MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-body-small text-foreground mb-2">
                Upload ABN Document (Optional)
              </label>
              <input
                ref={abnFileRef}
                type="file"
                accept="application/pdf,image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileSelect(e, 'abn', 'document')}
                style={{ display: 'none' }}
              />
              <div 
                onClick={() => abnFileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-surface shadow-neu-inset hover:border-primary transition-colors cursor-pointer"
              >
                {uploadStates.abn?.uploading ? (
                  <>
                    <div className="mx-auto h-12 w-12 relative">
                      <svg className="animate-spin h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <p className="text-body-small text-foreground mt-2">Uploading... {Math.round(uploadStates.abn.progress)}%</p>
                  </>
                ) : uploadStates.abn?.key ? (
                  <>
                    <svg className="mx-auto h-12 w-12 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-body-small text-success mt-2">Uploaded successfully</p>
                    <p className="text-caption text-muted-foreground">Click to replace</p>
                  </>
                ) : uploadStates.abn?.error ? (
                  <>
                    <svg className="mx-auto h-12 w-12 text-error" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-body-small text-error mt-2">{uploadStates.abn.error}</p>
                    <p className="text-caption text-muted-foreground">Click to retry</p>
                  </>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-body-small text-muted-foreground mt-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-caption text-muted-foreground">
                      PDF, JPG, PNG (max 5MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Services & Coverage */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-neu-inset space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-heading-4 text-foreground">Services & Coverage</h3>
              <p className="text-body-small text-muted-foreground">Service offerings and areas covered</p>
              {sectionErrors.services && sectionErrors.services.length > 0 && (
                <div className="mt-2 p-3 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-body-small text-error">Please complete all required fields in this section</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-body-small text-foreground mb-2">
                Types of Services Offered <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['Residential Solar', 'Commercial Solar', 'Battery Storage', 'EV Chargers', 'Solar Maintenance', 'System Upgrades'].map(service => (
                  <label key={service} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-background/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.services?.includes(service)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...(formData.services || []), service]
                          : (formData.services || []).filter(s => s !== service);
                        setFormData(prev => ({ ...prev, services: updated }));
                      }}
                      className="rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-body text-foreground">{service}</span>
                  </label>
                ))}
              </div>
              {errors.services && <p className="text-error text-body-small mt-1">{errors.services}</p>}
            </div>

            <div>
              <label className="block text-body-small text-foreground mb-2">
                Service Areas <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Sunshine Coast', 'Hobart', 'Geelong', 'Townsville', 'Cairns', 'Darwin'].map(area => (
                  <label key={area} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-background/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.serviceAreas?.includes(area)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...(formData.serviceAreas || []), area]
                          : (formData.serviceAreas || []).filter(a => a !== area);
                        setFormData(prev => ({ ...prev, serviceAreas: updated }));
                      }}
                      className="rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-body text-foreground">{area}</span>
                  </label>
                ))}
              </div>
              {errors.serviceAreas && <p className="text-error text-body-small mt-1">{errors.serviceAreas}</p>}
            </div>

            <div>
              <label htmlFor="postcodes" className="block text-body-small text-foreground mb-2">
                Postcodes Served <span className="text-error">*</span>
              </label>
              <input
                id="postcodes"
                type="text"
                value={rawPostcodesInput}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setRawPostcodesInput(inputValue);
                  // Parse into array for validation, keep empty strings during typing
                  const codes = inputValue.split(',').map(c => c.trim()).filter(Boolean);
                  setFormData(prev => ({ ...prev, postcodes: codes }));
                }}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="2000, 2001, 2010"
              />
              
              {/* D1: Visual tag display for postcodes */}
              {formData.postcodes && formData.postcodes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.postcodes.map((postcode, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-body-small"
                    >
                      {postcode}
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-body-small text-muted-foreground mt-2">
                {formData.postcodes && formData.postcodes.length > 0 
                  ? `${formData.postcodes.length} postcode${formData.postcodes.length !== 1 ? 's' : ''} entered. Separate multiple postcodes with commas.`
                  : 'Separate multiple postcodes with commas'
                }
              </p>
              {errors.postcodes && <p className="text-error text-body-small mt-1">{errors.postcodes}</p>}
            </div>
          </div>

          {/* Section 4: Additional Information */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-neu-inset space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-heading-4 text-foreground">Additional Information</h3>
              <p className="text-body-small text-muted-foreground">Website, social media, and company details</p>
            </div>

            <div>
              <label htmlFor="website" className="block text-body-small text-foreground mb-2">
                Website URL (Optional)
              </label>
              <input
                id="website"
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://www.solarsolutions.com.au"
              />
              {errors.website && <p className="text-error text-body-small mt-1">{errors.website}</p>}
            </div>

            <div className="space-y-3">
              <label className="block text-body-small text-foreground">
                Social Media Links (Optional)
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-icon" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-body-small text-foreground">Facebook</span>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks?.facebook || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, facebook: e.target.value } 
                    }))}
                    className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-icon" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/><path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-body-small text-foreground">Instagram</span>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks?.instagram || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value } 
                    }))}
                    className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-icon" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-body-small text-foreground">LinkedIn</span>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks?.linkedin || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value } 
                    }))}
                    className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-icon" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span className="text-body-small text-foreground">YouTube</span>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks?.youtube || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, youtube: e.target.value } 
                    }))}
                    className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="companyDescription" className="block text-body-small text-foreground mb-2">
                Company Description (Optional)
              </label>
              <textarea
                id="companyDescription"
                value={formData.companyDescription || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, companyDescription: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tell us about your company, experience, and what sets you apart..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-body-small text-foreground mb-2">
                Company Logo (Optional)
              </label>
              <input
                ref={logoFileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileSelect(e, 'logo', 'logo')}
                style={{ display: 'none' }}
              />
              <div 
                onClick={() => logoFileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-surface shadow-neu-inset hover:border-primary transition-colors cursor-pointer"
              >
                {uploadStates.logo?.uploading ? (
                  <>
                    <div className="mx-auto h-12 w-12 relative">
                      <svg className="animate-spin h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <p className="text-body-small text-foreground mt-2">Uploading... {Math.round(uploadStates.logo.progress)}%</p>
                  </>
                ) : uploadStates.logo?.key ? (
                  <>
                    <svg className="mx-auto h-12 w-12 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-body-small text-success mt-2">Uploaded successfully</p>
                    <p className="text-caption text-muted-foreground">Click to replace</p>
                  </>
                ) : uploadStates.logo?.error ? (
                  <>
                    <svg className="mx-auto h-12 w-12 text-error" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-body-small text-error mt-2">{uploadStates.logo.error}</p>
                    <p className="text-caption text-muted-foreground">Click to retry</p>
                  </>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-body-small text-muted-foreground mt-2">
                      Click to upload logo
                    </p>
                    <p className="text-caption text-muted-foreground">
                      PNG, JPG (max 2MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4 flex justify-between gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmitForm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
