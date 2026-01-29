
import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  AlertCircle, 
  MessageSquare, 
  CheckSquare, 
  Square,
  AlertOctagon
} from 'lucide-react';
import { NewsItem } from './types';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  item: NewsItem | null;
}

const RejectModal: React.FC<RejectModalProps> = ({ isOpen, onClose, onConfirm, item }) => {
  const [reason, setReason] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  if (!isOpen || !item) return null;

  const rejectionCategories = [
    'Factual Inaccuracy',
    'Policy Violation',
    'Low Quality / Hallucination',
    'Off-topic / Irrelevant',
    'Grammar & Syntax Errors',
    'Biased Content'
  ];

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setTouched(true);
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      onConfirm({
        reason,
        categories
      });
      setIsSubmitting(false);
      setReason('');
      setCategories([]);
      setTouched(false);
    }, 700);
  };

  const isFormValid = reason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop - darker for rejection context */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertOctagon size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Reject News Draft</h2>
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
          <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-100/50">
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Permanently Rejecting</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{item.title}</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertCircle size={14} /> Rejection Reasons
            </label>
            <div className="grid grid-cols-1 gap-2">
              {rejectionCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                    categories.includes(cat)
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {categories.includes(cat) ? (
                    <CheckSquare size={16} className="text-rose-600" />
                  ) : (
                    <Square size={16} className="text-slate-300" />
                  )}
                  <span className="text-xs font-medium">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
              <MessageSquare size={14} /> Detailed Feedback <span className="text-rose-500">*</span>
            </label>
            <textarea 
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
              }}
              onBlur={() => setTouched(true)}
              placeholder="Provide specific feedback on why this draft is being rejected..."
              className={`w-full h-24 px-4 py-3 bg-slate-50 border ${touched && !isFormValid ? 'border-rose-400 ring-2 ring-rose-50' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none`}
            />
            {touched && !isFormValid && (
              <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> A rejection reason is required to audit the decision.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isSubmitting || !isFormValid}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98] ${
              isFormValid 
                ? 'bg-rose-600 text-white shadow-rose-500/20 hover:bg-rose-700' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
            Reject Draft
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RejectModal;
