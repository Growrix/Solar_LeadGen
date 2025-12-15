/**
 * LeadPreviewModal Component
 * 
 * Purpose: Read-only modal for viewing approved/purchased leads
 * Used by: HomeownerDashboard lead cards (when canEditLead returns false)
 * 
 * Features:
 * - Shows all lead details in read-only format
 * - No editing capability
 * - Clean, organized layout
 * - Used for APPROVED, PURCHASED, or other non-editable statuses
 * 
 * Phase 4.11: Enhanced CRUD operations
 */

'use client';

import React from 'react';

// Icon components
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;

// Status label mapping for better UX
const STATUS_DISPLAY_LABELS: Record<string, string> = {
  PURCHASED: 'Responded by Installer',
  APPROVED: 'Approved',
  PENDING_APPROVAL: 'Awaiting Review',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  FLAGGED: 'Flagged',
  QUOTED: 'Quotes Received',
  ACCEPTED: 'Accepted',
  PENDING_PHONE: 'Needs Verification',
};

interface LeadPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    quoteType: string;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    quoteData: Record<string, any>;
  };
}

const LeadPreviewModal: React.FC<LeadPreviewModalProps> = ({
  isOpen,
  onClose,
  lead,
}) => {
  if (!isOpen) return null;

  const data = lead.quoteData || {};

  // Helper to format dates
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to format boolean values
  const formatBoolean = (value: boolean) => {
    return value ? (
      <span className="inline-flex items-center gap-1 text-success">
        <CheckIcon /> Yes
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-muted">
        <XCircleIcon /> No
      </span>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      style={{ zIndex: 1400 }}
      onClick={onClose}
    >
      <div 
        className="bg-surface rounded-xl shadow-modal w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface flex-shrink-0">
          <div>
            <h2 className="text-heading-2 text-foreground">
              Quote Request Details
            </h2>
            <p className="text-body-small text-muted mt-1">
              Read-only view • Created {formatDate(lead.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-icon hover:text-foreground transition-colors p-2 rounded-lg hover:bg-surface-hover"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-body-small ${
              lead.status === 'APPROVED' ? 'bg-success/20 text-success' :
              lead.status === 'PURCHASED' ? 'bg-accent/20 text-accent' :
              'bg-surface text-foreground'
            }`}>
              {STATUS_DISPLAY_LABELS[lead.status] || lead.status.replace('_', ' ')}
            </span>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
          {/* Location Details */}
          <div className="info-section rounded-lg p-4">
            <h3 className="text-heading-4 text-foreground mb-4">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-body-small text-muted">Postcode</p>
                <p className="text-body text-foreground">{data.postcode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-body-small text-muted">Suburb/City</p>
                <p className="text-body text-foreground">{data.location || 'N/A'}</p>
              </div>
              <div>
                <p className="text-body-small text-muted">State</p>
                <p className="text-body text-foreground">{data.state || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Energy Usage */}
          <div className="info-section rounded-lg p-4">
            <h3 className="text-heading-4 text-foreground mb-4">Energy Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-body-small text-muted">Bill Type</p>
                <p className="text-body text-foreground capitalize">
                  {data.electricityUsageType || data.billType || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted">Bill Amount</p>
                <p className="text-body text-foreground">
                  ${data.electricityValue || data.energyBill || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="info-section rounded-lg p-4">
            <h3 className="text-heading-4 text-foreground mb-4">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-body-small text-muted">Property Type</p>
                <p className="text-body text-foreground capitalize">
                  {data.propertyType || 'Residential'}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted">Roof Type</p>
                <p className="text-body text-foreground capitalize">
                  {data.roofType || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted">Roof Orientation</p>
                <p className="text-body text-foreground capitalize">
                  {data.panelOrientation || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted">Roof Pitch</p>
                <p className="text-body text-foreground capitalize">
                  {data.roofTilt || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted">Shading Level</p>
                <p className="text-body text-foreground capitalize">
                  {data.shadingLevel || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted">Budget Range</p>
                <p className="text-body text-foreground">
                  {data.budgetRange ? data.budgetRange.replace(/_/g, ' ') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* System Preferences */}
          <div className="info-section rounded-lg p-4">
            <h3 className="text-heading-4 text-foreground mb-4">System Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-body-small text-muted">Desired Offset</p>
                <p className="text-body text-foreground">
                  {data.desiredOffset || 100}%
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted">Usage Pattern</p>
                <p className="text-body text-foreground capitalize">
                  {data.usagePattern || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted">Installation Timeframe</p>
                <p className="text-body text-foreground capitalize">
                  {data.timeframe || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted">Existing Solar System</p>
                <p className="text-body text-foreground">
                  {formatBoolean(data.hasExistingSystem || false)}
                  {data.hasExistingSystem && data.existingSystemSize && (
                    <span className="ml-2 text-muted">
                      ({data.existingSystemSize})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Battery Storage */}
          {data.batteryIncluded && (
            <div className="info-section rounded-lg p-4">
              <h3 className="text-heading-4 text-foreground mb-4">Battery Storage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-body-small text-muted">Battery Included</p>
                  <p className="text-body text-foreground">
                    {formatBoolean(true)}
                  </p>
                </div>
                <div>
                  <p className="text-body-small text-muted">Battery Capacity</p>
                  <p className="text-body text-foreground">
                    {data.batteryCapacity || data.customBatteryCapacity || 'N/A'} kWh
                  </p>
                </div>
                {data.batteryBrand && (
                  <div>
                    <p className="text-body-small text-muted">Preferred Brand</p>
                    <p className="text-body text-foreground">
                      {data.batteryBrand}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-body-small text-muted">Battery Usage</p>
                  <p className="text-body text-foreground capitalize">
                    {data.batteryUsage?.replace('-', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-body-small text-muted">Backup Priority</p>
                  <p className="text-body text-foreground capitalize">
                    {data.backupCritical?.replace('-', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-body-small text-muted">VPP Program</p>
                  <p className="text-body text-foreground">
                    {formatBoolean(data.includeVPP || false)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Features */}
          {(data.includeEVCharging || data.includeSmartHome || data.includeGridServices || data.includeOptimizers || data.includeMicroinverters) && (
            <div className="info-section rounded-lg p-4">
              <h3 className="text-heading-4 text-foreground mb-4">Additional Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.includeEVCharging && (
                  <div className="flex items-center gap-2">
                    <div className="text-success"><CheckIcon /></div>
                    <span className="text-foreground">EV Charging</span>
                  </div>
                )}
                {data.includeSmartHome && (
                  <div className="flex items-center gap-2">
                    <div className="text-success"><CheckIcon /></div>
                    <span className="text-foreground">Smart Home Integration</span>
                  </div>
                )}
                {data.includeGridServices && (
                  <div className="flex items-center gap-2">
                    <div className="text-success"><CheckIcon /></div>
                    <span className="text-foreground">Grid Services</span>
                  </div>
                )}
                {data.includeOptimizers && (
                  <div className="flex items-center gap-2">
                    <div className="text-success"><CheckIcon /></div>
                    <span className="text-foreground">Panel Optimizers</span>
                  </div>
                )}
                {data.includeMicroinverters && (
                  <div className="flex items-center gap-2">
                    <div className="text-success"><CheckIcon /></div>
                    <span className="text-foreground">Microinverters</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment Preferences */}
          {(data.panelBrand || data.systemSizeOverride) && (
            <div className="info-section rounded-lg p-4">
              <h3 className="text-heading-4 text-foreground mb-4">Equipment Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.panelBrand && (
                  <div>
                    <p className="text-body-small text-muted">Preferred Panel Brand</p>
                    <p className="text-body text-foreground">
                      {data.panelBrand}
                    </p>
                  </div>
                )}
                {data.systemSizeOverride && (
                  <div>
                    <p className="text-body-small text-muted">Specific System Size</p>
                    <p className="text-body text-foreground">
                      {data.systemSizeOverride}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {data.additionalNotes && (
            <div className="info-section rounded-lg p-4">
              <h3 className="text-heading-4 text-foreground mb-4">Additional Notes</h3>
              <p className="text-body text-foreground whitespace-pre-wrap">
                {data.additionalNotes}
              </p>
            </div>
          )}

          {/* Commercial Details */}
          {data.propertyType === 'commercial' && (
            <div className="info-section rounded-lg p-4">
              <h3 className="text-heading-4 text-foreground mb-4">Commercial Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.peakDemand && (
                  <div>
                    <p className="text-body-small text-muted">Peak Demand</p>
                    <p className="text-body text-foreground">
                      {data.peakDemand} kW
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-body-small text-muted">Three-Phase Connection</p>
                  <p className="text-body text-foreground">
                    {formatBoolean(data.isThreePhase || false)}
                  </p>
                </div>
                {data.projectPriority && (
                  <div>
                    <p className="text-body-small text-muted">Project Priority</p>
                    <p className="text-body text-foreground capitalize">
                      {data.projectPriority.replace('_', ' ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="info-section rounded-lg p-4">
            <h3 className="text-heading-4 text-foreground mb-4">Request Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-body-small text-muted">Quote Type</p>
                <p className="text-body text-foreground capitalize">
                  {lead.quoteType.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-body-small text-muted">Last Updated</p>
                <p className="text-body text-foreground">
                  {formatDate(lead.updatedAt)}
                </p>
              </div>
            </div>
          </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="neu-btn px-6 py-2.5 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadPreviewModal;