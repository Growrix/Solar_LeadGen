
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Globe, 
  Hash, 
  ShieldAlert, 
  Copy, 
  Layers, 
  ExternalLink,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { RSSSource, SourceStatus } from './types';

const SourceToggle: React.FC<{ active: boolean; onChange: () => void; disabled?: boolean }> = ({ active, onChange, disabled }) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      if (!disabled) onChange();
    }}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
  </div>
);

interface SourcesPageProps {
  sources: RSSSource[];
  isLoading: boolean;
  onAddSource?: () => void;
  onEditSource?: (source: RSSSource) => void;
  onToggleSource?: (id: string) => void;
}

const SourcesPage: React.FC<SourcesPageProps> = ({ sources, isLoading, onAddSource, onEditSource, onToggleSource }) => {
  const [researchWeights, setResearchWeights] = useState({ web: 70, social: 30, journals: 50 });
  const [researchEnabled, setResearchEnabled] = useState({ web: true, social: true, journals: true });
  const [rules, setRules] = useState({ deduplication: true, verifyPayload: false });
  const [feedback, setFeedback] = useState<'idle' | 'saving' | 'saved'>('idle');

  const triggerFeedback = () => {
    setFeedback('saving');
    setTimeout(() => {
      setFeedback('saved');
      setTimeout(() => setFeedback('idle'), 2000);
    }, 600);
  };

  const handleToggleSourceLocal = (id: string) => {
    if (onToggleSource) {
      onToggleSource(id);
      triggerFeedback();
    }
  };

  const handleToggleResearch = (key: keyof typeof researchEnabled) => {
    setResearchEnabled(prev => ({ ...prev, [key]: !prev[key] }));
    triggerFeedback();
  };

  const handleToggleRule = (key: keyof typeof rules) => {
    setRules(prev => ({ ...prev, [key]: !prev[key] }));
    triggerFeedback();
  };

  const handleSaveConfig = () => {
    setFeedback('saving');
    setTimeout(() => {
      setFeedback('saved');
      setTimeout(() => setFeedback('idle'), 2000);
    }, 1200);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500 relative">
      {/* Floating Persist Indicator */}
      {feedback !== 'idle' && (
        <div className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {feedback === 'saving' ? (
            <>
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-widest">Syncing Changes...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest">Pipeline Updated</span>
            </>
          )}
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sources & Research</h1>
          <p className="text-slate-500 text-sm mt-1">Configure where the AI pulls its data from and how it researches topics.</p>
        </div>
        <button 
          onClick={onAddSource}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all hover:shadow-md"
        >
          <Plus size={20} />
          Add Source
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RSS Source Manager */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                RSS Source Manager
              </h3>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter sources..." 
                  className="pl-8 pr-3 py-1 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Source & URL</th>
                    <th className="px-6 py-3">Last Sync</th>
                    <th className="px-6 py-3">Articles</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    sources.map((source) => (
                      <tr key={source.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span 
                              className="font-medium text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors"
                              onClick={() => onEditSource?.(source)}
                            >
                              {source.name}
                            </span>
                            <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">{source.url}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{source.lastSync}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">{source.articleCount}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <SourceToggle 
                              active={source.status === SourceStatus.ACTIVE} 
                              onChange={() => handleToggleSourceLocal(source.id)} 
                            />
                            <span className={`text-[10px] font-bold uppercase min-w-[60px] ${
                              source.status === SourceStatus.ACTIVE ? 'text-emerald-600' : 
                              source.status === SourceStatus.ERROR ? 'text-rose-600' : 'text-slate-400'
                            }`}>
                              {source.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            className="text-slate-400 hover:text-slate-600"
                            onClick={() => onEditSource?.(source)}
                          >
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!isLoading && sources.length === 0 && (
              <div className="p-12 text-center text-slate-500">No sources added yet.</div>
            )}
          </section>

          {/* Research Toggles & Priority */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <SectionTitle title="Web & Trend Research" subtitle="Control AI exploration beyond static RSS feeds." />
            
            <div className="space-y-6">
              {[
                { id: 'web', label: 'Global Web Search', icon: <Globe size={20} />, color: 'text-blue-500' },
                { id: 'social', label: 'Real-time Social Trends', icon: <Hash size={20} />, color: 'text-indigo-500' },
                { id: 'journals', label: 'Academic & Scientific Journals', icon: <ExternalLink size={20} />, color: 'text-emerald-500' }
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className={`p-3 bg-white rounded-lg shadow-sm ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold transition-colors ${researchEnabled[item.id as keyof typeof researchEnabled] ? 'text-slate-900' : 'text-slate-400'}`}>
                        {item.label}
                      </span>
                      <SourceToggle 
                        active={researchEnabled[item.id as keyof typeof researchEnabled]} 
                        onChange={() => handleToggleResearch(item.id as keyof typeof researchEnabled)} 
                      />
                    </div>
                    <div className={`space-y-1 transition-opacity ${researchEnabled[item.id as keyof typeof researchEnabled] ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Research Priority</span>
                        <span className="font-bold text-indigo-600">{researchWeights[item.id as keyof typeof researchWeights]}%</span>
                      </div>
                      <input 
                        type="range" 
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        value={researchWeights[item.id as keyof typeof researchWeights]}
                        onChange={(e) => {
                          setResearchWeights({...researchWeights, [item.id]: parseInt(e.target.value)});
                          triggerFeedback();
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Research Rules Panel */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <SectionTitle title="Research Rules" subtitle="Establish boundaries for the AI engine." />
            
            <div className="space-y-6">
              {/* Min Sources */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <RefreshCw size={14} className="text-slate-400" />
                  Min Sources per Story
                </label>
                <input 
                  type="number" 
                  defaultValue={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-[10px] text-slate-400 italic">Ensures cross-verification of news facts.</p>
              </div>

              {/* Allowed Countries */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Globe size={14} className="text-slate-400" />
                  Geographical Focus
                </label>
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {['USA', 'UK', 'Japan', 'Germany'].map(c => (
                    <span key={c} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium flex items-center gap-1">
                      {c}
                      <button className="hover:text-indigo-900" onClick={triggerFeedback}>×</button>
                    </span>
                  ))}
                  <input type="text" placeholder="Add..." className="bg-transparent border-none text-xs w-16 focus:ring-0" />
                </div>
              </div>

              {/* Blacklist */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-slate-400" />
                  Source Blacklist
                </label>
                <textarea 
                  placeholder="Enter domains to ignore (one per line)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              {/* Toggles */}
              <div className="pt-4 space-y-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Copy size={14} />
                      Deduplication
                    </p>
                    <p className="text-xs text-slate-500">Prevent repeated coverage.</p>
                  </div>
                  <SourceToggle 
                    active={rules.deduplication} 
                    onChange={() => handleToggleRule('deduplication')} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Sliders size={14} />
                      Verify Payload
                    </p>
                    <p className="text-xs text-slate-500">Check source credibility.</p>
                  </div>
                  <SourceToggle 
                    active={rules.verifyPayload} 
                    onChange={() => handleToggleRule('verifyPayload')} 
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveConfig}
                disabled={feedback === 'saving'}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {feedback === 'saving' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : feedback === 'saved' ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : null}
                {feedback === 'saved' ? 'Configuration Saved' : 'Save Configuration'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SourcesPage;
