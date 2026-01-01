
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  PauseCircle, 
  PlayCircle, 
  Activity, 
  Zap, 
  Search, 
  FileEdit, 
  Calendar, 
  Share2, 
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { SystemFeature } from './types';

const FeatureCard: React.FC<{ feature: SystemFeature; onToggle: () => void }> = ({ feature, onToggle }) => {
  const statusStyles = {
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    degraded: 'bg-rose-50 text-rose-700 border-rose-200',
    stopped: 'bg-slate-50 text-slate-500 border-slate-200',
  };

  const statusIcons = {
    healthy: <CheckCircle2 size={14} />,
    warning: <AlertTriangle size={14} />,
    degraded: <AlertTriangle size={14} />,
    stopped: <PauseCircle size={14} />,
  };

  return (
    <div className={`p-5 rounded-xl border transition-all bg-white shadow-sm hover:shadow-md ${!feature.isActive ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900">{feature.name}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
        </div>
        <button 
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${feature.isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${feature.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusStyles[feature.status]}`}>
          {statusIcons[feature.status]}
          {feature.status}
        </div>
        <span className="text-[10px] font-medium text-slate-400">Last: {feature.lastActivity}</span>
      </div>
    </div>
  );
};

interface ControlPageProps {
  systemStatus: 'nominal' | 'paused' | 'emergency';
  onGlobalAction: (action: 'Pause' | 'Resume' | 'Emergency') => void;
}

const ControlPage: React.FC<ControlPageProps> = ({ systemStatus, onGlobalAction }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [features, setFeatures] = useState<SystemFeature[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFeatures([
        { id: '1', name: 'RSS Ingestion', description: 'Monitor and fetch raw data from configured RSS feeds.', isActive: systemStatus === 'nominal', status: systemStatus === 'nominal' ? 'healthy' : 'stopped', lastActivity: '2m ago' },
        { id: '2', name: 'Web Research Engine', description: 'AI agents exploring secondary sources and fact-checking.', isActive: systemStatus === 'nominal', status: systemStatus === 'nominal' ? 'healthy' : 'stopped', lastActivity: '5m ago' },
        { id: '3', name: 'Drafting Engine', description: 'Generative AI creating structured news articles.', isActive: systemStatus === 'nominal', status: systemStatus === 'nominal' ? 'warning' : 'stopped', lastActivity: '12m ago' },
        { id: '4', name: 'Auto-Scheduler', description: 'Algorithmic placement of stories in publish windows.', isActive: false, status: 'stopped', lastActivity: '2d ago' },
        { id: '5', name: 'Social Distribution', description: 'Automated posting to LinkedIn, X, and internal channels.', isActive: systemStatus !== 'emergency', status: systemStatus === 'nominal' ? 'healthy' : 'stopped', lastActivity: '1h ago' },
        { id: '6', name: 'Deduplication Service', description: 'Semantic analysis to prevent covering the same story twice.', isActive: systemStatus !== 'emergency', status: systemStatus === 'nominal' ? 'degraded' : 'stopped', lastActivity: 'Just now' },
      ]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [systemStatus]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-slate-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Global Status & High Impact Controls */}
      <section className={`rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden transition-colors duration-500 ${
        systemStatus === 'nominal' ? 'bg-slate-900' : 
        systemStatus === 'paused' ? 'bg-amber-900' : 'bg-rose-950'
      }`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Activity size={120} />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border mb-2 ${
              systemStatus === 'nominal' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
              systemStatus === 'paused' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
              'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}>
              <span className="relative flex h-2 w-2">
                {systemStatus === 'nominal' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  systemStatus === 'nominal' ? 'bg-emerald-500' : 
                  systemStatus === 'paused' ? 'bg-amber-500' : 'bg-rose-500'
                }`}></span>
              </span>
              System {systemStatus === 'nominal' ? 'Live' : systemStatus === 'paused' ? 'Paused' : 'LOCKED'}
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Master Automation Control</h2>
            <p className="text-slate-400 max-w-md">Global overrides for the entire AI pipeline. Use with caution during breaking events or maintenance.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => onGlobalAction('Resume')}
              disabled={systemStatus === 'nominal'}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayCircle size={20} fill="currentColor" />
              Resume All
            </button>
            <button 
              onClick={() => onGlobalAction('Pause')}
              disabled={systemStatus !== 'nominal'}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 border border-slate-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PauseCircle size={20} />
              Pause Pipeline
            </button>
            <button 
              onClick={() => onGlobalAction('Emergency')}
              disabled={systemStatus === 'emergency'}
              className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldAlert size={20} />
              Emergency Stop
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Feature Toggles */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Terminal size={20} className="text-indigo-600" />
              Pipeline Sub-Systems
            </h3>
            <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              <RefreshCw size={14} /> Refresh Health
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(f => (
              <FeatureCard 
                key={f.id} 
                feature={f} 
                onToggle={() => {
                  const newFeatures = features.map(item => item.id === f.id ? {...item, isActive: !item.isActive} : item);
                  setFeatures(newFeatures);
                }} 
              />
            ))}
          </div>
        </div>

        {/* Safety & Compliance Side Panel */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock size={20} className="text-indigo-600" />
            Safety Center
          </h3>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Human Checkpoint</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-100">Enforced</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">System will not bypass manual review for items with relevance below 95%.</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Rate Limiting</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider border border-indigo-100">Nominal</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[24%]" />
              </div>
              <p className="text-[10px] text-slate-400">Current Token consumption: 14.2k / 1.5M / hr</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Safety Filters</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-100">Active</span>
              </div>
              <div className="space-y-2">
                {['Bias Checker', 'Hallucination Monitor', 'PII Filter'].map(t => (
                  <div key={t} className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Operational Alert</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Deduplication service is currently experiencing high latency. Some redundant drafts may appear in the queue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPage;
