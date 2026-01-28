'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Info,
  Layers,
  Loader2,
  Plus,
  Settings2,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import type { NewsEngineState } from '@/lib/ui-stubs/news-engine';
import {
  adminCreateAutomationRule,
  adminDeleteAutomationRule,
  adminUpdateAutomationRule,
  fetchAdminAutomationConfig,
  fetchAdminAutomationRules,
  type AdminAutomationRule,
} from '@/lib/news-engine/client';
import type { useSavedIndicator } from '../shared';
import { OperationalRuleModal, type OperationalRuleDraft } from '../modals/OperationalRuleModal';

type SavedIndicator = ReturnType<typeof useSavedIndicator>;

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type Props = {
  state: NewsEngineState;
  setState: React.Dispatch<React.SetStateAction<NewsEngineState | null>>;
  automationSaved: SavedIndicator;
  onOpenGuidelines: () => void;
  operationalRuleModalOpen: boolean;
  onOpenOperationalRuleModal: () => void;
  onCloseOperationalRuleModal: () => void;
  onSave?: (payload: { automation: NewsEngineState['automation']; config: JsonValue }) => Promise<void> | void;
};

export function AutomationLogicTabV6({
  state,
  setState,
  automationSaved,
  onOpenGuidelines,
  operationalRuleModalOpen,
  onOpenOperationalRuleModal,
  onCloseOperationalRuleModal,
  onSave,
}: Props) {
  const [config, setConfig] = React.useState(() => ({
    minScore: 85,
    strategy: 'Chronological' as 'Chronological' | 'Priority-Based' | 'Batch Burst',
  }));

  const [configHydrating, setConfigHydrating] = React.useState(false);
  const [configHydrationError, setConfigHydrationError] = React.useState<string | null>(null);

  type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  type TimeRange = { id: string; start: string; end: string };
  type PublishWindowsV2 = {
    timezone: string;
    days: Record<DayKey, { enabled: boolean; ranges: TimeRange[] }>;
    jitterMinutes?: number;
    blackoutDates?: string[];
  };

  const dayDefs = React.useMemo<Array<{ key: DayKey; label: string; jsDay: number }>>(
    () => [
      { key: 'mon', label: 'Mon', jsDay: 1 },
      { key: 'tue', label: 'Tue', jsDay: 2 },
      { key: 'wed', label: 'Wed', jsDay: 3 },
      { key: 'thu', label: 'Thu', jsDay: 4 },
      { key: 'fri', label: 'Fri', jsDay: 5 },
      { key: 'sat', label: 'Sat', jsDay: 6 },
      { key: 'sun', label: 'Sun', jsDay: 0 },
    ],
    []
  );

  const makeId = React.useCallback(() => {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }, []);

  const [publishWindowsV2, setPublishWindowsV2] = React.useState<PublishWindowsV2>(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return {
      timezone: tz || 'UTC',
      days: {
        mon: { enabled: true, ranges: [{ id: 'seed_mon', start: '09:00', end: '11:00' }] },
        tue: { enabled: false, ranges: [] },
        wed: { enabled: false, ranges: [] },
        thu: { enabled: false, ranges: [] },
        fri: { enabled: false, ranges: [] },
        sat: { enabled: false, ranges: [] },
        sun: { enabled: false, ranges: [] },
      },
      jitterMinutes: 0,
      blackoutDates: [],
    };
  });

  const [savedSnapshot, setSavedSnapshot] = React.useState<{
    config: { minScore: number; strategy: 'Chronological' | 'Priority-Based' | 'Batch Burst' };
    publishWindowsV2: PublishWindowsV2;
  } | null>(null);

  const [blackoutDraft, setBlackoutDraft] = React.useState<string>(() => {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  type DbOperationalRule = {
    id: string;
    name: string;
    enabled: boolean;
    config: {
      scope: 'select' | 'research' | 'draft' | 'gate' | 'schedule' | 'publish';
      conditions: Array<{ id: string; kind: string; value: string }>;
      action: string;
      severity: string;
      actionValue?: string;
    };
    createdAt: string;
    updatedAt: string;
  };

  const [operationalRules, setOperationalRules] = React.useState<DbOperationalRule[]>([]);
  const [rulesLoading, setRulesLoading] = React.useState(false);
  const [rulesError, setRulesError] = React.useState<string | null>(null);

  const normalizeDbRule = React.useCallback((rule: AdminAutomationRule): DbOperationalRule | null => {
    const cfg = rule.config;
    if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) return null;

    const scope = typeof (cfg as any).scope === 'string' ? String((cfg as any).scope).trim() : '';
    const action = typeof (cfg as any).action === 'string' ? String((cfg as any).action).trim() : '';
    const severity = typeof (cfg as any).severity === 'string' ? String((cfg as any).severity).trim() : '';
    const actionValue = typeof (cfg as any).actionValue === 'string' ? String((cfg as any).actionValue).trim() : '';
    const rawConditions = Array.isArray((cfg as any).conditions) ? (cfg as any).conditions : [];

    const allowedScopes = new Set(['select', 'research', 'draft', 'gate', 'schedule', 'publish']);
    if (!allowedScopes.has(scope)) return null;

    return {
      id: rule.id,
      name: rule.name,
      enabled: rule.enabled,
      config: {
        scope: scope as DbOperationalRule['config']['scope'],
        conditions: rawConditions
          .filter((c: any) => c && typeof c === 'object')
          .map((c: any) => ({
            id: typeof c.id === 'string' ? c.id : `${Date.now()}_${Math.random().toString(16).slice(2)}`,
            kind: typeof c.kind === 'string' ? c.kind : 'category',
            value: typeof c.value === 'string' ? c.value : '',
          }))
          .filter((c: any) => !!c.kind && !!c.value),
        action,
        severity,
        ...(actionValue ? { actionValue } : {}),
      },
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }, []);

  const reloadOperationalRules = React.useCallback(async () => {
    setRulesLoading(true);
    setRulesError(null);
    try {
      const rules = await fetchAdminAutomationRules();
      const normalized = rules
        .map((r) => normalizeDbRule(r))
        .filter((r): r is DbOperationalRule => !!r);
      setOperationalRules(normalized);
    } catch (error) {
      setRulesError(error instanceof Error ? error.message : 'Failed to load operational rules');
    } finally {
      setRulesLoading(false);
    }
  }, [normalizeDbRule]);

  React.useEffect(() => {
    void reloadOperationalRules();
  }, [reloadOperationalRules]);

  const summarizeRuleConditions = React.useCallback((rule: DbOperationalRule) => {
    if (!rule.config.conditions || rule.config.conditions.length === 0) return 'No conditions (applies globally)';

    return rule.config.conditions
      .map((c) => {
        switch (c.kind) {
          case 'category':
            return `category: ${c.value}`;
          case 'keywords_blacklist':
            return `keywords_blacklist: ${c.value}`;
          case 'min_sources':
            return `min_sources: ${c.value}`;
          case 'duplicate_similarity_gt':
            return `duplicate_similarity_gt: ${c.value}%`;
          default:
            return `${c.kind}: ${c.value}`;
        }
      })
      .join(' • ');
  }, []);

  const summarizeRuleAction = React.useCallback((rule: DbOperationalRule) => {
    const base = `${rule.config.action}`;
    const extra = rule.config.actionValue?.trim() ? ` (${rule.config.actionValue.trim()})` : '';
    return `${base}${extra} • ${rule.config.severity}`;
  }, []);

  const explainRule = React.useCallback((rule: DbOperationalRule) => {
    const readableScope: Record<DbOperationalRule['config']['scope'], string> = {
      select: 'selection',
      research: 'research',
      draft: 'drafting',
      gate: 'gatekeeping',
      schedule: 'scheduling',
      publish: 'publishing',
    };

    const cond = summarizeRuleConditions(rule);
    const action = summarizeRuleAction(rule);
    return `When ${cond}, apply ${action} during ${readableScope[rule.config.scope]}.`;
  }, [summarizeRuleAction, summarizeRuleConditions]);

  const triggerSaved = React.useCallback(() => {
    automationSaved.trigger();
  }, [automationSaved]);

  const isDirty = React.useMemo(() => {
    if (!savedSnapshot) return false;
    const a = JSON.stringify({ config, publishWindowsV2 });
    const b = JSON.stringify(savedSnapshot);
    return a !== b;
  }, [config, publishWindowsV2, savedSnapshot]);

  const resetToSaved = React.useCallback(() => {
    if (!savedSnapshot) return;
    setConfig(savedSnapshot.config);
    setPublishWindowsV2(savedSnapshot.publishWindowsV2);
  }, [savedSnapshot]);

  const hydrateFromPersisted = React.useCallback(async () => {
    setConfigHydrating(true);
    setConfigHydrationError(null);

    try {
      const res = await fetchAdminAutomationConfig();
      const raw = res.config;

      const nextConfig = { ...config };
      let nextPublishWindowsV2 = publishWindowsV2;

      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const obj = raw as Record<string, unknown>;

        if (typeof obj.minScore === 'number' && Number.isFinite(obj.minScore)) {
          nextConfig.minScore = Math.max(0, Math.min(100, Math.round(obj.minScore)));
        }

        if (typeof obj.strategy === 'string') {
          const trimmed = obj.strategy.trim();
          if (trimmed === 'Chronological' || trimmed === 'Priority-Based' || trimmed === 'Batch Burst') {
            nextConfig.strategy = trimmed;
          }
        }

        if (obj.publishWindowsV2 && typeof obj.publishWindowsV2 === 'object' && !Array.isArray(obj.publishWindowsV2)) {
          const pw = obj.publishWindowsV2 as Record<string, unknown>;
          const timezone = typeof pw.timezone === 'string' ? pw.timezone : nextPublishWindowsV2.timezone;
          const jitterMinutes = typeof pw.jitterMinutes === 'number' ? pw.jitterMinutes : nextPublishWindowsV2.jitterMinutes;
          const blackoutDates = Array.isArray(pw.blackoutDates)
            ? pw.blackoutDates.filter((d) => typeof d === 'string').slice(0, 200)
            : nextPublishWindowsV2.blackoutDates;

          const daysRaw = pw.days;
          const nextDays = { ...nextPublishWindowsV2.days };
          if (daysRaw && typeof daysRaw === 'object' && !Array.isArray(daysRaw)) {
            for (const key of Object.keys(nextDays) as DayKey[]) {
              const rawDay = (daysRaw as any)[key];
              if (!rawDay || typeof rawDay !== 'object' || Array.isArray(rawDay)) continue;
              const enabled = typeof (rawDay as any).enabled === 'boolean' ? (rawDay as any).enabled : nextDays[key].enabled;
              const rangesRaw = Array.isArray((rawDay as any).ranges) ? (rawDay as any).ranges : nextDays[key].ranges;
              const ranges: TimeRange[] = (rangesRaw as any[])
                .filter((r) => r && typeof r === 'object')
                .map((r) => ({
                  id: typeof (r as any).id === 'string' ? (r as any).id : makeId(),
                  start: typeof (r as any).start === 'string' ? (r as any).start : '',
                  end: typeof (r as any).end === 'string' ? (r as any).end : '',
                }));

              nextDays[key] = { enabled, ranges };
            }
          }

          nextPublishWindowsV2 = {
            timezone,
            days: nextDays,
            jitterMinutes,
            blackoutDates,
          };
        }
      }

      setConfig(nextConfig);
      setPublishWindowsV2(nextPublishWindowsV2);
      setSavedSnapshot({ config: nextConfig, publishWindowsV2: nextPublishWindowsV2 });
    } catch (error) {
      setConfigHydrationError(error instanceof Error ? error.message : 'Failed to load saved automation config');
      setSavedSnapshot({ config, publishWindowsV2 });
    } finally {
      setConfigHydrating(false);
    }
  }, [config, makeId, publishWindowsV2]);

  React.useEffect(() => {
    void hydrateFromPersisted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runnerWindows = React.useMemo(() => {
    const now = new Date();
    const blackout = new Set(publishWindowsV2.blackoutDates ?? []);

    const windows: Array<{ startsAt: Date; window: string }> = [];
    const scanDays = 35;

    for (let i = 0; i < scanDays; i += 1) {
      const dayDate = new Date(now);
      dayDate.setHours(0, 0, 0, 0);
      dayDate.setDate(dayDate.getDate() + i);

      const yyyy = String(dayDate.getFullYear());
      const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dd = String(dayDate.getDate()).padStart(2, '0');
      const ymd = `${yyyy}-${mm}-${dd}`;
      if (blackout.has(ymd)) continue;

      const jsDay = dayDate.getDay();
      const def = dayDefs.find((d) => d.jsDay === jsDay);
      if (!def) continue;
      const dayCfg = publishWindowsV2.days[def.key];
      if (!dayCfg.enabled) continue;

      for (const range of dayCfg.ranges) {
        if (!range.start || !range.end) continue;
        if (range.end <= range.start) continue;

        const [sh, sm] = range.start.split(':').map((v) => parseInt(v, 10));
        if (Number.isNaN(sh) || Number.isNaN(sm)) continue;

        const startsAt = new Date(dayDate);
        startsAt.setHours(sh, sm, 0, 0);
        if (startsAt <= now) continue;

        windows.push({
          startsAt,
          window: `${ymd} • ${range.start} - ${range.end}`,
        });
      }
    }

    windows.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    return windows.map((w) => w.window).slice(0, 120);
  }, [dayDefs, publishWindowsV2.blackoutDates, publishWindowsV2.days]);

  const handleSaveOperationalRule = React.useCallback(
    async (rule: OperationalRuleDraft) => {
      try {
        setRulesLoading(true);
        await adminCreateAutomationRule({
          name: rule.name,
          enabled: rule.enabled,
          config: {
            scope: rule.scope,
            conditions: rule.conditions,
            action: rule.action,
            severity: rule.severity,
            ...(rule.actionValue ? { actionValue: rule.actionValue } : {}),
          },
        });
        triggerSaved();
        await reloadOperationalRules();
      } finally {
        setRulesLoading(false);
      }
    },
    [reloadOperationalRules, triggerSaved]
  );

  const saveConfiguration = React.useCallback(() => {
    automationSaved.trigger();
    onSave?.({
      automation: state.automation,
      config: {
        minScore: config.minScore,
        strategy: config.strategy,
        windows: runnerWindows,
        publishWindowsV2,
      },
    });
  }, [automationSaved, config.minScore, config.strategy, onSave, publishWindowsV2, runnerWindows, state.automation]);

  const deleteRule = React.useCallback(
    async (id: string) => {
      try {
        setRulesLoading(true);
        await adminDeleteAutomationRule(id);
        triggerSaved();
        await reloadOperationalRules();
      } finally {
        setRulesLoading(false);
      }
    },
    [reloadOperationalRules, triggerSaved]
  );

  const hasInvalidRange = React.useMemo(() => {
    for (const day of dayDefs) {
      const dayCfg = publishWindowsV2.days[day.key];
      if (!dayCfg.enabled) continue;
      for (const range of dayCfg.ranges) {
        if (!range.start || !range.end) return true;
        if (range.end <= range.start) return true;
      }
    }
    return false;
  }, [dayDefs, publishWindowsV2.days]);

  const hasAnyRanges = React.useMemo(() => {
    for (const day of dayDefs) {
      const dayCfg = publishWindowsV2.days[day.key];
      if (dayCfg.enabled && dayCfg.ranges.length > 0) return true;
    }
    return false;
  }, [dayDefs, publishWindowsV2.days]);

  const previewSlots = React.useMemo(() => {
    const now = new Date();
    const blackout = new Set(publishWindowsV2.blackoutDates ?? []);

    const slots: Array<{ startsAt: Date; label: string }> = [];
    const scanDays = 35;

    for (let i = 0; i < scanDays; i += 1) {
      const dayDate = new Date(now);
      dayDate.setHours(0, 0, 0, 0);
      dayDate.setDate(dayDate.getDate() + i);

      const yyyy = String(dayDate.getFullYear());
      const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dd = String(dayDate.getDate()).padStart(2, '0');
      const ymd = `${yyyy}-${mm}-${dd}`;
      if (blackout.has(ymd)) continue;

      const jsDay = dayDate.getDay();
      const def = dayDefs.find((d) => d.jsDay === jsDay);
      if (!def) continue;
      const dayCfg = publishWindowsV2.days[def.key];
      if (!dayCfg.enabled) continue;

      for (const range of dayCfg.ranges) {
        if (!range.start || !range.end) continue;
        if (range.end <= range.start) continue;

        const [sh, sm] = range.start.split(':').map((v) => parseInt(v, 10));
        const [eh, em] = range.end.split(':').map((v) => parseInt(v, 10));
        if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) continue;

        const startsAt = new Date(dayDate);
        startsAt.setHours(sh, sm, 0, 0);
        if (startsAt <= now) continue;

        const label = `${ymd} (${def.label}) ${range.start}–${range.end}`;
        slots.push({ startsAt, label });
      }
    }

    slots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    return slots.slice(0, 10);
  }, [dayDefs, publishWindowsV2.blackoutDates, publishWindowsV2.days]);

  const Toggle = ({ active, onChange, disabled }: { active: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${active ? 'bg-accent' : 'bg-surface'}`}
      aria-label="Toggle"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
          active ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const RuleCard = ({
    title,
    description,
    isActive,
    onToggle,
    children,
  }: {
    title: string;
    description: string;
    isActive: boolean;
    onToggle: () => void;
    children?: React.ReactNode;
  }) => (
    <div
      className={`p-5 rounded-xl border transition-colors ${
        isActive ? 'bg-background border-accent/20 shadow-neu-outset' : 'bg-surface border-border opacity-80'
      }`}
    >
      <div className="flex justify-between items-start mb-4 gap-4">
        <div className="space-y-1">
          <h4 className="text-body text-foreground">{title}</h4>
          <p className="text-body text-muted-foreground">{description}</p>
        </div>
        <Toggle
          active={isActive}
          onChange={() => {
            onToggle();
            triggerSaved();
          }}
        />
      </div>
      {isActive && children ? <div className="mt-4 pt-4 border-t border-border">{children}</div> : null}
    </div>
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 relative">
      {automationSaved.status !== 'idle' ? (
        <div className="fixed bottom-8 right-8 z-[1600] flex items-center gap-3 px-4 py-3 bg-foreground text-background rounded-2xl shadow-neu-outset animate-in slide-in-from-bottom-4 duration-300">
          {automationSaved.status === 'saving' ? (
            <>
              <Loader2 size={16} className="animate-spin text-brand-accent" />
              <span className="text-body-small uppercase tracking-widest">Persisting Logic…</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} className="text-success" />
              <span className="text-body-small uppercase tracking-widest">Logic Persisted</span>
            </>
          )}
        </div>
      ) : null}

      <section className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-4 shadow-neu-outset">
        <div className="p-2 bg-warning/10 rounded-lg text-warning border border-warning/30">
          <ShieldCheck size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-body text-warning">Safety First: Manual Approval Required</h3>
          <p className="text-body-small text-warning/90 mt-1 leading-relaxed">
            By default, all AI-generated content must be manually approved in the Review queue before going live.
            Automated publishing is currently disabled globally to ensure content quality and factual accuracy.
          </p>
        </div>
        <button type="button" onClick={onOpenGuidelines} className="text-body-small text-warning hover:underline whitespace-nowrap">
          View Guidelines
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-brand-accent" />
              <h2 className="text-heading-3 text-foreground">Pipeline Automation</h2>
            </div>

            <div className="grid gap-4">
              <RuleCard
                title="Auto-Research & Draft"
                description="Automatically trigger AI research and draft creation when new sources are detected."
                isActive={state.automation.autoDraft}
                onToggle={() => {
                  const next = {
                    ...state,
                    automation: { ...state.automation, autoDraft: !state.automation.autoDraft },
                  };
                  setState(next);
                }}
              >
                <div className="flex items-center justify-between text-body gap-4 flex-wrap">
                  <span className="text-muted-foreground">Minimum Relevance Score</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={config.minScore}
                      onChange={(e) => {
                        setConfig((prev) => ({ ...prev, minScore: parseInt(e.target.value, 10) }));
                        triggerSaved();
                      }}
                      className="w-32 cursor-pointer"
                    />
                    <span className="text-body text-brand-accent w-10 text-right">{config.minScore}%</span>
                  </div>
                </div>
              </RuleCard>

              <RuleCard
                title="Auto-Schedule"
                description="Move approved drafts automatically to the next available publication slot."
                isActive={state.automation.autoSchedule}
                onToggle={() => {
                  const next = {
                    ...state,
                    automation: { ...state.automation, autoSchedule: !state.automation.autoSchedule },
                  };
                  setState(next);
                }}
              >
                <div className="space-y-3">
                  <p className="text-body-small text-muted-foreground">Select active publication strategy:</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['Chronological', 'Priority-Based', 'Batch Burst'] as const).map((strategy) => (
                      <button
                        key={strategy}
                        type="button"
                        onClick={() => {
                          setConfig((prev) => ({ ...prev, strategy }));
                          triggerSaved();
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-body-small transition-all ${
                          config.strategy === strategy
                            ? 'bg-accent/10 border-accent/20 text-brand-accent shadow-neu-outset'
                            : 'bg-background border-border text-muted-foreground hover:bg-surface'
                        }`}
                      >
                        {strategy}
                      </button>
                    ))}
                  </div>
                </div>
              </RuleCard>

              <div
                className={`p-5 rounded-xl border transition-all flex items-center justify-between gap-4 flex-wrap ${
                  state.automation.autoPublish
                    ? 'bg-background border-destructive/30 shadow-neu-outset'
                    : 'bg-surface border-dashed border-border opacity-80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg border ${
                      state.automation.autoPublish
                        ? 'bg-destructive/10 text-destructive border-destructive/30'
                        : 'bg-background text-muted-foreground border-border'
                    }`}
                  >
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className={`text-body ${state.automation.autoPublish ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Direct Auto-Publish
                    </h4>
                    <p className="text-body text-muted-foreground">Publish content immediately without any human review.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {!state.automation.autoPublish ? (
                    <span className="text-body-small uppercase tracking-widest text-destructive bg-destructive/10 px-2 py-0.5 rounded border border-destructive/30">
                      Restricted
                    </span>
                  ) : null}
                  <Toggle
                    active={state.automation.autoPublish}
                    onChange={() => {
                      const next = {
                        ...state,
                        automation: { ...state.automation, autoPublish: !state.automation.autoPublish },
                      };
                      setState(next);
                      triggerSaved();
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface flex-wrap gap-4">
              <h3 className="text-heading-3 text-foreground flex items-center gap-2">
                <Layers size={18} className="text-brand-accent" />
                Operational Rules
              </h3>
              <button
                type="button"
                onClick={onOpenOperationalRuleModal}
                className="text-body-small text-brand-accent flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Add Rule
              </button>
            </div>

            <div className="divide-y divide-border">
              {rulesError ? (
                <div className="p-4 text-body text-destructive">{rulesError}</div>
              ) : null}

              {rulesLoading && operationalRules.length === 0 ? (
                <div className="p-4 text-body text-muted-foreground">Loading rules…</div>
              ) : null}

              {!rulesLoading && operationalRules.length === 0 && !rulesError ? (
                <div className="p-4 text-body text-muted-foreground">No operational rules yet. Add one to persist it to the database.</div>
              ) : null}

              {operationalRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-surface-hover transition-colors ${
                    !rule.enabled ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-neu-outset ${
                        rule.enabled
                          ? 'bg-accent/10 text-brand-accent border-accent/20'
                          : 'bg-surface text-muted-foreground border-border'
                      }`}
                    >
                      <Settings2 size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-body-small uppercase tracking-widest text-muted-foreground">{rule.config.scope}</span>
                        <h5 className="text-body text-foreground">{rule.name}</h5>
                        <span className="text-body-small text-muted-foreground">• {summarizeRuleAction(rule)}</span>
                      </div>
                      <p className="text-body-small text-muted-foreground mt-0.5">{summarizeRuleConditions(rule)}</p>
                      <p className="text-body-small text-muted-foreground mt-1">What this does: {explainRule(rule)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Toggle
                      active={rule.enabled}
                      onChange={() => {
                        void (async () => {
                          setOperationalRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r)));
                          triggerSaved();
                          try {
                            await adminUpdateAutomationRule(rule.id, { enabled: !rule.enabled });
                            await reloadOperationalRules();
                          } catch (error) {
                            setRulesError(error instanceof Error ? error.message : 'Failed to update rule');
                          }
                        })();
                      }}
                      disabled={rulesLoading}
                    />
                    <button
                      type="button"
                      onClick={() => void deleteRule(rule.id)}
                      disabled={rulesLoading}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Delete rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-background rounded-2xl border border-border shadow-neu-outset p-6 space-y-6 sticky top-24">
            <div className="space-y-2">
              <h3 className="text-heading-3 text-foreground flex items-center gap-2">
                <Clock size={18} className="text-brand-accent" />
                Publish Windows v2
              </h3>
              <p className="text-body-small text-muted-foreground">
                Define allowed publish time ranges per weekday. Preview updates immediately.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-body-small uppercase tracking-widest text-muted-foreground">Timezone (required)</label>
                <input
                  type="text"
                  value={publishWindowsV2.timezone}
                  onChange={(e) => {
                    setPublishWindowsV2((prev) => ({ ...prev, timezone: e.target.value }));
                    triggerSaved();
                  }}
                  placeholder="America/New_York"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <p className="text-body-small text-muted-foreground">
                  Stored as a label for the scheduler. Preview is computed in your browser time.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-body-small uppercase tracking-widest text-muted-foreground">Days of week</label>
                  <span className="text-body-small text-muted-foreground">Select days then add ranges</span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {dayDefs.map((d) => {
                    const enabled = publishWindowsV2.days[d.key].enabled;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => {
                          setPublishWindowsV2((prev) => {
                            const next = { ...prev, days: { ...prev.days, [d.key]: { ...prev.days[d.key] } } };
                            const nextEnabled = !next.days[d.key].enabled;
                            next.days[d.key].enabled = nextEnabled;
                            if (nextEnabled && next.days[d.key].ranges.length === 0) {
                              next.days[d.key].ranges = [{ id: makeId(), start: '09:00', end: '11:00' }];
                            }
                            return next;
                          });
                          triggerSaved();
                        }}
                        className={`px-2 py-2 rounded-lg border text-body-small transition-all ${
                          enabled
                            ? 'bg-accent/10 border-accent/20 text-brand-accent shadow-neu-outset'
                            : 'bg-background border-border text-muted-foreground hover:bg-surface'
                        }`}
                        aria-pressed={enabled}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {dayDefs
                  .filter((d) => publishWindowsV2.days[d.key].enabled)
                  .map((d) => {
                    const ranges = publishWindowsV2.days[d.key].ranges;
                    return (
                      <div key={d.key} className="p-4 bg-surface border border-border rounded-xl shadow-neu-inset space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-body text-foreground">{d.label}</h4>
                          <button
                            type="button"
                            onClick={() => {
                              setPublishWindowsV2((prev) => {
                                const dayCfg = prev.days[d.key];
                                const nextRanges = [...dayCfg.ranges, { id: makeId(), start: '09:00', end: '11:00' }];
                                return {
                                  ...prev,
                                  days: { ...prev.days, [d.key]: { ...dayCfg, ranges: nextRanges } },
                                };
                              });
                              triggerSaved();
                            }}
                            className="text-body-small text-brand-accent flex items-center gap-1 hover:underline"
                          >
                            <Plus size={14} /> Add range
                          </button>
                        </div>

                        {ranges.length === 0 ? (
                          <p className="text-body-small text-muted-foreground">No ranges yet.</p>
                        ) : null}

                        <div className="space-y-2">
                          {ranges.map((r) => {
                            const invalid = !!r.start && !!r.end && r.end <= r.start;
                            return (
                              <div key={r.id} className="space-y-2">
                                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                  <input
                                    type="time"
                                    value={r.start}
                                    onChange={(e) => {
                                      setPublishWindowsV2((prev) => {
                                        const dayCfg = prev.days[d.key];
                                        return {
                                          ...prev,
                                          days: {
                                            ...prev.days,
                                            [d.key]: {
                                              ...dayCfg,
                                              ranges: dayCfg.ranges.map((x) => (x.id === r.id ? { ...x, start: e.target.value } : x)),
                                            },
                                          },
                                        };
                                      });
                                      triggerSaved();
                                    }}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    aria-label={`${d.label} range start`}
                                  />
                                  <input
                                    type="time"
                                    value={r.end}
                                    onChange={(e) => {
                                      setPublishWindowsV2((prev) => {
                                        const dayCfg = prev.days[d.key];
                                        return {
                                          ...prev,
                                          days: {
                                            ...prev.days,
                                            [d.key]: {
                                              ...dayCfg,
                                              ranges: dayCfg.ranges.map((x) => (x.id === r.id ? { ...x, end: e.target.value } : x)),
                                            },
                                          },
                                        };
                                      });
                                      triggerSaved();
                                    }}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    aria-label={`${d.label} range end`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPublishWindowsV2((prev) => {
                                        const dayCfg = prev.days[d.key];
                                        return {
                                          ...prev,
                                          days: {
                                            ...prev.days,
                                            [d.key]: { ...dayCfg, ranges: dayCfg.ranges.filter((x) => x.id !== r.id) },
                                          },
                                        };
                                      });
                                      triggerSaved();
                                    }}
                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                    aria-label="Remove time range"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                {invalid ? <p className="text-body-small text-destructive">End time must be after start time.</p> : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                {dayDefs.every((d) => !publishWindowsV2.days[d.key].enabled) ? (
                  <p className="text-body-small text-muted-foreground">Select at least one day to configure ranges.</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-body-small uppercase tracking-widest text-muted-foreground">Optional jitter (minutes)</label>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={publishWindowsV2.jitterMinutes ?? 0}
                    onChange={(e) => {
                      const value = Math.max(0, parseInt(e.target.value || '0', 10));
                      setPublishWindowsV2((prev) => ({ ...prev, jitterMinutes: value }));
                      triggerSaved();
                    }}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-body-small uppercase tracking-widest text-muted-foreground">Optional blackout dates</label>
                    <span className="text-body-small text-muted-foreground">(YYYY-MM-DD)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={blackoutDraft}
                      onChange={(e) => setBlackoutDraft(e.target.value)}
                      className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const value = blackoutDraft.trim();
                        if (!value) return;
                        setPublishWindowsV2((prev) => {
                          const existing = new Set(prev.blackoutDates ?? []);
                          existing.add(value);
                          return { ...prev, blackoutDates: Array.from(existing).sort() };
                        });
                        triggerSaved();
                      }}
                      className="px-4 py-3 rounded-xl text-body-small uppercase tracking-widest shadow-neu-outset bg-accent text-accent-foreground hover:opacity-95"
                    >
                      Add
                    </button>
                  </div>

                  {(publishWindowsV2.blackoutDates ?? []).length > 0 ? (
                    <div className="space-y-2">
                      {(publishWindowsV2.blackoutDates ?? []).map((d) => (
                        <div key={d} className="flex items-center justify-between gap-3 px-3 py-2 bg-surface border border-border rounded-lg">
                          <span className="text-body text-foreground">{d}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPublishWindowsV2((prev) => ({
                                ...prev,
                                blackoutDates: (prev.blackoutDates ?? []).filter((x) => x !== d),
                              }));
                              triggerSaved();
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove blackout date"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body-small text-muted-foreground">No blackout dates.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-body text-foreground">Next 10 slots</h4>
                  <span className="text-body-small text-muted-foreground">{publishWindowsV2.timezone || 'Timezone required'}</span>
                </div>

                {!hasAnyRanges ? (
                  <p className="text-body-small text-muted-foreground">No ranges configured yet.</p>
                ) : hasInvalidRange ? (
                  <p className="text-body-small text-destructive">Fix invalid ranges to view an accurate preview.</p>
                ) : previewSlots.length === 0 ? (
                  <p className="text-body-small text-muted-foreground">No upcoming slots found in the next few weeks.</p>
                ) : (
                  <div className="space-y-2">
                    {previewSlots.map((s) => (
                      <div key={s.label} className="px-3 py-2 bg-surface border border-border rounded-lg text-body flex items-center justify-between">
                        <span className="text-foreground">{s.label}</span>
                        <Clock size={14} className="text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between text-body-small">
                <span className="text-muted-foreground">Active Automations</span>
                <span className="text-body-small text-success flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between text-body-small">
                <span className="text-muted-foreground">Scheduled Today</span>
                <span className="text-body-small text-foreground">8 / 15</span>
              </div>
              <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-border shadow-neu-inset">
                <div className="w-1/2 h-full bg-accent rounded-full" />
              </div>
            </div>

            <button
              type="button"
              onClick={saveConfiguration}
              disabled={
                automationSaved.status === 'saving' ||
                configHydrating ||
                !publishWindowsV2.timezone.trim() ||
                !hasAnyRanges ||
                hasInvalidRange
              }
              className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-xl text-body shadow-neu-outset hover:bg-foreground/90 transition-colors active:scale-[0.98] disabled:opacity-50"
            >
              {automationSaved.status === 'saving' || configHydrating ? <Loader2 size={18} className="animate-spin" /> : null}
              {automationSaved.status === 'saved' ? <CheckCircle2 size={18} className="text-success" /> : null}
              {automationSaved.status === 'saved' ? 'Logic Persisted' : configHydrating ? 'Loading saved config…' : 'Save Configuration'}
            </button>

            <div className="pt-3 flex items-center justify-between gap-3 text-body-small text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-2 ${isDirty ? 'text-warning' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isDirty ? 'bg-warning' : 'bg-muted-foreground'}`} />
                  {isDirty ? 'Unsaved changes' : 'Saved values loaded'}
                </span>
                {configHydrationError ? <span className="text-destructive">({configHydrationError})</span> : null}
              </div>
              <button
                type="button"
                onClick={resetToSaved}
                disabled={!savedSnapshot || !isDirty || automationSaved.status === 'saving' || configHydrating}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border shadow-neu-outset hover:bg-surface-hover transition-colors disabled:opacity-50"
              >
                Reset to Saved
              </button>
            </div>
          </section>

          <section className="p-5 bg-foreground rounded-xl text-background space-y-3 shadow-neu-outset relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Zap size={64} />
            </div>
            <div className="flex items-center gap-2 text-background/70">
              <Info size={16} />
              <span className="text-body-small uppercase tracking-widest">Editor Tip</span>
            </div>
            <p className="text-body-small text-background/80 leading-relaxed relative z-10">
              Use “Priority-Based” scheduling to ensure breaking news always takes the earliest available slot in your publish window.
            </p>
          </section>
        </div>
      </div>

      {operationalRuleModalOpen ? (
        <OperationalRuleModal
          onClose={onCloseOperationalRuleModal}
          onSave={(rule) => {
            void (async () => {
              await handleSaveOperationalRule(rule);
              onCloseOperationalRuleModal();
            })();
          }}
        />
      ) : null}
    </div>
  );
}
