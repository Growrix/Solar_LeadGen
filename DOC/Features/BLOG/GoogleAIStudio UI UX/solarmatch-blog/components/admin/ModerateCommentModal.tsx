import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle, 
  EyeOff, 
  ShieldAlert, 
  FileText,
  ExternalLink
} from 'lucide-react';
import { Comment, CommentStatus } from '../../types';

interface ModerateCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: Comment | null;
  onAction: (action: CommentStatus, note?: string) => void;
}

const ModerateCommentModal: React.FC<ModerateCommentModalProps> = ({ 
  isOpen, 
  onClose, 
  comment, 
  onAction 
}) => {
  const [internalNote, setInternalNote] = useState('');

  if (!isOpen || !comment) return null;

  const handleAction = (status: CommentStatus) => {
    onAction(status, internalNote);
    setInternalNote(''); // Reset note after action
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-500" />
            Moderate Comment
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* Author & Meta */}
          <div className="flex items-start gap-4 mb-6">
            <img 
              src={comment.authorAvatar} 
              alt={comment.authorName} 
              className="w-12 h-12 rounded-full border border-slate-200 bg-slate-100 object-cover flex-shrink-0" 
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900">{comment.authorName}</h4>
              <p className="text-xs text-slate-500 mb-1">{comment.authorEmail}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {comment.submittedAt}
                </span>
                <span className={`capitalize px-1.5 py-0.5 rounded border ${
                   comment.status === 'approved' ? 'bg-green-50 border-green-100 text-green-700' :
                   comment.status === 'spam' ? 'bg-red-50 border-red-100 text-red-700' :
                   comment.status === 'hidden' ? 'bg-slate-100 border-slate-200 text-slate-600' :
                   'bg-amber-50 border-amber-100 text-amber-700'
                }`}>
                  {comment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Context (Post) */}
          <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between group">
             <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
               <FileText className="w-4 h-4 text-slate-400" />
               <span className="truncate">On: <span className="font-medium text-slate-900">{comment.postTitle}</span></span>
             </div>
             <a 
               href={`#/blog/${comment.postSlug}`} 
               target="_blank" 
               rel="noreferrer"
               className="text-slate-400 hover:text-solar-600 p-1"
               title="View Post"
             >
               <ExternalLink className="w-4 h-4" />
             </a>
          </div>

          {/* Comment Body */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Comment Content
            </label>
            <div className="bg-white border border-slate-200 rounded-lg p-4 text-slate-800 text-sm leading-relaxed shadow-sm">
              {comment.content}
            </div>
          </div>

          {/* Internal Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Internal Note <span className="font-normal normal-case text-slate-400">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add a reason for your decision..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors text-sm"
          >
            Cancel
          </button>
          
          <div className="w-full sm:w-auto flex gap-2">
            <button 
              onClick={() => handleAction('spam')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              title="Mark as Spam"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="sm:hidden">Spam</span>
            </button>

            <button 
              onClick={() => handleAction('hidden')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
            >
              <EyeOff className="w-4 h-4" />
              Hide
            </button>

            <button 
              onClick={() => handleAction('approved')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModerateCommentModal;