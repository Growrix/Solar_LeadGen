'use client';

import React from 'react';
import type { NewsItem } from '@/lib/ui-stubs/news-engine';
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  ExternalLink,
  FileText,
  Globe,
  MessageSquare,
  Play,
  RefreshCcw,
  X,
} from 'lucide-react';

export function TestPreviewModal({
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
  const [testState, setTestState] = React.useState<'idle' | 'running' | 'completed'>('idle');
  const [sourceType, setSourceType] = React.useState<'existing' | 'custom'>('existing');
  const [topic, setTopic] = React.useState('');
  const [url, setUrl] = React.useState('');

  const mockResult = {
    title: 'Next-Gen Silicon Photonics Breakthrough set to Revolutionize Data Centers',
    summary:
      'Researchers at the Global Innovation Hub have successfully demonstrated a 400Gbps transmission over standard fiber using a new silicon-based laser array, potentially slashing cloud latency and energy consumption.',
  };

  const handleRunTest = () => {
    setTestState('running');
    window.setTimeout(() => setTestState('completed'), 2500);
  };

  const resetTest = () => {
    setTestState('idle');
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-preview-title"
    >
      <div
        className="relative bg-surface w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-neu-outset flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-8 py-5 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent text-accent-foreground rounded-xl shadow-neu-outset">
              <RefreshCcw size={20} />
            </div>
            <div>
              <h2 id="test-preview-title" className="text-heading-3 text-foreground">
                Test &amp; Preview
              </h2>
              <p className="text-body-small text-muted-foreground">Verify AI generation parameters before live deployment.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          <aside className="w-full lg:w-80 border-r border-border p-6 space-y-6 bg-surface">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-body-small uppercase tracking-widest text-muted-foreground">Source Input</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-background rounded-lg border border-border shadow-neu-inset">
                  <button
                    type="button"
                    onClick={() => setSourceType('existing')}
                    className={`py-2 rounded-md text-body-small uppercase tracking-widest ${
                      sourceType === 'existing'
                        ? 'bg-surface shadow-neu-outset text-brand-accent'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Saved Source
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('custom')}
                    className={`py-2 rounded-md text-body-small uppercase tracking-widest ${
                      sourceType === 'custom'
                        ? 'bg-surface shadow-neu-outset text-brand-accent'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Custom URL
                  </button>
                </div>
              </div>

              {sourceType === 'existing' ? (
                <div className="space-y-2">
                  <label className="text-body-small text-foreground">Select Existing Source</label>
                  <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground">
                    <option>TechCrunch Main Feed</option>
                    <option>Reuters Business</option>
                    <option>The Verge Science</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-body-small text-foreground">Target Article URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input
                      type="url"
                      placeholder="https://example.com/news/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-body-small text-foreground">Prompt Override Topic (Optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <input
                    type="text"
                    placeholder="e.g. Focus on technical specs..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <button
                type="button"
                onClick={handleRunTest}
                disabled={testState === 'running'}
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-accent-foreground rounded-xl text-body-small shadow-neu-outset hover:bg-accent/90 disabled:opacity-50"
              >
                {testState === 'running' ? (
                  <>
                    <RefreshCcw className="animate-spin" size={18} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Run Test Generation
                  </>
                )}
              </button>
              {testState === 'completed' ? (
                <button type="button" onClick={resetTest} className="w-full mt-3 py-2 text-body-small text-muted-foreground hover:text-foreground">
                  Clear Results
                </button>
              ) : null}
            </div>

            <div className="p-4 bg-warning/10 rounded-xl border border-warning/30 shadow-neu-outset space-y-2">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle size={14} />
                <span className="text-body-small uppercase tracking-widest">Test Mode</span>
              </div>
              <p className="text-body-small text-warning/90 leading-relaxed">
                Running a test will consume AI tokens but will not create a persistent record in the drafts database
                until manually saved.
              </p>
            </div>
          </aside>

          <main className="flex-1 bg-background p-8 relative min-h-[400px]">
            {testState === 'idle' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center text-muted-foreground shadow-neu-inset">
                  <Cpu size={32} />
                </div>
                <div>
                  <h3 className="text-heading-4 text-foreground">Ready to Test</h3>
                  <p className="text-body text-muted-foreground max-w-xs mx-auto">
                    Configure your inputs and click &quot;Run Test&quot; to see how the AI handles the content.
                  </p>
                </div>
              </div>
            ) : null}

            {testState === 'running' ? (
              <div className="h-full flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-border border-t-accent rounded-full animate-spin" />
                  <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-accent" size={32} />
                </div>
                <div className="space-y-4 w-full max-w-sm">
                  <div className="flex justify-between text-body-small uppercase tracking-widest text-brand-accent">
                    <span className="animate-pulse">Analyzing Source...</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-accent w-[65%] rounded-full duration-1000" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-3 bg-surface rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-surface rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : null}

            {testState === 'completed' ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-success" size={20} />
                    <span className="text-body-small text-foreground">Generation Complete</span>
                  </div>
                  <div className="flex items-center gap-4 text-body-small uppercase tracking-widest text-muted-foreground">
                    <span>Model: Gemini 3 Pro</span>
                    <span>Tokens: 1,420</span>
                    <span>Time: 2.4s</span>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="space-y-2">
                    <label className="text-body-small uppercase tracking-widest text-muted-foreground">Draft Headline</label>
                    <h4 className="text-heading-2 text-foreground">{mockResult.title}</h4>
                  </div>

                  <div className="space-y-2">
                    <label className="text-body-small uppercase tracking-widest text-muted-foreground">Article Body Preview</label>
                    <div className="bg-surface border border-border rounded-2xl p-5 shadow-neu-inset text-body text-foreground leading-relaxed space-y-4">
                      <p>{mockResult.summary}</p>
                      <p>
                        The technology, which integrates optical components directly onto standard CMOS wafers,
                        addresses one of the most significant bottlenecks in modern hyperscale computing. Industry
                        analysts predict that this approach could accelerate the deployment of AI-intensive workloads...
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20 space-y-3 shadow-neu-outset">
                    <div className="flex items-center gap-2 text-brand-accent">
                      <ExternalLink size={16} />
                      <span className="text-body-small uppercase tracking-widest">Research Citations</span>
                    </div>
                    <ul className="text-body-small text-brand-accent space-y-1 underline">
                      <li>Source: Nature Electronics (Oct 2023)</li>
                      <li>Source: Advanced Computing Consortium Analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>

        <footer className="px-8 py-4 bg-surface border-t border-border flex items-center justify-between">
          <button type="button" onClick={onClose} className="px-6 py-2 text-body text-muted-foreground hover:text-foreground">
            Close
          </button>

          <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={testState !== 'completed'}
                onClick={onSimulatePublish}
                className="px-6 py-2 text-body-small text-foreground bg-background border border-border rounded-lg hover:bg-surface-hover shadow-neu-outset disabled:opacity-50"
              >
              Simulate Publish
            </button>
              <button
                type="button"
                disabled={testState !== 'completed'}
                onClick={onSaveToDrafts}
                className="flex items-center gap-2 px-8 py-2 bg-foreground text-background rounded-xl text-body-small shadow-neu-outset hover:opacity-95 disabled:opacity-50"
              >
              <FileText size={18} />
              Save to Drafts
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
