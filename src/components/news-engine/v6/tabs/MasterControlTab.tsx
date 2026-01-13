'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Lock,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import type { NewsEngineTab, NewsItem, PipelineStatus } from '@/lib/ui-stubs/news-engine';
import { formatDateTime } from '../shared';
import type { AutomationRunModeV6, AutomationRunUiV6 } from '../modals/RunDetailsModal';

type FeatureStatus = 'enabled' | 'disabled' | 'unknown';

type PipelineFeature = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  status: FeatureStatus;
  lastActivity: string;
};

const statusPillClasses: Record<FeatureStatus, string> = {
  enabled: 'bg-success/10 text-success border-success/30',
  disabled: 'bg-muted/10 text-muted-foreground border-border',
  unknown: 'bg-accent/10 text-brand-accent border-accent/20',
};

const statusIcon: Record<FeatureStatus, React.ReactNode> = {
  enabled: <CheckCircle2 size={14} className="text-success" />,
  disabled: <PauseCircle size={14} className="text-muted-foreground" />,
  unknown: <AlertTriangle size={14} className="text-brand-accent" />,
};

function getSystemLabel(pipelineStatus: PipelineStatus) {
  if (pipelineStatus === 'NOMINAL') return { state: 'Live', chip: 'System Live', accent: 'success' as const };
  if (pipelineStatus === 'PAUSED') return { state: 'Paused', chip: 'System Paused', accent: 'warning' as const };
  return { state: 'LOCKED', chip: 'System LOCKED', accent: 'destructive' as const };
}

type Props = {
  pipelineStatus: PipelineStatus;
  items: NewsItem[];
  automation: { autoDraft: boolean; autoSchedule: boolean; autoPublish: boolean };

  automationRun: AutomationRunUiV6 | null;
  queueSnapshot: {
    rssNewEntries: number;
    researchNewEntries: Record<'WEB' | 'SOCIAL' | 'JOURNAL' | 'TREND', number>;
    draftsNeedingReview: number;
    scheduledDueSoon: number;
    errors: number;
    computedAt?: string;
    dueSoonWindowHours?: number;
  } | null;

  queueSnapshotError?: string | null;

  opsHealth?: {
    computedAt: string;
    jobs: Record<
      string,
      {
        type: string;
        lastSuccessAt: string | null;
        lastFailureAt: string | null;
        lastFailureError: string | null;
      }
    >;
  } | null;
  opsHealthError?: string | null;

  onOpenRunDetails: () => void;
  onNavigateToTab?: (tab: NewsEngineTab) => void;

  openPauseConfirmation: () => void;
  openResumeConfirmation: () => void;
  openEmergencyStopConfirmation: () => void;
  openRunAutomationNowConfirmation: (mode: AutomationRunModeV6) => void;
  refreshNonce: number;
  onRefreshHealth: () => void;
};

export function MasterControlTabV6({
  pipelineStatus,
  items,
  automation,
  automationRun,
  queueSnapshot,
  queueSnapshotError,
  opsHealth,
  opsHealthError,
  onOpenRunDetails,
  onNavigateToTab,
  openPauseConfirmation,
  openResumeConfirmation,
  openEmergencyStopConfirmation,
  openRunAutomationNowConfirmation,
  refreshNonce,
  onRefreshHealth,
}: Props) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [features, setFeatures] = React.useState<PipelineFeature[]>([]);
  const [runMode, setRunMode] = React.useState<AutomationRunModeV6>('dry');
  const [healthUpdatedAt, setHealthUpdatedAt] = React.useState<string>(() => new Date().toISOString());
  const [queueUpdatedAt, setQueueUpdatedAt] = React.useState<string>(() => new Date().toISOString());

  React.useEffect(() => {
    setIsLoading(true);
    const now = new Date();
    const nominal = pipelineStatus === 'NOMINAL';
    const emergency = pipelineStatus === 'EMERGENCY_STOP';

    const jobLabel = (type: string, label: string): string => {
      if (opsHealthError) return `${label}: error`;
      const job = opsHealth?.jobs?.[type];
      if (!job) return 'Not available';
      const ts = job.lastSuccessAt ?? job.lastFailureAt;
      if (!ts) return 'No runs yet';
      const prefix = job.lastSuccessAt ? 'Last OK' : 'Last failure';
      return `${prefix}: ${formatDateTime(ts)}`;
    };

    setHealthUpdatedAt(now.toISOString());
    setFeatures([
      {
        id: 'rss',
        name: 'RSS Ingestion',
        description: 'Fetches new items from configured RSS/Atom sources (configuration only).',
        isActive: nominal,
        status: nominal ? 'enabled' : 'disabled',
        lastActivity: jobLabel('RSS_SYNC', 'RSS'),
      },
      {
        id: 'research',
        name: 'Research Engine',
        description: 'Research sync orchestration (configuration only).',
        isActive: nominal,
        status: nominal ? 'enabled' : 'disabled',
        lastActivity: jobLabel('RESEARCH_SYNC', 'Research'),
      },
      {
        id: 'draft',
        name: 'Drafting Engine',
        description: 'AI drafting enabled state (based on Automation settings).',
        isActive: nominal && automation.autoDraft,
        status: nominal && automation.autoDraft ? 'enabled' : 'disabled',
        lastActivity: jobLabel('AI_DRAFT', 'Drafting'),
      },
      {
        id: 'scheduler',
        name: 'Auto-Scheduler',
        description: 'Scheduling enabled state (based on Automation settings).',
        isActive: nominal && automation.autoSchedule,
        status: nominal && automation.autoSchedule ? 'enabled' : 'disabled',
        lastActivity: jobLabel('AUTO_SCHEDULE', 'Scheduling'),
      },
      {
        id: 'publish',
        name: 'Auto-Publish',
        description: 'Publishing enabled state (based on Automation settings).',
        isActive: nominal && !emergency && automation.autoPublish,
        status: nominal && !emergency && automation.autoPublish ? 'enabled' : 'disabled',
        lastActivity: jobLabel('AUTO_PUBLISH', 'Publish'),
      },
      {
        id: 'dedupe',
        name: 'Deduplication',
        description: 'Latency/health telemetry not connected (placeholder).',
        isActive: !emergency,
        status: 'unknown',
        lastActivity: jobLabel('DEDUP_CLEANUP', 'Dedup'),
      },
    ]);

    setIsLoading(false);
  }, [automation.autoDraft, automation.autoPublish, automation.autoSchedule, opsHealth, opsHealthError, pipelineStatus, refreshNonce]);

  React.useEffect(() => {
    setQueueUpdatedAt(new Date().toISOString());
  }, [queueSnapshot, refreshNonce]);

  const system = getSystemLabel(pipelineStatus);

  const isRunBlocked = pipelineStatus === 'PAUSED' || pipelineStatus === 'EMERGENCY_STOP';
  const blockedReason = pipelineStatus === 'PAUSED' ? 'Pipeline is paused.' : pipelineStatus === 'EMERGENCY_STOP' ? 'Emergency stop is active.' : '';
  const isRunBusy = automationRun?.status === 'running';

  const runDuration = React.useMemo(() => {
    if (!automationRun?.startedAt) return null;
    if (!automationRun.finishedAt) return null;
    const startMs = Date.parse(automationRun.startedAt);
    const endMs = Date.parse(automationRun.finishedAt);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) return null;
    const seconds = Math.round((endMs - startMs) / 1000);
    return `${seconds}s`;
  }, [automationRun?.finishedAt, automationRun?.startedAt]);

  const runCounts = React.useMemo(() => {
    const summary: any = automationRun?.summary ?? null;
    const payloadSummary: any = (automationRun as any)?.payload?.summary ?? null;

    const pickNum = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null);

    return {
      rssSynced: pickNum(summary?.rssImportedCount) ?? pickNum(payloadSummary?.rssImportedCount),
      researchSynced: pickNum(summary?.researchSyncedCount) ?? pickNum(payloadSummary?.researchSyncedCount),
      draftsCreated: pickNum(summary?.draftCreatedCount) ?? pickNum(payloadSummary?.draftCreatedCount),
      published: pickNum(summary?.publishedCount) ?? pickNum(payloadSummary?.publishedCount),
      errors: pickNum(summary?.errorsCount) ?? pickNum(payloadSummary?.errorsCount),
    };
  }, [automationRun]);

  const queueState = React.useMemo(() => {
    if (queueSnapshotError) return 'error' as const;
    if (!queueSnapshot) return 'loading' as const;

    const researchValues = Object.values(queueSnapshot.researchNewEntries);
    const hasAnyResearch = researchValues.some((value) => value > 0);
    const hasAnyRss = queueSnapshot.rssNewEntries > 0;
    const hasAnyDrafts = queueSnapshot.draftsNeedingReview > 0;
    const hasAnyScheduled = queueSnapshot.scheduledDueSoon > 0;
    const hasAnyErrors = queueSnapshot.errors > 0;

    if (!hasAnyRss && !hasAnyResearch && !hasAnyDrafts && !hasAnyScheduled && !hasAnyErrors) return 'empty' as const;
    return 'success' as const;
  }, [queueSnapshot, queueSnapshotError]);

  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-32 bg-surface rounded-2xl shadow-neu-inset" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-surface rounded-xl shadow-neu-inset" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <section className="rounded-2xl p-8 text-background shadow-neu-outset relative overflow-hidden bg-foreground">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Activity size={120} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-body-small uppercase tracking-widest border mb-2 shadow-neu-inset ${
                system.accent === 'success'
                  ? 'bg-success/20 text-success border-success/30'
                  : system.accent === 'warning'
                    ? 'bg-warning/20 text-warning border-warning/30'
                    : 'bg-destructive/20 text-destructive border-destructive/30'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {pipelineStatus === 'NOMINAL' ? (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                ) : null}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    pipelineStatus === 'NOMINAL'
                      ? 'bg-success'
                      : pipelineStatus === 'PAUSED'
                        ? 'bg-warning'
                        : 'bg-destructive'
                  }`}
                />
              </span>
              {system.chip}
            </div>
            <h2 className="text-heading-2 tracking-tight">Master Automation Control</h2>
            <p className="text-body text-background/70 max-w-md">
              Global overrides for the entire AI pipeline. Use with caution during breaking events or maintenance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-background/10 border border-background/20 rounded-xl p-1 shadow-neu-inset">
              <button
                type="button"
                onClick={() => setRunMode('dry')}
                className={`px-3 py-2 rounded-lg text-body-small uppercase tracking-widest transition-colors ${
                  runMode === 'dry' ? 'bg-background text-foreground shadow-neu-outset' : 'text-background/80 hover:text-background'
                }`}
                aria-pressed={runMode === 'dry'}
              >
                Dry Run
              </button>
              <button
                type="button"
                onClick={() => setRunMode('live')}
                className={`px-3 py-2 rounded-lg text-body-small uppercase tracking-widest transition-colors ${
                  runMode === 'live' ? 'bg-background text-foreground shadow-neu-outset' : 'text-background/80 hover:text-background'
                }`}
                aria-pressed={runMode === 'live'}
              >
                Live Run
              </button>
            </div>

            <button
              type="button"
              onClick={() => openRunAutomationNowConfirmation(runMode)}
              disabled={pipelineStatus !== 'NOMINAL' || isRunBusy}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-xl text-body hover:opacity-95 transition-colors active:scale-[0.98] shadow-neu-outset disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={20} className={`text-accent-foreground ${isRunBusy ? 'animate-spin' : ''}`} />
              {isRunBusy ? 'Running…' : 'Run Automation Now'}
            </button>

            <button
              type="button"
              onClick={openResumeConfirmation}
              disabled={pipelineStatus === 'NOMINAL'}
              className="flex items-center gap-2 px-6 py-3 bg-background text-foreground rounded-xl text-body hover:bg-surface-hover transition-colors active:scale-[0.98] shadow-neu-outset disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayCircle size={20} className="text-foreground" />
              Resume All
            </button>

            <button
              type="button"
              onClick={openPauseConfirmation}
              disabled={pipelineStatus !== 'NOMINAL'}
              className="flex items-center gap-2 px-6 py-3 bg-surface text-foreground rounded-xl text-body hover:bg-surface-hover transition-colors active:scale-[0.98] shadow-neu-outset disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PauseCircle size={20} className="text-foreground" />
              Pause Pipeline
            </button>

            <button
              type="button"
              onClick={openEmergencyStopConfirmation}
              disabled={pipelineStatus === 'EMERGENCY_STOP'}
              className="flex items-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground rounded-xl text-body hover:bg-destructive/90 transition-colors active:scale-[0.98] shadow-neu-outset disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldAlert size={20} className="text-destructive-foreground" />
              Emergency Stop
            </button>
          </div>

          {isRunBlocked ? (
            <div className="mt-4 text-center lg:text-left">
              <p className={`text-body-small uppercase tracking-widest ${pipelineStatus === 'PAUSED' ? 'text-warning' : 'text-destructive'}`}>
                Blocked: {blockedReason}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-heading-3 text-foreground flex items-center gap-2">
              <Terminal size={18} className="text-brand-accent" />
              Queue Snapshot
            </h3>
            <span
              className={`text-body-small uppercase tracking-widest px-2 py-0.5 rounded border ${
                queueState === 'loading'
                  ? 'bg-accent/10 text-brand-accent border-accent/20'
                  : queueState === 'error'
                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                  : queueState === 'empty'
                    ? 'bg-muted/10 text-muted-foreground border-border'
                    : 'bg-success/10 text-success border-success/20'
              }`}
            >
              {queueState === 'loading' ? 'Loading' : queueState === 'error' ? 'Error' : queueState === 'empty' ? 'Empty' : 'Ready'}
            </span>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            <p className="text-body-small text-muted-foreground">Operational backlog overview.</p>
            <p className="text-body-small text-muted-foreground">Last updated: {formatDateTime(queueUpdatedAt)}</p>
          </div>
        </div>

        {queueState === 'loading' ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-surface rounded-xl shadow-neu-inset" />
            ))}
          </div>
        ) : queueState === 'error' ? (
          <div className="p-6 space-y-3">
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-body text-destructive">Failed to load queue snapshot.</p>
              <p className="text-body-small text-muted-foreground mt-1">{queueSnapshotError ?? 'Unknown error'}</p>
            </div>
            <button
              type="button"
              onClick={onRefreshHealth}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-body-small shadow-neu-outset hover:bg-surface-hover transition-colors"
            >
              <RefreshCw size={16} className="text-brand-accent" />
              Retry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {[
              {
                label: 'RSS NEW entries',
                value: queueSnapshot?.rssNewEntries ?? 0,
                onClick: () => onNavigateToTab?.('Sources'),
              },
              {
                label: 'Research NEW entries (WEB)',
                value: queueSnapshot?.researchNewEntries.WEB ?? 0,
                onClick: () => onNavigateToTab?.('Sources'),
              },
              {
                label: 'Research NEW entries (SOCIAL)',
                value: queueSnapshot?.researchNewEntries.SOCIAL ?? 0,
                onClick: () => onNavigateToTab?.('Sources'),
              },
              {
                label: 'Research NEW entries (JOURNAL)',
                value: queueSnapshot?.researchNewEntries.JOURNAL ?? 0,
                onClick: () => onNavigateToTab?.('Sources'),
              },
              {
                label: 'Research NEW entries (TREND)',
                value: queueSnapshot?.researchNewEntries.TREND ?? 0,
                onClick: () => onNavigateToTab?.('Sources'),
              },
              {
                label: 'Drafts needing review',
                value: queueSnapshot?.draftsNeedingReview ?? 0,
                onClick: () => onNavigateToTab?.('Drafts & Reviews'),
              },
              {
                label: 'Scheduled due soon',
                value: queueSnapshot?.scheduledDueSoon ?? 0,
                onClick: () => onNavigateToTab?.('Dashboard'),
              },
              {
                label: 'Errors',
                value: queueSnapshot?.errors ?? 0,
                onClick: () => onNavigateToTab?.('Audit Logs'),
              },
            ].map((row) => (
              <button
                key={row.label}
                type="button"
                onClick={row.onClick}
                className="w-full px-6 py-4 flex items-center justify-between gap-4 bg-background hover:bg-surface-hover transition-colors text-left"
              >
                <div>
                  <p className="text-body text-foreground">{row.label}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-body text-muted-foreground">{row.value}</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </button>
            ))}

            {queueState === 'empty' ? (
              <div className="px-6 py-4 bg-surface text-body-small text-muted-foreground">
                No backlog detected. (All tracked queue counts are 0.)
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface flex items-center justify-between gap-4">
          <h3 className="text-heading-3 text-foreground flex items-center gap-2">
            <RefreshCw size={18} className="text-brand-accent" />
            Last Run Summary
          </h3>
          <span
            className={`text-body-small uppercase tracking-widest px-2 py-0.5 rounded border ${
              !automationRun
                ? 'bg-muted/10 text-muted-foreground border-border'
                : automationRun.status === 'success'
                  ? 'bg-success/10 text-success border-success/20'
                  : automationRun.status === 'failure'
                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                    : 'bg-accent/10 text-brand-accent border-accent/20'
            }`}
          >
            {!automationRun ? 'No runs yet' : automationRun.status === 'running' ? 'Running…' : automationRun.status}
          </span>
        </div>

        {!automationRun ? (
          <div className="p-6">
            <p className="text-body text-muted-foreground">No automation runs have been triggered in this session.</p>
            <p className="text-body-small text-muted-foreground mt-2">Run Automation Now to generate a summary here. Missing fields will display as “—”.</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Run mode</p>
              <p className="text-body text-foreground">{automationRun.mode === 'dry' ? 'Dry Run' : 'Live Run'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Started</p>
              <p className="text-body text-foreground">{formatDateTime(automationRun.startedAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Duration</p>
              <p className="text-body text-foreground">{automationRun.status === 'running' ? 'Running…' : runDuration ?? '—'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">RSS synced</p>
              <p className="text-body text-foreground">{runCounts.rssSynced ?? '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Research synced</p>
              <p className="text-body text-foreground">{runCounts.researchSynced ?? '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Drafts created</p>
              <p className="text-body text-foreground">{runCounts.draftsCreated ?? '—'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Published</p>
              <p className="text-body text-foreground">{runCounts.published ?? '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Errors</p>
              <p className="text-body text-foreground">{runCounts.errors ?? '—'}</p>
            </div>

            <div className="md:col-span-2 lg:col-span-3 space-y-1">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Last error</p>
              <p className="text-body text-foreground">{automationRun.error ?? (automationRun.summary as any)?.lastError ?? '—'}</p>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-border">
              <p className="text-body-small text-muted-foreground">
                Run ID: <span className="text-foreground">{automationRun.runId ?? '—'}</span>
              </p>
              <button
                type="button"
                onClick={onOpenRunDetails}
                className="flex items-center gap-2 px-4 py-2 bg-surface text-foreground rounded-xl shadow-neu-outset hover:bg-surface-hover transition-colors"
              >
                View run details
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-heading-3 text-foreground flex items-center gap-2">
              <Terminal size={20} className="text-brand-accent" />
              Pipeline Sub-Systems
            </h3>
            <span className="text-body-small text-muted-foreground">Visibility surface (read-only)</span>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                onRefreshHealth();
              }}
              className="text-body-small text-brand-accent hover:underline flex items-center gap-1"
            >
              <RefreshCw size={14} /> Refresh Health
            </button>
          </div>

          <p className="text-body-small text-muted-foreground">Last updated: {formatDateTime(healthUpdatedAt)}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`p-5 rounded-xl border border-border transition-colors bg-background shadow-neu-outset hover:shadow-neu-inset ${
                  !feature.isActive ? 'opacity-80' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-body text-foreground">{feature.name}</h4>
                    <p className="text-body-small text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>

                  <button
                    type="button"
                    disabled
                    title="This is a status panel (not a control). Use Automation Logic / Sources to configure."
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border opacity-60 cursor-not-allowed ${
                      feature.isActive ? 'bg-accent' : 'bg-surface'
                    }`}
                    aria-label={`${feature.name} status`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                        feature.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-body-small uppercase border ${
                      statusPillClasses[feature.status]
                    }`}
                  >
                    {statusIcon[feature.status]}
                    {feature.status === 'enabled' ? 'Enabled' : feature.status === 'disabled' ? 'Disabled' : 'Placeholder'}
                  </div>
                  <span className="text-body-small text-muted-foreground">Last activity: {feature.lastActivity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-heading-3 text-foreground flex items-center gap-2">
            <Lock size={20} className="text-brand-accent" />
            Safety Center
          </h3>

          <div className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden divide-y divide-border">
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-body text-muted-foreground">Human Checkpoint</span>
                <span className="text-body-small uppercase tracking-widest text-muted-foreground bg-muted/10 px-2 py-0.5 rounded border border-border">
                  Placeholder
                </span>
              </div>
              <p className="text-body-small text-muted-foreground leading-relaxed">
                Not available (policy telemetry not connected yet).
              </p>
              <p className="text-body-small text-muted-foreground">Last updated: {formatDateTime(healthUpdatedAt)}</p>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-body text-muted-foreground">Rate Limiting</span>
                <span className="text-body-small uppercase tracking-widest text-muted-foreground bg-muted/10 px-2 py-0.5 rounded border border-border">
                  Not available
                </span>
              </div>
              <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border shadow-neu-inset">
                <div className="bg-muted h-full w-0" />
              </div>
              <p className="text-body-small text-muted-foreground">Counts unavailable (telemetry not connected yet).</p>
              <p className="text-body-small text-muted-foreground">Last updated: {formatDateTime(healthUpdatedAt)}</p>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-body text-muted-foreground">Safety Filters</span>
                <span className="text-body-small uppercase tracking-widest text-muted-foreground bg-muted/10 px-2 py-0.5 rounded border border-border">
                  Placeholder
                </span>
              </div>
              <div className="space-y-2">
                {['Bias Checker', 'Hallucination Monitor', 'PII Filter'].map((label) => (
                  <div key={label} className="flex items-center gap-2 text-body-small text-muted-foreground">
                    <CheckCircle2 size={12} className="text-muted-foreground" />
                    {label}
                  </div>
                ))}
              </div>
              <p className="text-body-small text-muted-foreground">Last updated: {formatDateTime(healthUpdatedAt)}</p>
            </div>
          </div>

          <div className="p-5 bg-background rounded-2xl border border-border shadow-neu-outset space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle size={18} />
              <span className="text-body-small uppercase tracking-widest">Operational Alerts</span>
            </div>
            <p className="text-body-small text-muted-foreground leading-relaxed">Not available (alerts telemetry not connected yet).</p>
            <p className="text-body-small text-muted-foreground">Last updated: {formatDateTime(healthUpdatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
