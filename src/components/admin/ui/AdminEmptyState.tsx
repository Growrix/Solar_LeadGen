'use client';

import React from 'react';
import { AdminButton } from './AdminButton';

export interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon ? (
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--admin-secondary)] text-[var(--admin-fg-muted)] mb-4">
          {icon}
        </div>
      ) : (
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--admin-secondary)] text-[var(--admin-fg-muted)] mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
          </svg>
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-[var(--admin-fg-primary)] mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-[var(--admin-fg-muted)] max-w-sm mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <AdminButton variant="primary" onClick={action.onClick}>
          {action.label}
        </AdminButton>
      )}
    </div>
  );
};
