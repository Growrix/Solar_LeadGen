
import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  ChevronDown, 
  CheckCircle2,
  Pin,
  CalendarDays,
  TimerOff
} from 'lucide-react';
import { NewsItem } from './types';

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  item: NewsItem | null;
}

const SchedulingModal: React.FC<SchedulingModalProps> = ({ isOpen, onClose, onConfirm, item }) => {
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [publishTime, setPublishTime] = useState('09:00');
  const [priority, setPriority] = useState('Normal');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      onConfirm({
        publishDate,
        publishTime,
        priority,
        expiryDate: hasExpiry ? expiryDate : null,
        isFeatured
      });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Schedule Publication</h2>
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
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Story</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{item.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <CalendarDays size={14} /> Publish Date
              </label>
              <input 
                type="date" 
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Clock size={14} /> Time
              </label>
              <input 
                type="time" 
                value={publishTime}
                onChange={(e) => setPublishTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Normal', 'High', 'Urgent'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                    priority === p 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TimerOff size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Auto-Expiry</span>
              </div>
              <button 
                onClick={() => setHasExpiry(!hasExpiry)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${hasExpiry ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${hasExpiry ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {hasExpiry && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <input 
                  type="date" 
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 italic">Story will be unpublished automatically on this date.</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Pin as Featured</span>
              </div>
              <button 
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${isFeatured ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
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
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            Schedule Story
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SchedulingModal;
