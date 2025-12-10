'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@/components/ui/button';
import VerificationModal from '@/components/installer/VerificationModal';
import ContactVerificationModal from '@/components/homeowner/ContactVerificationModal';
import OTPVerificationModal from '@/components/OTPVerificationModal';
import { 
  submitVerification, 
  fetchProfile,
  updateProfile,
  fetchPreferences,
  updatePreferences,
  changePassword,
  toggleOperationalStatus,
  type VerificationFormData, 
  type ProfileData,
  type PreferencesData,
  getErrorMessage 
} from '@/lib/api/installer';
import { servicesEnum, serviceAreasEnum } from '@/lib/validation/installer';

// Phase E13: Canonical option arrays derived from Zod enums
const SERVICE_OPTIONS = servicesEnum.options;
const SERVICE_AREA_OPTIONS = serviceAreasEnum.options;

// Phase E13: Legacy label mappings -> canonical enum values
const LEGACY_SERVICE_MAP: Record<string,string> = {
  Installation: 'Residential Solar',
  Maintenance: 'Solar Maintenance',
  Inspection: 'System Upgrades',
  Repair: 'System Upgrades',
  Consultation: 'Commercial Solar',
};

const LEGACY_AREA_MAP: Record<string,string> = {
  'Regional NSW': 'Newcastle',
  'Regional VIC': 'Geelong',
  'Regional QLD': 'Gold Coast',
};

const InstallerProfilePage: React.FC = () => {
  // Profile data state
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  
  // Verification submission state
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // F8: Operational status state
  const [operationalStatus, setOperationalStatus] = useState<'ACTIVE' | 'PAUSED' | 'INACTIVE'>('ACTIVE');
  const [togglingStatus, setTogglingStatus] = useState(false);

  // F6: Editable verification fields state
  const [editableVerification, setEditableVerification] = useState<any>(null);
  const [rawPostcodesInput, setRawPostcodesInput] = useState<string>('');

  // Preferences state
  const [localPreferences, setLocalPreferences] = useState<PreferencesData>({
    alertNewLead: true,
    alertLeadUpdates: true,
    alertAdminMessages: true,
    alertVerificationUpdates: true,
    alertAccountActivity: false,
  });
  
  // Fetch profile data on mount
  useEffect(() => {
    loadProfile();
  }, []);
  
  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfile();
      setProfileData(data);
      setOperationalStatus(data.profile?.operationalStatus || 'ACTIVE');
      setEditableVerification(data.verification);
      setRawPostcodesInput((data.verification?.postcodes || []).join(', '));
      if (data.preferences) {
        setLocalPreferences(data.preferences);
      }
      // D5: Track original phone for change detection
      const currentPhone = data.verification?.phone || data.user?.phone || '';
      setOriginalPhone(currentPhone);
      setEditedPhone(currentPhone);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // F7: Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Contact verification state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [pendingVerificationPhone, setPendingVerificationPhone] = useState<string | null>(null);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [otpPayload, setOtpPayload] = useState<{
    phoneNumber: string;
    verificationId: string;
    expiresAt: Date;
  } | null>(null);

  // Status badge logic
  const getStatusBadge = () => {
    if (user.installerVerified) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified Installer
        </span>
      );
    }

    if (verification?.status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Verification Pending
        </span>
      );
    }

    if (verification?.status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 text-error border border-error/20">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Verification Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/10 text-muted-foreground border border-border">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Not Verified
      </span>
    );
  };

  const handleVerificationSubmit = async (data: VerificationFormData) => {
    setSubmittingVerification(true);
    setVerificationError(null);
    setVerificationSuccess(false);
    
    try {
      await submitVerification(data);
      setVerificationSuccess(true);
      setIsVerificationModalOpen(false);
      await loadProfile(); // Refetch to get updated verification
      setTimeout(() => setVerificationSuccess(false), 3000);
    } catch (error) {
      setVerificationError(getErrorMessage(error));
    } finally {
      setSubmittingVerification(false);
    }
  };

  // C2.2: Auto-trigger contact verification after submission
  const handleVerificationSubmitSuccess = (phone: string) => {
    setPendingVerificationPhone(phone);
    // Small delay to allow verification modal to close smoothly
    setTimeout(() => {
      setIsContactModalOpen(true);
    }, 300);
  };

  // F7: Password validation (aligned with signup modal)
  const validatePassword = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else {
      const hasLetter = /[a-zA-Z]/.test(passwordData.newPassword);
      const hasNumber = /[0-9]/.test(passwordData.newPassword);
      if (!hasLetter || !hasNumber) {
        errors.newPassword = 'Password must contain at least one letter and one number';
      }
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (validatePassword()) {
      try {
        await changePassword(passwordData);
        alert('Password changed successfully. You will be logged out and redirected to the homepage.');
        // Sign out and redirect to homepage
        await signOut({ callbackUrl: '/', redirect: true });
      } catch (error) {
        alert(getErrorMessage(error));
      }
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    }
  };

  // F8: Toggle operational status
  const handleStatusToggle = async (newStatus: 'ACTIVE' | 'PAUSED') => {
    setTogglingStatus(true);
    try {
      await toggleOperationalStatus(newStatus);
      setOperationalStatus(newStatus);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setTogglingStatus(false);
    }
  };
  
  // Handle preference toggle with optimistic update
  const handlePreferenceToggle = async (key: keyof PreferencesData, value: boolean) => {
    // Optimistic update
    const prevPreferences = { ...localPreferences };
    setLocalPreferences(prev => ({ ...prev, [key]: value }));
    
    try {
      await updatePreferences({ [key]: value });
    } catch (error) {
      // Rollback on error
      setLocalPreferences(prevPreferences);
      alert(getErrorMessage(error));
    }
  };

  // State for save operation
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  // Phase E13: Field-level validation errors from API (Zod issues)
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});

  // D5: Phone change detection state
  const [originalPhone, setOriginalPhone] = useState<string>('');
  const [editedPhone, setEditedPhone] = useState<string>('');
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [phoneVerificationComplete, setPhoneVerificationComplete] = useState(false);

  // D5: Detect phone changes
  useEffect(() => {
    const changed = editedPhone !== originalPhone && editedPhone.trim() !== '';
    setPhoneChanged(changed);
    if (!changed) {
      setPhoneVerificationComplete(false); // Reset verification if reverted to original
    }
  }, [editedPhone, originalPhone]);

  // F6: Save all profile changes
  const handleSaveAllChanges = async () => {
    // D5: Check if phone changed and requires verification
    if (phoneChanged && !phoneVerificationComplete) {
      // Open contact verification modal to verify new phone
      setPendingVerificationPhone(editedPhone);
      setIsContactModalOpen(true);
      // Note: Save will auto-trigger after verification succeeds in handleVerificationSuccess
      return; // Block save until verification complete
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Collect all changed fields (only post-approval editable fields)
      const updateData: any = {
        services: editableVerification?.services,
        serviceAreas: editableVerification?.serviceAreas,
        postcodes: editableVerification?.postcodes,
        website: editableVerification?.website,
        socialLinks: editableVerification?.socialLinks,
        companyDescription: editableVerification?.companyDescription,
        // E2: Include company details fields
        companyName: editableVerification?.companyName,
        representativeName: editableVerification?.representativeName,
        designation: editableVerification?.designation,
        address: editableVerification?.address, // F14: Business address
        abnOrLicense: editableVerification?.abnOrLicense,
        establishedYear: editableVerification?.establishedYear,
        employeeCount: editableVerification?.employeeCount,
        // Phase E13: document keys
        licenseDocKey: editableVerification?.licenseDocKey,
        abnDocKey: editableVerification?.abnDocKey,
        logoKey: editableVerification?.logoKey,
      };

      // D5: Include phone if changed and verified
      if (phoneChanged && phoneVerificationComplete) {
        updateData.phone = editedPhone;
      }
      
      await updateProfile(updateData);
      
      // Exit edit mode
      setIsEditingProfile(false);
      
      // Reload profile data (will update originalPhone)
      await loadProfile();
      
      // Reset phone change tracking
      setPhoneChanged(false);
      setPhoneVerificationComplete(false);
      
      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      setFieldErrors({}); // Clear field errors on success
      
    } catch (error: any) {
      console.error('Save failed:', error);
      setSaveError(getErrorMessage(error) || 'Failed to save changes. Please try again.');
      // Extract Zod issues if present for inline display
      if (error?.issues && Array.isArray(error.issues)) {
        const mapped: Record<string,string> = {};
        for (const issue of error.issues) {
          const pathKey = Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path);
          if (!mapped[pathKey]) mapped[pathKey] = issue.message;
        }
        setFieldErrors(mapped);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleOTPRequested = (payload: {
    phoneNumber: string;
    verificationId: string;
    expiresAt: Date;
    remainingAttempts: number;
  }) => {
    console.log('OTP requested:', payload);
    setOtpPayload({
      phoneNumber: payload.phoneNumber,
      verificationId: payload.verificationId,
      expiresAt: payload.expiresAt,
    });
    setIsContactModalOpen(false);
    setIsOTPModalOpen(true);
  };

  const handleVerificationSuccess = async () => {
    console.log('Phone verification successful');
    // D5: Mark phone verification as complete
    setPhoneVerificationComplete(true);
    setIsOTPModalOpen(false);
    setIsContactModalOpen(false);
    setOtpPayload(null);
    
    // D5: Auto-save profile after phone verification completes
    if (phoneChanged) {
      try {
        setIsSaving(true);
        setSaveError(null);
        
        // Collect all changed fields
        const updateData: any = {
          services: editableVerification?.services,
          serviceAreas: editableVerification?.serviceAreas,
          postcodes: editableVerification?.postcodes,
          website: editableVerification?.website,
          socialLinks: editableVerification?.socialLinks,
          companyDescription: editableVerification?.companyDescription,
          companyName: editableVerification?.companyName,
          representativeName: editableVerification?.representativeName,
          designation: editableVerification?.designation,
          address: editableVerification?.address, // F14: Business address
          abnOrLicense: editableVerification?.abnOrLicense,
          establishedYear: editableVerification?.establishedYear,
          employeeCount: editableVerification?.employeeCount,
          phone: editedPhone, // Include verified phone
          licenseDocKey: editableVerification?.licenseDocKey,
          abnDocKey: editableVerification?.abnDocKey,
          logoKey: editableVerification?.logoKey,
        };

        await updateProfile(updateData);
        
        // Exit edit mode
        setIsEditingProfile(false);
        
        // Reload profile data
        await loadProfile();
        
        // Reset phone change tracking
        setPhoneChanged(false);
        setPhoneVerificationComplete(false);
        
        // Show success toast
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
        setFieldErrors({});
      } catch (error: any) {
        console.error('Failed to save profile after verification:', error);
        setSaveError(error.message || 'Failed to save changes');
        if (error?.issues && Array.isArray(error.issues)) {
          const mapped: Record<string,string> = {};
          for (const issue of error.issues) {
            const pathKey = Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path);
            if (!mapped[pathKey]) mapped[pathKey] = issue.message;
          }
          setFieldErrors(mapped);
        }
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleResendOTP = async () => {
    console.log('Resend OTP requested');
    // TODO: API call in Phase B5
    return {
      success: true,
      verificationId: otpPayload?.verificationId || '',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };
  };

  // Show loading skeleton
  if (loading) {
    return (
      <>
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 animate-pulse">
            <div className="h-8 bg-muted/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted/20 rounded w-2/3"></div>
          </div>
        </div>
      </>
    );
  }
  
  // Show error state
  if (error || !profileData) {
    return (
      <>
        <div className="bg-error/10 border border-error/20 rounded-xl p-6">
          <p className="text-body text-error">Failed to load profile</p>
          <p className="text-body-small text-error/80 mt-2">{error || 'Unknown error'}</p>
          <Button onClick={loadProfile} className="mt-4">Retry</Button>
        </div>
      </>
    );
  }
  
  const { user, profile, verification, preferences } = profileData;
  
  return (
    <>
      <div className="space-y-6">
        {/* Success/Error Feedback Banners */}
        {verificationSuccess && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-6 h-6 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-body text-success">Verification Submitted Successfully!</p>
            <p className="text-body-small text-success/80 mt-1">
              Your application is under review. You&apos;ll be notified once it&apos;s processed.
            </p>
          </div>
          <button
            onClick={() => setVerificationSuccess(false)}
            className="text-success hover:text-success/80 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {verificationError && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-body text-error">Submission Failed</p>
            <p className="text-body-small text-error/80 mt-1">{verificationError}</p>
          </div>
          <button
            onClick={() => setVerificationError(null)}
            className="text-error hover:text-error/80 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {saveError && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-body text-error">Failed to Save Changes</p>
            <p className="text-body-small text-error/80 mt-1">{saveError}</p>
          </div>
          <button
            onClick={() => setSaveError(null)}
            className="text-error hover:text-error/80 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-success text-foreground px-4 py-3 rounded-lg shadow-neu-outset z-50 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p>Profile updated successfully</p>
        </div>
      )}
      
      {/* F8: Operational Status Toggle - Always show for demo */}
      <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${operationalStatus === 'ACTIVE' ? 'bg-success' : operationalStatus === 'PAUSED' ? 'bg-warning' : 'bg-error'}`} />
          <div>
            <p className="text-body text-foreground">
              Operational Status: <span className="text-foreground">{operationalStatus}</span>
            </p>
            <p className="text-body-small text-muted-foreground">
              {operationalStatus === 'ACTIVE' ? 'Receiving new leads' : operationalStatus === 'PAUSED' ? 'Not receiving new leads' : 'Account disabled by admin'}
            </p>
          </div>
        </div>
        {operationalStatus !== 'INACTIVE' && (
          <Button
            variant={operationalStatus === 'ACTIVE' ? 'secondary' : 'primary'}
            onClick={() => handleStatusToggle(operationalStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
            disabled={togglingStatus}
          >
            {togglingStatus ? 'Updating...' : (operationalStatus === 'ACTIVE' ? 'Pause Operations' : 'Resume Operations')}
          </Button>
        )}
      </div>

      {/* F8: Paused Banner */}
      {operationalStatus === 'PAUSED' && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-body text-foreground">Operations Paused</h3>
            <p className="text-body-small text-muted-foreground mt-1">
              Your account is currently paused. You will not receive new lead assignments until you resume operations. Existing leads remain accessible.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-surface shadow-neu-inset flex items-center justify-center">
            {user.image ? (
              <img src={user.image} alt={user.name || 'User'} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-heading-2 text-primary">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-heading-2 text-foreground">{verification?.companyName || 'Company'}</h1>
            <p className="text-body text-muted-foreground">{verification?.representativeName || user.name || 'Representative'}</p>
            <div className="mt-2">{getStatusBadge()}</div>
          </div>
        </div>

        {verification && (
          <Button variant="secondary" onClick={() => {
            const newEditingState = !isEditingProfile;
            setIsEditingProfile(newEditingState);
            // Sync rawPostcodesInput when entering edit mode
            if (newEditingState) {
              setRawPostcodesInput((editableVerification?.postcodes || []).join(', '));
            }
          }}>
            {isEditingProfile ? 'Cancel Editing' : 'Edit Profile'}
          </Button>
        )}
      </div>

      {/* Verification Banner (show only if no verification submitted yet) */}
      {!verification && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-body text-foreground">Complete Verification to Access Full Features</h3>
            <p className="text-body-small text-muted-foreground mt-1">
              Submit your business details and documents for admin review to unlock lead purchasing and bidding.
            </p>
            <Button variant="primary" className="mt-3" onClick={() => setIsVerificationModalOpen(true)}>
              Start Verification
            </Button>
          </div>
        </div>
      )}

      {/* Contact Verification */}
      {!user.phoneVerified && (
        <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-heading-3 text-foreground">Contact Verification</h2>
          </div>

          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-body text-foreground">Phone Number Not Verified</h3>
              <p className="text-body-small text-muted-foreground mt-1">
                Verify your phone number to receive lead alerts and important notifications.
              </p>
              <Button variant="primary" className="mt-3" onClick={() => setIsContactModalOpen(true)}>
                Verify Phone Number
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Company Details */}
      <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-heading-3 text-foreground">Company Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Field */}
          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Email</label>
            <p className="text-body text-foreground">{user.email}</p>
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Phone</label>
            {isEditingProfile ? (
              <div>
                <input
                  type="tel"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  placeholder="+61 4XX XXX XXX"
                  disabled={isSaving}
                  className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                />
                {phoneChanged && !phoneVerificationComplete && (
                  <p className="text-body-small text-warning mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Phone number changed. Verification required before saving.
                  </p>
                )}
                {phoneChanged && phoneVerificationComplete && (
                  <p className="text-body-small text-success mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    New phone number verified. Ready to save.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-body text-foreground">{verification?.phone || user.phone || 'Not provided'}</p>
                {user.phoneVerified && (
                  <span className="text-success">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Company Name</label>
            {isEditingProfile ? (
              <input
                type="text"
                value={editableVerification?.companyName || ''}
                onChange={(e) => setEditableVerification((prev: any) => ({ ...prev!, companyName: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <p className="text-body text-foreground">{verification?.companyName || 'Not provided'}</p>
            )}
          </div>

          {/* Representative Name */}
          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Representative Name</label>
            {isEditingProfile ? (
              <input
                type="text"
                value={editableVerification?.representativeName || ''}
                onChange={(e) => setEditableVerification((prev: any) => ({ ...prev!, representativeName: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <p className="text-body text-foreground">{verification?.representativeName || 'Not provided'}</p>
            )}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Designation</label>
            {isEditingProfile ? (
              <input
                type="text"
                value={editableVerification?.designation || ''}
                onChange={(e) => setEditableVerification((prev: any) => ({ ...prev!, designation: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <p className="text-body text-foreground">{verification?.designation || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Business Address</label>
            {isEditingProfile ? (
              <textarea
                rows={3}
                value={editableVerification?.address || ''}
                onChange={(e) => setEditableVerification((prev: any) => ({ ...prev!, address: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Street address, city, state, postcode"
              />
            ) : (
              <p className="text-body text-foreground">{verification?.address || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-body-small text-muted-foreground mb-1">ABN / License</label>
            {isEditingProfile ? (
              <input
                type="text"
                value={editableVerification?.abnOrLicense || ''}
                onChange={(e) => setEditableVerification((prev: any) => ({ ...prev!, abnOrLicense: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <p className="text-body text-foreground">{verification?.abnOrLicense || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Established Year</label>
            {isEditingProfile ? (
              <input
                type="number"
                value={editableVerification?.establishedYear || ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                  setEditableVerification((prev: any) => ({ ...prev!, establishedYear: val }));
                }}
                className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                min="1900"
                max={new Date().getFullYear()}
              />
            ) : (
              <p className="text-body text-foreground">{verification?.establishedYear || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Employee Count</label>
            {isEditingProfile ? (
              <input
                type="number"
                value={editableVerification?.employeeCount || ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                  setEditableVerification((prev: any) => ({ ...prev!, employeeCount: val }));
                }}
                className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                min="1"
              />
            ) : (
              <p className="text-body text-foreground">{verification?.employeeCount || 'Not provided'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-body-small text-muted-foreground mb-1">Website</label>
            {isEditingProfile ? (
              <input
                type="url"
                value={editableVerification?.website || ''}
                onChange={(e) => setEditableVerification((prev: any) => ({ ...prev!, website: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://www.example.com"
              />
            ) : (
              <p className="text-body text-foreground">{verification?.website || 'Not provided'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-body-small text-muted-foreground mb-2">Company Description</label>
            {isEditingProfile ? (
              <textarea
                value={editableVerification?.companyDescription || ''}
                onChange={(e) => setEditableVerification((prev: any) => ({ ...prev!, companyDescription: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
                placeholder="Tell us about your company..."
              />
            ) : (
              <p className="text-body text-foreground">{verification?.companyDescription || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* F6: Social Media Links - Always show */}
      <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-heading-3 text-foreground">Social Media</h2>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-small text-muted-foreground mb-1">Facebook</label>
              {isEditingProfile ? (
                <input
                  type="url"
                  value={editableVerification?.socialLinks?.facebook || ''}
                  onChange={(e) => setEditableVerification((prev: any) => ({ 
                    ...prev!, 
                    socialLinks: { ...prev!.socialLinks, facebook: e.target.value } 
                  }))}
                  className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://facebook.com/yourpage"
                />
              ) : (
                <p className="text-body text-foreground">{verification?.socialLinks?.facebook || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-body-small text-muted-foreground mb-1">Instagram</label>
              {isEditingProfile ? (
                <input
                  type="url"
                  value={editableVerification?.socialLinks?.instagram || ''}
                  onChange={(e) => setEditableVerification((prev: any) => ({ 
                    ...prev!, 
                    socialLinks: { ...prev!.socialLinks, instagram: e.target.value } 
                  }))}
                  className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://instagram.com/yourpage"
                />
              ) : (
                <p className="text-body text-foreground">{verification?.socialLinks?.instagram || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-body-small text-muted-foreground mb-1">LinkedIn</label>
              {isEditingProfile ? (
                <input
                  type="url"
                  value={editableVerification?.socialLinks?.linkedin || ''}
                  onChange={(e) => setEditableVerification((prev: any) => ({ 
                    ...prev!, 
                    socialLinks: { ...prev!.socialLinks, linkedin: e.target.value } 
                  }))}
                  className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              ) : (
                <p className="text-body text-foreground">{verification?.socialLinks?.linkedin || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-body-small text-muted-foreground mb-1">YouTube</label>
              {isEditingProfile ? (
                <input
                  type="url"
                  value={editableVerification?.socialLinks?.youtube || ''}
                  onChange={(e) => setEditableVerification((prev: any) => ({ 
                    ...prev!, 
                    socialLinks: { ...prev!.socialLinks, youtube: e.target.value } 
                  }))}
                  className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://youtube.com/@yourchannel"
                />
              ) : (
                <p className="text-body text-foreground">{verification?.socialLinks?.youtube || 'Not provided'}</p>
              )}
            </div>
          </div>
      </div>

      {/* Services & Areas */}
      <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-heading-3 text-foreground">Services & Coverage</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-body-small text-muted-foreground mb-2">Services Offered</label>
            {isEditingProfile ? (
              <div className="space-y-2">
                {SERVICE_OPTIONS.map(service => (
                  <label key={service} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editableVerification?.services?.includes(service)}
                      onChange={(e) => {
                        // Normalize legacy labels to canonical before updating state
                        const canonical = LEGACY_SERVICE_MAP[service] || service;
                        const current = (editableVerification?.services || []).map((s: string) => LEGACY_SERVICE_MAP[s] || s);
                        const updated = e.target.checked
                          ? [...current.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i), canonical]
                          : current.filter((s: string) => s !== canonical);
                        setEditableVerification((prev: any) => ({ ...prev!, services: updated }));
                      }}
                      className="rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-body text-foreground">{service}</span>
                  </label>
                ))}
                {fieldErrors['services'] && (
                  <p className="text-caption text-error mt-2">{fieldErrors['services']}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {verification?.services?.map(service => (
                  <span key={service} className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-body-small">
                    {service}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-body-small text-muted-foreground mb-2">Service Areas</label>
            {isEditingProfile ? (
              <div className="space-y-2">
                {SERVICE_AREA_OPTIONS.map(area => (
                  <label key={area} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editableVerification?.serviceAreas?.includes(area)}
                      onChange={(e) => {
                        const canonical = LEGACY_AREA_MAP[area] || area;
                        const current = (editableVerification?.serviceAreas || []).map((a: string) => LEGACY_AREA_MAP[a] || a);
                        const updated = e.target.checked
                          ? [...current.filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i), canonical]
                          : current.filter((a: string) => a !== canonical);
                        setEditableVerification((prev: any) => ({ ...prev!, serviceAreas: updated }));
                      }}
                      className="rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-body text-foreground">{area}</span>
                  </label>
                ))}
                {fieldErrors['serviceAreas'] && (
                  <p className="text-caption text-error mt-2">{fieldErrors['serviceAreas']}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {verification?.serviceAreas?.map(area => (
                  <span key={area} className="px-3 py-1 rounded-full bg-accent/10 text-foreground border border-border text-body-small">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-body-small text-muted-foreground mb-2">Postcodes Served</label>
            {isEditingProfile ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {(editableVerification?.postcodes || []).map((code: string) => (
                    <span key={code} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-caption">
                      {code}
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = (editableVerification?.postcodes || []).filter((c: string) => c !== code);
                          setEditableVerification((prev: any) => ({ ...prev!, postcodes: filtered }));
                        }}
                        className="ml-1 text-primary hover:text-error focus:outline-none"
                        aria-label={`Remove postcode ${code}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={rawPostcodesInput}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setRawPostcodesInput(inputValue);
                    // Parse into array for chips/validation
                    const codes = inputValue.split(',').map(c => c.trim()).filter(Boolean);
                    const uniqueCodes = Array.from(new Set(codes));
                    setEditableVerification((prev: any) => ({ ...prev!, postcodes: uniqueCodes }));
                  }}
                  className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="2000, 2001, 2010"
                />
                <p className="text-caption text-muted-foreground">
                  Enter 4-digit codes separated by commas. Click × to remove. Validation on save.
                </p>
                {fieldErrors['postcodes'] && (
                  <p className="text-caption text-error">{fieldErrors['postcodes']}</p>
                )}
              </div>
            ) : (
              <p className="text-body text-foreground">{verification?.postcodes?.join(', ') || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* F6: Documents Upload Section - Always show */}
      <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-heading-3 text-foreground">Documents & Logo</h2>
          <p className="text-body-small text-muted-foreground mt-1">Upload or update your business documents</p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-body-small text-foreground mb-2">License Document</label>
              {isEditingProfile ? (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Stub: generate key locally (Phase E13 placeholder for presign/upload flow)
                      const generatedKey = `license-${Date.now()}-${file.name}`;
                      setEditableVerification((prev: any) => ({ ...prev!, licenseDocKey: generatedKey }));
                    }}
                    className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-caption text-muted-foreground">Accepted: PDF/JPG/PNG</p>
                  {(editableVerification?.licenseDocKey || verification?.licenseDocKey) && (
                    <p className="text-caption text-success">Key: {(editableVerification?.licenseDocKey || verification?.licenseDocKey)}</p>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center bg-surface shadow-neu-inset">
                  <svg className="mx-auto h-10 w-10 text-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-caption text-muted-foreground mt-2">Upload PDF/JPG</p>
                  {verification?.licenseDocKey && (
                    <p className="text-caption text-success mt-1">✓ Uploaded</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-body-small text-foreground mb-2">ABN Document</label>
              {isEditingProfile ? (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const generatedKey = `abn-${Date.now()}-${file.name}`;
                      setEditableVerification((prev: any) => ({ ...prev!, abnDocKey: generatedKey }));
                    }}
                    className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-caption text-muted-foreground">Accepted: PDF/JPG/PNG</p>
                  {(editableVerification?.abnDocKey || verification?.abnDocKey) && (
                    <p className="text-caption text-success">Key: {(editableVerification?.abnDocKey || verification?.abnDocKey)}</p>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center bg-surface shadow-neu-inset">
                  <svg className="mx-auto h-10 w-10 text-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-caption text-muted-foreground mt-2">Upload PDF/JPG</p>
                  {verification?.abnDocKey && (
                    <p className="text-caption text-success mt-1">✓ Uploaded</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-body-small text-foreground mb-2">Company Logo</label>
              {isEditingProfile ? (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const generatedKey = `logo-${Date.now()}-${file.name}`;
                      setEditableVerification((prev: any) => ({ ...prev!, logoKey: generatedKey }));
                    }}
                    className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-caption text-muted-foreground">Accepted: JPG/PNG</p>
                  {(editableVerification?.logoKey || verification?.logoKey) && (
                    <p className="text-caption text-success">Key: {(editableVerification?.logoKey || verification?.logoKey)}</p>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center bg-surface shadow-neu-inset">
                  <svg className="mx-auto h-10 w-10 text-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-caption text-muted-foreground mt-2">Upload PNG/JPG</p>
                  {verification?.logoKey && (
                    <p className="text-caption text-success mt-1">✓ Uploaded</p>
                  )}
                </div>
              )}
            </div>
          </div>
      </div>

      {/* F7: Change Password Section */}
      <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-heading-3 text-foreground">Security</h2>
            <p className="text-body-small text-muted-foreground mt-1">Manage your password and security settings</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label htmlFor="currentPassword" className="block text-body-small text-foreground mb-2">
              Current Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 pr-12 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-error text-body-small mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-body-small text-foreground mb-2">
              New Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 pr-12 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-error text-body-small mt-1">{passwordErrors.newPassword}</p>
            )}
            <div className="mt-2 space-y-1">
              <p className="text-caption text-muted-foreground">Password must contain:</p>
              <ul className="text-caption text-muted-foreground space-y-0.5 ml-4">
                <li className={passwordData.newPassword.length >= 8 ? 'text-success' : ''}>• At least 8 characters</li>
                <li className={/[a-zA-Z]/.test(passwordData.newPassword) ? 'text-success' : ''}>• At least one letter</li>
                <li className={/[0-9]/.test(passwordData.newPassword) ? 'text-success' : ''}>• At least one number</li>
              </ul>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-body-small text-foreground mb-2">
              Confirm New Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 pr-12 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-error text-body-small mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-heading-3 text-foreground">Notification Preferences</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body text-foreground">New Lead Available</p>
              <p className="text-body-small text-muted-foreground">Get notified when new leads match your criteria</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.alertNewLead}
                onChange={(e) => handlePreferenceToggle('alertNewLead', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface border-2 border-border peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:border-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/20" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-body text-foreground">Lead Updates</p>
              <p className="text-body-small text-muted-foreground">Get notified about changes to your leads</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.alertLeadUpdates}
                onChange={(e) => handlePreferenceToggle('alertLeadUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface border-2 border-border peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:border-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/20" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-body text-foreground">Admin Messages</p>
              <p className="text-body-small text-muted-foreground">Get notified about messages from admins</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.alertAdminMessages}
                onChange={(e) => handlePreferenceToggle('alertAdminMessages', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface border-2 border-border peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:border-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/20" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-body text-foreground">Verification Updates</p>
              <p className="text-body-small text-muted-foreground">Get notified about verification status changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.alertVerificationUpdates}
                onChange={(e) => handlePreferenceToggle('alertVerificationUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface border-2 border-border peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:border-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/20" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-body text-foreground">Account Activity</p>
              <p className="text-body-small text-muted-foreground">Get notified about login and security events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.alertAccountActivity}
                onChange={(e) => handlePreferenceToggle('alertAccountActivity', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface border-2 border-border peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:border-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/20" />
            </label>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      {isEditingProfile && (
        <div className="sticky bottom-0 bg-surface border-t border-border p-4 flex items-center justify-end gap-4 shadow-neu-outset z-10">
          <Button 
            variant="secondary" 
            onClick={() => {
              setIsEditingProfile(false);
              setEditableVerification(verification);
            }}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAllChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save All Changes'
            )}
          </Button>
        </div>
      )}

      {/* Verification Modal */}
      <VerificationModal
        open={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSubmit={handleVerificationSubmit}
        isSubmitting={submittingVerification}
        onSubmitSuccess={handleVerificationSubmitSuccess}
      />

      {/* Contact Verification Modal */}
      <ContactVerificationModal
        isOpen={isContactModalOpen}
        defaultPhone={pendingVerificationPhone || verification?.phone || user.phone || undefined}
        onClose={() => {
          setIsContactModalOpen(false);
          setPendingVerificationPhone(null); // Clear pending phone on close
        }}
        onOTPRequested={handleOTPRequested}
      />

      {/* OTP Verification Modal */}
      {otpPayload && (
        <OTPVerificationModal
          isOpen={isOTPModalOpen}
          phoneNumber={otpPayload.phoneNumber}
          verificationId={otpPayload.verificationId}
          expiresAt={otpPayload.expiresAt}
          onClose={() => {
            setIsOTPModalOpen(false);
            setOtpPayload(null);
          }}
          onVerificationSuccess={handleVerificationSuccess}
          onResendOTP={handleResendOTP}
        />
      )}
      </div>
    </>
  );
};

export default InstallerProfilePage;
