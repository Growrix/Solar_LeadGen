/**
 * LeadEditModal Component
 * 
 * Purpose: Modal for editing existing leads (before admin approval)
 * Used by: HomeownerDashboard lead cards
 * 
 * Features:
 * - Uses SimplifiedQuoteForm with pre-filled data
 * - Calls PATCH /api/leads/[id] endpoint
 * - Only available for PENDING_APPROVAL status leads
 * - Shows success/error feedback
 * - Refreshes dashboard on successful edit
 * 
 * Phase 4.11: Enhanced CRUD operations
 */

'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import SimplifiedQuoteForm from './SimplifiedQuoteForm';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';

interface LeadEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  initialData: Record<string, unknown> | null;
  onSaveSuccess: () => void;
}

/**
 * LeadEditModal
 * 
 * Allows homeowners to edit their PENDING_APPROVAL leads.
 * Uses SimplifiedQuoteForm (single-page) with pre-filled data.
 * On save, sends PATCH request to /api/leads/[id].
 */
export default function LeadEditModal({
  isOpen,
  onClose,
  leadId,
  initialData,
  onSaveSuccess,
}: LeadEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (quoteResult: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Extract form data from quoteResult (it contains all the form fields plus calculated results)
      const formData = quoteResult;
      
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Location fields
          propertyPostcode: formData.postcode,
          location: formData.location,
          state: formData.state,
          propertyType: formData.propertyType || formData.quoteType || 'residential',
          
          // Energy usage - CRITICAL: energyBill is required in database
          energyBill: (() => {
            const value = Number(formData.electricityValue) || Number(formData.energyBill);
            if (!value || isNaN(value)) {
              throw new Error('Energy bill value is required but missing from form data');
            }
            return value;
          })(),
          billType: formData.electricityUsageType || formData.billType || 'monthly',
          
          // Property details
          roofType: formData.roofType,
          budgetRange: formData.budgetRange,
          panelOrientation: formData.panelOrientation,
          roofTilt: formData.roofTilt,
          shadingLevel: formData.shadingLevel,
          usagePattern: formData.usagePattern,
          
          // System preferences
          desiredOffset: Number(formData.desiredOffset || 100),
          hasExistingSystem: Boolean(formData.hasExistingSystem),
          existingSystemSize: formData.existingSystemSize || null,
          timeframe: formData.timeframe,
          
          // Battery storage
          batteryRequired: Boolean(formData.batteryIncluded),
          batteryCapacity: formData.batteryCapacity || formData.customBatteryCapacity || null,
          batteryBrand: formData.batteryBrand || null,
          batteryUsage: formData.batteryUsage || null,
          backupCritical: formData.backupCritical || null,
          includeVPP: Boolean(formData.includeVPP),
          
          // Additional features
          includeEVCharging: Boolean(formData.includeEVCharging),
          includeSmartHome: Boolean(formData.includeSmartHome),
          includeGridServices: Boolean(formData.includeGridServices),
          
          // Equipment preferences
          panelBrand: formData.panelBrand || null,
          systemSizeOverride: formData.systemSizeOverride || null,
          includeOptimizers: Boolean(formData.includeOptimizers),
          includeMicroinverters: Boolean(formData.includeMicroinverters),
          
          // Tariff details
          retailer: formData.retailer || null,
          tariffPlan: formData.tariffPlan || null,
          customRetailRate: formData.customRetailRate ? Number(formData.customRetailRate) : null,
          customFeedInRate: formData.customFeedInRate ? Number(formData.customFeedInRate) : null,
          
          // Commercial fields (if applicable)
          peakDemand: formData.peakDemand ? Number(formData.peakDemand) : null,
          isThreePhase: Boolean(formData.isThreePhase),
          projectPriority: formData.projectPriority || null,
          
          // Store complete form data for future reference
          quoteData: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lead');
      }

      console.log('[LeadEditModal] Lead updated successfully:', data);

      // Show success message
      setSuccess(true);
      
      // Wait a moment then close and refresh
      setTimeout(() => {
        onSaveSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('[LeadEditModal] Error updating lead:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : handleCancel())}>
      <DialogContent className="theme-card relative w-full max-w-5xl p-4 sm:p-6 lg:p-8 animate-slide-in-up max-h-modal overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-4 flex items-center justify-between rounded-t-lg -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-6">
          <div>
            <h2 className="text-heading-2 text-foreground">
              Edit Quote Request
            </h2>
            <p className="text-body-small text-muted mt-1">
              Update your quote details before installer assignment
            </p>
          </div>
          <DialogClose asChild>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-muted hover:text-foreground transition-colors p-2 rounded-lg disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </DialogClose>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-success/10 border border-success rounded-lg flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <span className="">Lead updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-error/10 border border-error rounded-lg flex items-start gap-2 text-error">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="">Failed to update lead</p>
              <p className="text-body-small mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-lg">
          <div className="flex items-start gap-2 text-primary">
            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-body-small">
              <p className="">You can edit this quote because it hasn&apos;t been approved yet.</p>
              <p className="mt-1">Once an admin approves your request, you won&apos;t be able to make changes.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <SimplifiedQuoteForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText="Save Changes"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
