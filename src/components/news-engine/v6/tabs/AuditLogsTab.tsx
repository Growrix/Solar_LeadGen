'use client';

import React from 'react';
import { Calendar, ChevronDown, Cpu, Database, FileText, Filter, History, MousePointer2, Search, Terminal, User } from 'lucide-react';
import { exportAuditLogsToCsv, type AuditLogEntry } from '@/lib/ui-stubs/news-engine';
import type { AuditDateRange } from '../modals/AuditDateRangeModal';
import { formatDateTime } from '../shared';

type Props = {
  auditLogs: AuditLogEntry[];
  openPromptDetails: (log: AuditLogEntry) => void;
  openLogDetails: (log: AuditLogEntry) => void;
  dateRange: AuditDateRange;
  onOpenDateRange: () => void;
};

export function AuditLogsTabV6({ auditLogs, openPromptDetails, openLogDetails, dateRange, onOpenDateRange }: Props) {
  const [query, setQuery] = React.useState('');
  const [originFilter, setOriginFilter] = React.useState<'All' | 'AI' | 'Manual' | 'System'>('All');
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'INFO' | 'WARN' | 'ERROR'>('All');

  const normalized = (s: string) => s.trim().toLowerCase();

  const filtered = auditLogs.filter((log) => {
    const q = normalized(query);
    const matchesQuery = !q || normalized(log.action).includes(q) || normalized(log.origin).includes(q);

    const originLabel = normalized(log.origin) === 'ai' ? 'AI' : normalized(log.origin) === 'manual' ? 'Manual' : 'System';
    const matchesOrigin = originFilter === 'All' || originLabel === originFilter;

    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;

    let matchesDate = true;
    if (dateRange) {
      const logDate = new Date(log.timestamp);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      matchesDate = logDate >= fromDate && logDate <= toDate;
    }

    return matchesQuery && matchesOrigin && matchesStatus && matchesDate;
  });

  const originBadge = (origin: string) => {
    const label = normalized(origin) === 'ai' ? 'AI' : normalized(origin) === 'manual' ? 'Manual' : 'System';
    const Icon = label === 'AI' ? Cpu : label === 'Manual' ? MousePointer2 : Terminal;
    const cls = label === 'AI' ? 'bg-accent/10 text-brand-accent border-accent/20' : 'bg-surface text-muted-foreground border-border';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-body-small uppercase tracking-widest border ${cls}`}>
        <Icon size={10} />
        {label}
      </span>
    );
  };

  const statusBadge = (status: AuditLogEntry['status']) => {
    const cls =
      status === 'INFO'
        ? 'bg-info/10 text-info border-info/30'
        : status === 'WARN'
          ? 'bg-warning/10 text-warning border-warning/30'
          : 'bg-destructive/10 text-destructive border-destructive/30';
    return <span className={`px-2 py-0.5 rounded-full text-body-small border uppercase tracking-widest ${cls}`}>{status}</span>;
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 p-6 bg-background rounded-2xl border border-border shadow-neu-outset">
        <div className="p-3 bg-surface rounded-xl text-brand-accent shadow-neu-inset">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-heading-2 text-foreground">System Audit Trail</h2>
          <p className="text-body text-muted-foreground">
            A comprehensive record of AI generations, manual edits, and system actions.
          </p>
        </div>
      </div>

      <section className="bg-background p-4 rounded-xl border border-border shadow-neu-outset grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search logs (action, origin)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <button
          type="button"
          onClick={onOpenDateRange}
          className="flex items-center justify-between px-3 py-2 bg-background border border-border rounded-lg text-body text-muted-foreground hover:bg-surface transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground" />
            <span>{dateRange ? `${dateRange.from} — ${dateRange.to}` : 'Date Range'}</span>
          </div>
          <ChevronDown size={14} />
        </button>

        <div className="relative">
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value as typeof originFilter)}
            className="w-full appearance-none px-3 py-2 bg-background border border-border rounded-lg text-body text-muted-foreground hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20"
            aria-label="Origin filter"
          >
            <option value="All">Origin: All</option>
            <option value="System">Origin: System</option>
            <option value="AI">Origin: AI</option>
            <option value="Manual">Origin: Manual</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full appearance-none px-3 py-2 bg-background border border-border rounded-lg text-body text-muted-foreground hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20"
            aria-label="Status filter"
          >
            <option value="All">Status: All</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </section>

      <section className="bg-background rounded-xl border border-border shadow-neu-outset overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface text-muted-foreground uppercase text-body-small tracking-widest">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Origin</th>
                <th className="px-6 py-4">Performed By</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-hover transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-body-small">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-body text-foreground">{log.action}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Database size={12} className="text-muted-foreground" />
                        System
                      </div>
                    </td>
                    <td className="px-6 py-4">{originBadge(log.origin)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User size={12} className="text-muted-foreground" />
                        System
                      </div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(log.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {log.promptUsed ? (
                        <button
                          type="button"
                          onClick={() => openPromptDetails(log)}
                          className="p-2 text-muted-foreground hover:text-brand-accent bg-surface hover:bg-background rounded-lg transition-colors"
                          title="View Prompt Details"
                          aria-label="View Prompt Details"
                        >
                          <Terminal size={14} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openLogDetails(log)}
                          className="p-2 text-muted-foreground hover:text-foreground bg-surface hover:bg-background rounded-lg transition-colors"
                          title="View Log Details"
                          aria-label="View Log Details"
                        >
                          <FileText size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Database size={32} />
                      <p className="text-body">No audit logs found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-between items-center text-body-small text-muted-foreground px-2">
        <p>Retaining last 90 days of system activity.</p>
        <button
          type="button"
          onClick={() => exportAuditLogsToCsv(filtered)}
          className="flex items-center gap-1 hover:text-brand-accent transition-colors"
        >
          <Filter size={12} />
          Export CSV Log
        </button>
      </div>
    </div>
  );
}
