'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/button';

interface VerificationData {
  installer: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    phoneVerified: boolean;
    companyName: string | null;
    installerVerified: boolean;
    createdAt: string;
  };
  verification: {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MORE_INFO';
    companyName: string;
    representativeName: string;
    designation: string;
    email: string;
    phone: string;
    address: string | null;
    abnOrLicense: string;
    establishedYear: number;
    employeeCount: number;
    services: string[];
    serviceAreas: string[];
    postcodes: string[];
    website: string | null;
    socialLinks: any;
    companyDescription: string | null;
    licenseDocKey: string | null;
    abnDocKey: string | null;
    logoKey: string | null;
    adminNotes: string | null;
    submittedAt: string;
    updatedAt: string;
  } | null;
  logs: Array<{
    id: string;
    action: string;
    notes: string | null;
    timestamp: string;
    performedBy: string;
  }>;
  documentUrls?: {
    licenseDocUrl?: string;
    abnDocUrl?: string;
    logoUrl?: string;
  };
}

const AdminInstallerVerificationPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const installerId = params?.id as string;
  
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch verification data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/installers/${installerId}/verification`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load verification data');
      }
      
      const result = await response.json();
      setData(result);
      setAdminNotes(result.verification?.adminNotes || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (installerId) {
      fetchData();
    }
  }, [installerId]);

  // Action handlers
  const handleAction = async (action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO') => {
    if (!data?.verification) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const response = await fetch(`/api/admin/installers/${installerId}/verification`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: adminNotes || null,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update verification');
      }
      
      const result = await response.json();
      setActionSuccess(result.message || 'Verification updated successfully');
      
      // Refresh data
      await fetchData();
      
      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => handleAction('APPROVE');
  const handleReject = () => handleAction('REJECT');
  const handleRequestInfo = () => handleAction('REQUEST_INFO');

  const getStatusBadge = () => {
    if (!data?.verification) return null;
    
    switch (data.verification.status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 text-error border border-error/20">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Rejected
          </span>
        );
      case 'MORE_INFO':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            More Info Required
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Pending Review
          </span>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 animate-pulse">
          <div className="h-8 bg-muted/20 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted/20 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data || !data.installer) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-error/10 border border-error/20 rounded-xl p-6">
          <p className="text-body text-error">Failed to load verification data</p>
          <p className="text-body-small text-error/80 mt-2">{error || 'Unknown error'}</p>
          <Button onClick={fetchData} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  const { installer, verification, logs } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Success/Error Feedback */}
      {actionSuccess && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center justify-between">
          <p className="text-body text-success">{actionSuccess}</p>
          <button onClick={() => setActionSuccess(null)} className="text-success hover:text-success/80">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {actionError && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-center justify-between">
          <p className="text-body text-error">{actionError}</p>
          <button onClick={() => setActionError(null)} className="text-error hover:text-error/80">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Installer Verification Review</h1>
          <p className="text-body text-muted-foreground mt-1">
            Review and manage installer verification application
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Installer Snapshot */}
      <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-heading-3 text-foreground">Installer Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Name</label>
            <p className="text-body text-foreground">{installer.name || 'Not provided'}</p>
          </div>

          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Email</label>
            <p className="text-body text-foreground">{installer.email}</p>
          </div>

          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Phone</label>
            <div className="flex items-center gap-2">
              <p className="text-body text-foreground">{installer.phone || 'Not provided'}</p>
              {installer.phoneVerified && (
                <span className="text-success">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-body-small text-muted-foreground mb-1">Account Created</label>
            <p className="text-body text-foreground">
              {new Date(installer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Application Details */}
      {verification ? (
        <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-heading-3 text-foreground">Application Details</h2>
            <p className="text-body-small text-muted-foreground">
              Submitted: {new Date(verification.submittedAt).toLocaleString()}
            </p>
          </div>

          {/* Company & Representative */}
          <div>
            <h3 className="text-body text-foreground mb-3">Company & Representative</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-small text-muted-foreground mb-1">Company Name</label>
                <p className="text-body text-foreground">{verification.companyName}</p>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-1">Representative Name</label>
                <p className="text-body text-foreground">{verification.representativeName}</p>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-1">Designation</label>
                <p className="text-body text-foreground">{verification.designation}</p>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-1">Contact Email</label>
                <p className="text-body text-foreground">{verification.email}</p>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-1">Contact Phone</label>
                <p className="text-body text-foreground">{verification.phone}</p>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-1">Business Address</label>
                <p className="text-body text-foreground">{verification.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Business Legal */}
          <div>
            <h3 className="text-body text-foreground mb-3">Business Legal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-body-small text-muted-foreground mb-1">ABN/License</label>
                <p className="text-body text-foreground">{verification.abnOrLicense}</p>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-1">Established Year</label>
                <p className="text-body text-foreground">{verification.establishedYear}</p>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-1">Employee Count</label>
                <p className="text-body text-foreground">{verification.employeeCount}</p>
              </div>
            </div>

            {/* Document Links (Disabled) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {verification.licenseDocKey && (
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/10 border border-border text-muted-foreground cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  License Document (API Required)
                </button>
              )}

              {verification.abnDocKey && (
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/10 border border-border text-muted-foreground cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  ABN Document (API Required)
                </button>
              )}
            </div>
          </div>

          {/* Services & Coverage */}
          <div>
            <h3 className="text-body text-foreground mb-3">Services & Coverage</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Services Offered</label>
                <div className="flex flex-wrap gap-2">
                  {verification.services.map(service => (
                    <span key={service} className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-body-small">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Service Areas</label>
                <div className="flex flex-wrap gap-2">
                  {verification.serviceAreas.map(area => (
                    <span key={area} className="px-3 py-1 rounded-full bg-accent/10 text-foreground border border-border text-body-small">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-1">Postcodes Served</label>
                <p className="text-body text-foreground">{verification.postcodes.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(verification.website || 
            verification.socialLinks?.facebook || 
            verification.socialLinks?.instagram || 
            verification.socialLinks?.linkedin || 
            verification.socialLinks?.youtube || 
            verification.companyDescription) && (
            <div>
              <h3 className="text-body text-foreground mb-3">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verification.website && (
                  <div>
                    <label className="block text-body-small text-muted-foreground mb-1">Website</label>
                    <a href={verification.website} target="_blank" rel="noopener noreferrer" className="text-body text-primary hover:underline">
                      {verification.website}
                    </a>
                  </div>
                )}

                {verification.socialLinks?.facebook && (
                  <div>
                    <label className="block text-body-small text-muted-foreground mb-1">Facebook</label>
                    <a href={verification.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-body text-primary hover:underline">
                      {verification.socialLinks.facebook}
                    </a>
                  </div>
                )}

                {verification.socialLinks?.instagram && (
                  <div>
                    <label className="block text-body-small text-muted-foreground mb-1">Instagram</label>
                    <a href={verification.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-body text-primary hover:underline">
                      {verification.socialLinks.instagram}
                    </a>
                  </div>
                )}

                {verification.socialLinks?.linkedin && (
                  <div>
                    <label className="block text-body-small text-muted-foreground mb-1">LinkedIn</label>
                    <a href={verification.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-body text-primary hover:underline">
                      {verification.socialLinks.linkedin}
                    </a>
                  </div>
                )}

                {verification.socialLinks?.youtube && (
                  <div>
                    <label className="block text-body-small text-muted-foreground mb-1">YouTube</label>
                    <a href={verification.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-body text-primary hover:underline">
                      {verification.socialLinks.youtube}
                    </a>
                  </div>
                )}
              </div>

              {verification.companyDescription && (
                <div className="mt-4">
                  <label className="block text-body-small text-muted-foreground mb-1">Company Description</label>
                  <p className="text-body text-foreground">{verification.companyDescription}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-6">
          <p className="text-body text-warning">No verification application found for this installer.</p>
        </div>
      )}

      {/* Logo Preview */}
      {verification?.logoKey && (
        <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-heading-3 text-foreground">Company Logo</h2>
          </div>

          <div className="flex items-center justify-center p-8 bg-muted/5 border border-dashed border-border rounded-xl">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-body text-muted-foreground mt-3">Logo Preview</p>
              <p className="text-body-small text-muted-foreground mt-1">(Image display requires S3 presigned URL - API pending)</p>
              <p className="text-caption text-muted-foreground mt-2">Key: {verification.logoKey}</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notes */}
      <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-heading-3 text-foreground">Admin Notes</h2>
          <p className="text-body-small text-muted-foreground">Notes are saved with actions (approve/reject/request info)</p>
        </div>

        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Add internal notes about this verification application..."
          className="w-full h-32 rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>

      {/* Action Buttons */}
      {verification && (
        <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleApprove} 
              disabled={actionLoading || verification.status === 'APPROVED'}
            >
              {actionLoading ? (
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {verification.status === 'APPROVED' ? 'Already Approved' : 'Approve Application'}
            </Button>

            <Button 
              variant="secondary" 
              onClick={handleReject} 
              disabled={actionLoading || verification.status === 'REJECTED'}
            >
              {actionLoading ? (
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {verification.status === 'REJECTED' ? 'Already Rejected' : 'Reject Application'}
            </Button>

            <Button 
              variant="secondary" 
              onClick={handleRequestInfo} 
              disabled={actionLoading}
            >
              {actionLoading ? (
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              Request More Information
            </Button>
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-heading-3 text-foreground">Activity Log</h2>
        </div>

        <div className="space-y-3">
          {logs && logs.length > 0 ? (
            logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/5 border border-border">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-body text-foreground">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-body-small text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {log.notes && (
                    <p className="text-body-small text-muted-foreground mt-1">{log.notes}</p>
                  )}
                  <p className="text-body-small text-muted-foreground">By: {log.performedBy}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-body text-muted-foreground text-center py-4">No activity logs yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInstallerVerificationPage;
