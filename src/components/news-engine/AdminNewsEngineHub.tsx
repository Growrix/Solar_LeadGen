'use client';

import React from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  Hash,
  History,
  Layers,
  Loader2,
  MoreVertical,
  Plus,
  Pause,
  Play,
  RefreshCcw,
  RefreshCw,
  Rss,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Target,
  Type,
  MessageSquare,
  ListOrdered,
  BookOpen,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import Button from '@/components/Button';
import {
  type AuditLogEntry,
  type NewsEngineState,
  type NewsEngineTab,
  type NewsItem,
  type NewsSource,
  type PipelineStatus,
} from '@/lib/ui-stubs/news-engine';

import {
  adminCreateItem,
  adminDeleteItem,
  adminPurgeItem,
  adminPublishNow,
  adminReject,
  adminRunAutomationNow,
  adminRegenerateItem,
  adminRewriteRequest,
  adminSchedule,
  adminSetPipelineStatus,
  adminToggleSourceEnabled,
  adminUpdateSourcesConfig,
  fetchAdminSourcesConfig,
  adminUpdateAutomation,
  adminUpdateItem,
  adminUpdateSettings,
  adminUpsertSource,
  adminGenerateManualDraft,
  fetchAdminState,
} from '@/lib/news-engine/client';

import {
  formatDateTime,
  getPipelineBadgeClasses,
  getStatusBadgeClasses,
  isSameDay,
  useSavedIndicator,
  type DashboardDateRange,
  type DashboardFilterState,
  type DashboardSourceType,
} from './v6/shared';

import { DashboardTabV6 } from './v6/tabs/DashboardTab';
import { DraftsReviewsTabV6 } from './v6/tabs/DraftsReviewsTab';
import { AuditLogsTabV6 } from './v6/tabs/AuditLogsTab';
import { MasterControlTabV6 } from './v6/tabs/MasterControlTab';
import { AutomationLogicTabV6 } from './v6/tabs/AutomationLogicTab';
import { SourcesTabV6 } from './v6/tabs/SourcesTab';
import { SettingsTabV6 } from './v6/tabs/SettingsTab';

import { AddEditSourceModal } from './v6/modals/AddEditSourceModal';
import { AuditDateRangeModal, type AuditDateRange } from './v6/modals/AuditDateRangeModal';
import { AuditLogDetailsModal } from './v6/modals/AuditLogDetailsModal';
import { AutomationGuidelinesModal } from './v6/modals/AutomationGuidelinesModal';
import { ConfirmationModal } from './v6/modals/ConfirmationModal';
import { ManualDraftModalV6 } from './v6/modals/ManualDraftModal';
import { PromptDetailsModal } from './v6/modals/PromptDetailsModal';
import { RejectModal } from './v6/modals/RejectModal';
import { ReviewModalV6 } from './v6/modals/ReviewModal';
import { RewriteModal } from './v6/modals/RewriteModal';
import { ScheduleModal } from './v6/modals/ScheduleModal';
import { TestPreviewModal } from './v6/modals/TestPreviewModal';
import { RunDetailsModal, type AutomationRunModeV6, type AutomationRunUiV6 } from './v6/modals/RunDetailsModal';

const TABS: NewsEngineTab[] = [
  'Dashboard',
  'Drafts & Reviews',
  'Audit Logs',
  'Master Control',
  'Automation Logic',
  'Sources',
  'Settings',
];

// Dashboard filter types are shared via v6/shared.tsx to preserve identity across extracted tabs.

export default function AdminNewsEngineHub() {
  const [activeTab, setActiveTab] = React.useState<NewsEngineTab>('Dashboard');
  const [state, setState] = React.useState<NewsEngineState | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [rewriteOpen, setRewriteOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [testPreviewOpen, setTestPreviewOpen] = React.useState(false);
  const [promptDetailsOpen, setPromptDetailsOpen] = React.useState(false);
  const [promptDetailsLog, setPromptDetailsLog] = React.useState<AuditLogEntry | null>(null);

  const [manualDraftOpen, setManualDraftOpen] = React.useState(false);

  const [sourceModalOpen, setSourceModalOpen] = React.useState(false);
  const [editingSourceId, setEditingSourceId] = React.useState<string | null>(null);

  const [confirmationOpen, setConfirmationOpen] = React.useState(false);
  const [confirmationKind, setConfirmationKind] = React.useState<
    | { type: 'PUBLISH_NOW' }
    | { type: 'PAUSE' }
    | { type: 'RESUME' }
    | { type: 'EMERGENCY_STOP' }
    | { type: 'RUN_AUTOMATION_NOW' }
    | null
  >(null);

  const [auditDateRangeOpen, setAuditDateRangeOpen] = React.useState(false);
  const [auditDateRange, setAuditDateRange] = React.useState<AuditDateRange>(null);
  const [logDetailsOpen, setLogDetailsOpen] = React.useState(false);
  const [selectedLogForDetails, setSelectedLogForDetails] = React.useState<AuditLogEntry | null>(null);

  const [automationGuidelinesOpen, setAutomationGuidelinesOpen] = React.useState(false);

  const [operationalRuleModalOpen, setOperationalRuleModalOpen] = React.useState(false);

  const [masterControlRefreshNonce, setMasterControlRefreshNonce] = React.useState(0);

  const [pendingRunMode, setPendingRunMode] = React.useState<AutomationRunModeV6>('dry');
  const [automationRun, setAutomationRun] = React.useState<AutomationRunUiV6 | null>(null);
  const [runDetailsOpen, setRunDetailsOpen] = React.useState(false);

  const reloadState = React.useCallback(async () => {
    try {
      const loaded = await fetchAdminState();
      setState(loaded);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load News Engine');
    }
  }, []);

  const onRefreshHealth = React.useCallback(() => {
    setMasterControlRefreshNonce(Date.now());
    void reloadState();
  }, [reloadState]);

  const queueSnapshot = React.useMemo(() => {
    if (!state) return null;

    const draftsNeedingReview = state.items.filter((it) => it.status === 'NEEDS_REVIEW').length;
    const errors = state.items.filter((it) => it.status === 'ERROR').length;

    const now = Date.now();
    const dueSoonMs = 24 * 60 * 60 * 1000;
    const scheduledDueSoon = state.items.filter((it) => {
      if (it.status !== 'SCHEDULED') return false;
      const at = it.scheduledFor ? Date.parse(it.scheduledFor) : NaN;
      if (!Number.isFinite(at)) return false;
      return at >= now && at <= now + dueSoonMs;
    }).length;

    return {
      rssNewEntries: null as number | null,
      researchNewEntries: { WEB: null, SOCIAL: null, JOURNAL: null, TREND: null } as Record<
        'WEB' | 'SOCIAL' | 'JOURNAL' | 'TREND',
        number | null
      >,
      draftsNeedingReview,
      scheduledDueSoon,
      errors,
    };
  }, [state]);

  const sourcesSaved = useSavedIndicator();
  const automationSaved = useSavedIndicator();
  const settingsSaved = useSavedIndicator();

  React.useEffect(() => {
    void reloadState();
  }, [reloadState]);

  const selectedItem = React.useMemo(() => {
    if (!state || !selectedItemId) return null;
    return state.items.find((it) => it.id === selectedItemId) ?? null;
  }, [state, selectedItemId]);

  const openReviewForItem = React.useCallback(
    (itemId: string) => {
      setSelectedItemId(itemId);
      setReviewOpen(true);
    },
    [setSelectedItemId]
  );

  const openTestPreviewFromHeader = React.useCallback(() => {
    if (!state) return;
    const fallbackItem = state.items[0] ?? null;
    const nextId = selectedItemId ?? fallbackItem?.id ?? null;
    if (!nextId) return;
    setSelectedItemId(nextId);
    setTestPreviewOpen(true);
  }, [state, selectedItemId]);

  const openPauseFromHeader = React.useCallback(() => {
    setConfirmationKind({ type: 'PAUSE' });
    setConfirmationOpen(true);
  }, []);

  const openResumeFromHeader = React.useCallback(() => {
    setConfirmationKind({ type: 'RESUME' });
    setConfirmationOpen(true);
  }, []);

  const openPromptDetails = React.useCallback((log: AuditLogEntry) => {
    setPromptDetailsLog(log);
    setPromptDetailsOpen(true);
  }, []);

  const openLogDetails = React.useCallback((log: AuditLogEntry) => {
    setSelectedLogForDetails(log);
    setLogDetailsOpen(true);
  }, []);

  const ensureState: (s: NewsEngineState | null) => asserts s is NewsEngineState = (s) => {
    if (!s) throw new Error('News Engine state not loaded');
  };

  const items = React.useMemo(() => state?.items ?? [], [state]);

  const [dashboardSearchTerm, setDashboardSearchTerm] = React.useState('');
  const [dashboardFilters, setDashboardFilters] = React.useState<DashboardFilterState>({
    status: 'All',
    category: 'All',
    minScore: 0,
    dateRange: 'All Time',
    sourceType: 'All Types',
  });

  const [draftsBoardFilterTerm, setDraftsBoardFilterTerm] = React.useState('');

  const [sourcesResearchWeights, setSourcesResearchWeights] = React.useState({ web: 70, social: 30, journals: 50 });
  const [sourcesResearchEnabled, setSourcesResearchEnabled] = React.useState({ web: true, social: true, journals: true });
  const [sourcesRules, setSourcesRules] = React.useState({ deduplication: true, verifyPayload: false });
  const [sourcesMinSources, setSourcesMinSources] = React.useState(3);
  const [sourcesCountries, setSourcesCountries] = React.useState<string[]>(['USA', 'UK', 'Japan', 'Germany']);
  const [sourcesCountryInput, setSourcesCountryInput] = React.useState('');
  const [sourcesBlacklist, setSourcesBlacklist] = React.useState('');

  const sourcesConfigLoadedRef = React.useRef(false);
  const sourcesConfigHydratingRef = React.useRef(false);

  React.useEffect(() => {
    if (!state) return;
    if (sourcesConfigLoadedRef.current) return;

    void (async () => {
      sourcesConfigHydratingRef.current = true;
      try {
        const config = await fetchAdminSourcesConfig();
        setSourcesResearchWeights(config.researchWeights);
        setSourcesResearchEnabled(config.researchEnabled);
        setSourcesRules(config.rules);
        setSourcesMinSources(config.minSources);
        setSourcesCountries(config.countries);
        setSourcesBlacklist(config.blacklist);
      } catch (error) {
        console.error('❌ [NewsEngine Sources] Failed to load sources config:', error);
      } finally {
        sourcesConfigLoadedRef.current = true;
        window.setTimeout(() => {
          sourcesConfigHydratingRef.current = false;
        }, 0);
      }
    })();
  }, [state]);

  React.useEffect(() => {
    if (!state) return;
    if (!sourcesConfigLoadedRef.current) return;
    if (sourcesConfigHydratingRef.current) return;

    const timer = window.setTimeout(() => {
      void adminUpdateSourcesConfig({
        researchWeights: sourcesResearchWeights,
        researchEnabled: sourcesResearchEnabled,
        rules: sourcesRules,
        minSources: sourcesMinSources,
        countries: sourcesCountries,
        blacklist: sourcesBlacklist,
      }).catch((error) => {
        console.error('❌ [NewsEngine Sources] Failed to save sources config:', error);
      });
    }, 650);

    return () => window.clearTimeout(timer);
  }, [
    state,
    sourcesResearchWeights,
    sourcesResearchEnabled,
    sourcesRules,
    sourcesMinSources,
    sourcesCountries,
    sourcesBlacklist,
  ]);

  const dashboardCategories = React.useMemo(() => {
    const unique = Array.from(new Set(items.map((n) => n.category))).sort();
    return ['All', ...unique];
  }, [items]);

  const dashboardStatuses = React.useMemo(() => {
    const unique = Array.from(new Set(items.map((n) => n.status)));
    return ['All' as const, ...unique];
  }, [items]);

  const dashboardSourceTypes: DashboardSourceType[] = ['All Types', 'RSS Feed', 'AI Agent', 'Manual Entry'];
  const dashboardDateRanges: DashboardDateRange[] = ['All Time', 'Today', 'Yesterday', 'Last 7 Days'];

  const clearDashboardFilters = React.useCallback(() => {
    setDashboardSearchTerm('');
    setDashboardFilters({
      status: 'All',
      category: 'All',
      minScore: 0,
      dateRange: 'All Time',
      sourceType: 'All Types',
    });
  }, []);

  const filteredDashboardNews = React.useMemo(() => {
    const now = new Date();
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(dashboardSearchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(dashboardSearchTerm.toLowerCase());

      const matchesStatus = dashboardFilters.status === 'All' || item.status === dashboardFilters.status;
      const matchesCategory = dashboardFilters.category === 'All' || item.category === dashboardFilters.category;
      const matchesScore = item.relevanceScore >= dashboardFilters.minScore;
      const matchesSourceType =
        dashboardFilters.sourceType === 'All Types' || (item.sourceType ?? 'AI Agent') === dashboardFilters.sourceType;

      let matchesDate = true;
      if (dashboardFilters.dateRange !== 'All Time') {
        const d = new Date(item.createdAt);
        if (dashboardFilters.dateRange === 'Today') {
          matchesDate = isSameDay(d, now);
        } else if (dashboardFilters.dateRange === 'Yesterday') {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          matchesDate = isSameDay(d, yesterday);
        } else if (dashboardFilters.dateRange === 'Last 7 Days') {
          const cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 7);
          matchesDate = d >= cutoff;
        }
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesScore && matchesSourceType && matchesDate;
    });
  }, [dashboardFilters, dashboardSearchTerm, items]);

  const hasActiveDashboardFilters =
    dashboardSearchTerm !== '' ||
    dashboardFilters.status !== 'All' ||
    dashboardFilters.category !== 'All' ||
    dashboardFilters.minScore > 0 ||
    dashboardFilters.dateRange !== 'All Time' ||
    dashboardFilters.sourceType !== 'All Types';

  const draftsBoardColumns = React.useMemo(
    () =>
      [
        {
          key: 'RESEARCH_DONE' as const,
          label: 'Research Done',
          dotClass: 'bg-info',
        },
        {
          key: 'DRAFT_READY' as const,
          label: 'Draft Ready',
          dotClass: 'bg-accent',
        },
        {
          key: 'NEEDS_REVIEW' as const,
          label: 'Needs Review',
          dotClass: 'bg-warning',
        },
        {
          key: 'REJECTED' as const,
          label: 'Rejected',
          dotClass: 'bg-destructive',
        },
        {
          key: 'SCHEDULED' as const,
          label: 'Scheduled',
          dotClass: 'bg-success',
        },
        {
          key: 'PUBLISHED' as const,
          label: 'Published',
          dotClass: 'bg-muted-foreground',
        },
      ] satisfies Array<{
        key: NewsItem['status'];
        label: string;
        dotClass: string;
      }>,
    []
  );

  const draftsFilteredItems = React.useMemo(() => {
    const term = draftsBoardFilterTerm.trim().toLowerCase();
    return items.filter((item) => {
      const isBoardStatus =
        item.status === 'RESEARCH_DONE' ||
        item.status === 'DRAFT_READY' ||
        item.status === 'DRAFT' ||
        item.status === 'NEEDS_REVIEW' ||
        item.status === 'REJECTED' ||
        item.status === 'SCHEDULED' ||
        item.status === 'PUBLISHED';
      if (!isBoardStatus) return false;
      if (!term) return true;
      return (
        item.title.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.summary.toLowerCase().includes(term)
      );
    });
  }, [draftsBoardFilterTerm, items]);

  if (!state) {
    return (
      <div className="p-6">
        <div className="bg-surface rounded-2xl shadow-neu-outset p-10 text-center">
          <h1 className="text-heading-2 text-foreground">Loading News Engine…</h1>
          <p className="text-muted-foreground mt-2">Fetching admin state from the backend.</p>
          {loadError ? <p className="text-destructive mt-4 text-body">{loadError}</p> : null}
        </div>
      </div>
    );
  }

  const counts = {
    drafts: state.items.filter((it) => it.status === 'DRAFT' || it.status === 'DRAFT_READY').length,
    needsReview: state.items.filter((it) => it.status === 'NEEDS_REVIEW').length,
    scheduled: state.items.filter((it) => it.status === 'SCHEDULED').length,
    published: state.items.filter((it) => it.status === 'PUBLISHED').length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <h1 className="text-heading-1 text-foreground mb-2">News Engine</h1>
          <p className="text-heading-4 text-muted-foreground">Admin hub (UI-only, migration-safe semantics).</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="secondary" className="px-4 py-2" onClick={openTestPreviewFromHeader}>
            <span className="inline-flex items-center gap-2">
              <RefreshCcw size={16} />
              Test & Preview
            </span>
          </Button>
          <Button variant="primary" className="px-4 py-2" onClick={() => setManualDraftOpen(true)}>
            <span className="inline-flex items-center gap-2">
              <Sparkles size={16} />
              Create Manual Draft
            </span>
          </Button>
          {state.pipelineStatus === 'NOMINAL' ? (
            <Button variant="secondary" className="px-4 py-2" onClick={openPauseFromHeader}>
              <span className="inline-flex items-center gap-2">
                <Pause size={16} />
                Pause Automation
              </span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="px-4 py-2 border border-destructive/40 text-destructive"
              onClick={openResumeFromHeader}
            >
              <span className="inline-flex items-center gap-2">
                <Play size={16} />
                Resume Automation
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-neu-outset p-2 mb-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-body-small shadow-neu-outset transition-colors ${
                activeTab === tab ? 'bg-background text-foreground' : 'bg-surface text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Dashboard' ? (
        <DashboardTabV6
          state={state}
          dashboardSearchTerm={dashboardSearchTerm}
          setDashboardSearchTerm={setDashboardSearchTerm}
          dashboardFilters={dashboardFilters}
          setDashboardFilters={setDashboardFilters}
          dashboardStatuses={dashboardStatuses}
          dashboardCategories={dashboardCategories}
          dashboardSourceTypes={dashboardSourceTypes}
          dashboardDateRanges={dashboardDateRanges}
          clearDashboardFilters={clearDashboardFilters}
          hasActiveDashboardFilters={hasActiveDashboardFilters}
          filteredDashboardNews={filteredDashboardNews}
          openReviewForItem={openReviewForItem}
          openManualDraft={() => setManualDraftOpen(true)}
        />
      ) : null}

      <ManualDraftModalV6
        isOpen={manualDraftOpen}
        onClose={() => setManualDraftOpen(false)}
        onGenerate={async (data) => {
          ensureState(state);
          const nextTitle = data.title?.trim()
            ? data.title.trim()
            : `Draft: ${data.category} - ${new Date().toLocaleDateString()}`;

          try {
            const created = await adminGenerateManualDraft({
              title: nextTitle,
              prompt: data.prompt,
              category: data.category,
              tags: data.tags,
              outline: data.outline,
            });

            await reloadState();
            setManualDraftOpen(false);
            setActiveTab('Drafts & Reviews');
            openReviewForItem(created.id);
          } catch (error) {
            console.error('Failed to generate AI draft:', error);
            await reloadState();
            throw error;
          }
        }}
      />

      {activeTab === 'Drafts & Reviews' ? (
        <DraftsReviewsTabV6
          draftsBoardFilterTerm={draftsBoardFilterTerm}
          setDraftsBoardFilterTerm={setDraftsBoardFilterTerm}
          draftsBoardColumns={draftsBoardColumns}
          draftsFilteredItems={draftsFilteredItems}
          openReviewForItem={openReviewForItem}
          openManualDraft={() => setManualDraftOpen(true)}
        />
      ) : null}

      {activeTab === 'Audit Logs' ? (
        <AuditLogsTabV6
          auditLogs={state.auditLogs}
          openPromptDetails={openPromptDetails}
          openLogDetails={openLogDetails}
          dateRange={auditDateRange}
          onOpenDateRange={() => setAuditDateRangeOpen(true)}
        />
      ) : null}

      {activeTab === 'Master Control' ? (
        <MasterControlTabV6
          pipelineStatus={state.pipelineStatus}
          items={state.items}
          automationRun={automationRun}
          queueSnapshot={queueSnapshot}
          onOpenRunDetails={() => setRunDetailsOpen(true)}
          onNavigateToTab={(tab) => setActiveTab(tab)}
          refreshNonce={masterControlRefreshNonce}
          onRefreshHealth={onRefreshHealth}
          openRunAutomationNowConfirmation={(mode) => {
            setPendingRunMode(mode);
            setConfirmationKind({ type: 'RUN_AUTOMATION_NOW' });
            setConfirmationOpen(true);
          }}
          openPauseConfirmation={() => {
            setConfirmationKind({ type: 'PAUSE' });
            setConfirmationOpen(true);
          }}
          openResumeConfirmation={() => {
            setConfirmationKind({ type: 'RESUME' });
            setConfirmationOpen(true);
          }}
          openEmergencyStopConfirmation={() => {
            setConfirmationKind({ type: 'EMERGENCY_STOP' });
            setConfirmationOpen(true);
          }}
        />
      ) : null}

      {activeTab === 'Automation Logic' ? (
        <AutomationLogicTabV6
          state={state}
          setState={setState}
          automationSaved={automationSaved}
          onSave={async (payload: Parameters<typeof adminUpdateAutomation>[0]) => {
            try {
              await adminUpdateAutomation(payload);
            } finally {
              await reloadState();
            }
          }}
          onOpenGuidelines={() => setAutomationGuidelinesOpen(true)}
          operationalRuleModalOpen={operationalRuleModalOpen}
          onOpenOperationalRuleModal={() => setOperationalRuleModalOpen(true)}
          onCloseOperationalRuleModal={() => setOperationalRuleModalOpen(false)}
        />
      ) : null}

      {activeTab === 'Sources' ? (
        <SourcesTabV6
          state={state}
          setState={setState}
          sourcesSaved={sourcesSaved}
          onToggleSourceEnabled={async (sourceId, enabled) => {
            try {
              await adminToggleSourceEnabled(sourceId, enabled);
            } finally {
              await reloadState();
            }
          }}
          setEditingSourceId={setEditingSourceId}
          setSourceModalOpen={setSourceModalOpen}
          sourcesResearchEnabled={sourcesResearchEnabled}
          setSourcesResearchEnabled={setSourcesResearchEnabled}
          sourcesResearchWeights={sourcesResearchWeights}
          setSourcesResearchWeights={setSourcesResearchWeights}
          sourcesRules={sourcesRules}
          setSourcesRules={setSourcesRules}
          sourcesMinSources={sourcesMinSources}
          setSourcesMinSources={setSourcesMinSources}
          sourcesCountries={sourcesCountries}
          setSourcesCountries={setSourcesCountries}
          sourcesCountryInput={sourcesCountryInput}
          setSourcesCountryInput={setSourcesCountryInput}
          sourcesBlacklist={sourcesBlacklist}
          setSourcesBlacklist={setSourcesBlacklist}
        />
      ) : null}

      {activeTab === 'Settings' ? (
        <SettingsTabV6
          state={state}
          setState={setState}
          settingsSaved={settingsSaved}
          onSave={async (nextState) => {
            try {
              await adminUpdateSettings({ settings: nextState.settings });
            } finally {
              await reloadState();
            }
          }}
        />
      ) : null}

      <ReviewModalV6
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        item={selectedItem}
        auditLogs={state?.auditLogs ?? []}
        onApprove={() => {
          setReviewOpen(false);
          setScheduleOpen(true);
        }}
        onDelete={() => {
          if (!selectedItem) return;
          const isRejected = selectedItem.status === 'REJECTED';
          const confirmText = isRejected
            ? 'Delete this rejected item permanently? This cannot be undone.'
            : 'Delete this item? It will be moved to deleted state.';

          if (!window.confirm(confirmText)) return;

          void (async () => {
            try {
              if (isRejected) {
                await adminPurgeItem(selectedItem.id);
              } else {
                await adminDeleteItem(selectedItem.id);
              }
              setReviewOpen(false);
            } finally {
              await reloadState();
            }
          })();
        }}
        onPublish={() => {
          setConfirmationKind({ type: 'PUBLISH_NOW' });
          setConfirmationOpen(true);
        }}
        onRegenerate={() => {
          if (!selectedItem) return;
          if (selectedItem.status !== 'REJECTED') return;
          if (!window.confirm('Regenerate this rejected item with OpenAI and move it back to Draft Ready?')) return;

          void (async () => {
            try {
              await adminRegenerateItem(selectedItem.id);
            } finally {
              await reloadState();
            }
          })();
        }}
        onRestore={() => {
          if (!selectedItem) return;
          if (selectedItem.status !== 'REJECTED') return;

          void (async () => {
            try {
              await adminUpdateItem(selectedItem.id, { status: 'DRAFT_READY' });
              setReviewOpen(false);
            } finally {
              await reloadState();
            }
          })();
        }}
        onRewrite={() => {
          setReviewOpen(false);
          setRewriteOpen(true);
        }}
        onReject={() => {
          setReviewOpen(false);
          setRejectOpen(true);
        }}
        onSave={() => {
          if (!selectedItem) return;
          void (async () => {
            try {
              await adminUpdateItem(selectedItem.id, { status: 'DRAFT_READY' });
            } finally {
              await reloadState();
            }
          })();
        }}
      />

      {scheduleOpen && selectedItem ? (
        <ScheduleModal
          item={selectedItem}
          onClose={() => setScheduleOpen(false)}
          onSchedule={(iso) => {
            void (async () => {
              try {
                await adminSchedule(selectedItem.id, iso);
              } finally {
                await reloadState();
                setScheduleOpen(false);
              }
            })();
          }}
        />
      ) : null}

      {rewriteOpen && selectedItem ? (
        <RewriteModal
          item={selectedItem}
          onClose={() => {
            setRewriteOpen(false);
            setReviewOpen(true);
          }}
          onRewrite={(note) => {
            void (async () => {
              try {
                await adminRewriteRequest(selectedItem.id, note);
              } finally {
                await reloadState();
                setRewriteOpen(false);
                setReviewOpen(true);
              }
            })();
          }}
        />
      ) : null}

      {rejectOpen && selectedItem ? (
        <RejectModal
          item={selectedItem}
          onClose={() => {
            setRejectOpen(false);
            setReviewOpen(true);
          }}
          onReject={(reason) => {
            void (async () => {
              try {
                await adminReject(selectedItem.id, reason);
              } finally {
                await reloadState();
                setRejectOpen(false);
                setReviewOpen(true);
              }
            })();
          }}
        />
      ) : null}

      {testPreviewOpen && selectedItem ? (
        <TestPreviewModal
          item={selectedItem}
          onClose={() => setTestPreviewOpen(false)}
          onSaveToDrafts={(result) => {
            void (async () => {
              try {
                const created = await adminCreateItem({
                  title: result.title?.trim() ? result.title : `Draft: ${selectedItem.title}`,
                  summary: result.summary,
                  contentHtml: result.contentHtml,
                  category: selectedItem.category,
                  tags: selectedItem.tags,
                  status: 'DRAFT',
                  aiModel: selectedItem.aiModel,
                  relevanceScore: selectedItem.relevanceScore,
                  sourceType: selectedItem.sourceType,

                  seoTitle: result.seoTitle ?? null,
                  seoDescription: result.seoDescription ?? null,
                });

                await reloadState();
                setTestPreviewOpen(false);
                setActiveTab('Drafts & Reviews');
                openReviewForItem(created.id);
              } catch {
                await reloadState();
              }
            })();
          }}
          onSimulatePublish={() => {
            void (async () => {
              try {
                await adminPublishNow(selectedItem.id);
              } finally {
                await reloadState();
                setTestPreviewOpen(false);
                window.location.href = '/news';
              }
            })();
          }}
        />
      ) : null}

      {sourceModalOpen ? (
        <AddEditSourceModal
          source={editingSourceId ? state.sources.find((s) => s.id === editingSourceId) ?? null : null}
          onClose={() => {
            setSourceModalOpen(false);
            setEditingSourceId(null);
          }}
          onSave={(nextSource) => {
            ensureState(state);
            const exists = state.sources.some((s) => s.id === nextSource.id);
            void (async () => {
              try {
                await adminUpsertSource({
                  id: exists ? nextSource.id : undefined,
                  name: nextSource.name,
                  url: nextSource.url,
                  enabled: nextSource.enabled,
                });
                sourcesSaved.trigger();
              } finally {
                await reloadState();
                setSourceModalOpen(false);
                setEditingSourceId(null);
              }
            })();
          }}
        />
      ) : null}

      {promptDetailsOpen ? (
        <PromptDetailsModal
          log={promptDetailsLog}
          onClose={() => {
            setPromptDetailsOpen(false);
            setPromptDetailsLog(null);
          }}
        />
      ) : null}

      {confirmationOpen && confirmationKind ? (
        <ConfirmationModal
          kind={confirmationKind}
          item={selectedItem}
          onClose={() => {
            setConfirmationOpen(false);
            setConfirmationKind(null);
          }}
          onConfirm={async (typed) => {
            ensureState(state);
            try {
              if (confirmationKind.type === 'RUN_AUTOMATION_NOW') {
                const startedAt = new Date().toISOString();
                setAutomationRun({ status: 'running', mode: pendingRunMode, startedAt });

                const res = await adminRunAutomationNow();

                const payload = (res as any)?.payload;
                const runId = payload && typeof payload === 'object' && typeof (payload as any).runId === 'string' ? String((payload as any).runId) : undefined;

                setAutomationRun({
                  status: 'success',
                  mode: pendingRunMode,
                  startedAt,
                  finishedAt: new Date().toISOString(),
                  runId,
                  payload,
                });
                setConfirmationOpen(false);
                setConfirmationKind(null);
                await reloadState();
                return;
              }

              if (confirmationKind.type === 'PUBLISH_NOW') {
                if (!selectedItem) return;
                await adminPublishNow(selectedItem.id);
                setReviewOpen(false);
                setConfirmationOpen(false);
                setConfirmationKind(null);
                await reloadState();
                return;
              }

              if (confirmationKind.type === 'EMERGENCY_STOP' && typed !== 'LOCKDOWN') {
                return;
              }

              const nextStatus: PipelineStatus =
                confirmationKind.type === 'PAUSE'
                  ? 'PAUSED'
                  : confirmationKind.type === 'RESUME'
                    ? 'NOMINAL'
                    : 'EMERGENCY_STOP';

              await adminSetPipelineStatus(nextStatus);
              setConfirmationOpen(false);
              setConfirmationKind(null);
              await reloadState();
            } catch (error) {
              if (confirmationKind.type === 'RUN_AUTOMATION_NOW') {
                setAutomationRun((prev) => ({
                  status: 'failure',
                  mode: prev?.mode ?? pendingRunMode,
                  startedAt: prev?.startedAt ?? new Date().toISOString(),
                  finishedAt: new Date().toISOString(),
                  runId: prev?.runId,
                  payload: prev?.payload,
                  error: error instanceof Error ? error.message : 'Failed to run automation',
                }));
              }
              await reloadState();
              throw error;
            }
          }}
        />
      ) : null}

      {runDetailsOpen && automationRun ? (
        <RunDetailsModal
          run={automationRun}
          onClose={() => setRunDetailsOpen(false)}
        />
      ) : null}

      {auditDateRangeOpen ? (
        <AuditDateRangeModal
          dateRange={auditDateRange}
          onApply={(range) => {
            setAuditDateRange(range);
          }}
          onClose={() => setAuditDateRangeOpen(false)}
        />
      ) : null}

      {logDetailsOpen ? (
        <AuditLogDetailsModal
          log={selectedLogForDetails}
          onClose={() => {
            setLogDetailsOpen(false);
            setSelectedLogForDetails(null);
          }}
        />
      ) : null}

      {automationGuidelinesOpen ? (
        <AutomationGuidelinesModal
          onClose={() => {
            setAutomationGuidelinesOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
