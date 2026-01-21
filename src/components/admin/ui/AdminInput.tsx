'use client';

import React from 'react';

export interface AdminInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-8 text-xs px-3',
  md: 'h-10 text-sm px-4',
  lg: 'h-12 text-base px-4',
};

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ 
    label, 
    error, 
    hint,
    leftIcon,
    rightIcon,
    size = 'md',
    className = '', 
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    
    const baseStyles = 'w-full rounded-[var(--admin-radius)] bg-[var(--admin-bg-base)] text-[var(--admin-fg-primary)] placeholder:text-[var(--admin-fg-muted)] border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const borderStyles = hasError
      ? 'border-[var(--admin-destructive)] focus:ring-[var(--admin-ring-destructive)]'
      : 'border-[var(--admin-border)] focus:border-[var(--admin-primary)] focus:ring-[var(--admin-ring)]';

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--admin-fg-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-fg-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${baseStyles} ${borderStyles} ${sizeStyles[size]} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-fg-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[var(--admin-destructive)]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[var(--admin-fg-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

AdminInput.displayName = 'AdminInput';
