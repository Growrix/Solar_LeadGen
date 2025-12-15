'use client';

/**
 * InstallerProfileModal Component
 * 
 * Purpose: Display complete installer profile in a modal
 * Fetches: Full verification data, documents, logs, user info
 * Used by: AdminLeadManagementModal preview functionality
 */

import { useState, useEffect } from 'react';
import Button from '@/components/ui/button';

interface InstallerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  installerId: string;
}

interface VerificationData {
  installer: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    phoneVerified: boolean;
    installerVerified: boolean;
    companyName: string | null;
    createdAt: string;
  };
  verification: {
    id: string;
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
    status: string;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  logs: Array<{
    id: string;
    action: string;
    notes: string | null;
    timestamp: string;
    performedBy: string;
  }>;
  documentUrls: {
    licenseDocUrl?: string;
    abnDocUrl?: string;
    logoUrl?: string;
  };
}

export default function InstallerProfileModal({
  isOpen,
  onClose,
  installerId,
}: InstallerProfileModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VerificationData | null>(null);

  useEffect(() => {
    if (isOpen && installerId) {
      fetchInstallerProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, installerId]);

  const fetchInstallerProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/installers/${installerId}/verification`);
      if (!response.ok) {
        throw new Error('Failed to fetch installer profile');
      }
      const profileData = await response.json();
      setData(profileData);
    } catch (err: any) {
      setError(err.message || 'Failed to load installer profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl rounded-lg bg-surface shadow-neu-outset">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-heading-3 text-foreground">
              Installer Profile Preview
            </h2>
            <Button variant="ghost" onClick={onClose} className="p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-info border-r-transparent"></div>
                  <p className="mt-4 text-body-small text-muted-foreground">Loading installer profile...</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-md bg-error/10 p-4">
                <p className="text-body-small text-error">{error}</p>
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Account Information */}
                <div className="rounded-lg bg-surface shadow-neu-inset p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-heading-3 text-foreground">
                        {data.verification?.companyName || data.installer.companyName || 'Company Name Not Available'}
                      </h3>
                      <p className="text-body-small text-muted-foreground mt-1">
                        Account ID: {data.installer.id}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {data.installer.installerVerified && data.verification ? (
                        <span className="inline-flex items-center px-3 py-1 rounded text-caption bg-success/20 text-success">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded text-caption bg-warning/20 text-warning">
                          ⚠️ Unverified
                        </span>
                      )}
                      {data.verification && (
                        <span className={`inline-flex items-center px-3 py-1 rounded text-caption ${
                          data.verification.status === 'APPROVED' ? 'bg-success/20 text-success' :
                          data.verification.status === 'PENDING' ? 'bg-warning/20 text-warning' :
                          data.verification.status === 'REJECTED' ? 'bg-error/20 text-error' :
                          'bg-info/20 text-info'
                        }`}>
                          {data.verification.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-small">
                    <div>
                      <p className="text-muted-foreground">Email:</p>
                      <p className="text-foreground">{data.installer.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone:</p>
                      <p className="text-foreground">
                        {data.verification?.phone || data.installer.phone || 'Not provided'}
                        {data.installer.phoneVerified && ' ✓'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account Created:</p>
                      <p className="text-foreground">
                        {new Date(data.installer.createdAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account Name:</p>
                      <p className="text-foreground">{data.installer.name || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                {/* Verification Details */}
                {data.verification && (
                  <>
                    {/* Company Information */}
                    <div className="rounded-lg bg-surface shadow-neu-inset p-5 space-y-4">
                      <h4 className="text-heading-4 text-foreground">Company Information</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-small">
                        <div>
                          <p className="text-muted-foreground">Representative:</p>
                          <p className="text-foreground">{data.verification.representativeName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Designation:</p>
                          <p className="text-foreground">{data.verification.designation}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ABN/License:</p>
                          <p className="text-foreground">{data.verification.abnOrLicense}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Established Year:</p>
                          <p className="text-foreground">{data.verification.establishedYear}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Employee Count:</p>
                          <p className="text-foreground">{data.verification.employeeCount}</p>
                        </div>
                        {data.verification.website && (
                          <div>
                            <p className="text-muted-foreground">Website:</p>
                            <a 
                              href={data.verification.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-info hover:underline"
                            >
                              {data.verification.website}
                            </a>
                          </div>
                        )}
                      </div>

                      {data.verification.address && (
                        <div>
                          <p className="text-body-small text-muted-foreground">Business Address:</p>
                          <p className="text-body-small text-foreground mt-1">{data.verification.address}</p>
                        </div>
                      )}

                      {data.verification.companyDescription && (
                        <div>
                          <p className="text-body-small text-muted-foreground">Company Description:</p>
                          <p className="text-body-small text-foreground mt-1">{data.verification.companyDescription}</p>
                        </div>
                      )}
                    </div>

                    {/* Services & Areas */}
                    <div className="rounded-lg bg-surface shadow-neu-inset p-5 space-y-4">
                      <h4 className="text-heading-4 text-foreground">Services & Coverage</h4>
                      
                      {data.verification.services.length > 0 && (
                        <div>
                          <p className="text-body-small text-muted-foreground mb-2">Services Offered:</p>
                          <div className="flex flex-wrap gap-2">
                            {data.verification.services.map((service, idx) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded text-caption bg-info/10 text-info"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {data.verification.serviceAreas.length > 0 && (
                        <div>
                          <p className="text-body-small text-muted-foreground mb-2">Service Areas:</p>
                          <div className="flex flex-wrap gap-2">
                            {data.verification.serviceAreas.map((area, idx) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded text-caption bg-success/10 text-success"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {data.verification.postcodes.length > 0 && (
                        <div>
                          <p className="text-body-small text-muted-foreground mb-2">Service Postcodes:</p>
                          <div className="flex flex-wrap gap-2">
                            {data.verification.postcodes.map((postcode, idx) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded text-caption bg-info/10 text-info"
                              >
                                {postcode}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    {(data.documentUrls.licenseDocUrl || data.documentUrls.abnDocUrl || data.documentUrls.logoUrl) && (
                      <div className="rounded-lg bg-surface shadow-neu-inset p-5 space-y-4">
                        <h4 className="text-heading-4 text-foreground">Documents</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {data.documentUrls.licenseDocUrl && (
                            <a
                              href={data.documentUrls.licenseDocUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors text-body-small text-foreground"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              License Document
                            </a>
                          )}
                          {data.documentUrls.abnDocUrl && (
                            <a
                              href={data.documentUrls.abnDocUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors text-body-small text-foreground"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              ABN Document
                            </a>
                          )}
                          {data.documentUrls.logoUrl && (
                            <div className="flex flex-col gap-2">
                              <p className="text-caption text-muted-foreground">Company Logo:</p>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={data.documentUrls.logoUrl} 
                                alt="Company Logo" 
                                className="max-h-20 object-contain rounded-lg bg-muted/20 p-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {data.verification.adminNotes && (
                      <div className="rounded-lg bg-warning/10 border border-warning/20 p-5">
                        <h4 className="text-heading-4 text-warning mb-2">Admin Notes</h4>
                        <p className="text-body-small text-foreground">{data.verification.adminNotes}</p>
                      </div>
                    )}

                    {/* Verification Logs */}
                    {data.logs.length > 0 && (
                      <div className="rounded-lg bg-surface shadow-neu-inset p-5 space-y-4">
                        <h4 className="text-heading-4 text-foreground">Verification History</h4>
                        <div className="space-y-3">
                          {data.logs.map((log) => (
                            <div 
                              key={log.id} 
                              className="flex gap-3 p-3 rounded-lg bg-muted/10 border border-border"
                            >
                              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-info mt-2"></div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                  <span className={`text-body-small font-medium ${
                                    log.action === 'APPROVED' ? 'text-success' :
                                    log.action === 'REJECTED' ? 'text-error' :
                                    log.action === 'REQUEST_INFO' ? 'text-warning' :
                                    'text-info'
                                  }`}>
                                    {log.action}
                                  </span>
                                  <span className="text-caption text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleDateString('en-AU', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <p className="text-caption text-muted-foreground">By: {log.performedBy}</p>
                                {log.notes && (
                                  <p className="text-body-small text-foreground mt-2">{log.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* No Verification Message */}
                {!data.verification && (
                  <div className="rounded-lg bg-warning/10 border border-warning/20 p-5 text-center">
                    <p className="text-body text-warning">
                      ⚠️ This installer has not submitted verification details yet.
                    </p>
                    <p className="text-body-small text-muted-foreground mt-2">
                      They need to complete their installer profile before verification can be reviewed.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4 bg-surface">
            <div className="flex justify-end">
              <Button onClick={onClose} variant="primary">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
