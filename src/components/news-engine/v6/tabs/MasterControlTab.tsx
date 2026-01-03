'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import type { PipelineStatus } from '@/lib/ui-stubs/news-engine';

type FeatureStatus = 'healthy' | 'warning' | 'degraded' | 'stopped';

type PipelineFeature = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  status: FeatureStatus;
  lastActivity: string;
};

const statusPillClasses: Record<FeatureStatus, string> = {
  healthy: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  degraded: 'bg-destructive/10 text-destructive border-destructive/30',
  stopped: 'bg-muted/10 text-muted-foreground border-border',
};

const statusIcon: Record<FeatureStatus, React.ReactNode> = {
  healthy: <CheckCircle2 size={14} className="text-success" />,
  warning: <AlertTriangle size={14} className="text-warning" />,
  degraded: <AlertTriangle size={14} className="text-destructive" />,
  stopped: <PauseCircle size={14} className="text-muted-foreground" />,
};

function getSystemLabel(pipelineStatus: PipelineStatus) {
  if (pipelineStatus === 'NOMINAL') return { state: 'Live', chip: 'System Live', accent: 'success' as const };
  if (pipelineStatus === 'PAUSED') return { state: 'Paused', chip: 'System Paused', accent: 'warning' as const };
  return { state: 'LOCKED', chip: 'System LOCKED', accent: 'destructive' as const };
}

type Props = {
  pipelineStatus: PipelineStatus;
  openPauseConfirmation: () => void;
  openResumeConfirmation: () => void;
  openEmergencyStopConfirmation: () => void;
  refreshNonce: number;
  onRefreshHealth: () => void;
};

export function MasterControlTabV6({
  pipelineStatus,
  openPauseConfirmation,
  openResumeConfirmation,
  openEmergencyStopConfirmation,
  refreshNonce,
  onRefreshHealth,
}: Props) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [features, setFeatures] = React.useState<PipelineFeature[]>([]);

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const nominal = pipelineStatus === 'NOMINAL';
      const emergency = pipelineStatus === 'EMERGENCY_STOP';

      setFeatures([
        {
          id: 'rss',
          name: 'RSS Ingestion',
          description: 'Monitor and fetch raw data from configured RSS feeds.',
          isActive: nominal,
          status: nominal ? 'healthy' : 'stopped',
          lastActivity: '2m ago',
        },
        {
          id: 'research',
          name: 'Web Research Engine',
          description: 'AI agents exploring secondary sources and fact-checking.',
          isActive: nominal,
          status: nominal ? 'healthy' : 'stopped',
          lastActivity: '5m ago',
        },
        {
          id: 'draft',
          name: 'Drafting Engine',
          description: 'Generative AI creating structured news articles.',
          isActive: nominal,
          status: nominal ? 'warning' : 'stopped',
          lastActivity: '12m ago',
        },
        {
          id: 'scheduler',
          name: 'Auto-Scheduler',
          description: 'Algorithmic placement of stories in publish windows.',
          isActive: false,
          status: 'stopped',
          lastActivity: '2d ago',
        },
        {
          id: 'social',
          name: 'Social Distribution',
          description: 'Automated posting to LinkedIn, X, and internal channels.',
          isActive: !emergency,
          status: nominal ? 'healthy' : 'stopped',
          lastActivity: '1h ago',
        },
        {
          id: 'dedupe',
          name: 'Deduplication Service',
          description: 'Semantic analysis to prevent covering the same story twice.',
          isActive: !emergency,
          status: nominal ? 'degraded' : 'stopped',
          lastActivity: 'Just now',
        },
      ]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [pipelineStatus, refreshNonce]);

  const system = getSystemLabel(pipelineStatus);

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
            <button
              type="button"
              onClick={openResumeConfirmation}
              disabled={pipelineStatus === 'NOMINAL'}
              className="flex items-center gap-2 px-6 py-3 bg-background text-foreground rounded-xl text-body font-bold hover:bg-surface-hover transition-all active:scale-[0.98] shadow-neu-outset disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayCircle size={20} className="text-foreground" />
              Resume All
            </button>

            <button
              type="button"
              onClick={openPauseConfirmation}
              disabled={pipelineStatus !== 'NOMINAL'}
              className="flex items-center gap-2 px-6 py-3 bg-surface text-foreground rounded-xl text-body font-bold hover:bg-surface-hover transition-all active:scale-[0.98] shadow-neu-outset disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PauseCircle size={20} className="text-foreground" />
              Pause Pipeline
            </button>

            <button
              type="button"
              onClick={openEmergencyStopConfirmation}
              disabled={pipelineStatus === 'EMERGENCY_STOP'}
              className="flex items-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground rounded-xl text-body font-bold hover:bg-destructive/90 transition-all active:scale-[0.98] shadow-neu-outset disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldAlert size={20} className="text-destructive-foreground" />
              Emergency Stop
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-heading-3 text-foreground flex items-center gap-2">
              <Terminal size={20} className="text-brand-accent" />
              Pipeline Sub-Systems
            </h3>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`p-5 rounded-xl border border-border transition-all bg-background shadow-neu-outset hover:shadow-neu-inset ${
                  !feature.isActive ? 'opacity-80' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-body font-bold text-foreground">{feature.name}</h4>
                    <p className="text-body-small text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFeatures((prev) => prev.map((f) => (f.id === feature.id ? { ...f, isActive: !f.isActive } : f)));
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border ${
                      feature.isActive ? 'bg-accent' : 'bg-surface'
                    }`}
                    aria-label={`Toggle ${feature.name}`}
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
                    {feature.status}
                  </div>
                  <span className="text-body-small text-muted-foreground">Last: {feature.lastActivity}</span>
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
                <span className="text-body font-semibold text-muted-foreground">Human Checkpoint</span>
                <span className="text-body-small uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded border border-success/20">
                  Enforced
                </span>
              </div>
              <p className="text-body-small text-muted-foreground leading-relaxed">
                System will not bypass manual review for items with relevance below 95%.
              </p>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-body font-semibold text-muted-foreground">Rate Limiting</span>
                <span className="text-body-small uppercase tracking-widest text-brand-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                  Nominal
                </span>
              </div>
              <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border shadow-neu-inset">
                <div className="bg-accent h-full w-[24%]" />
              </div>
              <p className="text-body-small text-muted-foreground">Current token consumption: 14.2k / 1.5M / hr</p>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-body font-semibold text-muted-foreground">Safety Filters</span>
                <span className="text-body-small uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded border border-success/20">
                  Active
                </span>
              </div>
              <div className="space-y-2">
                {['Bias Checker', 'Hallucination Monitor', 'PII Filter'].map((label) => (
                  <div key={label} className="flex items-center gap-2 text-body-small text-muted-foreground">
                    <CheckCircle2 size={12} className="text-success" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 bg-warning/10 rounded-2xl border border-warning/30 shadow-neu-outset space-y-2">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle size={18} />
              <span className="text-body-small uppercase tracking-widest">Operational Alert</span>
            </div>
            <p className="text-body-small text-warning/90 leading-relaxed">
              Deduplication service is currently experiencing high latency. Some redundant drafts may appear in the queue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
