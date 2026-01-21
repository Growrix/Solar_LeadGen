'use client';

import React from 'react';

export interface AdminTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  count?: number;
}

export interface AdminTabsProps {
  tabs: AdminTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md';
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
  };

  const variantStyles = {
    default: {
      container: 'bg-[var(--admin-bg-base)] p-1 rounded-[var(--admin-radius-md)] border border-[var(--admin-border)]',
      tab: 'rounded-[var(--admin-radius)]',
      active: 'bg-[var(--admin-bg-elevated)] text-[var(--admin-fg-primary)] shadow-[var(--admin-shadow-1)]',
      inactive: 'text-[var(--admin-fg-muted)] hover:text-[var(--admin-fg-primary)] hover:bg-[var(--admin-bg-hover)]',
    },
    pills: {
      container: 'gap-2',
      tab: 'rounded-[var(--admin-radius-full)]',
      active: 'bg-[var(--admin-primary)] text-[var(--admin-primary-fg)]',
      inactive: 'text-[var(--admin-fg-muted)] hover:text-[var(--admin-fg-primary)] hover:bg-[var(--admin-bg-hover)]',
    },
    underline: {
      container: 'border-b border-[var(--admin-border)] gap-4',
      tab: 'rounded-none border-b-2 -mb-px',
      active: 'border-[var(--admin-primary)] text-[var(--admin-fg-primary)]',
      inactive: 'border-transparent text-[var(--admin-fg-muted)] hover:text-[var(--admin-fg-primary)] hover:border-[var(--admin-border)]',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`flex items-center ${styles.container}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            className={`
              inline-flex items-center gap-2 font-medium transition-all duration-150
              ${sizeStyles[size]}
              ${styles.tab}
              ${isActive ? styles.active : styles.inactive}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`
                text-xs px-1.5 py-0.5 rounded-[var(--admin-radius-full)]
                ${isActive 
                  ? 'bg-[var(--admin-primary-fg)]/20' 
                  : 'bg-[var(--admin-secondary)]'
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
