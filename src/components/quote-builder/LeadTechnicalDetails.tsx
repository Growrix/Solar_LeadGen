'use client';

import React from 'react';
import { MapPin, DollarSign, Home, Lock, Clock, Battery } from 'lucide-react';

interface Lead {
  id: string | number;
  name: string;
  location: string;
  propertyType: string;
  systemSize: string;
  estimatedUsage: string;
  budget: string;
  quoteData?: any;
  batteryRequired?: boolean;
}

interface LeadData {
  id: string;
  projectType: string;
  propertyType: string;
  postcode: string;
  location: string;
  state: string;
  address?: string;
  energyBill: number;
  billType: string;
  roofType: string;
  budgetRange: string;
  desiredOffset: number;
  batteryRequired: boolean;
  batteryCapacity?: string;
  timeframe?: string;
  additionalNotes?: string;
  quoteData?: any;
  quoteType: string;
  expiresAt?: string;
  leadPrice?: number;
  phoneNumber?: string;
  homeowner?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

interface LeadTechnicalDetailsProps {
  lead: Lead | LeadData;
  isPurchased?: boolean; // T13I-4: Show real contacts if purchased
}

const LeadTechnicalDetails: React.FC<LeadTechnicalDetailsProps> = ({ lead, isPurchased = false }) => {
  // Type guard to check if it's full LeadData
  const isFullLeadData = (l: Lead | LeadData): l is LeadData => {
    return 'projectType' in l && 'postcode' in l;
  };

  // Extract data from either direct properties or quoteData
  const extractLeadData = (): LeadData | null => {
    if (isFullLeadData(lead)) {
      return lead;
    }
    
    // Try to extract from quoteData if available
    if (lead.quoteData) {
      const qd = lead.quoteData;
      return {
        id: String(lead.id),
        projectType: qd.projectType || 'Residential',
        propertyType: lead.propertyType || qd.propertyType || 'House',
        postcode: qd.postcode || '',
        location: lead.location || qd.location || '',
        state: qd.state || '',
        address: qd.address || '',
        energyBill: qd.energyBill || qd.electricityBill || 0,
        billType: qd.billType || 'monthly',
        roofType: qd.roofType || '',
        budgetRange: lead.budget || qd.budgetRange || '',
        desiredOffset: qd.desiredOffset || 100,
        batteryRequired: lead.batteryRequired || qd.batteryRequired || false,
        batteryCapacity: qd.batteryCapacity || '',
        timeframe: qd.timeframe || qd.installationUrgency || '',
        additionalNotes: qd.additionalNotes || '',
        quoteData: qd,
        quoteType: qd.quoteType || 'instant',
        expiresAt: qd.expiresAt || '',
        leadPrice: qd.leadPrice || 0,
        phoneNumber: qd.phoneNumber || ''
      };
    }
    
    return null;
  };

  const leadData = extractLeadData();

  if (!leadData) {
    return (
      <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
        <p className="text-body-small text-warning">
          Lead technical details not available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl shadow-neu-inset p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h3 className="text-heading-4 text-foreground flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          Lead Technical Details
        </h3>
        <span className="text-caption text-muted-foreground">
          Lead #{String(leadData.id).slice(-8)}
        </span>
      </div>

      {/* Location & Property + Energy & Budget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Location & Property */}
        <div className="space-y-3">
          <h4 className="text-label text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location & Property
          </h4>
          <div className="bg-background rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-body-small">
              <span className="text-muted-foreground">Location</span>
              <span className="text-foreground">{leadData.location}, {leadData.state}</span>
            </div>
            <div className="flex justify-between text-body-small">
              <span className="text-muted-foreground">Postcode</span>
              <span className="text-foreground">{leadData.postcode}</span>
            </div>
            <div className="flex justify-between text-body-small">
              <span className="text-muted-foreground">Property Type</span>
              <span className="text-foreground capitalize">{leadData.propertyType}</span>
            </div>
            <div className="flex justify-between text-body-small">
              <span className="text-muted-foreground">Project Type</span>
              <span className="text-foreground capitalize">{leadData.projectType}</span>
            </div>
          </div>
        </div>

        {/* Energy & Budget */}
        <div className="space-y-3">
          <h4 className="text-label text-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Energy & Budget
          </h4>
          <div className="bg-background rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-body-small">
              <span className="text-muted-foreground">Energy Bill</span>
              <span className="text-foreground">${leadData.energyBill} / {leadData.billType}</span>
            </div>
            <div className="flex justify-between text-body-small">
              <span className="text-muted-foreground">Budget Range</span>
              <span className="text-foreground">{leadData.budgetRange}</span>
            </div>
            <div className="flex justify-between text-body-small">
              <span className="text-muted-foreground">Desired Offset</span>
              <span className="text-foreground">{leadData.desiredOffset}%</span>
            </div>
            {leadData.leadPrice && (
              <div className="flex justify-between text-body-small pt-2 border-t border-border">
                <span className="text-muted-foreground">Lead Price</span>
                <span className="text-primary">${leadData.leadPrice}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Requirements + Contact Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* System Requirements */}
        <div className="space-y-3">
          <h4 className="text-label text-foreground flex items-center gap-2">
            <Home className="h-4 w-4" />
            System Requirements
          </h4>
          <div className="bg-background rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-body-small">
              <span className="text-muted-foreground">Roof Type</span>
              <span className="text-foreground capitalize">{leadData.roofType}</span>
            </div>
            <div className="flex justify-between text-body-small">
              <span className="text-muted-foreground">Battery Required</span>
              <span className="text-foreground">{leadData.batteryRequired ? 'Yes' : 'No'}</span>
            </div>
            {leadData.batteryRequired && leadData.batteryCapacity && (
              <div className="flex justify-between text-body-small">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Battery className="h-3 w-3" />
                  Battery Capacity
                </span>
                <span className="text-foreground">{leadData.batteryCapacity}</span>
              </div>
            )}
            {leadData.timeframe && (
              <div className="flex justify-between text-body-small">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Timeframe
                </span>
                <span className="text-foreground capitalize">{leadData.timeframe}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="text-label text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Contact Information
          </h4>
          {isPurchased && leadData.homeowner ? (
            <div className="bg-success/5 border border-success/20 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-body-small">
                <span className="text-muted-foreground">Name</span>
                <span className="text-foreground">{leadData.homeowner.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-body-small">
                <span className="text-muted-foreground">Phone</span>
                <span className="text-foreground">{leadData.homeowner.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-body-small">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground">{leadData.homeowner.email || 'N/A'}</span>
              </div>
              {leadData.address && (
                <div className="flex justify-between text-body-small">
                  <span className="text-muted-foreground">Full Address</span>
                  <span className="text-foreground">{leadData.address}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-body-small text-warning mb-1">
                    Available After Purchase
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Contact details (name, phone, full address) will be unlocked after you submit your bid and homeowner selects you as winner.
                  </p>
                </div>
              </div>
            </div>
          )}
          {leadData.expiresAt && (
            <div className="bg-info/5 border border-info/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-body-small text-info flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Countdown Expires
                </span>
                <span className="text-body-small text-foreground">
                  {new Date(leadData.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      {leadData.additionalNotes && (
        <div className="bg-info/10 border border-info/20 rounded-xl p-4">
          <h4 className="text-label text-foreground mb-2">Additional Notes</h4>
          <p className="text-body-small text-foreground whitespace-pre-wrap">{leadData.additionalNotes}</p>
        </div>
      )}
    </div>
  );
};

export default LeadTechnicalDetails;
