'use client';

import React from 'react';
import { CalendarClock, FileText, Globe, Hash, Save, X } from 'lucide-react';
import { adminCreateItem, adminPublishNow, adminSchedule } from '@/lib/news-engine/client';
import { RichHtmlEditor } from '../components/RichHtmlEditor';

function stripHtmlToText(html: string): string {
  const raw = (html ?? '').trim();
  if (!raw) return '';
  return raw
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseTagsCsv(value: string): string[] {
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function CreateNewsModalV6({
  isOpen,
  onClose,
  categoryOptions,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  categoryOptions?: string[];
  onCreated: (itemId: string) => Promise<void> | void;
}) {
  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [tagsCsv, setTagsCsv] = React.useState('');
  const [contentHtml, setContentHtml] = React.useState('');
  const [seoTitle, setSeoTitle] = React.useState('');
  const [seoDescription, setSeoDescription] = React.useState('');
  const [scheduledForLocal, setScheduledForLocal] = React.useState('');

  const [isWorking, setIsWorking] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setError('');
    // Keep any partially-entered form state while open.
  }, [isOpen]);

  if (!isOpen) return null;

  async function createBaseItem(): Promise<{ id: string }> {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      throw new Error('Title is required');
    }

    const tags = parseTagsCsv(tagsCsv);

    const created = await adminCreateItem({
      title: trimmedTitle,
      summary: subtitle.trim(),
      contentHtml,
      category: category.trim(),
      tags,
      status: 'DRAFT',
      sourceType: 'Manual Entry',
      seoTitle: seoTitle.trim() ? seoTitle.trim() : null,
      seoDescription: seoDescription.trim() ? seoDescription.trim() : null,
    });

    return { id: created.id };
  }

  async function handleSaveDraft() {
    setError('');
    setIsWorking(true);
    try {
      const created = await createBaseItem();
      await onCreated(created.id);
      setTitle('');
      setSubtitle('');
      setCategory('');
      setTagsCsv('');
      setContentHtml('');
      setSeoTitle('');
      setSeoDescription('');
      setScheduledForLocal('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create draft';
      setError(msg);
    } finally {
      setIsWorking(false);
    }
  }

  async function handleSaveAndPublish() {
    setError('');
    setIsWorking(true);
    try {
      const bodyText = stripHtmlToText(contentHtml);
      if (bodyText.length < 20) {
        throw new Error('Body is too short to publish. Add some content first.');
      }

      const created = await createBaseItem();
      await adminPublishNow(created.id);
      await onCreated(created.id);
      setTitle('');
      setSubtitle('');
      setCategory('');
      setTagsCsv('');
      setContentHtml('');
      setSeoTitle('');
      setSeoDescription('');
      setScheduledForLocal('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to publish';
      setError(msg);
    } finally {
      setIsWorking(false);
    }
  }

  async function handleSaveAndSchedule() {
    setError('');
    setIsWorking(true);
    try {
      const trimmed = scheduledForLocal.trim();
      if (!trimmed) {
        throw new Error('Schedule time is required');
      }

      const dt = new Date(trimmed);
      if (Number.isNaN(dt.getTime())) {
        throw new Error('Schedule time is invalid');
      }
      if (dt.getTime() <= Date.now()) {
        throw new Error('Schedule time must be in the future');
      }

      const created = await createBaseItem();
      await adminSchedule(created.id, dt.toISOString());
      await onCreated(created.id);
      setTitle('');
      setSubtitle('');
      setCategory('');
      setTagsCsv('');
      setContentHtml('');
      setSeoTitle('');
      setSeoDescription('');
      setScheduledForLocal('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule';
      setError(msg);
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface w-full max-w-7xl rounded-2xl shadow-neu-outset flex flex-col overflow-hidden max-h-[90vh] border border-border">
        <header className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-background shadow-neu-outset">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-heading-3 text-foreground">Create News</h2>
              <p className="text-body-small text-muted-foreground uppercase tracking-widest mt-1">
                Manual post creation (rich formatting supported)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full shadow-neu-outset"
            aria-label="Close"
            disabled={isWorking}
          >
            <X size={22} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="bg-background p-6 rounded-[28px] border border-border shadow-neu-outset space-y-6">
                <div className="space-y-2">
                  <label className="text-body-small text-muted-foreground uppercase tracking-widest">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title"
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-body-small text-muted-foreground uppercase tracking-widest">Subtitle (optional)</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Short subtitle shown under the title"
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-body-small text-muted-foreground uppercase tracking-widest">Category</label>
                    <input
                      type="text"
                      list="news-engine-create-category-options"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Start typing category..."
                      className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <datalist id="news-engine-create-category-options">
                      {(categoryOptions ?? []).map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <label className="text-body-small text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Hash size={14} /> Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tagsCsv}
                      onChange={(e) => setTagsCsv(e.target.value)}
                      placeholder="solar, rebates, installer"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-body-small text-muted-foreground uppercase tracking-widest">Body</label>
                  <RichHtmlEditor initialHtml={contentHtml} onHtmlChange={setContentHtml} />
                </div>
              </div>

              <div className="bg-background p-6 rounded-[28px] border border-border shadow-neu-outset space-y-6">
                <h3 className="text-heading-4 text-foreground">SEO (optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-body-small text-muted-foreground uppercase tracking-widest">SEO Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Overrides title in metadata"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-body-small text-muted-foreground uppercase tracking-widest">SEO Description</label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Overrides meta description"
                      className="w-full h-24 px-4 py-3 bg-surface border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-background p-6 rounded-[28px] border border-border shadow-neu-outset space-y-4">
                <h3 className="text-heading-4 text-foreground">Schedule (optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-body-small text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <CalendarClock size={16} /> Publish at (local time)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledForLocal}
                      onChange={(e) => setScheduledForLocal(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="text-body-small text-muted-foreground uppercase tracking-widest flex items-center">
                    Use “Save & Schedule” to schedule.
                  </div>
                </div>
              </div>

              {error ? <p className="text-body-small text-destructive">{error}</p> : null}
            </div>

            <div className="space-y-4">
              <div className="bg-background p-6 rounded-[28px] border border-border shadow-neu-outset">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-heading-4 text-foreground">Live Preview</h3>
                  <span className="text-body-small text-muted-foreground uppercase tracking-widest">Article</span>
                </div>

                <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
                  <div className="space-y-3">
                    <div className="text-body-small text-muted-foreground uppercase tracking-widest">
                      {(category || '').trim() || 'Category'}
                    </div>
                    <h1 className="text-heading-2 text-foreground">{title.trim() || 'Title goes here'}</h1>
                    {subtitle.trim() ? (
                      <p className="text-body text-muted-foreground">{subtitle.trim()}</p>
                    ) : null}

                    {(tagsCsv.trim() ? parseTagsCsv(tagsCsv) : []).length ? (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {parseTagsCsv(tagsCsv)
                          .slice(0, 10)
                          .map((t) => (
                            <span
                              key={t}
                              className="px-3 py-1 bg-background text-foreground rounded-full text-body-small uppercase tracking-wider border border-border"
                            >
                              {t}
                            </span>
                          ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 border-t border-border pt-6">
                    {contentHtml.trim() ? (
                      <div
                        className="prose prose-neutral prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                      />
                    ) : (
                      <p className="text-body text-muted-foreground">Start writing to see the preview.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="px-8 py-6 border-t border-border bg-surface flex flex-col md:flex-row md:items-center gap-3 md:gap-4 md:justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isWorking}
            className="px-6 py-3 text-body-small text-muted-foreground uppercase tracking-widest"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-end">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isWorking}
              className="flex items-center gap-2 px-6 py-3 text-body-small text-foreground border border-border rounded-2xl hover:bg-surface shadow-neu-outset active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              <Save size={18} />
              Save Draft
            </button>

            <button
              type="button"
              onClick={handleSaveAndSchedule}
              disabled={isWorking}
              className="flex items-center gap-2 px-6 py-3 text-body-small text-foreground border border-border rounded-2xl hover:bg-surface shadow-neu-outset active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              <CalendarClock size={18} />
              Save & Schedule
            </button>

            <button
              type="button"
              onClick={handleSaveAndPublish}
              disabled={isWorking}
              className="flex items-center gap-2 px-6 py-3 text-body-small rounded-2xl uppercase tracking-widest text-brand-accent bg-surface border border-border hover:bg-surface-hover active:scale-95 disabled:opacity-50"
            >
              <Globe size={18} />
              Save & Publish
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
