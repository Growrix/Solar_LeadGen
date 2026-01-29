
import React, { useState, useEffect } from 'react';
import { 
  X, 
  PauseCircle, 
  CheckCircle2,
  AlertOctagon,
  Loader2,
  Zap,
  Globe
} from 'lucide-react';

export type ConfirmationVariant = 'warning' | 'danger' | 'info' | 'success' | 'publish';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: ConfirmationVariant;
  requireConfirmText?: string; // If provided, user must type this to enable confirm button
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel,
  variant = 'warning',
  requireConfirmText
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setConfirmInput('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const themes = {
    warning: {
      icon: <PauseCircle size={28} />,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
      border: 'border-amber-100'
    },
    danger: {
      icon: <AlertOctagon size={28} />,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
      border: 'border-rose-100'
    },
    info: {
      icon: <Zap size={28} />,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
      border: 'border-indigo-100'
    },
    success: {
      icon: <CheckCircle2 size={28} />,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
      border: 'border-emerald-100'
    },
    publish: {
      icon: <Globe size={28} />,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
      border: 'border-indigo-100'
    }
  };

  const theme = themes[variant];
  const isConfirmDisabled = (requireConfirmText && confirmInput !== requireConfirmText) || isSubmitting;

  const handleConfirm = () => {
    setIsSubmitting(true);
    // Deterministic delay for visual confirmation of progress
    setTimeout(() => {
      onConfirm();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-10 text-center space-y-6">
          <div className={`mx-auto w-16 h-16 rounded-[22px] flex items-center justify-center border-2 mb-2 ${theme.iconBg} shadow-sm animate-in slide-in-from-top-4 duration-500`}>
            {theme.icon}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed px-2">
              {message}
            </p>
          </div>

          {requireConfirmText && (
            <div className="space-y-3 pt-2 animate-in fade-in duration-500">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Verification required: Type <span className="text-indigo-600 font-black">"{requireConfirmText}"</span>
              </label>
              <input 
                autoFocus
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border ${confirmInput === requireConfirmText ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200'} rounded-xl text-center text-sm font-bold focus:outline-none transition-all placeholder:text-slate-300`}
                placeholder="Type here..."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-8 pb-8 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-4 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-white rounded-2xl font-black text-xs shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest ${isConfirmDisabled ? 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed' : theme.button}`}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmationModal;
