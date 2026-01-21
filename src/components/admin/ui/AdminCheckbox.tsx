'use client';

import React from 'react';

export interface AdminCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const AdminCheckbox = React.forwardRef<HTMLInputElement, AdminCheckboxProps>(
  ({ label, description, error, className = '', id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={`
            mt-0.5 w-4 h-4 rounded border-[var(--admin-border)] bg-[var(--admin-bg-base)]
            text-[var(--admin-primary)] focus:ring-[var(--admin-ring)] focus:ring-2 focus:ring-offset-0
            cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--admin-destructive)]' : ''}
            ${className}
          `}
          {...props}
        />
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-[var(--admin-fg-primary)] cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-[var(--admin-fg-muted)] mt-0.5">
                {description}
              </p>
            )}
            {error && (
              <p className="text-xs text-[var(--admin-destructive)] mt-1">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

AdminCheckbox.displayName = 'AdminCheckbox';
