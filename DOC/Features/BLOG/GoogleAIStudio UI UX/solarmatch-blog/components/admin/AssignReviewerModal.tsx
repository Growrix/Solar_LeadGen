
import React, { useState } from 'react';
import { X, User, Check, Loader2, Search } from 'lucide-react';

interface AssignReviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (reviewer: string) => void;
  selectedCount: number;
}

const REVIEWERS = [
  { id: '1', name: 'Sarah Jenkins', role: 'Senior Editor', avatar: 'https://picsum.photos/seed/user1/100/100' },
  { id: '2', name: 'David Chen', role: 'Content Manager', avatar: 'https://picsum.photos/seed/user2/100/100' },
  { id: '3', name: 'Emily Ross', role: 'Compliance Officer', avatar: 'https://picsum.photos/seed/user3/100/100' },
  { id: '4', name: 'Admin User', role: 'Administrator', avatar: 'https://picsum.photos/seed/user_admin/100/100' },
];

const AssignReviewerModal: React.FC<AssignReviewerModalProps> = ({ isOpen, onClose, onAssign, selectedCount }) => {
  const [selectedReviewerId, setSelectedReviewerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const handleAssign = () => {
    if (!selectedReviewerId) return;
    setIsSubmitting(true);
    setTimeout(() => {
        const reviewerName = REVIEWERS.find(r => r.id === selectedReviewerId)?.name || 'Unknown';
        onAssign(reviewerName);
        setIsSubmitting(false);
        onClose();
        setSelectedReviewerId(null);
    }, 800);
  };

  const filteredReviewers = REVIEWERS.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={!isSubmitting ? onClose : undefined}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Assign Reviewer</h3>
            <p className="text-xs text-slate-500">Assigning {selectedCount} draft{selectedCount !== 1 ? 's' : ''}</p>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 outline-none"
            />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredReviewers.map(reviewer => (
              <div 
                key={reviewer.id}
                onClick={() => setSelectedReviewerId(reviewer.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedReviewerId === reviewer.id 
                    ? 'border-solar-500 bg-solar-50 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={reviewer.avatar} alt="" className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{reviewer.name}</p>
                    <p className="text-xs text-slate-500">{reviewer.role}</p>
                  </div>
                </div>
                {selectedReviewerId === reviewer.id && (
                  <div className="w-5 h-5 bg-solar-600 rounded-full flex items-center justify-center text-white">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleAssign}
            disabled={!selectedReviewerId || isSubmitting}
            className="px-4 py-2 bg-solar-600 text-white rounded-lg font-medium hover:bg-solar-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Assign Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignReviewerModal;
