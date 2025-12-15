'use client';

import React, { ButtonHTMLAttributes } from 'react';

export interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'social';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * AuthButton - Neumorphic button for authentication forms
 * Uses design system classes and neumorphic shadows
 * No hardcoded colors or typography
 */
export const AuthButton: React.FC<AuthButtonProps> = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  children,
  fullWidth = true,
  type = 'button',
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  // Variant-specific classes using design system
  const variantClasses = {
    primary: 'neu-btn-primary',
    secondary: 'neu-btn-secondary',
    social: 'neu-btn-secondary flex items-center justify-center space-x-3',
  };

  const baseClasses = [
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    'py-3 px-6',
    'rounded-xl',
    '',
    'transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={baseClasses}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        <div className={`flex items-center ${icon ? 'justify-center space-x-2' : 'justify-center'}`}>
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </div>
      )}
    </button>
  );
};

export default AuthButton;
