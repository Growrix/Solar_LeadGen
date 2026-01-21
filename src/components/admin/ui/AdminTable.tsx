'use client';

import React from 'react';

export interface AdminTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  selectable?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  selectedKeys = new Set(),
  onSelectionChange,
  selectable = false,
  emptyMessage = 'No data available',
  isLoading = false,
}: AdminTableProps<T>) {
  const allSelected = data.length > 0 && data.every(item => selectedKeys.has(keyExtractor(item)));
  const someSelected = data.some(item => selectedKeys.has(keyExtractor(item)));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map(keyExtractor)));
    }
  };

  const handleSelectRow = (item: T) => {
    if (!onSelectionChange) return;
    const key = keyExtractor(item);
    const newSelection = new Set(selectedKeys);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    onSelectionChange(newSelection);
  };

  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className="w-full overflow-hidden rounded-[var(--admin-radius-lg)] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-bg-base)]">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-[var(--admin-border)] bg-[var(--admin-bg-base)] text-[var(--admin-primary)] focus:ring-[var(--admin-ring)] focus:ring-2 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold text-[var(--admin-fg-muted)] uppercase tracking-wider ${alignStyles[col.align || 'left']}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-border-muted)]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-[var(--admin-fg-muted)]">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-[var(--admin-fg-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const key = keyExtractor(item);
                const isSelected = selectedKeys.has(key);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(item)}
                    className={`
                      transition-colors duration-150
                      ${onRowClick ? 'cursor-pointer hover:bg-[var(--admin-bg-hover)]' : ''}
                      ${isSelected ? 'bg-[var(--admin-primary-muted)]' : ''}
                    `}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(item)}
                          className="w-4 h-4 rounded border-[var(--admin-border)] bg-[var(--admin-bg-base)] text-[var(--admin-primary)] focus:ring-[var(--admin-ring)] focus:ring-2 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm text-[var(--admin-fg-primary)] ${alignStyles[col.align || 'left']}`}
                      >
                        {col.render ? col.render(item, index) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
