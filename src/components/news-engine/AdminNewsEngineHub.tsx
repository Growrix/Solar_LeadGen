'use client';

import React from 'react';
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
  type PipelineStatus,
} from '@/lib/ui-stubs/news-engine';

const TABS: NewsEngineTab[] = [
  'Dashboard',
  'Drafts & Reviews',
  'Audit Logs',
  'Master Control',
  'Automation Logic',
  'Sources',
  'Settings',
];

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function getStatusBadgeClasses(status: NewsItem['status']): string {
  const base = 'px-3 py-1 rounded-full text-body-small';
  const map: Record<NewsItem['status'], string> = {
    DRAFT: 'bg-surface text-muted-foreground',
    NEEDS_REVIEW: 'bg-warning text-warning-foreground',
    DRAFT_READY: 'bg-surface text-foreground',
    RESEARCH_DONE: 'bg-surface text-muted-foreground',
    SCHEDULED: 'bg-warning text-warning-foreground',
    PUBLISHED: 'bg-success text-success-foreground',
    REJECTED: 'bg-destructive text-destructive-foreground',
    ERROR: 'bg-destructive text-destructive-foreground',
  };
  return `${base} ${map[status]}`;
}

function getPipelineBadgeClasses(status: PipelineStatus): string {
  const base = 'px-3 py-1 rounded-full text-body-small';
  const map: Record<PipelineStatus, string> = {
    NOMINAL: 'bg-success text-success-foreground',
    PAUSED: 'bg-warning text-warning-foreground',
    EMERGENCY_STOP: 'bg-destructive text-destructive-foreground',
  };
  return `${base} ${map[status]}`;
}

function ModalShell({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 1600 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-surface rounded-2xl shadow-neu-outset w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div>
            <h2 className="text-heading-2 text-foreground">{title}</h2>
            {description ? <p className="text-body-small text-muted-foreground mt-1">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-background text-muted-foreground shadow-neu-outset hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function useSavedIndicator() {
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');

  const trigger = React.useCallback(() => {
    setStatus('saving');
    window.setTimeout(() => setStatus('saved'), 350);
    window.setTimeout(() => setStatus('idle'), 1200);
  }, []);

  return { status, trigger };
}

export default function AdminNewsEngineHub() {
  const [activeTab, setActiveTab] = React.useState<NewsEngineTab>('Dashboard');
  const [state, setState] = React.useState<NewsEngineState | null>(null);

  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [rewriteOpen, setRewriteOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [manualDraftOpen, setManualDraftOpen] = React.useState(false);
  const [testPreviewOpen, setTestPreviewOpen] = React.useState(false);
  const [promptDetailsOpen, setPromptDetailsOpen] = React.useState(false);

  const [confirmationOpen, setConfirmationOpen] = React.useState(false);
  const [confirmationKind, setConfirmationKind] = React.useState<
    | { type: 'PUBLISH_NOW' }
    | { type: 'PAUSE' }
    | { type: 'RESUME' }
    | { type: 'EMERGENCY_STOP' }
    | null
  >(null);

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

  const ensureState = (s: NewsEngineState | null): asserts s is NewsEngineState => {
    if (!s) throw new Error('News Engine state not loaded');
  };

  const setAndLog = React.useCallback((next: NewsEngineState, entry: Omit<AuditLogEntry, 'id'>) => {
    setState(appendAuditLog(next, entry));
  }, []);

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
          <Button variant="secondary" className="px-4 py-2" onClick={() => window.location.href = '/news'}>
            View Public News
          </Button>
          <Button
            variant="primary"
            className="px-4 py-2"
            onClick={() => {
              setManualDraftOpen(true);
            }}
          >
            Manual Draft
          </Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
            <h2 className="text-heading-3 text-foreground">Pipeline</h2>
            <div className="mt-4 flex items-center justify-between">
              <span className={getPipelineBadgeClasses(state.pipelineStatus)}>{state.pipelineStatus}</span>
              <span className="text-body-small text-muted-foreground">UI-only</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-background rounded-2xl shadow-neu-inset p-4">
                <div className="text-body-small text-muted-foreground">Drafts</div>
                <div className="text-heading-2 text-foreground mt-1">{counts.drafts}</div>
              </div>
              <div className="bg-background rounded-2xl shadow-neu-inset p-4">
                <div className="text-body-small text-muted-foreground">Needs Review</div>
                <div className="text-heading-2 text-foreground mt-1">{counts.needsReview}</div>
              </div>
              <div className="bg-background rounded-2xl shadow-neu-inset p-4">
                <div className="text-body-small text-muted-foreground">Scheduled</div>
                <div className="text-heading-2 text-foreground mt-1">{counts.scheduled}</div>
              </div>
              <div className="bg-background rounded-2xl shadow-neu-inset p-4">
                <div className="text-body-small text-muted-foreground">Published</div>
                <div className="text-heading-2 text-foreground mt-1">{counts.published}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-surface rounded-2xl shadow-neu-outset p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-heading-3 text-foreground">Recent Items</h2>
              <Button variant="secondary" className="px-4 py-2" onClick={() => setActiveTab('Drafts & Reviews')}>
                Go to Drafts
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {state.items.slice(0, 6).map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => openReviewForItem(it.id)}
                  className="w-full text-left bg-background rounded-2xl shadow-neu-outset p-4 hover:shadow-neu-inset transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-foreground text-body">{it.title}</div>
                      <div className="text-body-small text-muted-foreground mt-1">{it.summary}</div>
                    </div>
                    <span className={getStatusBadgeClasses(it.status)}>{it.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'Drafts & Reviews' ? (
        <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-heading-3 text-foreground">Drafts & Reviews</h2>
              <p className="text-muted-foreground mt-1">Click any card to open Review.</p>
            </div>
            <Button variant="secondary" className="px-4 py-2" onClick={() => setManualDraftOpen(true)}>
              New Manual Draft
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {state.items
              .filter((it) => it.status !== 'PUBLISHED')
              .map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => openReviewForItem(it.id)}
                  className="text-left bg-background rounded-2xl shadow-neu-outset p-5 hover:shadow-neu-inset transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={getStatusBadgeClasses(it.status)}>{it.status}</span>
                    <span className="text-body-small text-muted-foreground">{it.relevanceScore}</span>
                  </div>
                  <div className="mt-3 text-foreground text-body">{it.title}</div>
                  <div className="mt-2 text-muted-foreground text-body-small">{it.summary}</div>
                  <div className="mt-4 text-body-small text-muted-foreground">Created {formatDateTime(it.createdAt)}</div>
                </button>
              ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'Audit Logs' ? (
        <div className="bg-surface rounded-2xl shadow-neu-outset overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-heading-3 text-foreground">Audit Logs</h2>
            <p className="text-muted-foreground mt-1">Click Prompt to open Prompt Details when available.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-surface shadow-neu-inset">
                <tr>
                  <th className="px-6 py-4 text-left text-body-small text-muted-foreground">Time</th>
                  <th className="px-6 py-4 text-left text-body-small text-muted-foreground">Action</th>
                  <th className="px-6 py-4 text-left text-body-small text-muted-foreground">Origin</th>
                  <th className="px-6 py-4 text-right text-body-small text-muted-foreground">Prompt</th>
                </tr>
              </thead>
              <tbody>
                {state.auditLogs.map((log) => (
                  <tr key={log.id} className="border-t border-border hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4 text-body-small text-muted-foreground">{formatDateTime(log.timestamp)}</td>
                    <td className="px-6 py-4 text-body text-foreground">{log.action}</td>
                    <td className="px-6 py-4 text-body-small text-muted-foreground">{log.origin}</td>
                    <td className="px-6 py-4 text-right">
                      {log.promptUsed ? (
                        <Button
                          variant="secondary"
                          className="px-4 py-2"
                          onClick={() => {
                            (window as any).__newsEnginePrompt = log.promptUsed;
                            setPromptDetailsOpen(true);
                          }}
                        >
                          Prompt
                        </Button>
                      ) : (
                        <span className="text-body-small text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === 'Master Control' ? (
        <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-heading-3 text-foreground">Master Control</h2>
              <p className="text-muted-foreground mt-1">Global pipeline controls (UI-only).</p>
            </div>
            <span className={getPipelineBadgeClasses(state.pipelineStatus)}>{state.pipelineStatus}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="px-4 py-2"
              onClick={() => {
                setConfirmationKind({ type: 'PAUSE' });
                setConfirmationOpen(true);
              }}
            >
              Pause
            </Button>
            <Button
              variant="secondary"
              className="px-4 py-2"
              onClick={() => {
                setConfirmationKind({ type: 'RESUME' });
                setConfirmationOpen(true);
              }}
            >
              Resume
            </Button>
            <Button
              variant="secondary"
              className="px-4 py-2"
              onClick={() => {
                setConfirmationKind({ type: 'EMERGENCY_STOP' });
                setConfirmationOpen(true);
              }}
            >
              Emergency Stop
            </Button>
          </div>
        </div>
      ) : null}

      {activeTab === 'Automation Logic' ? (
        <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-heading-3 text-foreground">Automation Logic</h2>
              <p className="text-muted-foreground mt-1">Local toggles with saved feedback (UI-only).</p>
            </div>
            <span className="text-body-small text-muted-foreground">
              {automationSaved.status === 'saving'
                ? 'Saving…'
                : automationSaved.status === 'saved'
                  ? 'Saved'
                  : ''}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {(
              [
                { key: 'autoDraft', label: 'Auto Draft' },
                { key: 'autoSchedule', label: 'Auto Schedule' },
                { key: 'autoPublish', label: 'Auto Publish' },
              ] as const
            ).map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between gap-4 bg-background rounded-2xl shadow-neu-outset p-4">
                <div>
                  <div className="text-body text-foreground">{label}</div>
                  <div className="text-body-small text-muted-foreground">UI state only</div>
                </div>
                <input
                  type="checkbox"
                  checked={state.automation[key]}
                  onChange={(e) => {
                    const next = {
                      ...state,
                      automation: { ...state.automation, [key]: e.target.checked },
                    };
                    setState(next);
                    automationSaved.trigger();
                  }}
                />
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'Sources' ? (
        <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-heading-3 text-foreground">Sources</h2>
              <p className="text-muted-foreground mt-1">Toggle sources and add new ones (UI-only).</p>
            </div>
            <span className="text-body-small text-muted-foreground">
              {sourcesSaved.status === 'saving' ? 'Saving…' : sourcesSaved.status === 'saved' ? 'Saved' : ''}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {state.sources.map((src) => (
              <div key={src.id} className="bg-background rounded-2xl shadow-neu-outset p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-body text-foreground">{src.name}</div>
                  <div className="text-body-small text-muted-foreground mt-1">{src.url}</div>
                  <div className="text-body-small text-muted-foreground mt-1">
                    Last sync: {src.lastSync ? formatDateTime(src.lastSync) : '—'} • Articles: {src.articleCount ?? '—'}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-body-small text-muted-foreground">
                  <span>Enabled</span>
                  <input
                    type="checkbox"
                    checked={src.enabled}
                    onChange={(e) => {
                      const next = {
                        ...state,
                        sources: state.sources.map((s) => (s.id === src.id ? { ...s, enabled: e.target.checked } : s)),
                      };
                      setState(next);
                      sourcesSaved.trigger();
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'Settings' ? (
        <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-heading-3 text-foreground">Settings</h2>
              <p className="text-muted-foreground mt-1">Minimal controls aligned to feature intent (UI-only).</p>
            </div>
            <span className="text-body-small text-muted-foreground">
              {settingsSaved.status === 'saving' ? 'Saving…' : settingsSaved.status === 'saved' ? 'Saved' : ''}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="bg-background rounded-2xl shadow-neu-outset p-4">
              <div className="text-body text-foreground">Region / Locale</div>
              <input
                className="mt-2 w-full bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
                value={state.settings.regionLocale}
                onChange={(e) => {
                  setState({ ...state, settings: { ...state.settings, regionLocale: e.target.value } });
                  settingsSaved.trigger();
                }}
              />
            </label>

            <label className="bg-background rounded-2xl shadow-neu-outset p-4">
              <div className="text-body text-foreground">Daily Limit</div>
              <input
                type="number"
                className="mt-2 w-full bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
                value={state.settings.dailyLimit}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setState({ ...state, settings: { ...state.settings, dailyLimit: Number.isFinite(v) ? v : 0 } });
                  settingsSaved.trigger();
                }}
              />
            </label>

            <label className="bg-background rounded-2xl shadow-neu-outset p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-body text-foreground">Deduplication</div>
                <div className="text-body-small text-muted-foreground">UI-only toggle</div>
              </div>
              <input
                type="checkbox"
                checked={state.settings.deduplicationEnabled}
                onChange={(e) => {
                  setState({ ...state, settings: { ...state.settings, deduplicationEnabled: e.target.checked } });
                  settingsSaved.trigger();
                }}
              />
            </label>
          </div>
        </div>
      ) : null}

      {reviewOpen && selectedItem ? (
        <ModalShell
          title="Review"
          description="Review a draft and take an action (UI-only)."
          onClose={() => setReviewOpen(false)}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-heading-3 text-foreground">{selectedItem.title}</div>
              <div className="text-body-small text-muted-foreground mt-1">Created {formatDateTime(selectedItem.createdAt)}</div>
            </div>
            <span className={getStatusBadgeClasses(selectedItem.status)}>{selectedItem.status}</span>
          </div>

          <div className="mt-6 bg-background rounded-2xl shadow-neu-inset p-5">
            <div className="text-body text-foreground">Summary</div>
            <p className="text-body-small text-muted-foreground mt-2">{selectedItem.summary}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="px-4 py-2"
              onClick={() => {
                setConfirmationKind({ type: 'PUBLISH_NOW' });
                setConfirmationOpen(true);
              }}
            >
              Publish Now
            </Button>
            <Button variant="secondary" className="px-4 py-2" onClick={() => setScheduleOpen(true)}>
              Schedule
            </Button>
            <Button variant="secondary" className="px-4 py-2" onClick={() => setRewriteOpen(true)}>
              Request Rewrite
            </Button>
            <Button variant="secondary" className="px-4 py-2" onClick={() => setRejectOpen(true)}>
              Reject
            </Button>
            <Button
              variant="secondary"
              className="px-4 py-2"
              onClick={() => {
                ensureState(state);
                const nextItem = { ...selectedItem, status: 'DRAFT_READY' as const };
                const next = upsertItem(state, nextItem);
                setAndLog(next, {
                  timestamp: new Date().toISOString(),
                  action: 'Saved Edits',
                  origin: 'admin',
                  status: 'INFO',
                });
              }}
            >
              Save Edits
            </Button>
            <Button variant="secondary" className="px-4 py-2" onClick={() => setTestPreviewOpen(true)}>
              Test & Preview
            </Button>
          </div>
        </ModalShell>
      ) : null}

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
          onClose={() => setRewriteOpen(false)}
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
          }}
        />
      ) : null}

      {rejectOpen && selectedItem ? (
        <RejectModal
          item={selectedItem}
          onClose={() => setRejectOpen(false)}
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

      {manualDraftOpen ? (
        <ManualDraftModal
          onClose={() => setManualDraftOpen(false)}
          onCreate={(title, summary) => {
            ensureState(state);
            const draft = createDraftFromTitle(title, summary);
            const next = { ...state, items: [draft, ...state.items] };
            setAndLog(next, {
              timestamp: new Date().toISOString(),
              action: 'Manual Draft Created',
              origin: 'admin',
              status: 'INFO',
            });
            setManualDraftOpen(false);
            setActiveTab('Drafts & Reviews');
            openReviewForItem(draft.id);
          }}
        />
      ) : null}

      {promptDetailsOpen ? (
        <PromptDetailsModal onClose={() => setPromptDetailsOpen(false)} />
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
    </div>
  );
}

function ScheduleModal({
  item,
  onClose,
  onSchedule,
}: {
  item: NewsItem;
  onClose: () => void;
  onSchedule: (iso: string) => void;
}) {
  const [value, setValue] = React.useState<string>(() => {
    const d = new Date(Date.now() + 1000 * 60 * 60);
    return d.toISOString().slice(0, 16);
  });

  return (
    <ModalShell title="Scheduling" description={`Schedule "${item.title}" (UI-only).`} onClose={onClose}>
      <div className="bg-background rounded-2xl shadow-neu-inset p-5">
        <label className="block text-body text-foreground">Schedule for</label>
        <input
          type="datetime-local"
          className="mt-2 w-full bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          variant="primary"
          className="px-4 py-2"
          onClick={() => {
            const iso = new Date(value).toISOString();
            onSchedule(iso);
          }}
        >
          Confirm Schedule
        </Button>
      </div>
    </ModalShell>
  );
}

function RewriteModal({
  item,
  onClose,
  onRewrite,
}: {
  item: NewsItem;
  onClose: () => void;
  onRewrite: (note: string) => void;
}) {
  const [note, setNote] = React.useState('Rewrite request: tighten summary and verify claims (UI-only).');

  return (
    <ModalShell title="Rewrite" description={`Request rewrite for "${item.title}" (UI-only).`} onClose={onClose}>
      <label className="block text-body text-foreground">Rewrite Note / Prompt</label>
      <textarea
        className="mt-2 w-full min-h-32 bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="mt-6 flex justify-end">
        <Button variant="primary" className="px-4 py-2" onClick={() => onRewrite(note)}>
          Submit Rewrite
        </Button>
      </div>
    </ModalShell>
  );
}

function RejectModal({
  item,
  onClose,
  onReject,
}: {
  item: NewsItem;
  onClose: () => void;
  onReject: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState('Not suitable');

  return (
    <ModalShell title="Reject" description={`Reject "${item.title}" (UI-only).`} onClose={onClose}>
      <label className="block text-body text-foreground">Reason</label>
      <input
        className="mt-2 w-full bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="mt-6 flex justify-end">
        <Button variant="primary" className="px-4 py-2" onClick={() => onReject(reason)}>
          Confirm Reject
        </Button>
      </div>
    </ModalShell>
  );
}

function TestPreviewModal({
  item,
  onClose,
  onSaveToDrafts,
  onSimulatePublish,
}: {
  item: NewsItem;
  onClose: () => void;
  onSaveToDrafts: () => void;
  onSimulatePublish: () => void;
}) {
  const [state, setState] = React.useState<'idle' | 'running' | 'completed'>('idle');

  return (
    <ModalShell title="Test & Preview" description={`Run a UI-only test for "${item.title}".`} onClose={onClose}>
      <div className="bg-background rounded-2xl shadow-neu-inset p-5">
        <div className="text-body text-foreground">Test Status</div>
        <div className="mt-2 text-body-small text-muted-foreground">
          {state === 'idle' ? 'Ready.' : state === 'running' ? 'Running…' : 'Completed.'}
        </div>
        <div className="mt-4">
          <Button
            variant="secondary"
            className="px-4 py-2"
            onClick={() => {
              setState('running');
              window.setTimeout(() => setState('completed'), 700);
            }}
          >
            Run Test
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 justify-end">
        <Button variant="secondary" className="px-4 py-2" disabled={state !== 'completed'} onClick={onSaveToDrafts}>
          Save to Drafts
        </Button>
        <Button variant="secondary" className="px-4 py-2" disabled={state !== 'completed'} onClick={onSimulatePublish}>
          Simulate Publish
        </Button>
      </div>
    </ModalShell>
  );
}

function ManualDraftModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, summary: string) => void;
}) {
  const [title, setTitle] = React.useState('Manual Draft:');
  const [summary, setSummary] = React.useState('');

  return (
    <ModalShell title="Manual Draft" description="Create a new draft (UI-only)." onClose={onClose}>
      <div className="space-y-4">
        <label className="block">
          <div className="text-body text-foreground">Title</div>
          <input
            className="mt-2 w-full bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block">
          <div className="text-body text-foreground">Summary</div>
          <textarea
            className="mt-2 w-full min-h-32 bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" className="px-4 py-2" onClick={() => onCreate(title, summary)}>
          Create Draft
        </Button>
      </div>
    </ModalShell>
  );
}

function PromptDetailsModal({ onClose }: { onClose: () => void }) {
  const prompt: string = (window as any).__newsEnginePrompt ?? '';

  return (
    <ModalShell title="Prompt Details" description="Read-only prompt context." onClose={onClose}>
      <div className="bg-background rounded-2xl shadow-neu-inset p-5">
        <div className="text-body-small text-muted-foreground">Prompt</div>
        <pre className="mt-3 whitespace-pre-wrap text-body-small text-foreground">{prompt}</pre>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          variant="secondary"
          className="px-4 py-2"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(prompt);
            } catch {
              // no-op
            }
          }}
        >
          Copy
        </Button>
      </div>
    </ModalShell>
  );
}

function ConfirmationModal({
  kind,
  item,
  onClose,
  onConfirm,
}: {
  kind: { type: 'PUBLISH_NOW' } | { type: 'PAUSE' } | { type: 'RESUME' } | { type: 'EMERGENCY_STOP' };
  item: NewsItem | null;
  onClose: () => void;
  onConfirm: (typed: string) => void;
}) {
  const needsTyped = kind.type === 'PUBLISH_NOW';
  const [typed, setTyped] = React.useState('');

  const title =
    kind.type === 'PUBLISH_NOW'
      ? 'Confirm Publish'
      : kind.type === 'PAUSE'
        ? 'Confirm Pause'
        : kind.type === 'RESUME'
          ? 'Confirm Resume'
          : 'Confirm Emergency Stop';

  const description =
    kind.type === 'PUBLISH_NOW'
      ? `Type PUBLISH to confirm publishing "${item?.title ?? ''}".`
      : kind.type === 'EMERGENCY_STOP'
        ? 'This is a stronger safety action (UI-only).'
        : 'Confirm this pipeline action (UI-only).';

  return (
    <ModalShell title={title} description={description} onClose={onClose}>
      {needsTyped ? (
        <div className="bg-background rounded-2xl shadow-neu-inset p-5">
          <div className="text-body text-foreground">Type PUBLISH</div>
          <input
            className="mt-2 w-full bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
        </div>
      ) : null}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" className="px-4 py-2" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          className="px-4 py-2"
          disabled={needsTyped && typed !== 'PUBLISH'}
          onClick={() => onConfirm(typed)}
        >
          Confirm
        </Button>
      </div>
    </ModalShell>
  );
}
