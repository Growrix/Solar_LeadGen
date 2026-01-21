'use client';

import React from 'react';

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const variantStyles = {
  default: 'bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] shadow-[var(--admin-shadow-1)]',
  elevated: 'bg-[var(--admin-bg-elevated)] border border-[var(--admin-border-muted)] shadow-[var(--admin-shadow-2)]',
  outlined: 'bg-transparent border border-[var(--admin-border)]',
  ghost: 'bg-transparent',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const AdminCard = React.forwardRef<HTMLDivElement, AdminCardProps>(
  ({ 
    children, 
    variant = 'default', 
    padding = 'md',
    hoverable = false,
    className = '', 
    ...props 
  }, ref) => {
    const baseStyles = 'rounded-[var(--admin-radius-lg)] transition-all duration-200';
    const hoverStyles = hoverable ? 'hover:shadow-[var(--admin-shadow-3)] hover:border-[var(--admin-border-strong)] cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AdminCard.displayName = 'AdminCard';

export const AdminCardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <div className={`flex items-center justify-between pb-4 border-b border-[var(--admin-border)] ${className}`} {...props}>
    {children}
  </div>
);

export const AdminCardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <h3 className={`text-lg font-semibold text-[var(--admin-fg-primary)] ${className}`} {...props}>
    {children}
  </h3>
);

export const AdminCardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <p className={`text-sm text-[var(--admin-fg-secondary)] ${className}`} {...props}>
    {children}
  </p>
);

export const AdminCardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <div className={`pt-4 ${className}`} {...props}>
    {children}
  </div>
);

export const AdminCardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <div className={`flex items-center justify-end gap-3 pt-4 border-t border-[var(--admin-border)] ${className}`} {...props}>
    {children}
  </div>
);
