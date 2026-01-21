'use client';

import React from 'react';

export interface AdminSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
}

const sizeStyles = {
  sm: 'h-8 text-xs px-3 pr-8',
  md: 'h-10 text-sm px-4 pr-10',
  lg: 'h-12 text-base px-4 pr-10',
};

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ 
    label, 
    error, 
    hint,
    options,
    size = 'md',
    placeholder,
    className = '', 
    id,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    
    const baseStyles = 'w-full rounded-[var(--admin-radius)] bg-[var(--admin-bg-base)] text-[var(--admin-fg-primary)] border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer';
    
    const borderStyles = hasError
      ? 'border-[var(--admin-destructive)] focus:ring-[var(--admin-ring-destructive)]'
      : 'border-[var(--admin-border)] focus:border-[var(--admin-primary)] focus:ring-[var(--admin-ring)]';

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--admin-fg-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`${baseStyles} ${borderStyles} ${sizeStyles[size]} ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--admin-fg-muted)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
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

AdminSelect.displayName = 'AdminSelect';
