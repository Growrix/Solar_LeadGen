
import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  MessageSquare, 
  Layers, 
  Target, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NewsItem } from './types';

interface RewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  item: NewsItem | null;
}

const RewriteModal: React.FC<RewriteModalProps> = ({ isOpen, onClose, onConfirm, item }) => {
  const [reason, setReason] = useState('');
  const [intensity, setIntensity] = useState('Standard Rewrite');
  const [focusAreas, setFocusAreas] = useState<string[]>(['Tone & Voice']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const toggleFocusArea = (area: string) => {
    setFocusAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a reason or instructions for the rewrite.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      onConfirm({
        reason,
        intensity,
        focusAreas
      });
      setIsSubmitting(false);
      setReason('');
    }, 800);
  };

  const focusOptions = [
    'Tone & Voice',
    'Fact Density',
    'Structural Flow',
    'SEO Optimization',
    'Clarity & Conciseness',
    'Length (Shorter)',
    'Length (Longer)'
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
              <RotateCcw size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Request AI Rewrite</h2>
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
          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Target Draft</p>
            <p className="text-sm font-semibold text-indigo-900 truncate">{item.title}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <MessageSquare size={14} /> Instructions & Reasoning
            </label>
            <textarea 
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Tell the AI what needs to change (e.g., 'Make it more professional and focus more on the economic impact')..."
              className={`w-full h-28 px-4 py-3 bg-slate-50 border ${error ? 'border-rose-300' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-rose-500/10' : 'focus:ring-indigo-500/10'} focus:border-indigo-500 transition-all resize-none`}
            />
            {error && (
              <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Layers size={14} /> Rewrite Intensity
            </label>
            <select 
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option>Light Polish (Minor corrections)</option>
              <option>Standard Rewrite (Balancing existing vs new)</option>
              <option>Complete Overhaul (Fresh generation from scratch)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Target size={14} /> Strategic Focus Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {focusOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleFocusArea(option)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    focusAreas.includes(option)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {option}
                </button>
              ))}
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <RotateCcw size={18} />
            )}
            Send Rewrite Request
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RewriteModal;
