'use client';

import React from 'react';
import { Bell, Brain, CheckCircle2, Loader2, Save, Shield, Zap } from 'lucide-react';
import type { NewsEngineState } from '@/lib/ui-stubs/news-engine';
import {
  adminCreateModelProfile,
  adminCreateKeyVaultKey,
  adminGetAiRouterDefaults,
  adminGetKeyVaultState,
  adminListKeyVaultKeys,
  adminListModelProfiles,
  adminUpdateAiRouterDefaults,
  adminUpdateKeyVaultKey,
  adminUpdateModelProfile,
} from '@/lib/news-engine/client';
import type { useSavedIndicator } from '../shared';

type SavedIndicator = ReturnType<typeof useSavedIndicator>;

type Props = {
  state: NewsEngineState;
  setState: React.Dispatch<React.SetStateAction<NewsEngineState | null>>;
  settingsSaved: SavedIndicator;
  onSave?: (next: NewsEngineState) => Promise<void> | void;
};

export function SettingsTabV6({ state, setState, settingsSaved, onSave }: Props) {
  type KeyPool = 'Research' | 'Drafting' | 'Images';
  type KeyProvider = 'OpenAI' | 'Other';

  type KeyVaultEntry = {
    id: string;
    provider: KeyProvider;
    label: string;
    pool: KeyPool;
    enabled: boolean;
    maskedKey: string;
    lastSuccess?: string;
    lastError?: string;
    lastUsed?: string;
  };

  const [keyVault, setKeyVault] = React.useState<KeyVaultEntry[]>([]);

  const [isAddKeyOpen, setIsAddKeyOpen] = React.useState(false);
  const [editingKeyId, setEditingKeyId] = React.useState<string | null>(null);
  const [keyForm, setKeyForm] = React.useState<{
    provider: KeyProvider;
    label: string;
    pool: KeyPool;
    enabled: boolean;
    rawKey: string;
  }>({
    provider: 'OpenAI',
    label: '',
    pool: 'Research',
    enabled: true,
    rawKey: '',
  });

  const [modelProfiles, setModelProfiles] = React.useState<
    Array<{ id: string; displayName: string; provider: string; modelId: string; enabled: boolean }>
  >([]);

  const [isAddModelProfileOpen, setIsAddModelProfileOpen] = React.useState(false);
  const [editingModelProfileId, setEditingModelProfileId] = React.useState<string | null>(null);
  const [modelProfileForm, setModelProfileForm] = React.useState<{
    displayName: string;
    provider: string;
    modelId: string;
    enabled: boolean;
  }>({
    displayName: 'OpenAI o3-mini',
    provider: 'openai',
    modelId: 'o3-mini',
    enabled: true,
  });

  const [keyVaultMasterKeyConfigured, setKeyVaultMasterKeyConfigured] = React.useState(false);

  type AiRouterTaskType =
    | 'research_deep'
    | 'research_fast'
    | 'draft_longform'
    | 'rewrite'
    | 'seo'
    | 'dedup_semantic'
    | 'image_prompt'
    | 'image_generate';

  const AI_ROUTER_TASK_TYPES = React.useMemo<AiRouterTaskType[]>(
    () => [
      'research_deep',
      'research_fast',
      'draft_longform',
      'rewrite',
      'seo',
      'dedup_semantic',
      'image_prompt',
      'image_generate',
    ],
    []
  );

  const [aiRouterDefaults, setAiRouterDefaults] = React.useState<Record<AiRouterTaskType, string>>(() => {
    return {
      research_deep: '',
      research_fast: '',
      draft_longform: '',
      rewrite: '',
      seo: '',
      dedup_semantic: '',
      image_prompt: '',
      image_generate: '',
    };
  });

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [profiles, defaults, keyVaultState] = await Promise.all([
          adminListModelProfiles(),
          adminGetAiRouterDefaults(),
          adminGetKeyVaultState(),
        ]);
        if (cancelled) return;

        setModelProfiles(
          (profiles ?? []).map((p) => ({
            id: p.id,
            displayName: p.displayName,
            provider: p.provider,
            modelId: p.modelId,
            enabled: p.enabled,
          }))
        );

        setAiRouterDefaults((prev) => {
          const next = { ...prev };
          for (const t of AI_ROUTER_TASK_TYPES) {
            const v = (defaults as any)?.[t];
            next[t] = typeof v === 'string' ? v : '';
          }
          return next;
        });

        setKeyVaultMasterKeyConfigured(Boolean(keyVaultState?.masterKeyConfigured));

        setKeyVault(
          (keyVaultState?.keys ?? []).map((k) => ({
            id: k.id,
            provider: (k.provider as KeyProvider) ?? 'Other',
            label: k.label,
            pool: (k.pool as KeyPool) ?? 'Research',
            enabled: Boolean(k.enabled),
            maskedKey: k.maskedKey ?? '••••',
            lastSuccess: k.lastSuccessAt ?? '—',
            lastError: k.lastErrorAt ?? '—',
            lastUsed: k.lastUsedAt ?? '—',
          }))
        );
      } catch (err) {
        if (cancelled) return;
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [AI_ROUTER_TASK_TYPES]);

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
    void (async () => {
      try {
        await Promise.all([
          adminUpdateAiRouterDefaults({
            defaults: Object.fromEntries(
              AI_ROUTER_TASK_TYPES.map((t) => [t, aiRouterDefaults[t] ? aiRouterDefaults[t] : null])
            ) as any,
          }),
          onSave?.(state),
        ]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save configuration';
        window.alert(msg);
      }
    })();
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-32 relative">
      {isAddModelProfileOpen ? (
        <div className="fixed inset-0 z-[1700] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => {
              setIsAddModelProfileOpen(false);
              setEditingModelProfileId(null);
              setModelProfileForm({ displayName: 'OpenAI o3-mini', provider: 'openai', modelId: 'o3-mini', enabled: true });
            }}
          />
          <div className="relative w-full max-w-xl bg-background rounded-[28px] border border-border shadow-neu-outset overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-heading-3 text-foreground">{editingModelProfileId ? 'Update Model Profile' : 'Add Model Profile'}</h3>
              <p className="text-body text-muted-foreground">Used by the AI Router defaults.</p>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest">Display Name</label>
                <input
                  value={modelProfileForm.displayName}
                  onChange={(e) => setModelProfileForm((p) => ({ ...p, displayName: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest">Provider</label>
                <input
                  value={modelProfileForm.provider}
                  onChange={(e) => setModelProfileForm((p) => ({ ...p, provider: e.target.value }))}
                  placeholder="openai"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest">Model ID</label>
                <input
                  value={modelProfileForm.modelId}
                  onChange={(e) => setModelProfileForm((p) => ({ ...p, modelId: e.target.value }))}
                  placeholder="gpt-4o-mini"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-body text-foreground">Enabled</p>
                  <p className="text-body-small text-muted-foreground">Disabled profiles are not eligible for routing.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModelProfileForm((p) => ({ ...p, enabled: !p.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border ${
                    modelProfileForm.enabled ? 'bg-accent' : 'bg-surface'
                  }`}
                  aria-label="Toggle model profile enabled"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                      modelProfileForm.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    try {
                      const displayName = modelProfileForm.displayName.trim();
                      const provider = modelProfileForm.provider.trim();
                      const modelId = modelProfileForm.modelId.trim();
                      if (!displayName) throw new Error('Display Name is required');
                      if (!provider) throw new Error('Provider is required');
                      if (!modelId) throw new Error('Model ID is required');

                      if (!editingModelProfileId) {
                        await adminCreateModelProfile({
                          displayName,
                          provider,
                          modelId,
                          enabled: modelProfileForm.enabled,
                        });
                      } else {
                        await adminUpdateModelProfile(editingModelProfileId, {
                          displayName,
                          provider,
                          modelId,
                          enabled: modelProfileForm.enabled,
                        });
                      }

                      const profiles = await adminListModelProfiles();
                      setModelProfiles(
                        (profiles ?? []).map((p) => ({
                          id: p.id,
                          displayName: p.displayName,
                          provider: p.provider,
                          modelId: p.modelId,
                          enabled: p.enabled,
                        }))
                      );

                      settingsSaved.trigger();

                      setIsAddModelProfileOpen(false);
                      setEditingModelProfileId(null);
                      setModelProfileForm({ displayName: 'OpenAI o3-mini', provider: 'openai', modelId: 'o3-mini', enabled: true });
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : 'Failed to save model profile';
                      window.alert(msg);
                    }
                  })();
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-xl text-body shadow-neu-outset hover:bg-foreground/90 transition-colors active:scale-[0.98]"
              >
                <Save size={16} />
                Save Profile
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAddKeyOpen ? (
        <div className="fixed inset-0 z-[1700] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => {
              setIsAddKeyOpen(false);
              setEditingKeyId(null);
              setKeyForm({ provider: 'OpenAI', label: '', pool: 'Research', enabled: true, rawKey: '' });
            }}
          />
          <div className="relative w-full max-w-xl bg-background rounded-[28px] border border-border shadow-neu-outset overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-heading-3 text-foreground">{editingKeyId ? 'Update Key' : 'Add Key'}</h3>
              <p className="text-body text-muted-foreground">
                Raw keys are entered only on create/update and are never shown again.
              </p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest">Provider</label>
                <select
                  value={keyForm.provider}
                  onChange={(e) => setKeyForm((p) => ({ ...p, provider: e.target.value as KeyProvider }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                >
                  <option value="OpenAI">OpenAI</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest">Label</label>
                <input
                  value={keyForm.label}
                  onChange={(e) => setKeyForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. Research key 1"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest">Pool</label>
                <select
                  value={keyForm.pool}
                  onChange={(e) => setKeyForm((p) => ({ ...p, pool: e.target.value as KeyPool }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                >
                  <option value="Research">Research</option>
                  <option value="Drafting">Drafting</option>
                  <option value="Images">Images</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest">Raw Key</label>
                <input
                  type="password"
                  value={keyForm.rawKey}
                  onChange={(e) => setKeyForm((p) => ({ ...p, rawKey: e.target.value }))}
                  placeholder={editingKeyId ? 'Enter a new key to rotate (optional)' : 'Enter key (write-only)'}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                />
                <p className="text-body-small text-muted-foreground">This value is not stored in UI state after saving.</p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-body text-foreground">Enabled</p>
                  <p className="text-body-small text-muted-foreground">If disabled, this key will not be used for requests.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setKeyForm((p) => ({ ...p, enabled: !p.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border ${
                    keyForm.enabled ? 'bg-accent' : 'bg-surface'
                  }`}
                  aria-label="Toggle key enabled"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                      keyForm.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    try {
                      if (!keyVaultMasterKeyConfigured) {
                        throw new Error(
                          'Key Vault master key is not configured. Set NEWS_ENGINE_KEY_VAULT_MASTER_KEY and retry.'
                        );
                      }

                      const nextLabel = keyForm.label.trim() || 'Untitled key';

                      if (!editingKeyId) {
                        await adminCreateKeyVaultKey({
                          provider: keyForm.provider,
                          label: nextLabel,
                          pool: keyForm.pool,
                          enabled: keyForm.enabled,
                          rawKey: keyForm.rawKey,
                        });
                      } else {
                        await adminUpdateKeyVaultKey(editingKeyId, {
                          provider: keyForm.provider,
                          label: nextLabel,
                          pool: keyForm.pool,
                          enabled: keyForm.enabled,
                          ...(keyForm.rawKey.trim() ? { rawKey: keyForm.rawKey } : null),
                        });
                      }

                      const keyVaultState = await adminGetKeyVaultState();
                      setKeyVaultMasterKeyConfigured(Boolean(keyVaultState?.masterKeyConfigured));
                      setKeyVault(
                        (keyVaultState?.keys ?? []).map((k) => ({
                          id: k.id,
                          provider: (k.provider as KeyProvider) ?? 'Other',
                          label: k.label,
                          pool: (k.pool as KeyPool) ?? 'Research',
                          enabled: Boolean(k.enabled),
                          maskedKey: k.maskedKey ?? '••••',
                          lastSuccess: k.lastSuccessAt ?? '—',
                          lastError: k.lastErrorAt ?? '—',
                          lastUsed: k.lastUsedAt ?? '—',
                        }))
                      );

                      settingsSaved.trigger();

                      setIsAddKeyOpen(false);
                      setEditingKeyId(null);
                      setKeyForm({ provider: 'OpenAI', label: '', pool: 'Research', enabled: true, rawKey: '' });
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : 'Failed to save key';
                      window.alert(msg);
                    }
                  })();
                }}
                disabled={!keyVaultMasterKeyConfigured}
                className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-xl text-body shadow-neu-outset hover:bg-foreground/90 transition-colors active:scale-[0.98]"
              >
                <Save size={16} />
                Save Key
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
        title="AI Router"
        description="Choose default model profiles per task across the pipeline."
        icon={<Brain size={20} />}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-body text-foreground">Model profiles</p>
            <p className="text-body-small text-muted-foreground">Create, enable/disable, and edit profiles used by routing.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingModelProfileId(null);
              setModelProfileForm({ displayName: 'OpenAI o3-mini', provider: 'openai', modelId: 'o3-mini', enabled: true });
              setIsAddModelProfileOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-body shadow-neu-outset hover:bg-surface-hover transition-colors"
          >
            <Save size={16} />
            Add Profile
          </button>
        </div>

        <div className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 px-6 py-3 bg-surface border-b border-border">
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Name</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Provider</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Model</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Enabled</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest text-right">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {modelProfiles.map((p) => (
              <div key={p.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 px-6 py-4 bg-background">
                <div className="text-body text-foreground">{p.displayName}</div>
                <div className="text-body text-foreground">{p.provider}</div>
                <div className="text-body text-foreground">{p.modelId}</div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextEnabled = !p.enabled;
                      setModelProfiles((prev) => prev.map((it) => (it.id === p.id ? { ...it, enabled: nextEnabled } : it)));
                      settingsSaved.trigger();
                      void (async () => {
                        try {
                          await adminUpdateModelProfile(p.id, { enabled: nextEnabled });
                          const profiles = await adminListModelProfiles();
                          setModelProfiles(
                            (profiles ?? []).map((row) => ({
                              id: row.id,
                              displayName: row.displayName,
                              provider: row.provider,
                              modelId: row.modelId,
                              enabled: row.enabled,
                            }))
                          );
                        } catch (err) {
                          const msg = err instanceof Error ? err.message : 'Failed to update model profile';
                          window.alert(msg);
                        }
                      })();
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border ${
                      p.enabled ? 'bg-accent' : 'bg-surface'
                    }`}
                    aria-label="Toggle model profile enabled"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                        p.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-start justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingModelProfileId(p.id);
                      setModelProfileForm({
                        displayName: p.displayName,
                        provider: p.provider,
                        modelId: p.modelId,
                        enabled: p.enabled,
                      });
                      setIsAddModelProfileOpen(true);
                    }}
                    className="px-3 py-2 text-body-small text-brand-accent hover:bg-surface rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-body text-foreground">Default routing</p>
          <p className="text-body-small text-muted-foreground">Operational rules may override defaults</p>
        </div>

        <div className="space-y-3">
          {AI_ROUTER_TASK_TYPES.map((taskType) => (
            <div key={taskType} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-body text-foreground">{taskType}</p>
                <p className="text-body-small text-muted-foreground">Default model profile</p>
              </div>
              <select
                value={aiRouterDefaults[taskType]}
                onChange={(e) => {
                  const next = e.target.value;
                  setAiRouterDefaults((prev) => ({ ...prev, [taskType]: next }));
                  settingsSaved.trigger();
                }}
                className="w-full md:w-64 px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
              >
                <option value="">—</option>
                {modelProfiles.map((p) => (
                  <option key={p.id} value={p.id} disabled={!p.enabled}>
                    {p.displayName}{p.enabled ? '' : ' (disabled)'}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </SettingSection>

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
        title="Key Vault"
        description="Manage provider keys, pools, and health indicators (masked only)."
        icon={<Shield size={20} />}
      >
        {!keyVaultMasterKeyConfigured ? (
          <div className="bg-surface border border-border rounded-2xl shadow-neu-inset p-4">
            <p className="text-body text-foreground">Key Vault is locked (missing/invalid master key).</p>
            <p className="text-body-small text-muted-foreground">
              Configure `NEWS_ENGINE_KEY_VAULT_MASTER_KEY` to enable adding or editing keys.
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-body text-foreground">Keys</p>
            <p className="text-body-small text-muted-foreground">Raw keys are write-only and never displayed.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingKeyId(null);
              setKeyForm({ provider: 'OpenAI', label: '', pool: 'Research', enabled: true, rawKey: '' });
              setIsAddKeyOpen(true);
            }}
            disabled={!keyVaultMasterKeyConfigured}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-body shadow-neu-outset hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:hover:bg-surface"
          >
            <Save size={16} />
            Add Key
          </button>
        </div>

        <div className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 px-6 py-3 bg-surface border-b border-border">
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Provider</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Label</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Pool</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Enabled</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Health</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest text-right">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {keyVault.map((k) => (
              <div key={k.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 px-6 py-4 bg-background">
                <div className="text-body text-foreground">{k.provider}</div>
                <div className="space-y-1">
                  <div className="text-body text-foreground">{k.label}</div>
                  <div className="text-body-small text-muted-foreground">{k.maskedKey}</div>
                </div>
                <div>
                  <select
                    value={k.pool}
                    onChange={(e) => {
                      const nextPool = e.target.value as KeyPool;
                      setKeyVault((prev) => prev.map((it) => (it.id === k.id ? { ...it, pool: nextPool } : it)));
                      settingsSaved.trigger();
                      void (async () => {
                        try {
                          if (!keyVaultMasterKeyConfigured) {
                            throw new Error(
                              'Key Vault master key is not configured. Set NEWS_ENGINE_KEY_VAULT_MASTER_KEY and retry.'
                            );
                          }
                          await adminUpdateKeyVaultKey(k.id, { pool: nextPool });
                          const keyVaultState = await adminGetKeyVaultState();
                          setKeyVaultMasterKeyConfigured(Boolean(keyVaultState?.masterKeyConfigured));
                          setKeyVault(
                            (keyVaultState?.keys ?? []).map((row) => ({
                              id: row.id,
                              provider: (row.provider as KeyProvider) ?? 'Other',
                              label: row.label,
                              pool: (row.pool as KeyPool) ?? 'Research',
                              enabled: Boolean(row.enabled),
                              maskedKey: row.maskedKey ?? '••••',
                              lastSuccess: row.lastSuccessAt ?? '—',
                              lastError: row.lastErrorAt ?? '—',
                              lastUsed: row.lastUsedAt ?? '—',
                            }))
                          );
                        } catch (err) {
                          const msg = err instanceof Error ? err.message : 'Failed to update key';
                          window.alert(msg);
                        }
                      })();
                    }}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                  >
                    <option value="Research">Research</option>
                    <option value="Drafting">Drafting</option>
                    <option value="Images">Images</option>
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextEnabled = !k.enabled;
                      setKeyVault((prev) => prev.map((it) => (it.id === k.id ? { ...it, enabled: nextEnabled } : it)));
                      settingsSaved.trigger();
                      void (async () => {
                        try {
                          if (!keyVaultMasterKeyConfigured) {
                            throw new Error(
                              'Key Vault master key is not configured. Set NEWS_ENGINE_KEY_VAULT_MASTER_KEY and retry.'
                            );
                          }
                          await adminUpdateKeyVaultKey(k.id, { enabled: nextEnabled });
                          const keyVaultState = await adminGetKeyVaultState();
                          setKeyVaultMasterKeyConfigured(Boolean(keyVaultState?.masterKeyConfigured));
                          setKeyVault(
                            (keyVaultState?.keys ?? []).map((row) => ({
                              id: row.id,
                              provider: (row.provider as KeyProvider) ?? 'Other',
                              label: row.label,
                              pool: (row.pool as KeyPool) ?? 'Research',
                              enabled: Boolean(row.enabled),
                              maskedKey: row.maskedKey ?? '••••',
                              lastSuccess: row.lastSuccessAt ?? '—',
                              lastError: row.lastErrorAt ?? '—',
                              lastUsed: row.lastUsedAt ?? '—',
                            }))
                          );
                        } catch (err) {
                          const msg = err instanceof Error ? err.message : 'Failed to update key';
                          window.alert(msg);
                        }
                      })();
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border ${
                      k.enabled ? 'bg-accent' : 'bg-surface'
                    }`}
                    aria-label="Toggle key enabled"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                        k.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="text-body-small text-muted-foreground">Last success: {k.lastSuccess ?? '—'}</div>
                  <div className="text-body-small text-muted-foreground">Last error: {k.lastError ?? '—'}</div>
                  <div className="text-body-small text-muted-foreground">Last used: {k.lastUsed ?? '—'}</div>
                </div>
                <div className="flex items-start justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!keyVaultMasterKeyConfigured) {
                        window.alert('Key Vault master key is not configured. Set NEWS_ENGINE_KEY_VAULT_MASTER_KEY and retry.');
                        return;
                      }
                      setEditingKeyId(k.id);
                      setKeyForm({
                        provider: k.provider,
                        label: k.label,
                        pool: k.pool,
                        enabled: k.enabled,
                        rawKey: '',
                      });
                      setIsAddKeyOpen(true);
                    }}
                    className="px-3 py-2 text-body-small text-brand-accent hover:bg-surface rounded-lg transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
