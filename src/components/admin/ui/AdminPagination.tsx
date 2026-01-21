'use client';

import React from 'react';
import { AdminButton } from './AdminButton';

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showItemCount?: boolean;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showItemCount = true,
}) => {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const startItem = totalItems && itemsPerPage 
    ? (currentPage - 1) * itemsPerPage + 1 
    : undefined;
  const endItem = totalItems && itemsPerPage 
    ? Math.min(currentPage * itemsPerPage, totalItems) 
    : undefined;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {showItemCount && totalItems !== undefined && (
        <p className="text-sm text-[var(--admin-fg-muted)]">
          {startItem && endItem ? (
            <>
              Showing <span className="font-medium text-[var(--admin-fg-primary)]">{startItem}</span> to{' '}
              <span className="font-medium text-[var(--admin-fg-primary)]">{endItem}</span> of{' '}
              <span className="font-medium text-[var(--admin-fg-primary)]">{totalItems}</span> results
            </>
          ) : (
            <>
              <span className="font-medium text-[var(--admin-fg-primary)]">{totalItems}</span> total results
            </>
          )}
        </p>
      )}
      
      {!showItemCount && (
        <p className="text-sm text-[var(--admin-fg-muted)]">
          Page <span className="font-medium text-[var(--admin-fg-primary)]">{currentPage}</span> of{' '}
          <span className="font-medium text-[var(--admin-fg-primary)]">{totalPages}</span>
        </p>
      )}

      <div className="flex items-center gap-2">
        <AdminButton
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Previous
        </AdminButton>
        
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`
                  w-8 h-8 rounded-[var(--admin-radius)] text-sm font-medium transition-colors
                  ${pageNum === currentPage 
                    ? 'bg-[var(--admin-primary)] text-[var(--admin-primary-fg)]' 
                    : 'text-[var(--admin-fg-secondary)] hover:bg-[var(--admin-bg-hover)]'
                  }
                `}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <AdminButton
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          Next
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </AdminButton>
      </div>
    </div>
  );
};
