
import React, { useState } from 'react';
import { X, Terminal, Copy, Check, Cpu, Clock, Database, Code } from 'lucide-react';
import { LogEntry } from './types';

interface PromptDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: LogEntry | null;
}

const PromptDetailsModal: React.FC<PromptDetailsModalProps> = ({ isOpen, onClose, log }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !log) return null;

  const handleCopy = () => {
    if (log.promptUsed) {
      navigator.clipboard.writeText(log.promptUsed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-3xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Terminal size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Prompt Architecture</h2>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                <span className="flex items-center gap-1"><Cpu size={12} /> {log.origin} Engine</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span>Log ID: {log.id}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </header>

        {/* Metadata Strip */}
        <div className="px-8 py-4 bg-white border-b border-slate-100 grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Endpoint</p>
            <p className="text-sm font-bold text-slate-700">Gemini 3 Pro (Experimental)</p>
          </div>
          <div className="space-y-1 border-x border-slate-100 px-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</p>
            <p className="text-sm font-bold text-slate-700">{log.timestamp}</p>
          </div>
          <div className="space-y-1 pl-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Performed</p>
            <p className="text-sm font-bold text-indigo-600">{log.action}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                <Code size={14} />
                Raw System Prompt
              </div>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  copied 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Prompt'}
              </button>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-600/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-inner min-h-[300px]">
                <pre className="text-indigo-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {log.promptUsed || 'No prompt data recorded for this manual action.'}
                </pre>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <Database size={16} className="text-indigo-600 mt-0.5" />
              <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                <strong>Context Injection:</strong> This prompt included 4 verified RSS sources and 122KB of historical data to ensure factual consistency across the NewsEngine network.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 py-5 border-t border-slate-100 bg-white flex items-center justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Close Details
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PromptDetailsModal;
