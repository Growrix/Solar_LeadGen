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
import type { useSavedIndicator } from '../shared';
import { OperationalRuleModal, type OperationalRule } from '../modals/OperationalRuleModal';

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
    windows: ['09:00 - 11:00', '14:00 - 17:00'],
  }));

  const [slotDraft, setSlotDraft] = React.useState<{
    date: string;
    startTime: string;
    endTime: string;
    open: boolean;
  }>(() => {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return {
      date: `${yyyy}-${mm}-${dd}`,
      startTime: '09:00',
      endTime: '11:00',
      open: false,
    };
  });

  const [operationalRules, setOperationalRules] = React.useState(
    () =>
      [
        {
          id: 1,
          type: 'Limit',
          label: 'Max Stories Per Day',
          value: '15 Stories',
          desc: 'Prevents overwhelming the feed',
          isActive: true,
        },
        {
          id: 2,
          type: 'Filter',
          label: 'Global Blacklist',
          value: 'Active',
          desc: 'Keywords and phrases to never use',
          isActive: true,
        },
        {
          id: 3,
          type: 'Constraint',
          label: 'Draft Expiry',
          value: '48 Hours',
          desc: 'Auto-delete unreviewed old news',
          isActive: false,
        },
      ] as OperationalRule[]
  );

  const triggerSaved = React.useCallback(() => {
    automationSaved.trigger();
  }, [automationSaved]);

  const handleSaveOperationalRule = React.useCallback(
    (rule: OperationalRule) => {
      setOperationalRules((prev) => [rule, ...prev]);
      triggerSaved();
    },
    [triggerSaved]
  );

  const saveConfiguration = React.useCallback(() => {
    automationSaved.trigger();
    onSave?.({
      automation: state.automation,
      config: {
        minScore: config.minScore,
        strategy: config.strategy,
        windows: config.windows,
        operationalRules,
      },
    });
  }, [automationSaved, config.minScore, config.strategy, config.windows, onSave, operationalRules, state.automation]);

  const deleteRule = React.useCallback(
    (id: number) => {
      setOperationalRules((prev) => prev.filter((r) => r.id !== id));
      triggerSaved();
    },
    [triggerSaved]
  );

  const deleteWindow = React.useCallback(
    (index: number) => {
      setConfig((prev) => {
        const nextWindows = [...prev.windows];
        nextWindows.splice(index, 1);
        return { ...prev, windows: nextWindows };
      });
      triggerSaved();
    },
    [triggerSaved]
  );

  const addWindowSlot = React.useCallback(() => {
    const date = slotDraft.date.trim();
    const startTime = slotDraft.startTime.trim();
    const endTime = slotDraft.endTime.trim();
    if (!date || !startTime || !endTime) return;
    if (endTime <= startTime) return;

    const label = `${date} • ${startTime} - ${endTime}`;
    setConfig((prev) => ({ ...prev, windows: [...prev.windows, label] }));
    triggerSaved();
    setSlotDraft((prev) => ({ ...prev, open: false }));
  }, [slotDraft.date, slotDraft.startTime, slotDraft.endTime, triggerSaved]);

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
              {operationalRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-surface-hover transition-colors ${
                    !rule.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-neu-outset ${
                        rule.isActive ? 'bg-accent/10 text-brand-accent border-accent/20' : 'bg-surface text-muted-foreground border-border'
                      }`}
                    >
                      <Settings2 size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-body-small uppercase tracking-widest text-muted-foreground">{rule.type}</span>
                        <h5 className="text-body text-foreground">{rule.label}</h5>
                      </div>
                      <p className="text-body-small text-muted-foreground mt-0.5">{rule.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-body text-foreground">{rule.value}</span>
                    <Toggle
                      active={rule.isActive}
                      onChange={() => {
                        setOperationalRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r)));
                        triggerSaved();
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => deleteRule(rule.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
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
                Publish Windows
              </h3>
              <p className="text-body-small text-muted-foreground">Allowed time slots for automated scheduling.</p>
            </div>

            <div className="space-y-3">
              {config.windows.map((window, i) => (
                <div key={window} className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-body flex justify-between items-center">
                    {window}
                    <Clock size={14} className="text-muted-foreground" />
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteWindow(i)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete window"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {slotDraft.open ? (
                <div className="p-4 bg-surface border border-border rounded-xl shadow-neu-inset space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-body-small uppercase tracking-widest text-muted-foreground">Date</label>
                      <input
                        type="date"
                        value={slotDraft.date}
                        onChange={(e) => setSlotDraft((prev) => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-body-small uppercase tracking-widest text-muted-foreground">Start</label>
                        <input
                          type="time"
                          value={slotDraft.startTime}
                          onChange={(e) => setSlotDraft((prev) => ({ ...prev, startTime: e.target.value }))}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-body-small uppercase tracking-widest text-muted-foreground">End</label>
                        <input
                          type="time"
                          value={slotDraft.endTime}
                          onChange={(e) => setSlotDraft((prev) => ({ ...prev, endTime: e.target.value }))}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                    </div>
                  </div>

                  {slotDraft.endTime <= slotDraft.startTime ? (
                    <p className="text-body-small text-destructive">End time must be after start time.</p>
                  ) : null}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSlotDraft((prev) => ({ ...prev, open: false }))}
                      className="flex-1 px-4 py-3 text-body-small text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addWindowSlot}
                      disabled={
                        !slotDraft.date ||
                        !slotDraft.startTime ||
                        !slotDraft.endTime ||
                        slotDraft.endTime <= slotDraft.startTime
                      }
                      className={`flex-1 px-4 py-3 rounded-xl text-body-small uppercase tracking-widest shadow-neu-outset transition-colors ${
                        !slotDraft.date ||
                        !slotDraft.startTime ||
                        !slotDraft.endTime ||
                        slotDraft.endTime <= slotDraft.startTime
                          ? 'bg-border text-muted-foreground shadow-none cursor-not-allowed'
                          : 'bg-accent text-accent-foreground hover:opacity-95'
                      }`}
                    >
                      Add Slot
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setSlotDraft((prev) => ({ ...prev, open: !prev.open }));
                }}
                className="w-full py-2 border border-dashed border-border rounded-lg text-body-small text-muted-foreground hover:bg-surface transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={14} /> {slotDraft.open ? 'Close Picker' : 'Add Slot'}
              </button>
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
              disabled={automationSaved.status === 'saving'}
              className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-xl text-body shadow-neu-outset hover:bg-foreground/90 transition-colors active:scale-[0.98] disabled:opacity-50"
            >
              {automationSaved.status === 'saving' ? <Loader2 size={18} className="animate-spin" /> : null}
              {automationSaved.status === 'saved' ? <CheckCircle2 size={18} className="text-success" /> : null}
              {automationSaved.status === 'saved' ? 'Logic Persisted' : 'Save Configuration'}
            </button>
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
            handleSaveOperationalRule(rule);
            onCloseOperationalRuleModal();
          }}
        />
      ) : null}
    </div>
  );
}
