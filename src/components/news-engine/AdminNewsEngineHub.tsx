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
  appendAuditLog,
  createDraftFromTitle,
  loadNewsEngineState,
  saveNewsEngineState,
  slugify,
  upsertItem,
  type AuditLogEntry,
  type NewsEngineState,
  type NewsEngineTab,
  type NewsItem,
  type NewsSource,
  type PipelineStatus,
} from '@/lib/ui-stubs/news-engine';

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
    | null
  >(null);

  const [auditDateRangeOpen, setAuditDateRangeOpen] = React.useState(false);
  const [auditDateRange, setAuditDateRange] = React.useState<AuditDateRange>(null);
  const [logDetailsOpen, setLogDetailsOpen] = React.useState(false);
  const [selectedLogForDetails, setSelectedLogForDetails] = React.useState<AuditLogEntry | null>(null);

  const [automationGuidelinesOpen, setAutomationGuidelinesOpen] = React.useState(false);

  const [operationalRuleModalOpen, setOperationalRuleModalOpen] = React.useState(false);

  const [masterControlRefreshNonce, setMasterControlRefreshNonce] = React.useState(0);

  const onRefreshHealth = React.useCallback(() => {
    setMasterControlRefreshNonce(Date.now());
    setState((prev) => {
      if (!prev) return prev;
      return appendAuditLog(prev, {
        timestamp: new Date().toISOString(),
        action: 'Health Check Refreshed',
        origin: 'admin',
        status: 'INFO',
      });
    });
  }, []);

  const sourcesSaved = useSavedIndicator();
  const automationSaved = useSavedIndicator();
  const settingsSaved = useSavedIndicator();

  React.useEffect(() => {
    const loaded = loadNewsEngineState();
    setState(loaded);
  }, []);

  React.useEffect(() => {
    if (!state) return;
    saveNewsEngineState(state);
  }, [state]);

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

  const setAndLog = React.useCallback((next: NewsEngineState, entry: Omit<AuditLogEntry, 'id'>) => {
    setState(appendAuditLog(next, entry));
  }, []);

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
          <p className="text-muted-foreground mt-2">Preparing UI-only state.</p>
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
        onGenerate={(data) => {
          ensureState(state);
          const nextTitle = data.title?.trim() ? data.title.trim() : `Draft: ${data.category} - ${new Date().toLocaleDateString()}`;
          const draft = {
            ...createDraftFromTitle(nextTitle, data.prompt),
            category: data.category,
            tags: data.tags,
            aiModel: 'gpt-5.2',
          } satisfies NewsItem;
          const next = { ...state, items: [draft, ...state.items] };
          setAndLog(next, {
            timestamp: new Date().toISOString(),
            action: 'Manual Draft Generated',
            origin: 'admin',
            status: 'INFO',
            promptUsed: data.prompt,
          });
          setManualDraftOpen(false);
          setActiveTab('Drafts & Reviews');
          openReviewForItem(draft.id);
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
          refreshNonce={masterControlRefreshNonce}
          onRefreshHealth={onRefreshHealth}
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
        <SettingsTabV6 state={state} setState={setState} settingsSaved={settingsSaved} />
      ) : null}

      <ReviewModalV6
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        item={selectedItem}
        onApprove={() => {
          setReviewOpen(false);
          setScheduleOpen(true);
        }}
        onPublish={() => {
          setConfirmationKind({ type: 'PUBLISH_NOW' });
          setConfirmationOpen(true);
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
          if (!selectedItem || !state) return;
          const nextItem = { ...selectedItem, status: 'DRAFT_READY' as const };
          const next = upsertItem(state, nextItem);
          setAndLog(next, {
            timestamp: new Date().toISOString(),
            action: 'Saved Edits',
            origin: 'admin',
            status: 'INFO',
          });
        }}
      />

      {scheduleOpen && selectedItem ? (
        <ScheduleModal
          item={selectedItem}
          onClose={() => setScheduleOpen(false)}
          onSchedule={(iso) => {
            ensureState(state);
            const nextItem: NewsItem = {
              ...selectedItem,
              status: 'SCHEDULED',
              scheduledFor: iso,
            };
            const next = upsertItem(state, nextItem);
            setAndLog(next, {
              timestamp: new Date().toISOString(),
              action: 'Scheduled Item',
              origin: 'admin',
              status: 'INFO',
            });
            setScheduleOpen(false);
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
            ensureState(state);
            const nextItem: NewsItem = {
              ...selectedItem,
              status: 'DRAFT',
            };
            const next = upsertItem(state, nextItem);
            setAndLog(next, {
              timestamp: new Date().toISOString(),
              action: 'Rewrite Requested',
              origin: 'admin',
              status: 'INFO',
              promptUsed: note,
            });
            setRewriteOpen(false);
            setReviewOpen(true);
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
            ensureState(state);
            const nextItem: NewsItem = {
              ...selectedItem,
              status: 'REJECTED',
            };
            const next = upsertItem(state, nextItem);
            setAndLog(next, {
              timestamp: new Date().toISOString(),
              action: `Rejected: ${reason}`,
              origin: 'admin',
              status: 'WARN',
            });
            setRejectOpen(false);
            setReviewOpen(true);
          }}
        />
      ) : null}

      {testPreviewOpen && selectedItem ? (
        <TestPreviewModal
          item={selectedItem}
          onClose={() => setTestPreviewOpen(false)}
          onSaveToDrafts={() => {
            ensureState(state);
            const newDraft = createDraftFromTitle(`Draft: ${selectedItem.title}`, selectedItem.summary);
            const next = { ...state, items: [newDraft, ...state.items] };
            setAndLog(next, {
              timestamp: new Date().toISOString(),
              action: 'Test & Preview: Saved to Drafts',
              origin: 'admin',
              status: 'INFO',
            });
            setTestPreviewOpen(false);
            setActiveTab('Drafts & Reviews');
            openReviewForItem(newDraft.id);
          }}
          onSimulatePublish={() => {
            ensureState(state);
            const publishedAt = new Date().toISOString();
            const slug = selectedItem.slug ?? slugify(selectedItem.title);
            const nextItem: NewsItem = {
              ...selectedItem,
              status: 'PUBLISHED',
              publishedAt,
              slug,
            };
            const next = upsertItem(state, nextItem);
            setAndLog(next, {
              timestamp: new Date().toISOString(),
              action: 'Test & Preview: Simulated Publish',
              origin: 'admin',
              status: 'INFO',
            });
            setTestPreviewOpen(false);
            window.location.href = '/news';
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
            const existingIndex = state.sources.findIndex((s) => s.id === nextSource.id);
            const nextSources = state.sources.slice();
            if (existingIndex === -1) {
              nextSources.unshift(nextSource);
            } else {
              nextSources[existingIndex] = nextSource;
            }
            const nextState = { ...state, sources: nextSources };
            setAndLog(nextState, {
              timestamp: new Date().toISOString(),
              action: existingIndex === -1 ? 'Source Added' : 'Source Updated',
              origin: 'admin',
              status: 'INFO',
            });
            sourcesSaved.trigger();
            setSourceModalOpen(false);
            setEditingSourceId(null);
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
          onConfirm={(typed) => {
            ensureState(state);
            if (confirmationKind.type === 'PUBLISH_NOW') {
              if (!selectedItem) return;
              if (typed !== 'PUBLISH') return;
              const publishedAt = new Date().toISOString();
              const slug = selectedItem.slug ?? slugify(selectedItem.title);
              const nextItem: NewsItem = { ...selectedItem, status: 'PUBLISHED', publishedAt, slug };
              const next = upsertItem(state, nextItem);
              setAndLog(next, {
                timestamp: new Date().toISOString(),
                action: 'Published Now',
                origin: 'admin',
                status: 'INFO',
              });
              setReviewOpen(false);
              setConfirmationOpen(false);
              setConfirmationKind(null);
              return;
            }

            if (confirmationKind.type === 'EMERGENCY_STOP') {
              if (typed !== 'LOCKDOWN') return;
            }

            const nextStatus: PipelineStatus =
              confirmationKind.type === 'PAUSE'
                ? 'PAUSED'
                : confirmationKind.type === 'RESUME'
                  ? 'NOMINAL'
                  : 'EMERGENCY_STOP';

            const next = { ...state, pipelineStatus: nextStatus };
            setAndLog(next, {
              timestamp: new Date().toISOString(),
              action:
                confirmationKind.type === 'PAUSE'
                  ? 'Pipeline Paused'
                  : confirmationKind.type === 'RESUME'
                    ? 'Pipeline Resumed'
                    : 'Emergency Stop Activated',
              origin: 'admin',
              status: confirmationKind.type === 'EMERGENCY_STOP' ? 'WARN' : 'INFO',
            });

            setConfirmationOpen(false);
            setConfirmationKind(null);
          }}
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
