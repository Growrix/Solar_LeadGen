import React, { useState } from 'react';
import { X, CheckCircle, EyeOff, ShieldAlert, Loader2 } from 'lucide-react';
import { CommentStatus } from '../../types';

interface BulkModerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => void;
  action: CommentStatus | null;
  count: number;
  isLoading?: boolean;
}

const BulkModerateModal: React.FC<BulkModerateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  count,
  isLoading = false
}) => {
  const [note, setNote] = useState('');

  if (!isOpen || !action) return null;

  const handleConfirm = () => {
    onConfirm(note);
    setNote('');
  };

  const config = {
    approved: {
      title: 'Approve Comments',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      btnColor: 'bg-green-600 hover:bg-green-700',
      description: `Are you sure you want to approve ${count} selected comments? They will become visible to the public.`
    },
    hidden: {
      title: 'Hide Comments',
      icon: EyeOff,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      btnColor: 'bg-slate-800 hover:bg-slate-900',
      description: `Are you sure you want to hide ${count} selected comments? They will only be visible to admins.`
    },
    spam: {
      title: 'Mark as Spam',
      icon: ShieldAlert,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
      description: `Are you sure you want to mark ${count} selected comments as spam?`
    },
    pending: { title: '', icon: X, color: '', bgColor: '', btnColor: '', description: '' } // Fallback
  };

  const currentConfig = config[action] || config.approved;
  const Icon = currentConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Icon className={`w-5 h-5 ${currentConfig.color}`} />
            {currentConfig.title}
          </h3>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            {currentConfig.description}
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Internal Note <span className="font-normal normal-case text-slate-400">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a reason for this bulk action..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 ${currentConfig.btnColor}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkModerateModal;