'use client';

import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-overlay/60 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative bg-surface rounded-modal shadow-modal w-full max-w-md overflow-hidden transform transition-colors transition-shadow transition-transform scale-100 opacity-100">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isDestructive ? 'bg-error/15 text-error' : 'bg-warning/15 text-warning'
              }`}
            >
              <AlertTriangle className="icon-sm" />
            </div>

            <div className="flex-1 pt-0.5">
              <h3 className="text-heading-4 text-foreground mb-2">
                {title}
              </h3>
              <p className="text-body-small text-foreground-muted">
                {message}
              </p>
            </div>

            {!isLoading && (
              <button 
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors -mt-1 -mr-2 p-2 rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <X className="icon-sm" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-background-alt px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-border">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-surface border border-border rounded-button text-button text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`w-full sm:w-auto px-4 py-2 rounded-button text-button flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors transition-shadow transition-transform disabled:opacity-70 disabled:cursor-not-allowed ${
              isDestructive
                ? 'bg-error hover:bg-error/90 text-error-foreground'
                : 'bg-primary hover:bg-primary-hover text-background'
            }`}
          >
            {isLoading && <Loader2 className="icon-sm animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
