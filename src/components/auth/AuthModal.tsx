'use client';

import React, { useEffect, useRef } from 'react';
import { XIcon } from '@/components/icons/auth';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * AuthModal - Base modal wrapper for all authentication dialogs
 * Provides consistent layout, animations, and keyboard handling
 * Uses design system tokens and neumorphic styling
 * 
 * Accessibility features:
 * - Focus trap: Tab cycles within modal only
 * - ESC key: Closes modal
 * - aria-live: Screen reader announcements
 * - role="dialog" with aria-modal="true"
 */
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  maxWidth = 'md',
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key, body scroll, and focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap: Tab cycles within modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus first focusable element in modal
    setTimeout(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-20 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-description"
    >
      {/* Screen reader announcements (aria-live region) */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true" />

      <div
        ref={modalRef}
        className={`theme-card relative w-full ${maxWidthClasses[maxWidth]} p-8 max-h-[90vh] overflow-y-auto animate-slide-in-up ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-subtle hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <XIcon />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          {/* Icon container */}
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            {icon}
          </div>

          {/* Title */}
          <h2 id="auth-modal-title" className="text-heading-2 text-foreground mb-2">
            {title}
          </h2>

          {/* Description */}
          <p id="auth-modal-description" className="text-body-small text-subtle">
            {description}
          </p>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default AuthModal;
