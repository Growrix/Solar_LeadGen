
'use client';
import Button from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { FileText, Phone, Trophy, X } from 'lucide-react';

import { useState, useEffect } from 'react';

export interface QuoteDistribution {
  type: 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING';
  count: number;
}

interface QuoteTypeDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (distributions: QuoteDistribution[]) => void;
  remainingQuota: number;
  quoteData?: any; // InstantQuote calculation results for context
  userAlreadyHasBiddingLead?: boolean; // Deprecated, kept for backward compatibility
  biddingLeadsSubmitted?: number; // Phase 13S.2: Current bidding count
  biddingLeadsLimit?: number; // Phase 13S.2: Max bidding allowed (admin-adjustable)
}

/**
 * QuoteTypeDistributionModal
 * 
 * Allows homeowners to select how many quotes of each type they want to request
 * within their remaining quota. Provides real-time validation and total count display.
 * 
 * Example:
 *   - Remaining quota: 4
 *   - User selects: 2 Call/Visit + 2 Written = 4 total ✓
 *   - On submit: [{ type: 'CALL_VISIT', count: 2 }, { type: 'WRITTEN_QUOTE', count: 2 }]
 */
export default function QuoteTypeDistributionModal({
  isOpen,
  onClose,
  onSubmit,
  remainingQuota,
  quoteData,
  userAlreadyHasBiddingLead = false, // Deprecated
  biddingLeadsSubmitted = 0, // Phase 13S.2
  biddingLeadsLimit = 1, // Phase 13S.2
}: QuoteTypeDistributionModalProps) {
  const [callVisitCount, setCallVisitCount] = useState(0);
  const [writtenQuoteCount, setWrittenQuoteCount] = useState(0);
  const [biddingCount, setBiddingCount] = useState(0); // Phase 4.9.7: Add bidding state

  // Reset counts when modal opens
  useEffect(() => {
    if (isOpen) {
      setCallVisitCount(0);
      setWrittenQuoteCount(0);
      setBiddingCount(0);
    }
  }, [isOpen]);

  // Calculate total selected (including bidding)
  const totalSelected = callVisitCount + writtenQuoteCount + biddingCount;
  const isValid = totalSelected > 0 && totalSelected <= remainingQuota;
  const exceedsQuota = totalSelected > remainingQuota;

  // Handle count changes
  const handleCallVisitChange = (count: number) => {
    setCallVisitCount(Math.max(0, Math.min(count, remainingQuota)));
  };

  const handleWrittenQuoteChange = (count: number) => {
    setWrittenQuoteCount(Math.max(0, Math.min(count, remainingQuota)));
  };

  // Phase 13S.2: Handle bidding count change (dynamic limit)
  const remainingBiddingQuota = Math.max(0, biddingLeadsLimit - biddingLeadsSubmitted);
  
  const handleBiddingChange = (count: number) => {
    if (count > 0 && remainingBiddingQuota === 0) {
      alert(`You have already used all ${biddingLeadsLimit} bidding request(s). Contact admin to increase your limit.`);
      return;
    }
    setBiddingCount(Math.max(0, Math.min(count, remainingBiddingQuota)));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isValid) return;

    const distributions: QuoteDistribution[] = [];
    
    if (callVisitCount > 0) {
      distributions.push({ type: 'CALL_VISIT', count: callVisitCount });
    }
    
    if (writtenQuoteCount > 0) {
      distributions.push({ type: 'WRITTEN_QUOTE', count: writtenQuoteCount });
    }

    if (biddingCount > 0) {
      distributions.push({ type: 'BIDDING', count: biddingCount });
    }

    onSubmit(distributions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface shadow-neu-outset rounded-2xl border border-border max-w-2xl w-full max-h-modal overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-heading-2 text-foreground">
              Select Quote Distribution
            </h2>
            <p className="text-body-small text-muted-foreground mt-1">
              Choose how many quotes of each type you want to request
            </p>
          </div>
          <DialogClose asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </DialogClose>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Remaining Quota Display */}
          <div className="bg-success/10 border border-success rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-body-small text-success">
                Remaining Quote Allowance
              </span>
              <span className="text-heading-2 text-success">
                {remainingQuota}
              </span>
            </div>
          </div>

          {/* Call or Site Visit Quotes Section */}
          <div className="theme-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-heading-4 text-foreground flex items-center gap-2">
                  <Phone className="h-5 w-5" /> Call or Site Visit Quotes
                </h3>
                <p className="text-body-small text-muted-foreground mt-1">
                  Installers will contact you to schedule a site visit and provide a personalized quote
                </p>
              </div>
            </div>

            {/* Count Selector */}
            <div className="flex items-center gap-3">
              <label className="text-body-small text-foreground">
                Count:
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleCallVisitChange(num)}
                    className={`w-12 h-12 rounded-lg font-semibold transition-colors ${
                      callVisitCount === num
                        ? 'bg-foreground text-background shadow-md scale-105'
                        : 'bg-surface shadow-neu-inset text-foreground hover:shadow-neu-outset'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Written Quotes Section */}
          <div className="theme-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-heading-4 text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Written Quotes
                </h3>
                <p className="text-body-small text-muted-foreground mt-1">
                  Receive detailed written proposals from installers with pricing and system specifications
                </p>
              </div>
            </div>

            {/* Count Selector */}
            <div className="flex items-center gap-3">
              <label className="text-body-small text-foreground">
                Count:
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleWrittenQuoteChange(num)}
                    className={`w-12 h-12 rounded-lg font-semibold transition-colors ${
                      writtenQuoteCount === num
                        ? 'bg-foreground text-background shadow-md scale-105'
                        : 'bg-surface shadow-neu-inset text-foreground hover:shadow-neu-outset'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Phase 13S.2: Competitive Bidding Section (Dynamic Limit) */}
          <div className="theme-card p-6 space-y-4 border-2 border-warning">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-heading-4 text-foreground flex items-center gap-2">
                  <Trophy className="h-5 w-5" /> Competitive Bidding
                </h3>
                <p className="text-body-small text-muted-foreground mt-1">
                  Open competitive bidding - multiple installers submit proposals to compete for your project
                </p>
                <p className="text-caption text-info mt-2">
                  📊 Bidding Usage: {biddingLeadsSubmitted}/{biddingLeadsLimit}
                </p>
                {remainingBiddingQuota > 0 ? (
                  <p className="text-caption text-success mt-1">
                    ✅ You have {remainingBiddingQuota} bidding request(s) remaining
                  </p>
                ) : (
                  <p className="text-caption text-warning mt-1">
                    ⚠️ All bidding requests used. Contact admin to increase limit.
                  </p>
                )}
              </div>
            </div>

            {/* Count Selector - Dynamic based on remaining quota */}
            <div className="flex items-center gap-3">
              <label className="text-body-small text-foreground">
                Count:
              </label>
              <div className="flex gap-2">
                {Array.from({ length: remainingBiddingQuota + 1 }, (_, i) => i).map((num) => (
                  <button
                    key={num}
                    onClick={() => handleBiddingChange(num)}
                    disabled={remainingBiddingQuota === 0 && num > 0}
                    className={`w-12 h-12 rounded-lg font-semibold transition-colors ${
                      biddingCount === num
                        ? 'bg-foreground text-background shadow-md scale-105'
                        : remainingBiddingQuota === 0 && num > 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                        : 'bg-surface shadow-neu-inset text-foreground hover:shadow-neu-outset'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Total Count Display */}
          <div className={`rounded-lg p-4 ${
            exceedsQuota
              ? 'bg-error/10 border border-error'
              : totalSelected === 0
              ? 'bg-muted/50 border border-border'
              : 'bg-info/10 border border-info'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-body-small ${
                exceedsQuota
                  ? 'text-error'
                  : totalSelected === 0
                  ? 'text-muted-foreground'
                  : 'text-info'
              }`}>
                Total Selected
              </span>
              <span className={`text-heading-2 ${
                exceedsQuota
                  ? 'text-error'
                  : totalSelected === 0
                  ? 'text-muted-foreground'
                  : 'text-info'
              }`}>
                {totalSelected} of {remainingQuota}
              </span>
            </div>

            {/* Validation Messages */}
            {exceedsQuota && (
              <p className="text-body-small text-error mt-2">
                ⚠️ Total count exceeds your remaining quota. Please reduce your selection.
              </p>
            )}
            {totalSelected === 0 && (
              <p className="text-body-small text-muted-foreground mt-2">
                Please select at least one quote to continue.
              </p>
            )}
            {isValid && (
              <p className="text-body-small text-info mt-2">
                ✓ Valid selection! Click confirm to proceed.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4 flex gap-3 justify-end">
          <DialogClose asChild>
            <Button variant="secondary" className="px-6 py-2.5 rounded-lg">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            variant="primary"
            className="px-6 py-2.5 rounded-lg"
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}