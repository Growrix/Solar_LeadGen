
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Settings2, 
  ArrowRight,
  Info,
  Layers,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';

const Toggle: React.FC<{ active: boolean; onChange: () => void; label?: string; disabled?: boolean }> = ({ active, onChange, label, disabled }) => (
  <div className="flex items-center gap-3">
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
    {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
  </div>
);

const RuleCard: React.FC<{ 
  title: string; 
  description: string; 
  isActive: boolean; 
  onToggle: () => void; 
  children?: React.ReactNode 
}> = ({ title, description, isActive, onToggle, children }) => (
  <div className={`p-5 rounded-xl border transition-all ${isActive ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-80'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <h4 className="font-bold text-slate-900">{title}</h4>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <Toggle active={isActive} onChange={onToggle} />
    </div>
    {isActive && children && (
      <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
        {children}
      </div>
    )}
  </div>
);

const AutomationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [config, setConfig] = useState({
    autoDraft: true,
    autoSchedule: false,
    autoPublish: false,
    maxDaily: 15,
    minScore: 85,
    windows: ['09:00 - 11:00', '14:00 - 17:00'],
    strategy: 'Chronological'
  });

  const [operationalRules, setOperationalRules] = useState([
    { id: 1, type: 'Limit', label: 'Max Stories Per Day', value: '15 Stories', desc: 'Prevents overwhelming the feed', isActive: true },
    { id: 2, type: 'Filter', label: 'Global Blacklist', value: 'Active', desc: 'Keywords and phrases to never use', isActive: true },
    { id: 3, type: 'Constraint', label: 'Draft Expiry', value: '48 Hours', desc: 'Auto-delete unreviewed old news', isActive: false }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const triggerFeedback = () => {
    setFeedback('saving');
    setTimeout(() => {
      setFeedback('saved');
      setTimeout(() => setFeedback('idle'), 2000);
    }, 800);
  };

  const handleSaveConfiguration = () => {
    setFeedback('saving');
    setTimeout(() => {
      setFeedback('saved');
      setTimeout(() => setFeedback('idle'), 2500);
    }, 1200);
  };

  const handleDeleteRule = (id: number) => {
    setOperationalRules(prev => prev.filter(r => r.id !== id));
    triggerFeedback();
  };

  const handleDeleteWindow = (index: number) => {
    const newWindows = [...config.windows];
    newWindows.splice(index, 1);
    setConfig({ ...config, windows: newWindows });
    triggerFeedback();
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-xl w-full" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-xl" />
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500 relative">
      {/* Floating Feedback Indicator */}
      {feedback !== 'idle' && (
        <div className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {feedback === 'saving' ? (
            <>
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-widest">Syncing Rules...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest">Logic Persisted</span>
            </>
          )}
        </div>
      )}

      {/* Safety Banner */}
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
          <ShieldCheck size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-amber-900">Safety First: Manual Approval Required</h3>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            By default, all AI-generated content must be manually approved in the Review queue before going live. 
            Automated publishing is currently disabled globally to ensure content quality and factual accuracy.
          </p>
        </div>
        <button className="text-xs font-bold text-amber-700 hover:text-amber-900 underline whitespace-nowrap">
          View Guidelines
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Pipeline Toggles */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Pipeline Automation</h2>
            </div>
            
            <div className="grid gap-4">
              <RuleCard 
                title="Auto-Research & Draft" 
                description="Automatically trigger AI research and draft creation when new sources are detected."
                isActive={config.autoDraft}
                onToggle={() => {
                  setConfig({...config, autoDraft: !config.autoDraft});
                  triggerFeedback();
                }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Minimum Relevance Score</span>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="50" max="100" 
                      value={config.minScore}
                      onChange={(e) => {
                        setConfig({...config, minScore: parseInt(e.target.value)});
                        triggerFeedback();
                      }}
                      className="w-32 accent-indigo-600 cursor-pointer"
                    />
                    <span className="font-bold text-indigo-600 w-8">{config.minScore}%</span>
                  </div>
                </div>
              </RuleCard>

              <RuleCard 
                title="Auto-Schedule" 
                description="Move approved drafts automatically to the next available publication slot."
                isActive={config.autoSchedule}
                onToggle={() => {
                  setConfig({...config, autoSchedule: !config.autoSchedule});
                  triggerFeedback();
                }}
              >
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">Select active publication strategy:</p>
                  <div className="flex gap-2">
                    {['Chronological', 'Priority-Based', 'Batch Burst'].map(strategy => (
                      <button 
                        key={strategy}
                        onClick={() => {
                          setConfig({...config, strategy});
                          triggerFeedback();
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          config.strategy === strategy 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {strategy}
                      </button>
                    ))}
                  </div>
                </div>
              </RuleCard>

              <div className={`p-5 rounded-xl border transition-all flex items-center justify-between group ${config.autoPublish ? 'bg-white border-rose-200 shadow-sm' : 'bg-slate-50 border-dashed border-slate-300 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${config.autoPublish ? 'bg-rose-50 text-rose-600' : 'bg-slate-200 text-slate-400'}`}>
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className={`font-bold ${config.autoPublish ? 'text-slate-900' : 'text-slate-400'}`}>Direct Auto-Publish</h4>
                    <p className={`text-sm ${config.autoPublish ? 'text-slate-500' : 'text-slate-400'}`}>Publish content immediately without any human review.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {!config.autoPublish && (
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Restricted</span>
                  )}
                  <Toggle 
                    active={config.autoPublish} 
                    onChange={() => {
                      setConfig({...config, autoPublish: !config.autoPublish});
                      triggerFeedback();
                    }} 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Rules Editor */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                Operational Rules
              </h3>
              <button className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Rule
              </button>
            </div>
            
            <div className="divide-y divide-slate-100">
              {operationalRules.map(rule => (
                <div key={rule.id} className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group ${!rule.isActive ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${rule.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Settings2 size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{rule.type}</span>
                        <h5 className="text-sm font-bold text-slate-900">{rule.label}</h5>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{rule.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-bold text-slate-700">{rule.value}</span>
                    <Toggle 
                      active={rule.isActive} 
                      onChange={() => {
                        setOperationalRules(prev => prev.map(r => r.id === rule.id ? {...r, isActive: !r.isActive} : r));
                        triggerFeedback();
                      }} 
                    />
                    <button 
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-24">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock size={18} className="text-indigo-600" />
                Publish Windows
              </h3>
              <p className="text-xs text-slate-500">Allowed time slots for automated scheduling.</p>
            </div>

            <div className="space-y-3">
              {config.windows.map((window, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <div className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium flex justify-between items-center group-hover:border-indigo-200 transition-colors">
                    {window}
                    <Clock size={14} className="text-slate-400" />
                  </div>
                  <button 
                    onClick={() => handleDeleteWindow(i)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button 
                onClick={triggerFeedback}
                className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Add Slot
              </button>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Active Automations</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Scheduled Today</span>
                <span className="font-bold text-slate-900">8 / 15</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-indigo-500 rounded-full transition-all duration-1000" />
              </div>
            </div>

            <button 
              onClick={handleSaveConfiguration}
              disabled={feedback === 'saving'}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {feedback === 'saving' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : feedback === 'saved' ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : null}
              {feedback === 'saved' ? 'Logic Persisted' : 'Save Configuration'}
            </button>
          </section>

          <section className="p-5 bg-indigo-900 rounded-xl text-white space-y-3 shadow-lg shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform">
              <Zap size={64} fill="white" />
            </div>
            <div className="flex items-center gap-2 text-indigo-300">
              <Info size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Editor Tip</span>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed relative z-10">
              Use "Priority-Based" scheduling to ensure breaking news always takes the earliest available slot in your publish window.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AutomationPage;
