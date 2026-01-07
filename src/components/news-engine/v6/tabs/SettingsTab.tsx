'use client';

import React from 'react';
import { Bell, Brain, CheckCircle2, Loader2, Save, Shield, Zap } from 'lucide-react';
import type { NewsEngineState } from '@/lib/ui-stubs/news-engine';
import type { useSavedIndicator } from '../shared';

type SavedIndicator = ReturnType<typeof useSavedIndicator>;

type Props = {
  state: NewsEngineState;
  setState: React.Dispatch<React.SetStateAction<NewsEngineState | null>>;
  settingsSaved: SavedIndicator;
  onSave?: (next: NewsEngineState) => Promise<void> | void;
};

export function SettingsTabV6({ state, setState, settingsSaved, onSave }: Props) {
  const [apiKey, setApiKey] = React.useState('ne_live_••••••••••••');

  const writingTone = state.settings.writingTone ?? 'Journalistic';
  const modelLabel = state.settings.modelLabel ?? 'OpenAI o3-mini';
  const dedupSensitivity = state.settings.dedupSensitivity ?? 85;
  const hallucinationMonitoring = state.settings.hallucinationMonitoring ?? true;
  const contentPreservation = state.settings.contentPreservation ?? true;
  const autoArchivePeriod = state.settings.autoArchivePeriod ?? '48 Hours';
  const emailAlerts = state.settings.emailAlerts ?? true;
  const weeklyDigest = state.settings.weeklyDigest ?? false;

  const SettingSection = ({
    title,
    description,
    icon,
    children,
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
      <div className="p-6 border-b border-border flex items-start gap-4">
        <div className="p-2.5 bg-surface text-brand-accent rounded-xl shadow-neu-inset">{icon}</div>
        <div>
          <h3 className="text-heading-3 text-foreground">{title}</h3>
          <p className="text-body text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </div>
  );

  const SettingRow = ({
    label,
    description,
    children,
  }: {
    label: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-body text-foreground">{label}</p>
        {description ? <p className="text-body-small text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  const Toggle = ({ active, onChange }: { active: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={() => {
        onChange();
        settingsSaved.trigger();
      }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border ${
        active ? 'bg-accent' : 'bg-surface'
      }`}
      aria-label="Toggle"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
          active ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const resetDefaults = () => {
    setApiKey('ne_live_••••••••••••');

    setState({
      ...state,
      settings: {
        regionLocale: 'AU',
        dailyLimit: 6,
        deduplicationEnabled: true,

        writingTone: 'Journalistic',
        modelLabel: 'OpenAI o3-mini',
        dedupSensitivity: 85,
        hallucinationMonitoring: true,
        contentPreservation: true,
        autoArchivePeriod: '48 Hours',
        emailAlerts: true,
        weeklyDigest: false,
      },
    });
    settingsSaved.trigger();
    onSave?.({
      ...state,
      settings: {
        regionLocale: 'AU',
        dailyLimit: 6,
        deduplicationEnabled: true,

        writingTone: 'Journalistic',
        modelLabel: 'OpenAI o3-mini',
        dedupSensitivity: 85,
        hallucinationMonitoring: true,
        contentPreservation: true,
        autoArchivePeriod: '48 Hours',
        emailAlerts: true,
        weeklyDigest: false,
      },
    });
  };

  const saveConfiguration = () => {
    settingsSaved.trigger();
    onSave?.(state);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-32 relative">
      {settingsSaved.status !== 'idle' ? (
        <div className="fixed bottom-24 right-8 z-[1600] flex items-center gap-3 px-4 py-3 bg-foreground text-background rounded-2xl shadow-neu-outset animate-in slide-in-from-bottom-4 duration-300">
          {settingsSaved.status === 'saving' ? (
            <>
              <Loader2 size={16} className="animate-spin text-brand-accent" />
              <span className="text-body-small uppercase tracking-widest">Syncing Config…</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} className="text-success" />
              <span className="text-body-small uppercase tracking-widest">Engine Updated</span>
            </>
          )}
        </div>
      ) : null}

      <SettingSection
        title="AI Personalization"
        description="Customize how the AI researches and writes stories across the pipeline."
        icon={<Brain size={20} />}
      >
        <SettingRow label="Writing Tone" description="The default personality for generated drafts.">
          <select
            value={writingTone}
            onChange={(e) => {
              setState({
                ...state,
                settings: {
                  ...state.settings,
                  writingTone: e.target.value,
                },
              });
              settingsSaved.trigger();
            }}
            className="w-full md:w-64 px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
          >
            <option>Journalistic</option>
            <option>Professional</option>
            <option>Casual & Engaging</option>
            <option>Technical</option>
            <option>Creative Narrative</option>
          </select>
        </SettingRow>

        <SettingRow label="Default Research Model" description="Higher models provide better accuracy but more latency.">
          <select
            value={modelLabel}
            onChange={(e) => {
              setState({
                ...state,
                settings: {
                  ...state.settings,
                  modelLabel: e.target.value,
                },
              });
              settingsSaved.trigger();
            }}
            className="w-full md:w-64 px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
          >
            <option>OpenAI o3-mini</option>
            <option>OpenAI gpt-4o-mini</option>
            <option>OpenAI gpt-4o</option>
          </select>
        </SettingRow>

        <SettingRow
          label="Hallucination Monitoring"
          description="Active cross-checking of generated facts against verified sources."
        >
          <Toggle
            active={hallucinationMonitoring}
            onChange={() =>
              setState({
                ...state,
                settings: {
                  ...state.settings,
                  hallucinationMonitoring: !hallucinationMonitoring,
                },
              })
            }
          />
        </SettingRow>
      </SettingSection>

      <SettingSection
        title="News Engine Settings"
        description="Global operational thresholds for the news pipeline engine."
        icon={<Zap size={20} />}
      >
        <SettingRow label="Region / Locale" description="Controls the default regional context.">
          <input
            className="w-full md:w-64 px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
            value={state.settings.regionLocale}
            onChange={(e) => {
              setState({ ...state, settings: { ...state.settings, regionLocale: e.target.value } });
              settingsSaved.trigger();
            }}
          />
        </SettingRow>

        <SettingRow label="Daily Limit" description="Max number of stories generated per day.">
          <input
            type="number"
            className="w-full md:w-64 px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
            value={state.settings.dailyLimit}
            onChange={(e) => {
              const v = Number(e.target.value);
              setState({ ...state, settings: { ...state.settings, dailyLimit: Number.isFinite(v) ? v : 0 } });
              settingsSaved.trigger();
            }}
          />
        </SettingRow>

        <SettingRow label="Deduplication Sensitivity" description="Controls how strictly the AI flags similar stories (85% recommended).">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={50}
              max={100}
              value={dedupSensitivity}
              onChange={(e) => {
                setState({
                  ...state,
                  settings: {
                    ...state.settings,
                    dedupSensitivity: parseInt(e.target.value, 10),
                  },
                });
                settingsSaved.trigger();
              }}
              className="w-48 h-1.5 bg-surface rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-body text-brand-accent w-12 text-right">{dedupSensitivity}%</span>
          </div>
        </SettingRow>

        <SettingRow label="Deduplication" description="Enable or disable deduplication rules.">
          <Toggle
            active={state.settings.deduplicationEnabled}
            onChange={() =>
              setState({
                ...state,
                settings: { ...state.settings, deduplicationEnabled: !state.settings.deduplicationEnabled },
              })
            }
          />
        </SettingRow>

        <SettingRow label="Content Preservation" description="Retain original source quotes and direct citations.">
          <Toggle
            active={contentPreservation}
            onChange={() =>
              setState({
                ...state,
                settings: {
                  ...state.settings,
                  contentPreservation: !contentPreservation,
                },
              })
            }
          />
        </SettingRow>

        <SettingRow label="Auto-Archive Period" description="How long unreviewed drafts remain in the queue.">
          <select
            value={autoArchivePeriod}
            onChange={(e) => {
              setState({
                ...state,
                settings: {
                  ...state.settings,
                  autoArchivePeriod: e.target.value,
                },
              });
              settingsSaved.trigger();
            }}
            className="w-full md:w-64 px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
          >
            <option>24 Hours</option>
            <option>48 Hours</option>
            <option>7 Days</option>
            <option>Never</option>
          </select>
        </SettingRow>
      </SettingSection>

      <SettingSection
        title="Notifications"
        description="Stay updated on system health and new story drafts."
        icon={<Bell size={20} />}
      >
        <SettingRow label="Email Alerts" description="Receive high-priority system alerts and pipeline errors.">
          <Toggle
            active={emailAlerts}
            onChange={() =>
              setState({
                ...state,
                settings: {
                  ...state.settings,
                  emailAlerts: !emailAlerts,
                },
              })
            }
          />
        </SettingRow>
        <SettingRow label="Weekly Digest" description="Summary of news volume and relevance scores.">
          <Toggle
            active={weeklyDigest}
            onChange={() =>
              setState({
                ...state,
                settings: {
                  ...state.settings,
                  weeklyDigest: !weeklyDigest,
                },
              })
            }
          />
        </SettingRow>
      </SettingSection>

      <SettingSection
        title="Security & API"
        description="Manage engine access and integration points."
        icon={<Shield size={20} />}
      >
        <SettingRow label="Engine API Key" description="Used for external automation and integration with the NewsEngine API.">
          <div className="flex items-center gap-2">
            <code className="bg-surface px-2 py-1 rounded text-body-small text-muted-foreground">{apiKey}</code>
            <button
              type="button"
              onClick={() => {
                setApiKey('ne_live_••••••••••••');
                settingsSaved.trigger();
              }}
              className="text-body-small text-brand-accent hover:bg-surface px-2 py-1 rounded transition-colors"
            >
              Regenerate
            </button>
          </div>
        </SettingRow>
      </SettingSection>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur border-t border-border px-8 py-4 flex items-center justify-end gap-3 z-40">
        <button
          type="button"
          onClick={resetDefaults}
          className="px-4 py-2 text-body text-muted-foreground hover:bg-surface rounded-lg transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          type="button"
          onClick={saveConfiguration}
          disabled={settingsSaved.status === 'saving'}
          className="flex items-center gap-2 px-8 py-2.5 bg-foreground text-background rounded-xl text-body shadow-neu-outset hover:bg-foreground/90 transition-colors active:scale-[0.98] disabled:opacity-50"
        >
          {settingsSaved.status === 'saving' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {settingsSaved.status === 'saved' ? 'Saved' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
