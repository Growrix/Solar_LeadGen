'use client';

import React from 'react';

export interface AdminToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  centerContent?: React.ReactNode;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
  leftContent,
  rightContent,
  centerContent,
  className = '',
  children,
  ...props
}) => {
  const hasCustomLayout = leftContent || rightContent || centerContent;

  return (
    <div
      className={`flex flex-wrap items-center gap-3 p-4 bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] rounded-[var(--admin-radius-lg)] ${className}`}
      {...props}
    >
      {hasCustomLayout ? (
        <>
          {leftContent && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {leftContent}
            </div>
          )}
          {centerContent && (
            <div className="flex-1 flex items-center justify-center gap-3">
              {centerContent}
            </div>
          )}
          {rightContent && (
            <div className="flex items-center gap-3 ml-auto flex-shrink-0">
              {rightContent}
            </div>
          )}
        </>
      ) : (
        children
      )}
    </div>
  );
};

export const AdminToolbarDivider: React.FC = () => (
  <div className="w-px h-6 bg-[var(--admin-border)]" />
);

export const AdminToolbarGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex items-center gap-2 ${className}`} {...props}>
    {children}
  </div>
);
