'use client';

import React from 'react';
import { Check, Copy, Cpu, Database, Terminal, X } from 'lucide-react';
import Button from '@/components/Button';
import type { AuditLogEntry } from '@/lib/ui-stubs/news-engine';
import { formatDateTime } from '../shared';

export function PromptDetailsModal({ log, onClose }: { log: AuditLogEntry | null; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);

  if (!log) return null;

  const prompt = log.promptUsed ?? '';

  const handleCopy = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-details-title"
    >
      <div
        className="bg-surface border border-border rounded-3xl shadow-neu-outset w-full max-w-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-8 py-6 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-brand-accent shadow-neu-inset">
              <Terminal size={22} />
            </div>
            <div>
              <h2 id="prompt-details-title" className="text-heading-3 text-foreground">
                Prompt Architecture
              </h2>
              <div className="flex items-center gap-3 text-body-small uppercase tracking-widest text-muted-foreground mt-1">
                <span className="inline-flex items-center gap-1">
                  <Cpu size={12} />
                  {log.origin} Engine
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>Log ID: {log.id}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </header>

        <div className="px-8 py-4 bg-surface border-b border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-body-small uppercase tracking-widest text-muted-foreground">Model Endpoint</div>
            <div className="text-body text-foreground">Gemini 3 Pro (Experimental)</div>
          </div>
          <div className="space-y-1 sm:px-4 sm:border-x sm:border-border">
            <div className="text-body-small uppercase tracking-widest text-muted-foreground">Timestamp</div>
            <div className="text-body text-foreground">{formatDateTime(log.timestamp)}</div>
          </div>
          <div className="space-y-1 sm:pl-4">
            <div className="text-body-small uppercase tracking-widest text-muted-foreground">Action Performed</div>
            <div className="text-body text-brand-accent">{log.action}</div>
          </div>
        </div>

        <div className="p-8 bg-background max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-body-small uppercase tracking-widest text-muted-foreground">
                Raw System Prompt
              </div>
              <Button
                variant={copied ? 'primary' : 'secondary'}
                className="px-4 py-2"
                onClick={handleCopy}
              >
                <span className="inline-flex items-center gap-2">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy Prompt'}
                </span>
              </Button>
            </div>

            <div className="bg-surface border border-border rounded-2xl shadow-neu-inset p-6 min-h-[260px]">
              <pre className="whitespace-pre-wrap text-body-small text-foreground font-mono">
                {prompt || 'No prompt data recorded for this manual action.'}
              </pre>
            </div>

            <div className="flex items-start gap-3 p-4 bg-accent/10 rounded-2xl border border-accent/20">
              <Database size={16} className="text-brand-accent mt-0.5" />
              <p className="text-body-small text-foreground leading-relaxed">
                <strong>Context Injection:</strong> This prompt included 4 verified RSS sources and 122KB of historical
                data to ensure factual consistency across the NewsEngine network.
              </p>
            </div>
          </div>
        </div>

        <footer className="px-8 py-5 border-t border-border bg-surface flex items-center justify-end">
          <Button variant="primary" className="px-8 py-2" onClick={onClose}>
            Close Details
          </Button>
        </footer>
      </div>
    </div>
  );
}
