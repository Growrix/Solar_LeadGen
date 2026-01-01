
import React, { useState } from 'react';
import { 
  Brain, 
  Bell, 
  Shield, 
  Save,
  Zap,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const SettingSection: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  children: React.ReactNode 
}> = ({ title, description, icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
    <div className="p-6 border-b border-slate-50 flex items-start gap-4">
      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
    <div className="p-6 space-y-6">
      {children}
    </div>
  </div>
);

const SettingRow: React.FC<{ 
  label: string; 
  description?: string; 
  children: React.ReactNode 
}> = ({ label, description, children }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="space-y-0.5">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
    <div className="flex-shrink-0">
      {children}
    </div>
  </div>
);

const SettingsPage: React.FC = () => {
  const [tone, setTone] = useState('Journalistic');
  const [model, setModel] = useState('Gemini 3 Pro');
  const [dedupSensitivity, setDedupSensitivity] = useState(85);
  const [hallucinationCheck, setHallucinationCheck] = useState(true);
  const [feedback, setFeedback] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setFeedback('saving');
    setTimeout(() => {
      setFeedback('saved');
      setTimeout(() => setFeedback('idle'), 2500);
    }, 1200);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-32">
      
      {/* AI Personalization */}
      <SettingSection 
        title="AI Personalization" 
        description="Customize how the AI researches and writes stories across the pipeline."
        icon={<Brain size={20} />}
      >
        <SettingRow 
          label="Writing Tone" 
          description="The default personality for generated drafts."
        >
          <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option>Journalistic</option>
            <option>Professional</option>
            <option>Casual & Engaging</option>
            <option>Technical</option>
            <option>Creative Narrative</option>
          </select>
        </SettingRow>
        <SettingRow 
          label="Default Research Model" 
          description="Higher models provide better accuracy but more latency."
        >
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option>Gemini 3 Pro</option>
            <option>Gemini 3 Flash</option>
          </select>
        </SettingRow>
        <SettingRow label="Hallucination Monitoring" description="Active cross-checking of generated facts against verified sources.">
          <button 
            onClick={() => setHallucinationCheck(!hallucinationCheck)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${hallucinationCheck ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hallucinationCheck ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </SettingRow>
      </SettingSection>

      {/* News Engine Settings */}
      <SettingSection 
        title="News Engine Settings" 
        description="Global operational thresholds for the news pipeline engine."
        icon={<Zap size={20} />}
      >
        <SettingRow 
          label="Deduplication Sensitivity" 
          description="Controls how strictly the AI flags similar stories (85% recommended)."
        >
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="50" max="100" 
              value={dedupSensitivity}
              onChange={(e) => setDedupSensitivity(parseInt(e.target.value))}
              className="w-48 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-sm font-black text-indigo-600 w-10">{dedupSensitivity}%</span>
          </div>
        </SettingRow>

        <SettingRow 
          label="Content Preservation" 
          description="Retain original source quotes and direct citations."
        >
          <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-indigo-600">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
          </button>
        </SettingRow>

        <SettingRow 
          label="Auto-Archive Period" 
          description="How long unreviewed drafts remain in the queue."
        >
          <select className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option>24 Hours</option>
            <option>48 Hours</option>
            <option>7 Days</option>
            <option>Never</option>
          </select>
        </SettingRow>
      </SettingSection>

      {/* Notifications */}
      <SettingSection 
        title="Notifications" 
        description="Stay updated on system health and new story drafts."
        icon={<Bell size={20} />}
      >
        <SettingRow label="Email Alerts" description="Receive high-priority system alerts and pipeline errors.">
          <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-indigo-600">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
          </button>
        </SettingRow>
        <SettingRow label="Weekly Digest" description="Summary of news volume and relevance scores.">
          <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-slate-200">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
          </button>
        </SettingRow>
      </SettingSection>

      {/* Security & API */}
      <SettingSection 
        title="Security & API" 
        description="Manage engine access and integration points."
        icon={<Shield size={20} />}
      >
        <SettingRow label="Engine API Key" description="Used for external automation and integration with the NewsEngine API.">
          <div className="flex items-center gap-2">
            <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 font-mono">ne_live_••••••••••••</code>
            <button className="text-xs text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition-colors">Regenerate</button>
          </div>
        </SettingRow>
      </SettingSection>

      {/* Floating Persist Indicator */}
      {feedback !== 'idle' && (
        <div className="fixed bottom-24 right-8 z-[100] flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {feedback === 'saving' ? (
            <>
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-widest">Syncing Config...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest">Engine Updated</span>
            </>
          )}
        </div>
      )}

      {/* Footer Controls */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-8 py-4 flex items-center justify-end gap-3 z-40">
        <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          Reset to Defaults
        </button>
        <button 
          onClick={handleSave}
          disabled={feedback === 'saving'}
          className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {feedback === 'saving' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {feedback === 'saved' ? 'Saved' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
