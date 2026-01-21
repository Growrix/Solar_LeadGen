'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, X } from 'lucide-react';
import { ModalShell, formatDateTime } from '../shared';

export type AutomationRunModeV6 = 'dry' | 'live';

export type AutomationRunUiV6 = {
  status: 'idle' | 'running' | 'success' | 'failure';
  mode: AutomationRunModeV6;
  startedAt: string;
  finishedAt?: string;
  runId?: string;
  error?: string;
  summary?: {
    enabledSourceCount?: number | null;
    rssImportedCount?: number | null;
    selectedEntryCount?: number | null;
    draftCreatedCount?: number | null;
    ignoredByRulesCount?: number | null;
    forcedNeedsReviewCount?: number | null;
    priorityOverridesCount?: number | null;
    lastError?: string | null;
    skipped?: boolean | null;
    skippedReason?: string | null;
  };
  payload?: unknown;
};

type ParsedRunDetails = {
  runId: string | null;
  skippedReason: string | null;
  selectedEntryCount: number | null;
  rssImportedCount: number | null;
  draftCreatedCount: number | null;
  errors: string[];
};

function parseRunDetails(payload: unknown): ParsedRunDetails {
  const out: ParsedRunDetails = {
    runId: null,
    skippedReason: null,
    selectedEntryCount: null,
    rssImportedCount: null,
    draftCreatedCount: null,
    errors: [],
  };

  if (!payload || typeof payload !== 'object') return out;

  const runId = (payload as any).runId;
  if (typeof runId === 'string' && runId.trim()) out.runId = runId.trim();

  const results = (payload as any).results;
  if (!results || typeof results !== 'object') return out;

  if ((results as any).skipped === true) {
    const reason = (results as any).reason;
    if (typeof reason === 'string' && reason.trim()) out.skippedReason = reason.trim();
  }

  const selectedEntryCount = (results as any).selectedEntryCount;
  if (typeof selectedEntryCount === 'number' && Number.isFinite(selectedEntryCount)) {
    out.selectedEntryCount = selectedEntryCount;
  }

  const rssResults = (results as any).rssResults;
  if (Array.isArray(rssResults)) {
    let imported = 0;
    for (const r of rssResults) {
      const n = (r as any)?.imported;
      if (typeof n === 'number' && Number.isFinite(n)) imported += n;
      const err = (r as any)?.error;
      if (typeof err === 'string' && err.trim()) out.errors.push(err.trim());
      const status = (r as any)?.status;
      if (typeof status === 'string' && status.trim() && status !== 'ok' && status !== 'not_modified') {
        out.errors.push(`RSS: ${status}`);
      }
    }
    out.rssImportedCount = imported;
  }

  const draftResults = (results as any).draftResults;
  if (Array.isArray(draftResults)) {
    let created = 0;
    for (const r of draftResults) {
      if ((r as any)?.ok === true) created += 1;
      const err = (r as any)?.error;
      if (typeof err === 'string' && err.trim()) out.errors.push(err.trim());
    }
    out.draftCreatedCount = created;
  }

  return out;
}

export function RunDetailsModal({
  run,
  onClose,
}: {
  run: AutomationRunUiV6;
  onClose: () => void;
}) {
  const parsed = React.useMemo(() => parseRunDetails(run.payload), [run.payload]);

  const headerIcon =
    run.status === 'success' ? (
      <CheckCircle2 size={18} className="text-success" />
    ) : run.status === 'failure' ? (
      <AlertTriangle size={18} className="text-destructive" />
    ) : (
      <ClipboardList size={18} className="text-brand-accent" />
    );

  const headerLabel = run.status === 'success' ? 'SUCCESS' : run.status === 'failure' ? 'FAILURE' : 'RUN';

  return (
    <ModalShell
      title={`Run Details${parsed.runId ? ` — ${parsed.runId}` : ''}`}
      description={`Status: ${headerLabel} • Mode: ${run.mode === 'dry' ? 'Dry Run' : 'Live Run'}`}
      onClose={onClose}
    >
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-foreground">
            {headerIcon}
            <span className="text-body">{headerLabel}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-full transition-colors"
            aria-label="Close run details"
          >
            <X size={18} />
          </button>
        </div>

        <section className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
          <div className="p-5 border-b border-border bg-surface">
            <h3 className="text-heading-3 text-foreground">Run Summary</h3>
            <p className="text-body-small text-muted-foreground">A snapshot of the most recent run payload captured by the UI.</p>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Started</p>
              <p className="text-body text-foreground">{formatDateTime(run.startedAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Finished</p>
              <p className="text-body text-foreground">{run.finishedAt ? formatDateTime(run.finishedAt) : '—'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Run ID</p>
              <p className="text-body text-foreground">{parsed.runId ?? '—'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Skipped Reason</p>
              <p className="text-body text-foreground">{parsed.skippedReason ?? '—'}</p>
            </div>
          </div>
        </section>

        <section className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
          <div className="p-5 border-b border-border bg-surface">
            <h3 className="text-heading-3 text-foreground">Stage Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface text-muted-foreground text-body-small uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-3">Stage</th>
                  <th className="px-6 py-3">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 text-body text-foreground">Ingest</td>
                  <td className="px-6 py-4 text-body text-muted-foreground">{parsed.rssImportedCount ?? '—'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-body text-foreground">Select</td>
                  <td className="px-6 py-4 text-body text-muted-foreground">{parsed.selectedEntryCount ?? '—'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-body text-foreground">Research</td>
                  <td className="px-6 py-4 text-body text-muted-foreground">—</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-body text-foreground">Draft</td>
                  <td className="px-6 py-4 text-body text-muted-foreground">{parsed.draftCreatedCount ?? '—'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-body text-foreground">Gate</td>
                  <td className="px-6 py-4 text-body text-muted-foreground">—</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-body text-foreground">Schedule</td>
                  <td className="px-6 py-4 text-body text-muted-foreground">—</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-body text-foreground">Publish</td>
                  <td className="px-6 py-4 text-body text-muted-foreground">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
          <div className="p-5 border-b border-border bg-surface">
            <h3 className="text-heading-3 text-foreground">Errors</h3>
          </div>
          <div className="p-5">
            {run.error ? (
              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-body">
                {run.error}
              </div>
            ) : null}

            {parsed.errors.length ? (
              <ul className="mt-4 space-y-2">
                {parsed.errors.slice(0, 12).map((e, idx) => (
                  <li key={idx} className="text-body text-muted-foreground">
                    {e}
                  </li>
                ))}
              </ul>
            ) : !run.error ? (
              <p className="text-body text-muted-foreground">No errors reported in the captured payload.</p>
            ) : null}
          </div>
        </section>
      </div>
    </ModalShell>
  );
}
