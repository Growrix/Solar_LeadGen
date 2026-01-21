'use client';

import React from 'react';

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-[var(--admin-primary)] text-[var(--admin-primary-fg)] hover:bg-[var(--admin-primary-hover)] active:bg-[var(--admin-primary-active)]',
  secondary: 'bg-[var(--admin-secondary)] text-[var(--admin-secondary-fg)] hover:bg-[var(--admin-secondary-hover)] border border-[var(--admin-border)]',
  ghost: 'bg-transparent text-[var(--admin-fg-primary)] hover:bg-[var(--admin-bg-hover)]',
  destructive: 'bg-[var(--admin-destructive)] text-[var(--admin-destructive-fg)] hover:bg-[var(--admin-destructive-hover)]',
  outline: 'bg-transparent text-[var(--admin-fg-primary)] border border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)] hover:border-[var(--admin-border-strong)]',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    className = '', 
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[var(--admin-radius)] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg-base)] disabled:opacity-50 disabled:pointer-events-none';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

AdminButton.displayName = 'AdminButton';
