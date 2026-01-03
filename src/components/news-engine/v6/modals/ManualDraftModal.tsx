'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Hash, ListOrdered, MessageSquare, Plus, Sparkles, Type, X, Zap } from 'lucide-react';

type ManualDraftFormV6 = {
  title: string;
  prompt: string;
  category: string;
  tags: string[];
  outline: string;
};

export function ManualDraftModalV6({
  isOpen,
  onClose,
  onGenerate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: ManualDraftFormV6) => void;
}) {
  const [title, setTitle] = React.useState('');
  const [prompt, setPrompt] = React.useState('');
  const [category, setCategory] = React.useState('Tech');
  const [tagInput, setTagInput] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [outline, setOutline] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    window.setTimeout(() => {
      onGenerate({ title, prompt, category, tags, outline });
      setIsGenerating(false);
      setTitle('');
      setPrompt('');
      setCategory('Tech');
      setTags([]);
      setOutline('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface w-full max-w-2xl rounded-2xl shadow-neu-outset flex flex-col overflow-hidden max-h-[90vh] border border-border">
        <header className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-background shadow-neu-outset">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-heading-3 text-foreground">Generate Targeted Draft</h2>
              <p className="text-body-small text-muted-foreground uppercase tracking-widest mt-1">Custom AI Intelligence Briefing</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full shadow-neu-outset"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full shadow-neu-inset" />
                <Zap
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-accent"
                  size={32}
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-heading-3 text-foreground uppercase tracking-tight">Initializing AI Agents</h3>
                <p className="text-body text-muted-foreground max-w-xs mx-auto">
                  Researching historical context and drafting your custom intelligence report...
                </p>
              </div>
              <div className="w-full max-w-sm h-2 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-accent w-1/2 rounded-full" />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Type size={16} /> Working Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Strategic Impact of MoE Architectures"
                  className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={16} /> Core Topic / AI Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What should the AI research and write about? Provide context, key players, or specific data points..."
                  className="w-full h-32 px-4 py-3 bg-background border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-body-small text-muted-foreground uppercase tracking-widest">Primary Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-background border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer"
                    >
                      <option>Tech</option>
                      <option>Finance</option>
                      <option>AI Tech</option>
                      <option>Science</option>
                      <option>Politics</option>
                      <option>Health</option>
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-body-small text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Hash size={16} /> Taxonomy Tags
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => (e.key === 'Enter' ? handleAddTag() : undefined)}
                      placeholder="Add tag..."
                      className="flex-1 px-4 py-3 bg-background border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="p-3 bg-surface text-foreground rounded-2xl shadow-neu-outset active:scale-[0.98]"
                      aria-label="Add tag"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-background text-foreground rounded-full text-body-small uppercase tracking-wider flex items-center gap-2 border border-border"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-body-small text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <ListOrdered size={16} /> Strategic Outline (Optional)
                </label>
                <textarea
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  placeholder="Provide a structure for the AI to follow (e.g. 1. Introduction, 2. Core Market Analysis...)"
                  className="w-full h-24 px-4 py-3 bg-background border border-border rounded-2xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <footer className="px-8 py-6 border-t border-border bg-surface flex items-center justify-between">
          <button type="button" onClick={onClose} className="px-6 py-3 text-body-small text-muted-foreground uppercase tracking-widest">
            Cancel Draft
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`flex items-center gap-2 px-10 py-4 rounded-2xl text-body-small uppercase tracking-widest shadow-neu-outset active:scale-[0.98] ${
              !prompt.trim() || isGenerating
                ? 'bg-surface text-muted-foreground cursor-not-allowed'
                : 'bg-accent text-background hover:bg-accent-hover'
            }`}
          >
            {isGenerating ? 'Synthesizing...' : 'Generate AI Draft'}
            <ChevronRight size={18} />
          </button>
        </footer>
      </div>
    </div>
  );
}
