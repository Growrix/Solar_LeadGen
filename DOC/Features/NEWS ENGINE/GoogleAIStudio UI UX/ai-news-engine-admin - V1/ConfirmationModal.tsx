
import React from 'react';
import { 
  X, 
  AlertTriangle, 
  PauseCircle, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'warning' | 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel,
  variant = 'warning' 
}) => {
  if (!isOpen) return null;

  const themes = {
    warning: {
      icon: <PauseCircle size={24} />,
      iconBg: 'bg-amber-50 text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
      border: 'border-amber-100'
    },
    danger: {
      icon: <ShieldAlert size={24} />,
      iconBg: 'bg-rose-50 text-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
      border: 'border-rose-100'
    },
    info: {
      icon: <ArrowRight size={24} />,
      iconBg: 'bg-indigo-50 text-indigo-600',
      button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
      border: 'border-indigo-100'
    }
  };

  const theme = themes[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="p-8 text-center space-y-4">
          <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-2 ${theme.iconBg}`}>
            {theme.icon}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98] ${theme.button}`}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmationModal;
