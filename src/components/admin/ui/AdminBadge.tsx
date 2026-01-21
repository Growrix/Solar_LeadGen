'use client';

import React from 'react';

export interface AdminBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-[var(--admin-secondary)] text-[var(--admin-fg-primary)]',
  primary: 'bg-[var(--admin-primary-muted)] text-[var(--admin-primary)]',
  secondary: 'bg-[var(--admin-secondary)] text-[var(--admin-fg-secondary)]',
  success: 'bg-[var(--admin-success-muted)] text-[var(--admin-success)]',
  warning: 'bg-[var(--admin-warning-muted)] text-[var(--admin-warning)]',
  destructive: 'bg-[var(--admin-destructive-muted)] text-[var(--admin-destructive)]',
  info: 'bg-[var(--admin-info-muted)] text-[var(--admin-info)]',
  outline: 'bg-transparent border border-[var(--admin-border)] text-[var(--admin-fg-secondary)]',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export const AdminBadge: React.FC<AdminBadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-[var(--admin-radius-full)]';

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
