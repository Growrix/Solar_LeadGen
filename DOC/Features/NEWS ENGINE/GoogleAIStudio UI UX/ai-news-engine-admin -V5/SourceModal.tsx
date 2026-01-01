
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Rss, 
  Globe, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Link2,
  Settings2
} from 'lucide-react';
import { RSSSource, SourceStatus } from './types';

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (source: Partial<RSSSource>) => void;
  source?: RSSSource | null;
}

const SourceModal: React.FC<SourceModalProps> = ({ isOpen, onClose, onSave, source }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('RSS Feed');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  useEffect(() => {
    if (source) {
      setName(source.name);
      setUrl(source.url);
      setIsEnabled(source.status === SourceStatus.ACTIVE);
    } else {
      setName('');
      setUrl('');
      setIsEnabled(true);
    }
    setErrors({});
  }, [source, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { name?: string; url?: string } = {};
    if (!name.trim()) newErrors.name = 'Source name is required';
    if (!url.trim()) {
      newErrors.url = 'Endpoint URL is required';
    } else if (!/^(https?:\/\/)/.test(url)) {
      newErrors.url = 'Must be a valid URL starting with http:// or https://';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      onSave({
        name,
        url,
        status: isEnabled ? SourceStatus.ACTIVE : SourceStatus.INACTIVE,
      });
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Settings2 size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {source ? 'Edit Data Source' : 'Connect New Source'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Source Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Friendly Name
              </label>
              <div className="relative">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. TechCrunch Gadgets"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.name ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all`}
                />
              </div>
              {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.name}</p>}
            </div>

            {/* Source URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Endpoint URL (RSS/Atom/JSON)
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://techcrunch.com/feed/"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.url ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all`}
                />
              </div>
              {errors.url && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.url}</p>}
            </div>

            {/* Source Type Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Source Logic Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['RSS Feed', 'API Endpoint', 'Scraper'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                      type === t 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t === 'RSS Feed' && <Rss size={18} />}
                    {t === 'API Endpoint' && <Database size={18} />}
                    {t === 'Scraper' && <Globe size={18} />}
                    <span className="text-[10px] font-bold">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enabled Toggle */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-700">Enable Monitoring</p>
                <p className="text-[10px] text-slate-400">If disabled, the AI will ignore this source during syncs.</p>
              </div>
              <button 
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {source ? 'Update Source' : 'Connect Source'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SourceModal;
