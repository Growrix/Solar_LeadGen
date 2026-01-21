'use client';

import React, { useEffect } from 'react';
import Button from '@/components/Button';

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export type ConfirmDialogVariant = 'default' | 'danger';

export default function ConfirmDialog(props: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const {
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel = 'Cancel',
    variant = 'default',
    loading = false,
    onConfirm,
    onCancel,
  } = props;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8 animate-fade-in"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="theme-card relative w-full max-w-lg p-6 sm:p-8 animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onCancel}
          variant="secondary"
          className="absolute top-4 right-4 p-2"
          aria-label="Close"
        >
          <XIcon />
        </Button>

        <div className="mb-6">
          <h2 className="text-heading-3 text-foreground mb-2">{title}</h2>
          <p className="text-body text-muted-foreground">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant === 'danger' ? 'primary' : 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
