import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bot, 
  User, 
  Zap, 
  Calendar, 
  Send, 
  RefreshCw, 
  ThumbsDown,
  Edit3,
  Loader2
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import ScheduleModal from './ScheduleModal';

interface ReviewDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: {
    id: string;
    title: string;
    status: string;
    source: string; // 'ai', 'automation', 'manual' etc
    author: string;
  } | null;
  onActionComplete: (action: string) => void;
  onEdit: () => void;
}

const ReviewDraftModal: React.FC<ReviewDraftModalProps> = ({ 
  isOpen, 
  onClose, 
  draft,
  onActionComplete,
  onEdit
}) => {
  // Local States
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Sub-Modals
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Mock Loading of Content
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    if (isOpen && draft) {
      setRejectMode(false);
      setRejectReason('');
      setIsProcessing(false);
      setContentLoading(true);
      // Simulate fetch
      setTimeout(() => setContentLoading(false), 800);
    }
  }, [isOpen, draft]);

  if (!isOpen || !draft) return null;

  // Handlers
  const handleReject = () => {
    if (!rejectReason.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onActionComplete('rejected');
      onClose();
    }, 1000);
  };

  const handleRewrite = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onActionComplete('rewrite_requested');
      onClose();
    }, 1000);
  };

  const handlePublish = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPublishConfirm(false);
      onActionComplete('published');
      onClose();
    }, 1000);
  };

  const handleSchedule = (date: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowScheduleModal(false);
      onActionComplete('scheduled');
      onClose();
    }, 1000);
  };

  // Helper for source icon
  const SourceIcon = () => {
    const s = draft.source.toLowerCase();
    if (s.includes('ai') || s.includes('assistant')) return <Bot className="w-4 h-4 text-purple-600" />;
    if (s.includes('auto')) return <Zap className="w-4 h-4 text-blue-600" />;
    return <User className="w-4 h-4 text-slate-500" />;
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
             <div>
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 Review Draft
                 <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium uppercase tracking-wide">
                   {draft.status.replace('_', ' ')}
                 </span>
               </h3>
               <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                 <span className="flex items-center gap-1">
                   <SourceIcon /> {draft.source}
                 </span>
                 <span>•</span>
                 <span>Author: {draft.author}</span>
               </div>
             </div>
             <button 
               onClick={onClose}
               className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
             >
               <X className="w-5 h-5" />
             </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 font-serif">
              {draft.title}
            </h1>

            {contentLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-11/12" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-32 bg-slate-100 rounded w-full my-6" />
                <div className="h-4 bg-slate-100 rounded w-5/6" />
                <div className="h-4 bg-slate-100 rounded w-full" />
              </div>
            ) : (
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                <p className="lead text-lg mb-6">
                  {/* Mock content based on title */}
                  This is a preview of the generated content for <strong>"{draft.title}"</strong>. 
                  In a real implementation, the full HTML body of the draft would be rendered here for review.
                </p>
                <p>
                  Solar energy adoption continues to accelerate globally. As we examine the current market trends, 
                  it becomes clear that efficiency and storage are the key drivers for the next decade. 
                  Recent policy changes have further incentivized residential installations.
                </p>
                <div className="my-6 p-4 bg-slate-50 border-l-4 border-solar-500 italic">
                  "The future of energy is decentralized, digital, and decarbonized."
                </div>
                <h3>Key Takeaways</h3>
                <ul>
                  <li>Increased panel efficiency ratings.</li>
                  <li>Lower battery storage costs.</li>
                  <li>Smart grid integration capabilities.</li>
                </ul>
                <p>
                  As we move forward, monitoring these metrics will be crucial for stakeholders across the industry.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
            {rejectMode ? (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Factual errors in the second paragraph..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setRejectMode(false)}
                    className="px-4 py-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || isProcessing}
                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirm Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-3 w-full sm:w-auto">
                   <button 
                     onClick={() => setRejectMode(true)}
                     className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                   >
                     <ThumbsDown className="w-4 h-4" /> Reject
                   </button>
                   <button 
                     onClick={onEdit}
                     className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                   >
                     <Edit3 className="w-4 h-4" /> Edit
                   </button>
                </div>

                <div className="flex gap-3 w-full sm:w-auto justify-end">
                   <button 
                     onClick={handleRewrite}
                     className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium shadow-sm"
                   >
                     {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                     Request Rewrite
                   </button>
                   
                   <button 
                     onClick={() => setShowScheduleModal(true)}
                     className="flex items-center gap-2 px-4 py-2 text-solar-700 bg-solar-100 hover:bg-solar-200 rounded-lg text-sm font-medium shadow-sm"
                   >
                     <Calendar className="w-4 h-4" /> Schedule
                   </button>
                   
                   <button 
                     onClick={() => setShowPublishConfirm(true)}
                     className="flex items-center gap-2 px-4 py-2 text-white bg-solar-600 hover:bg-solar-700 rounded-lg text-sm font-medium shadow-sm"
                   >
                     <Send className="w-4 h-4" /> Publish Now
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub Modals */}
      <ConfirmationModal
        isOpen={showPublishConfirm}
        onClose={() => setShowPublishConfirm(false)}
        onConfirm={handlePublish}
        isLoading={isProcessing}
        title="Publish Draft?"
        message="This will immediately publish the article to your live blog. Are you sure it's ready?"
        confirmLabel="Publish Now"
        isDestructive={false}
      />

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onConfirm={handleSchedule}
        isLoading={isProcessing}
      />
    </>
  );
};

export default ReviewDraftModal;