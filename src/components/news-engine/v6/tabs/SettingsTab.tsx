'use client';

import React from 'react';
import { Bell, Brain, CheckCircle2, Loader2, Save, Shield, Zap } from 'lucide-react';
import type { NewsEngineState } from '@/lib/ui-stubs/news-engine';
import {
  adminCreateModelProfile,
  adminCreateKeyVaultKey,
  adminBulkDeleteModelProfiles,
  adminGetAiRouterDefaults,
  adminGetKeyVaultState,
  adminListAiModels,
  adminListGeminiModels,
  adminListOpenAiModels,
  adminListKeyVaultKeys,
  adminListModelProfiles,
  adminUpdateSettings,
  adminUpdateAiRouterDefaults,
  adminDeleteKeyVaultKey,
  adminUpdateKeyVaultKey,
  adminUpdateModelProfile,
} from '@/lib/news-engine/client';
import type {
  AdminGeminiModelInfo,
  AdminGeminiModelsKeyUsed,
  AdminOpenAiModelInfo,
  AdminOpenAiModelsKeyUsed,
} from '@/lib/news-engine/client';
import { useSavedIndicator } from '../shared';

type SavedIndicator = ReturnType<typeof useSavedIndicator>;

type Props = {
  state: NewsEngineState;
  setState: React.Dispatch<React.SetStateAction<NewsEngineState | null>>;
  settingsSaved: SavedIndicator;
  onSave?: (next: NewsEngineState) => Promise<void> | void;
};

export function SettingsTabV6({ state, setState, settingsSaved, onSave }: Props) {
  type KeyPool = 'Research' | 'Drafting' | 'Images';
  type KeyProvider = string;

  const PROVIDER_OPTIONS = React.useMemo(
    () => [
      { id: 'openai', label: 'OpenAI' },
      { id: 'anthropic', label: 'Anthropic (Claude)' },
      { id: 'gemini', label: 'Google Gemini' },
      { id: 'vertexai', label: 'Google Vertex AI' },
      { id: 'deepseek', label: 'DeepSeek' },
      { id: 'xai', label: 'xAI' },
      { id: 'mistral', label: 'Mistral' },
      { id: 'cohere', label: 'Cohere' },
      { id: 'groq', label: 'Groq' },
      { id: 'together', label: 'Together.ai' },
      { id: 'fireworks', label: 'Fireworks' },
      { id: 'openrouter', label: 'OpenRouter' },
      { id: 'perplexity', label: 'Perplexity' },
      { id: 'azure-openai', label: 'Azure OpenAI' },
      { id: 'bedrock', label: 'AWS Bedrock' },
      { id: 'huggingface', label: 'Hugging Face' },
      { id: 'ollama', label: 'Ollama' },
      { id: 'other', label: 'Other' },
    ],
    []
  );

  const CUSTOM_PROVIDER_VALUE = '__custom__';

  const formatProviderLabel = React.useCallback(
    (providerId: string, providerLabel?: string | null) => {
      if (providerLabel && providerLabel.trim()) return providerLabel;
      const v = (providerId || '').trim().toLowerCase();
      const known = new Map(PROVIDER_OPTIONS.map((o) => [o.id, o.label] as const));
      return known.get(v) ?? (providerId || 'other');
    },
    [PROVIDER_OPTIONS]
  );

  type KeyVaultEntry = {
    id: string;
    provider: KeyProvider;
    providerLabel?: string;
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
    provider: 'openai',
    label: '',
    pool: 'Research',
    enabled: true,
    rawKey: '',
  });

  const keyFormProviderSelectValue = React.useMemo(() => {
    const current = (keyForm.provider || '').trim().toLowerCase();
    return PROVIDER_OPTIONS.some((o) => o.id === current) ? current : CUSTOM_PROVIDER_VALUE;
  }, [CUSTOM_PROVIDER_VALUE, PROVIDER_OPTIONS, keyForm.provider]);

  const isKeyFormCustomProvider = keyFormProviderSelectValue === CUSTOM_PROVIDER_VALUE;

  const [modelProfiles, setModelProfiles] = React.useState<
    Array<{ id: string; displayName: string; provider: string; modelId: string; enabled: boolean }>
  >([]);
  const [selectedModelProfileIds, setSelectedModelProfileIds] = React.useState<string[]>([]);

  const [isAddModelProfileOpen, setIsAddModelProfileOpen] = React.useState(false);
  const [editingModelProfileId, setEditingModelProfileId] = React.useState<string | null>(null);
  const [openAiModels, setOpenAiModels] = React.useState<AdminOpenAiModelInfo[]>([]);
  const [openAiModelsLoading, setOpenAiModelsLoading] = React.useState(false);
  const [openAiModelsError, setOpenAiModelsError] = React.useState<string | null>(null);
  const [openAiModelsWarnings, setOpenAiModelsWarnings] = React.useState<string[]>([]);
  const [openAiModelsKeysUsed, setOpenAiModelsKeysUsed] = React.useState<AdminOpenAiModelsKeyUsed[]>([]);
  const [openAiModelsKeySource, setOpenAiModelsKeySource] = React.useState<'key_vault' | 'env' | 'none'>('none');

  const [geminiModels, setGeminiModels] = React.useState<AdminGeminiModelInfo[]>([]);
  const [geminiModelsLoading, setGeminiModelsLoading] = React.useState(false);
  const [geminiModelsError, setGeminiModelsError] = React.useState<string | null>(null);
  const [geminiModelsWarnings, setGeminiModelsWarnings] = React.useState<string[]>([]);
  const [geminiModelsKeysUsed, setGeminiModelsKeysUsed] = React.useState<AdminGeminiModelsKeyUsed[]>([]);
  const [geminiModelsKeySource, setGeminiModelsKeySource] = React.useState<'key_vault' | 'env' | 'none'>('none');

  const [otherModels, setOtherModels] = React.useState<Array<{ id: string; type: string; label: string }>>([]);
  const [otherModelsLoading, setOtherModelsLoading] = React.useState(false);
  const [otherModelsError, setOtherModelsError] = React.useState<string | null>(null);
  const [otherModelsWarnings, setOtherModelsWarnings] = React.useState<string[]>([]);
  const [otherModelsKeysUsed, setOtherModelsKeysUsed] = React.useState<Array<{ source: string; id: string | null; label: string; pools: string[] }>>([]);
  const [otherModelsKeySource, setOtherModelsKeySource] = React.useState<'key_vault' | 'env' | 'none'>('none');
  const [modelProfileForm, setModelProfileForm] = React.useState<{
    provider: string;
    modelId: string;
    enabled: boolean;
  }>({
    provider: '',
    modelId: '',
    enabled: true,
  });

  const modelProfileProviderOptions = React.useMemo(() => {
    const enabledProviders = new Set(
      keyVault
        .filter((k) => k.enabled)
        .map((k) => (k.provider || '').trim().toLowerCase())
        .filter(Boolean)
    );

    const providerLabels = new Map<string, string>();
    for (const k of keyVault) {
      const id = (k.provider || '').trim().toLowerCase();
      if (!id) continue;
      providerLabels.set(id, formatProviderLabel(id, k.providerLabel));
    }

    const known = PROVIDER_OPTIONS.map((o) => ({ id: o.id, label: o.label }));
    const custom = Array.from(providerLabels.keys())
      .filter((id) => !known.some((k) => k.id === id))
      .map((id) => ({ id, label: providerLabels.get(id) ?? id }));

    const merged = [...known, ...custom].map((o) => ({
      id: o.id,
      label: o.label,
      hasEnabledKey: enabledProviders.has(o.id),
    }));

    merged.sort((a, b) => {
      if (a.hasEnabledKey !== b.hasEnabledKey) return a.hasEnabledKey ? -1 : 1;
      return a.label.localeCompare(b.label);
    });

    return merged;
  }, [PROVIDER_OPTIONS, formatProviderLabel, keyVault]);

  const selectedModelProfileProvider = (modelProfileForm.provider || '').trim().toLowerCase();
  const isModelProfileProviderOpenAi = selectedModelProfileProvider === 'openai';
  const isModelProfileProviderGemini = selectedModelProfileProvider === 'gemini';
  const isModelProfileProviderOther = Boolean(selectedModelProfileProvider) && !isModelProfileProviderOpenAi && !isModelProfileProviderGemini;

  const selectedOpenAiModelId = React.useMemo(() => {
    const candidate = (modelProfileForm.modelId || '').trim();
    if (!candidate) return '';
    return openAiModels.some((m) => m.id === candidate) ? candidate : '';
  }, [modelProfileForm.modelId, openAiModels]);

  const selectedGeminiModelId = React.useMemo(() => {
    const candidate = (modelProfileForm.modelId || '').trim();
    if (!candidate) return '';
    return geminiModels.some((m) => m.id === candidate) ? candidate : '';
  }, [modelProfileForm.modelId, geminiModels]);

  const selectedOtherModelId = React.useMemo(() => {
    const candidate = (modelProfileForm.modelId || '').trim();
    if (!candidate) return '';
    return otherModels.some((m) => m.id === candidate) ? candidate : '';
  }, [modelProfileForm.modelId, otherModels]);

  const modelProfileDisplayName = React.useMemo(() => {
    if (!selectedModelProfileProvider) return '';
    const providerLabel = formatProviderLabel(selectedModelProfileProvider, null);

    if (isModelProfileProviderOpenAi) {
      const selected = openAiModels.find((m) => m.id === selectedOpenAiModelId);
      return selected ? `${providerLabel} — ${selected.label}` : providerLabel;
    }

    if (isModelProfileProviderGemini) {
      const selected = geminiModels.find((m) => m.id === selectedGeminiModelId);
      return selected ? `${providerLabel} — ${selected.label}` : providerLabel;
    }

    const selected = otherModels.find((m) => m.id === selectedOtherModelId);
    return selected ? `${providerLabel} — ${selected.label}` : providerLabel;
  }, [
    formatProviderLabel,
    geminiModels,
    isModelProfileProviderGemini,
    isModelProfileProviderOpenAi,
    otherModels,
    selectedOtherModelId,
    openAiModels,
    selectedGeminiModelId,
    selectedModelProfileProvider,
    selectedOpenAiModelId,
  ]);

  const modelProfileProviderHasEnabledKey = React.useMemo(() => {
    if (!selectedModelProfileProvider) return false;
    return modelProfileProviderOptions.some((o) => o.id === selectedModelProfileProvider && o.hasEnabledKey);
  }, [modelProfileProviderOptions, selectedModelProfileProvider]);

  const modelProfileCanSave =
    Boolean(selectedModelProfileProvider) &&
    modelProfileProviderHasEnabledKey &&
    ((isModelProfileProviderOpenAi && !openAiModelsLoading && !openAiModelsError && Boolean(selectedOpenAiModelId)) ||
      (isModelProfileProviderGemini && !geminiModelsLoading && !geminiModelsError && Boolean(selectedGeminiModelId)) ||
      (isModelProfileProviderOther && !otherModelsLoading && !otherModelsError && Boolean(selectedOtherModelId))) &&
    Boolean(modelProfileDisplayName.trim());

  const closeModelProfileModal = React.useCallback(() => {
    setIsAddModelProfileOpen(false);
    setEditingModelProfileId(null);
    setModelProfileForm({ provider: '', modelId: '', enabled: true });
  }, []);

  const loadOpenAiModels = React.useCallback(async (input?: { refresh?: boolean }) => {
    try {
      setOpenAiModelsError(null);
      setOpenAiModelsLoading(true);
      const data = await adminListOpenAiModels({ refresh: Boolean(input?.refresh) });
      const ok = Boolean((data as any)?.ok);
      setOpenAiModels(Array.isArray((data as any)?.models) ? (data as any).models : []);
      setOpenAiModelsWarnings(Array.isArray((data as any)?.warnings) ? (data as any).warnings : []);
      setOpenAiModelsKeysUsed(Array.isArray((data as any)?.keysUsed) ? (data as any).keysUsed : []);
      setOpenAiModelsKeySource(
        (data as any)?.keySource === 'env' ? 'env' : (data as any)?.keySource === 'key_vault' ? 'key_vault' : 'none'
      );
      setOpenAiModelsError(ok ? null : ((data as any)?.error as string) || 'Failed to load OpenAI models');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load OpenAI models';
      setOpenAiModelsError(msg);
      setOpenAiModels([]);
      setOpenAiModelsWarnings([]);
      setOpenAiModelsKeysUsed([]);
      setOpenAiModelsKeySource('none');
    } finally {
      setOpenAiModelsLoading(false);
    }
  }, []);

  const loadGeminiModels = React.useCallback(async (input?: { refresh?: boolean }) => {
    try {
      setGeminiModelsError(null);
      setGeminiModelsLoading(true);
      const data = await adminListGeminiModels({ refresh: Boolean(input?.refresh) });
      const ok = Boolean((data as any)?.ok);
      setGeminiModels(Array.isArray((data as any)?.models) ? (data as any).models : []);
      setGeminiModelsWarnings(Array.isArray((data as any)?.warnings) ? (data as any).warnings : []);
      setGeminiModelsKeysUsed(Array.isArray((data as any)?.keysUsed) ? (data as any).keysUsed : []);
      setGeminiModelsKeySource(
        (data as any)?.keySource === 'env' ? 'env' : (data as any)?.keySource === 'key_vault' ? 'key_vault' : 'none'
      );
      setGeminiModelsError(ok ? null : ((data as any)?.error as string) || 'Failed to load Gemini models');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load Gemini models';
      setGeminiModelsError(msg);
      setGeminiModels([]);
      setGeminiModelsWarnings([]);
      setGeminiModelsKeysUsed([]);
      setGeminiModelsKeySource('none');
    } finally {
      setGeminiModelsLoading(false);
    }
  }, []);

  const loadOtherModels = React.useCallback(
    async (provider: string, input?: { refresh?: boolean }) => {
      try {
        setOtherModelsError(null);
        setOtherModelsLoading(true);

        const data = await adminListAiModels(provider, { refresh: Boolean(input?.refresh) });
        const ok = Boolean((data as any)?.ok);

        setOtherModels(Array.isArray((data as any)?.models) ? (data as any).models : []);
        setOtherModelsWarnings(Array.isArray((data as any)?.warnings) ? (data as any).warnings : []);
        setOtherModelsKeysUsed(Array.isArray((data as any)?.keysUsed) ? (data as any).keysUsed : []);
        setOtherModelsKeySource(
          (data as any)?.keySource === 'env' ? 'env' : (data as any)?.keySource === 'key_vault' ? 'key_vault' : 'none'
        );
        setOtherModelsError(ok ? null : ((data as any)?.error as string) || `Failed to load models for ${provider}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : `Failed to load models for ${provider}`;
        setOtherModelsError(msg);
        setOtherModels([]);
        setOtherModelsWarnings([]);
        setOtherModelsKeysUsed([]);
        setOtherModelsKeySource('none');
      } finally {
        setOtherModelsLoading(false);
      }
    },
    []
  );

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

  const AI_ROUTER_TASK_LABELS = React.useMemo<Record<AiRouterTaskType, string>>(
    () => ({
      research_deep: 'Deep Research Model',
      research_fast: 'Fast Research Model',
      draft_longform: 'Writing / Drafting Model',
      rewrite: 'Rewrite Model',
      seo: 'SEO Model',
      dedup_semantic: 'Deduplication Model',
      image_prompt: 'Image Prompt Model',
      image_generate: 'Image Generation Model',
    }),
    []
  );

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

  const autosaveReadyRef = React.useRef(false);
  const autosaveInFlightRef = React.useRef(false);
  const autosaveLastPersistedFingerprintRef = React.useRef<string | null>(null);
  const autosaveTimerRef = React.useRef<number | null>(null);

  const latestSettingsRef = React.useRef(state.settings);
  latestSettingsRef.current = state.settings;

  const latestAiRouterDefaultsRef = React.useRef(aiRouterDefaults);
  latestAiRouterDefaultsRef.current = aiRouterDefaults;

  const stableStringify = React.useCallback((value: unknown): string => {
    if (value === null || value === undefined) return JSON.stringify(value);
    if (typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(',')}]`;

    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
  }, []);

  const computeAutosaveFingerprint = React.useCallback(() => {
    return stableStringify({ settings: latestSettingsRef.current, aiRouterDefaults: latestAiRouterDefaultsRef.current });
  }, [stableStringify]);

  const persistSettingsAndDefaults = React.useCallback(
    async (input?: { triggerIndicator?: boolean }) => {
      const triggerIndicator = input?.triggerIndicator === true;
      const settings = latestSettingsRef.current;
      const defaults = latestAiRouterDefaultsRef.current;

      await Promise.all([
        adminUpdateSettings({ settings }),
        adminUpdateAiRouterDefaults({
          defaults: Object.fromEntries(AI_ROUTER_TASK_TYPES.map((t) => [t, defaults[t] ? defaults[t] : null])) as any,
        }),
      ]);

      autosaveLastPersistedFingerprintRef.current = computeAutosaveFingerprint();
      if (triggerIndicator) settingsSaved.trigger();
    },
    [AI_ROUTER_TASK_TYPES, computeAutosaveFingerprint, settingsSaved]
  );

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
            provider: (k.provider ?? 'other') as KeyProvider,
            providerLabel: formatProviderLabel(k.provider ?? 'other', k.providerLabel),
            label: k.label,
            pool: (k.pool as KeyPool) ?? 'Research',
            enabled: Boolean(k.enabled),
            maskedKey: k.maskedKey ?? '••••',
            lastSuccess: k.lastSuccessAt ?? '—',
            lastError: k.lastErrorAt ?? '—',
            lastUsed: k.lastUsedAt ?? '—',
          }))
        );

        autosaveReadyRef.current = true;
      } catch (err) {
        if (cancelled) return;
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [AI_ROUTER_TASK_TYPES, formatProviderLabel]);

  // Debounced autosave: persists settings + router defaults, but only when values actually change.
  React.useEffect(() => {
    if (!autosaveReadyRef.current) return;

     // Establish baseline on first run after initial load.
     if (autosaveLastPersistedFingerprintRef.current === null) {
       autosaveLastPersistedFingerprintRef.current = computeAutosaveFingerprint();
       return;
     }

     // Don't autosave while modal is open (keeps UI snappy).
     if (isAddModelProfileOpen) return;

     const currentFingerprint = computeAutosaveFingerprint();
     if (autosaveLastPersistedFingerprintRef.current === currentFingerprint) return;

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      void (async () => {
        try {
          if (autosaveInFlightRef.current) return;
          const latestFingerprint = computeAutosaveFingerprint();
          if (autosaveLastPersistedFingerprintRef.current === latestFingerprint) return;

          autosaveInFlightRef.current = true;
          await persistSettingsAndDefaults({ triggerIndicator: false });
        } catch (err) {
          console.error(err);
        } finally {
          autosaveInFlightRef.current = false;
        }
      })();
    }, 1400);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [aiRouterDefaults, computeAutosaveFingerprint, isAddModelProfileOpen, persistSettingsAndDefaults, state.settings]);

  React.useEffect(() => {
    if (!isAddModelProfileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModelProfileModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAddModelProfileOpen, closeModelProfileModal]);

  React.useEffect(() => {
    if (!isAddModelProfileOpen) return;
    if (!isModelProfileProviderOpenAi) return;
    if (openAiModels.length) return;
    void loadOpenAiModels();
  }, [isAddModelProfileOpen, isModelProfileProviderOpenAi, openAiModels.length, loadOpenAiModels]);

  React.useEffect(() => {
    if (!isAddModelProfileOpen) return;
    if (!isModelProfileProviderGemini) return;
    if (geminiModels.length) return;
    void loadGeminiModels();
  }, [isAddModelProfileOpen, geminiModels.length, isModelProfileProviderGemini, loadGeminiModels]);

  React.useEffect(() => {
    if (!isAddModelProfileOpen) return;
    if (!isModelProfileProviderOther) return;
    if (!selectedModelProfileProvider) return;
    if (otherModels.length) return;
    void loadOtherModels(selectedModelProfileProvider);
  }, [isAddModelProfileOpen, isModelProfileProviderOther, loadOtherModels, otherModels.length, selectedModelProfileProvider]);

  React.useEffect(() => {
    if (!isAddModelProfileOpen) return;
    if (!isModelProfileProviderOpenAi) return;
    const current = (modelProfileForm.modelId || '').trim();
    if (!current) return;
    if (openAiModels.some((m) => m.id === current)) return;
    setModelProfileForm((p) => ({ ...p, modelId: '' }));
  }, [isAddModelProfileOpen, isModelProfileProviderOpenAi, modelProfileForm.modelId, openAiModels]);

  React.useEffect(() => {
    if (!isAddModelProfileOpen) return;
    if (!isModelProfileProviderGemini) return;
    const current = (modelProfileForm.modelId || '').trim();
    if (!current) return;
    if (geminiModels.some((m) => m.id === current)) return;
    setModelProfileForm((p) => ({ ...p, modelId: '' }));
  }, [isAddModelProfileOpen, geminiModels, isModelProfileProviderGemini, modelProfileForm.modelId]);

  React.useEffect(() => {
    if (!isAddModelProfileOpen) return;
    if (!isModelProfileProviderOther) return;
    const current = (modelProfileForm.modelId || '').trim();
    if (!current) return;
    if (otherModels.some((m) => m.id === current)) return;
    setModelProfileForm((p) => ({ ...p, modelId: '' }));
  }, [isAddModelProfileOpen, isModelProfileProviderOther, modelProfileForm.modelId, otherModels]);

  React.useEffect(() => {
    if (!modelProfiles.length) {
      setSelectedModelProfileIds([]);
      return;
    }
    setSelectedModelProfileIds((prev) => prev.filter((id) => modelProfiles.some((p) => p.id === id)));
  }, [modelProfiles]);

  const writingTone = state.settings.writingTone ?? 'Journalistic';
  const aiInputPrompt = state.settings.aiInputPrompt ?? '';
  const dedupSensitivity = state.settings.dedupSensitivity ?? 85;
  const hallucinationMonitoring = state.settings.hallucinationMonitoring ?? true;
  const contentPreservation = state.settings.contentPreservation ?? true;
  const autoArchivePeriod = state.settings.autoArchivePeriod ?? '48 Hours';
  const emailAlerts = state.settings.emailAlerts ?? true;
  const weeklyDigest = state.settings.weeklyDigest ?? false;

  const activeModelProfiles = React.useMemo(() => {
    const enabledProviders = new Set(
      keyVault
        .filter((k) => k.enabled)
        .map((k) => (k.provider || '').trim().toLowerCase())
        .filter(Boolean)
    );
    return modelProfiles.filter((p) => p.enabled && enabledProviders.has((p.provider || '').trim().toLowerCase()));
  }, [keyVault, modelProfiles]);

  const modelProfileLabelById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const p of modelProfiles) {
      map.set(p.id, p.displayName);
    }
    return map;
  }, [modelProfiles]);

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
    const nextSettings = {
      ...state.settings,
      regionLocale: 'AU',
      dailyLimit: 6,
      deduplicationEnabled: true,

      writingTone: 'Journalistic',
      aiInputPrompt: '',
      dedupSensitivity: 85,
      hallucinationMonitoring: true,
      contentPreservation: true,
      autoArchivePeriod: '48 Hours',
      emailAlerts: true,
      weeklyDigest: false,
    };

    setState({
      ...state,
      settings: nextSettings,
    });
    void (async () => {
      try {
        await Promise.all([
          adminUpdateSettings({ settings: nextSettings }),
          adminUpdateAiRouterDefaults({
            defaults: Object.fromEntries(
              AI_ROUTER_TASK_TYPES.map((t) => [t, aiRouterDefaults[t] ? aiRouterDefaults[t] : null])
            ) as any,
          }),
        ]);

        settingsSaved.trigger();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to reset settings';
        window.alert(msg);
      }
    })();
  };

  const saveConfiguration = () => {
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

        settingsSaved.trigger();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save configuration';
        window.alert(msg);
      }
    })();
  };

  const allModelProfilesSelected = modelProfiles.length > 0 && selectedModelProfileIds.length === modelProfiles.length;

  const toggleAllModelProfiles = () => {
    if (allModelProfilesSelected) {
      setSelectedModelProfileIds([]);
    } else {
      setSelectedModelProfileIds(modelProfiles.map((p) => p.id));
    }
  };

  const toggleModelProfile = (id: string) => {
    setSelectedModelProfileIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const deleteModelProfiles = (ids: string[]) => {
    if (!ids.length) return;
    const label = ids.length === 1 ? 'this model profile' : `${ids.length} model profiles`;
    if (!window.confirm(`Delete ${label} permanently? This cannot be undone and will clear any AI Router defaults pointing to them.`)) return;
    void (async () => {
      try {
        await adminBulkDeleteModelProfiles(ids);
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
        setSelectedModelProfileIds([]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete model profiles';
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
            onClick={closeModelProfileModal}
          />
          <div className="relative w-full max-w-xl bg-background rounded-[28px] border border-border shadow-neu-outset overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between gap-4">
              <div>
                <h3 className="text-heading-3 text-foreground">{editingModelProfileId ? 'Update Model Profile' : 'Add Model Profile'}</h3>
                <p className="text-body text-muted-foreground">Used by the AI Router defaults.</p>
              </div>
              <button
                type="button"
                onClick={closeModelProfileModal}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface"
                aria-label="Close model profile modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest">Display Name</label>
                <div className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body text-foreground">
                  {modelProfileDisplayName || '—'}
                </div>
                <p className="text-body-small text-muted-foreground">Auto-generated from Provider + Model.</p>
              </div>

              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest">Provider</label>
                <select
                  value={modelProfileForm.provider}
                  onChange={(e) => {
                    const next = e.target.value;
                    setModelProfileForm((p) => ({ ...p, provider: next, modelId: '' }));
                    setOpenAiModelsError(null);
                    setGeminiModelsError(null);
                    setOtherModelsError(null);
                    setOtherModels([]);
                    setOtherModelsWarnings([]);
                    setOtherModelsKeysUsed([]);
                    setOtherModelsKeySource('none');
                  }}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                >
                  <option value="">— Select a provider —</option>
                  {(() => {
                    const current = (modelProfileForm.provider || '').trim().toLowerCase();
                    const hasCurrent = current ? modelProfileProviderOptions.some((o) => o.id === current) : true;
                    if (!current || hasCurrent) return null;
                    return (
                      <option value={current} disabled>
                        Current: {current} (no enabled key)
                      </option>
                    );
                  })()}
                  {modelProfileProviderOptions.map((o) => (
                    <option key={o.id} value={o.id} disabled={!o.hasEnabledKey}>
                      {o.label}
                      {!o.hasEnabledKey ? ' (add/enable a key in Key Vault)' : ''}
                    </option>
                  ))}
                </select>
                {!modelProfileProviderHasEnabledKey && selectedModelProfileProvider ? (
                  <p className="text-body-small text-primary">
                    Add/enable a {formatProviderLabel(selectedModelProfileProvider, null)} key in Key Vault to use this provider.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest">Model ID</label>
                {isModelProfileProviderOpenAi ? (
                  <div className="space-y-2">
                    <select
                      value={selectedOpenAiModelId}
                      onChange={(e) => setModelProfileForm((p) => ({ ...p, modelId: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                      disabled={openAiModelsLoading || Boolean(openAiModelsError) || !modelProfileProviderHasEnabledKey}
                    >
                      {openAiModelsLoading ? <option value="">Loading models…</option> : <option value="">— Select an OpenAI model —</option>}
                      {openAiModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label} — {m.id}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-body-small text-muted-foreground">
                        Pulled live from OpenAI (server-side). Source: {openAiModelsKeySource === 'key_vault' ? 'Key Vault' : openAiModelsKeySource === 'env' ? 'OPENAI_API_KEY' : 'None'}
                      </p>
                      <button
                        type="button"
                        onClick={() => void loadOpenAiModels({ refresh: true })}
                        className="px-3 py-1.5 rounded-lg border border-border bg-surface text-body-small text-foreground hover:bg-surface/70"
                      >
                        Refresh
                      </button>
                    </div>

                    {openAiModelsKeysUsed.length ? (
                      <p className="text-body-small text-muted-foreground">
                        Keys used: {openAiModelsKeysUsed.map((k) => k.label).join(', ')}
                      </p>
                    ) : null}

                    {openAiModelsWarnings.length ? (
                      <div className="space-y-1">
                        {openAiModelsWarnings.map((w, idx) => (
                          <p key={idx} className="text-body-small text-primary">
                            {w}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {openAiModelsError ? <p className="text-body-small text-destructive">{openAiModelsError}</p> : null}
                    {!openAiModelsLoading && !openAiModelsError && !openAiModels.length ? (
                      <p className="text-body-small text-primary">
                        No models were returned. This usually means the key has insufficient permissions or the account has limited access.
                      </p>
                    ) : null}
                  </div>
                ) : isModelProfileProviderGemini ? (
                  <div className="space-y-2">
                    <select
                      value={selectedGeminiModelId}
                      onChange={(e) => setModelProfileForm((p) => ({ ...p, modelId: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                      disabled={geminiModelsLoading || Boolean(geminiModelsError) || !modelProfileProviderHasEnabledKey}
                    >
                      {geminiModelsLoading ? <option value="">Loading models…</option> : <option value="">— Select a Gemini model —</option>}
                      {geminiModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label} — {m.id}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-body-small text-muted-foreground">
                        Pulled live from Gemini (server-side). Source: {geminiModelsKeySource === 'key_vault' ? 'Key Vault' : geminiModelsKeySource === 'env' ? 'GEMINI_API_KEY' : 'None'}
                      </p>
                      <button
                        type="button"
                        onClick={() => void loadGeminiModels({ refresh: true })}
                        className="px-3 py-1.5 rounded-lg border border-border bg-surface text-body-small text-foreground hover:bg-surface/70"
                      >
                        Refresh
                      </button>
                    </div>

                    {geminiModelsKeysUsed.length ? (
                      <p className="text-body-small text-muted-foreground">
                        Keys used: {geminiModelsKeysUsed.map((k) => k.label).join(', ')}
                      </p>
                    ) : null}

                    {geminiModelsWarnings.length ? (
                      <div className="space-y-1">
                        {geminiModelsWarnings.map((w, idx) => (
                          <p key={idx} className="text-body-small text-primary">
                            {w}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {geminiModelsError ? <p className="text-body-small text-destructive">{geminiModelsError}</p> : null}
                    {!geminiModelsLoading && !geminiModelsError && !geminiModels.length ? (
                      <p className="text-body-small text-primary">
                        No models were returned. This usually means the key is invalid or the project/account has restricted access.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedOtherModelId}
                      onChange={(e) => setModelProfileForm((p) => ({ ...p, modelId: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                      disabled={
                        !selectedModelProfileProvider ||
                        !modelProfileProviderHasEnabledKey ||
                        otherModelsLoading ||
                        Boolean(otherModelsError)
                      }
                    >
                      {otherModelsLoading ? (
                        <option value="">Loading models…</option>
                      ) : (
                        <option value="">— Select a model —</option>
                      )}
                      {otherModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label} — {m.id}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-body-small text-muted-foreground">
                        Pulled server-side from provider (OpenAI-compatible /v1/models). Source:{' '}
                        {otherModelsKeySource === 'key_vault'
                          ? 'Key Vault'
                          : otherModelsKeySource === 'env'
                            ? 'Env'
                            : 'None'}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          selectedModelProfileProvider
                            ? void loadOtherModels(selectedModelProfileProvider, { refresh: true })
                            : undefined
                        }
                        className="px-3 py-1.5 rounded-lg border border-border bg-surface text-body-small text-foreground hover:bg-surface/70"
                        disabled={!selectedModelProfileProvider}
                      >
                        Refresh
                      </button>
                    </div>

                    {otherModelsKeysUsed.length ? (
                      <p className="text-body-small text-muted-foreground">
                        Keys used: {otherModelsKeysUsed.map((k) => k.label).join(', ')}
                      </p>
                    ) : null}

                    {otherModelsWarnings.length ? (
                      <div className="space-y-1">
                        {otherModelsWarnings.map((w, idx) => (
                          <p key={idx} className="text-body-small text-primary">
                            {w}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {otherModelsError ? <p className="text-body-small text-destructive">{otherModelsError}</p> : null}
                    {!otherModelsLoading && !otherModelsError && !otherModels.length ? (
                      <p className="text-body-small text-primary">
                        No models were returned. Ensure the provider base URL env var is configured and the key has permissions.
                      </p>
                    ) : null}
                  </div>
                )}
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
                disabled={!modelProfileCanSave}
                onClick={() => {
                  void (async () => {
                    try {
                      const provider = selectedModelProfileProvider;
                      const modelId = (
                        isModelProfileProviderOpenAi
                          ? selectedOpenAiModelId
                          : isModelProfileProviderGemini
                            ? selectedGeminiModelId
                            : selectedOtherModelId
                      ).trim();
                      const displayName = modelProfileDisplayName.trim();
                      if (!provider) throw new Error('Provider is required');
                      if (!modelId) throw new Error('Model is required');
                      if (!displayName) throw new Error('Display name could not be generated');

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

                      closeModelProfileModal();
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : 'Failed to save model profile';
                      window.alert(msg);
                    }
                  })();
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-xl text-body shadow-neu-outset hover:bg-foreground/90 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-foreground"
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
              setKeyForm({ provider: 'openai', label: '', pool: 'Research', enabled: true, rawKey: '' });
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
                  value={keyFormProviderSelectValue}
                  onChange={(e) => {
                    const next = e.target.value;
                    setKeyForm((p) => ({ ...p, provider: next === CUSTOM_PROVIDER_VALUE ? '' : next }));
                  }}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                >
                  {PROVIDER_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                  <option value={CUSTOM_PROVIDER_VALUE}>Custom…</option>
                </select>

                {isKeyFormCustomProvider ? (
                  <input
                    value={keyForm.provider}
                    onChange={(e) => setKeyForm((p) => ({ ...p, provider: e.target.value }))}
                    placeholder="e.g. deepseek, gemini, anthropic"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                  />
                ) : null}
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
                      const nextProvider = keyForm.provider.trim();
                      if (!nextProvider) throw new Error('Provider is required');

                      if (!editingKeyId) {
                        await adminCreateKeyVaultKey({
                          provider: nextProvider,
                          label: nextLabel,
                          pool: keyForm.pool,
                          enabled: keyForm.enabled,
                          rawKey: keyForm.rawKey,
                        });
                      } else {
                        await adminUpdateKeyVaultKey(editingKeyId, {
                          provider: nextProvider,
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
                          provider: (k.provider ?? 'other') as KeyProvider,
                          providerLabel: formatProviderLabel(k.provider ?? 'other', k.providerLabel),
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
                      setKeyForm({ provider: 'openai', label: '', pool: 'Research', enabled: true, rawKey: '' });
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
        description="Manage Model Profiles used by AI routing."
        icon={<Brain size={20} />}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-body text-foreground">Model profiles</p>
            <p className="text-body-small text-muted-foreground">Create, enable/disable, and edit profiles used by routing.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => deleteModelProfiles(selectedModelProfileIds)}
              disabled={!selectedModelProfileIds.length}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-body shadow-neu-outset hover:bg-surface-hover transition-colors disabled:opacity-50"
            >
              Delete Selected
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingModelProfileId(null);
                const preferred =
                  modelProfileProviderOptions.find((o) => o.hasEnabledKey && o.id === 'openai') ??
                  modelProfileProviderOptions.find((o) => o.hasEnabledKey) ??
                  null;
                setModelProfileForm({ provider: preferred?.id ?? '', modelId: '', enabled: true });
                setIsAddModelProfileOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-body shadow-neu-outset hover:bg-surface-hover transition-colors"
            >
              <Save size={16} />
              Add Profile
            </button>
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 px-6 py-3 bg-surface border-b border-border">
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">
              <input
                type="checkbox"
                checked={allModelProfilesSelected}
                onChange={toggleAllModelProfiles}
                aria-label="Select all model profiles"
              />
            </div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Name</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Provider</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Model</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest">Enabled</div>
            <div className="text-body-small text-muted-foreground uppercase tracking-widest text-right">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {modelProfiles.map((p) => (
              <div key={p.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 px-6 py-4 bg-background">
                <div>
                  <input
                    type="checkbox"
                    checked={selectedModelProfileIds.includes(p.id)}
                    onChange={() => toggleModelProfile(p.id)}
                    aria-label={`Select model profile ${p.displayName}`}
                  />
                </div>
                <div className="text-body text-foreground">{p.displayName}</div>
                <div className="text-body text-foreground">{p.provider}</div>
                <div className="text-body text-foreground">{p.modelId}</div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextEnabled = !p.enabled;
                      setModelProfiles((prev) => prev.map((it) => (it.id === p.id ? { ...it, enabled: nextEnabled } : it)));
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

                          settingsSaved.trigger();
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
                <div className="flex items-start justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingModelProfileId(p.id);
                      setModelProfileForm({
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
                  <button
                    type="button"
                    onClick={() => deleteModelProfiles([p.id])}
                    className="px-3 py-2 text-body-small text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
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

        <div className="space-y-1">
          <p className="text-body text-foreground">AI Models</p>
          <p className="text-body-small text-muted-foreground">These are the same AI Router defaults used by automation (saved in the database).</p>
        </div>

        <div className="space-y-4">
          {AI_ROUTER_TASK_TYPES.map((taskType) => {
            const current = aiRouterDefaults[taskType];
            const currentIsActive = current ? activeModelProfiles.some((p) => p.id === current) : true;
            return (
              <SettingRow
                key={taskType}
                label={AI_ROUTER_TASK_LABELS[taskType] ?? taskType}
                description={`Default model profile for ${taskType}. Only active models are shown.`}
              >
                <select
                  value={current}
                  onChange={(e) => {
                    const next = e.target.value;
                    setAiRouterDefaults((prev) => ({ ...prev, [taskType]: next }));
                  }}
                  className="w-full md:w-80 px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                >
                  <option value="">—</option>
                  {current && !currentIsActive ? (
                    <option value={current} disabled>
                      Current (inactive): {modelProfileLabelById.get(current) ?? current}
                    </option>
                  ) : null}
                  {activeModelProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName}
                    </option>
                  ))}
                </select>
              </SettingRow>
            );
          })}
        </div>

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

        <SettingRow
          label="Input Prompt"
          description="Optional extra instructions appended to the AI drafting prompt (saved to the database)."
        >
          <textarea
            value={aiInputPrompt}
            onChange={(e) => {
              setState({
                ...state,
                settings: {
                  ...state.settings,
                  aiInputPrompt: e.target.value,
                },
              });
            }}
            rows={4}
            placeholder="e.g. Focus on AU homeowner incentives; keep tone concise; avoid speculation."
            className="w-full md:w-[28rem] px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground resize-y"
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
              setKeyForm({ provider: 'openai', label: '', pool: 'Research', enabled: true, rawKey: '' });
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
                <div className="text-body text-foreground">{k.providerLabel ?? formatProviderLabel(k.provider)}</div>
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
                              provider: (row.provider ?? 'other') as KeyProvider,
                              providerLabel: formatProviderLabel(row.provider ?? 'other', row.providerLabel),
                              label: row.label,
                              pool: (row.pool as KeyPool) ?? 'Research',
                              enabled: Boolean(row.enabled),
                              maskedKey: row.maskedKey ?? '••••',
                              lastSuccess: row.lastSuccessAt ?? '—',
                              lastError: row.lastErrorAt ?? '—',
                              lastUsed: row.lastUsedAt ?? '—',
                            }))
                          );

                          settingsSaved.trigger();
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
                              provider: (row.provider ?? 'other') as KeyProvider,
                              providerLabel: formatProviderLabel(row.provider ?? 'other', row.providerLabel),
                              label: row.label,
                              pool: (row.pool as KeyPool) ?? 'Research',
                              enabled: Boolean(row.enabled),
                              maskedKey: row.maskedKey ?? '••••',
                              lastSuccess: row.lastSuccessAt ?? '—',
                              lastError: row.lastErrorAt ?? '—',
                              lastUsed: row.lastUsedAt ?? '—',
                            }))
                          );

                          settingsSaved.trigger();
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
                <div className="flex items-start justify-end gap-2">
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

                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm(`Remove key "${k.label}"? This cannot be undone.`)) return;
                      void (async () => {
                        try {
                          await adminDeleteKeyVaultKey(k.id);
                          const keyVaultState = await adminGetKeyVaultState();
                          setKeyVaultMasterKeyConfigured(Boolean(keyVaultState?.masterKeyConfigured));
                          setKeyVault(
                            (keyVaultState?.keys ?? []).map((row) => ({
                              id: row.id,
                              provider: (row.provider ?? 'other') as KeyProvider,
                              providerLabel: formatProviderLabel(row.provider ?? 'other', row.providerLabel),
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
                          const msg = err instanceof Error ? err.message : 'Failed to remove key';
                          window.alert(msg);
                        }
                      })();
                    }}
                    className="px-3 py-2 text-body-small text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    Remove
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
