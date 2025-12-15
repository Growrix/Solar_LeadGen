'use client';

import React from 'react';
import { CheckCircleIcon, AlertCircleIcon, AlertTriangleIcon, ShieldIcon, XIcon } from '@/components/icons/auth';

export interface AuthAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string | React.ReactNode;
  onClose?: () => void;
  className?: string;
}

/**
 * AuthAlert - Neumorphic alert component for auth feedback
 * Uses design system tokens and neumorphic inset shadow
 * No hardcoded colors or typography
 */
export const AuthAlert: React.FC<AuthAlertProps> = ({
  type,
  message,
  onClose,
  className = '',
}) => {
  // Icon mapping
  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-success flex-shrink-0" />,
    error: <AlertCircleIcon className="h-5 w-5 text-destructive flex-shrink-0" />,
    warning: <AlertTriangleIcon className="h-5 w-5 text-warning flex-shrink-0" />,
    info: <ShieldIcon className="h-5 w-5 text-info flex-shrink-0" />,
  };

  // CSS classes using design system
  const typeClasses = {
    success: 'neu-alert-success',
    error: 'neu-alert-error',
    warning: 'neu-alert-warning',
    info: 'neu-alert-info',
  };

  const baseClasses = [
    typeClasses[type],
    'flex items-start space-x-3',
    'animate-fade-in',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses} role="alert">
      {/* Icon */}
      <div className="mt-0.5">{icons[type]}</div>

      {/* Message */}
      <div className="flex-1 text-body-small">
        {message}
      </div>

      {/* Close button (optional) */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default AuthAlert;
