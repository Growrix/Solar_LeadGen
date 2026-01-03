'use client';

import React from 'react';
import type { NewsSource } from '@/lib/ui-stubs/news-engine';
import { CheckCircle2, Database, Globe, Link2, Rss, Settings2, X } from 'lucide-react';

export function AddEditSourceModal({
  source,
  onClose,
  onSave,
}: {
  source: NewsSource | null;
  onClose: () => void;
  onSave: (next: NewsSource) => void;
}) {
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [type, setType] = React.useState<'RSS Feed' | 'API Endpoint' | 'Scraper'>('RSS Feed');
  const [isEnabled, setIsEnabled] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{ name?: string; url?: string }>({});

  React.useEffect(() => {
    if (source) {
      setName(source.name);
      setUrl(source.url);
      setIsEnabled(source.enabled);
    } else {
      setName('');
      setUrl('');
      setIsEnabled(true);
    }
    setType('RSS Feed');
    setErrors({});
    setIsSubmitting(false);
  }, [source]);

  const validate = () => {
    const nextErrors: { name?: string; url?: string } = {};
    if (!name.trim()) nextErrors.name = 'Source name is required';
    if (!url.trim()) nextErrors.url = 'Endpoint URL is required';
    else if (!/^(https?:\/\/)/.test(url.trim())) nextErrors.url = 'Must be a valid URL starting with http:// or https://';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      const id = source?.id ?? `src_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
      onSave({
        id,
        name: name.trim(),
        url: url.trim(),
        enabled: isEnabled,
        lastSync: source?.lastSync,
        articleCount: source?.articleCount,
      });
      setIsSubmitting(false);
    }, 800);
  };

  const Toggle = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-border'}`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-modal-title"
    >
      <div
        className="relative bg-surface w-full max-w-lg rounded-2xl shadow-neu-outset flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-4 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 text-brand-accent rounded-lg border border-accent/20 shadow-neu-inset">
              <Settings2 size={20} />
            </div>
            <h2 id="source-modal-title" className="text-heading-4 text-foreground">
              {source ? 'Edit Data Source' : 'Connect New Source'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-body-small uppercase tracking-widest text-muted-foreground">Friendly Name</label>
              <div className="relative">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. TechCrunch Gadgets"
                  className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl text-body focus:outline-none focus:ring-2 transition-all text-foreground placeholder:text-muted-foreground ${
                    errors.name ? 'border-destructive focus:ring-destructive/10' : 'border-border focus:ring-accent/20'
                  }`}
                />
              </div>
              {errors.name ? <p className="text-body-small text-destructive">{errors.name}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-body-small uppercase tracking-widest text-muted-foreground">Endpoint URL (RSS/Atom/JSON)</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/feed"
                  className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl text-body focus:outline-none focus:ring-2 transition-all text-foreground placeholder:text-muted-foreground ${
                    errors.url ? 'border-destructive focus:ring-destructive/10' : 'border-border focus:ring-accent/20'
                  }`}
                />
              </div>
              {errors.url ? <p className="text-body-small text-destructive">{errors.url}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-body-small uppercase tracking-widest text-muted-foreground">Source Logic Type</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { label: 'RSS Feed', icon: <Rss size={18} /> },
                  { label: 'API Endpoint', icon: <Database size={18} /> },
                  { label: 'Scraper', icon: <Globe size={18} /> },
                ] as const).map((t) => {
                  const active = type === t.label;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setType(t.label)}
                      className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${
                        active
                          ? 'bg-accent/10 border-accent/20 text-brand-accent shadow-neu-outset'
                          : 'bg-background border-border text-muted-foreground hover:bg-surface-hover'
                      }`}
                    >
                      {t.icon}
                      <span className="text-body-small uppercase tracking-widest">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-body font-semibold text-foreground">Enable Monitoring</p>
                <p className="text-body-small text-muted-foreground">If disabled, the AI will ignore this source during syncs.</p>
              </div>
              <Toggle checked={isEnabled} onToggle={() => setIsEnabled((v) => !v)} />
            </div>
          </div>
        </div>

        <footer className="px-6 py-4 bg-surface border-t border-border flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-body text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2 bg-accent text-accent-foreground rounded-xl text-body font-semibold shadow-neu-outset hover:bg-accent/90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {source ? 'Update Source' : 'Connect Source'}
          </button>
        </footer>
      </div>
    </div>
  );
}
