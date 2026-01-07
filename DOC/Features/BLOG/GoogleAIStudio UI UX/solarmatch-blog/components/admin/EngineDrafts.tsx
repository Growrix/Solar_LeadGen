
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Edit3, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Bot, 
  User, 
  Zap,
  RefreshCw,
  ExternalLink,
  Users,
  ThumbsUp,
  ThumbsDown,
  Trash2
} from 'lucide-react';
import SkeletonAdminTable from './SkeletonAdminTable';
import ReviewDraftModal from './ReviewDraftModal';
import AssignReviewerModal from './AssignReviewerModal';

// Types
type DraftStatus = 'needs_review' | 'draft_ready' | 'rejected' | 'error';
type DraftSource = 'manual' | 'ai_assistant' | 'automation';

export interface DraftItem {
  id: string;
  title: string;
  excerpt: string;
  source: DraftSource;
  status: DraftStatus;
  author: string;
  assignedTo?: string; // New field for reviewer assignment
  updatedAt: string;
  confidenceScore?: number; // Simulated AI confidence
}

// Mock Data
export const MOCK_DRAFTS: DraftItem[] = [
  { 
    id: '101', 
    title: 'Solar Battery Storage Trends 2025', 
    excerpt: 'An in-depth look at how lithium-iron-phosphate adoption is reshaping residential storage...', 
    source: 'automation', 
    status: 'needs_review', 
    author: 'Auto-Engine', 
    assignedTo: 'Sarah Jenkins',
    updatedAt: '15 mins ago',
    confidenceScore: 88
  },
  { 
    id: '102', 
    title: 'Tax Incentives for Commercial Solar', 
    excerpt: 'Updated guide on the ITC extension and what it means for small businesses in California...', 
    source: 'ai_assistant', 
    status: 'draft_ready', 
    author: 'Sarah Jenkins (AI Assisted)', 
    updatedAt: '1 hour ago',
    confidenceScore: 95
  },
  { 
    id: '103', 
    title: 'The Myth of cloudy days', 
    excerpt: 'Debunking common misconceptions about solar production during winter months.', 
    source: 'manual', 
    status: 'needs_review', 
    author: 'Admin User', 
    updatedAt: '3 hours ago'
  },
  { 
    id: '104', 
    title: 'Installation Safety Protocols', 
    excerpt: 'Internal guidelines for safety harness compliance...', 
    source: 'automation', 
    status: 'error', 
    author: 'Auto-Engine', 
    updatedAt: '5 hours ago',
    confidenceScore: 42
  },
  { 
    id: '105', 
    title: 'Old Gen Panel Recycling', 
    excerpt: 'What happens to panels after 25 years? A sustainability report.', 
    source: 'ai_assistant', 
    status: 'rejected', 
    author: 'AI Assistant', 
    updatedAt: '1 day ago',
    confidenceScore: 65
  },
];

interface EngineDraftsProps {
  items: DraftItem[];
  setItems: React.Dispatch<React.SetStateAction<DraftItem[]>>;
}

const EngineDrafts: React.FC<EngineDraftsProps> = ({ items, setItems }) => {
  const [viewState, setViewState] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<DraftItem | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulate Initial Load
  useEffect(() => {
    if (items.length === 0 && viewState === 'loading') {
       const timer = setTimeout(() => {
         setViewState('success');
       }, 800);
       return () => clearTimeout(timer);
    } else {
       setViewState('success');
    }
  }, [items]);

  // Selection Header Logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesConfidence = !item.confidenceScore || item.confidenceScore >= confidenceThreshold;
    return matchesSearch && matchesStatus && matchesConfidence;
  });

  useEffect(() => {
    if (headerCheckboxRef.current) {
      const allSelected = filteredItems.length > 0 && selectedIds.size === filteredItems.length;
      const someSelected = selectedIds.size > 0 && selectedIds.size < filteredItems.length;
      headerCheckboxRef.current.indeterminate = someSelected;
      headerCheckboxRef.current.checked = allSelected;
    }
  }, [selectedIds, filteredItems]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleReview = (draft: DraftItem) => {
    setSelectedDraft(draft);
    setReviewModalOpen(true);
  };

  const handleReviewAction = (action: string) => {
    if (!selectedDraft) return;
    
    const actionMap: Record<string, string> = {
      'published': 'Draft published successfully!',
      'scheduled': 'Draft scheduled successfully!',
      'rejected': 'Draft rejected.',
      'rewrite_requested': 'Rewrite requested from engine.'
    };

    setToastMessage(actionMap[action] || 'Action completed.');
    setItems(prev => prev.filter(i => i.id !== selectedDraft.id));
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Bulk Actions
  const handleBulkApprove = () => {
    setItems(prev => prev.map(item => selectedIds.has(item.id) ? { ...item, status: 'draft_ready' } : item));
    setToastMessage(`${selectedIds.size} drafts approved for editing.`);
    setSelectedIds(new Set());
  };

  const handleBulkReject = () => {
    setItems(prev => prev.map(item => selectedIds.has(item.id) ? { ...item, status: 'rejected' } : item));
    setToastMessage(`${selectedIds.size} drafts rejected.`);
    setSelectedIds(new Set());
  };

  const handleBulkAssign = (reviewerName: string) => {
    setItems(prev => prev.map(item => selectedIds.has(item.id) ? { ...item, assignedTo: reviewerName } : item));
    setToastMessage(`${selectedIds.size} drafts assigned to ${reviewerName}.`);
    setSelectedIds(new Set());
  };

  const handleOpenEditor = (id: string) => {
    window.location.hash = `#/admin/blog/${id}`;
  };

  // UI Components
  const StatusBadge = ({ status }: { status: DraftStatus }) => {
    switch (status) {
      case 'needs_review':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200"><AlertCircle className="w-3 h-3 mr-1" /> Needs Review</span>;
      case 'draft_ready':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"><CheckCircle className="w-3 h-3 mr-1" /> Draft Ready</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
      case 'error':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"><AlertCircle className="w-3 h-3 mr-1" /> Error</span>;
      default: return null;
    }
  };

  const SourceIcon = ({ source }: { source: DraftSource }) => {
    switch (source) {
      case 'automation': return <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100"><Zap className="w-3.5 h-3.5 fill-current" /> Auto-Engine</div>;
      case 'ai_assistant': return <div className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100"><Bot className="w-3.5 h-3.5" /> AI Assistant</div>;
      case 'manual': return <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200"><User className="w-3.5 h-3.5" /> Manual</div>;
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
           <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">{toastMessage}</span>
           </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewDraftModal 
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        draft={selectedDraft ? { ...selectedDraft, source: selectedDraft.source } : null}
        onActionComplete={handleReviewAction}
        onEdit={() => {
          setReviewModalOpen(false);
          if (selectedDraft) handleOpenEditor(selectedDraft.id);
        }}
      />

      {/* Assign Reviewer Modal */}
      <AssignReviewerModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleBulkAssign}
        selectedCount={selectedIds.size}
      />
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-4">
        <div>
           <h2 className="text-lg font-bold text-slate-900">Review Queue</h2>
           <p className="text-sm text-slate-500">Manage incoming drafts from automation and manual inputs.</p>
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
           {/* Status Tabs */}
           <div className="flex items-center gap-1 overflow-x-auto w-full xl:w-auto p-1 scrollbar-hide">
              {[{ id: 'all', label: 'All' }, { id: 'needs_review', label: 'Needs Review' }, { id: 'draft_ready', label: 'Draft Ready' }, { id: 'rejected', label: 'Rejected' }, { id: 'error', label: 'Errors' }].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${statusFilter === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {tab.label}
                </button>
              ))}
           </div>

           <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
              {/* Confidence Threshold Slider */}
              <div className="flex items-center gap-3 w-full sm:w-auto px-2 border-r border-slate-100 mr-2">
                 <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Min Confidence: <span className="text-slate-900 font-bold">{confidenceThreshold}%</span></span>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   step="5"
                   value={confidenceThreshold}
                   onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                   className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-solar-600"
                 />
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search drafts..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all"
                  />
              </div>
           </div>
        </div>
      </div>

      {/* Content Area */}
      {viewState === 'loading' && <SkeletonAdminTable />}

      {viewState === 'error' && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-red-900 mb-1">Failed to load drafts</h3>
          <button onClick={() => window.location.reload()} className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {viewState === 'success' && filteredItems.length === 0 && (
         <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center">
           <div className="bg-slate-50 p-4 rounded-full mb-4">
             <FileText className="w-6 h-6 text-slate-400" />
           </div>
           <h3 className="text-lg font-medium text-slate-900">No drafts found</h3>
           <p className="text-slate-500 mt-1 mb-4">No items match your current filters.</p>
           <button 
             onClick={() => {setStatusFilter('all'); setSearchQuery(''); setConfidenceThreshold(0);}}
             className="text-solar-600 font-medium text-sm hover:underline"
           >
             Clear filters
           </button>
         </div>
      )}

      {viewState === 'success' && filteredItems.length > 0 && (
        <>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-16">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="w-12 px-6 py-4 text-left">
                     <input 
                       type="checkbox" 
                       ref={headerCheckboxRef} 
                       onChange={handleSelectAll} 
                       className="rounded border-slate-300 text-solar-600 focus:ring-solar-500 w-4 h-4 cursor-pointer" 
                     />
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">
                    Article Details
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr key={item.id} className={`transition-colors group ${isSelected ? 'bg-solar-50/50 hover:bg-solar-50' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <input 
                           type="checkbox" 
                           checked={isSelected} 
                           onChange={() => handleSelectRow(item.id)} 
                           className="rounded border-slate-300 text-solar-600 focus:ring-solar-500 w-4 h-4 cursor-pointer" 
                         />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-900 line-clamp-1">{item.title}</span>
                          <span className="text-xs text-slate-500 line-clamp-1">{item.excerpt}</span>
                          {item.confidenceScore && (
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              AI Confidence: <span className={item.confidenceScore > 80 ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{item.confidenceScore}%</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <SourceIcon source={item.source} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         {item.assignedTo ? (
                           <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                             <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] border border-indigo-200">
                               {item.assignedTo.charAt(0)}
                             </div>
                             {item.assignedTo}
                           </div>
                         ) : (
                           <span className="text-xs text-slate-400 italic">Unassigned</span>
                         )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEditor(item.id)}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors group-hover:opacity-100 opacity-60"
                            title="Open in Editor"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          
                          {item.status === 'needs_review' ? (
                            <button 
                              onClick={() => handleReview(item)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-solar-50 text-solar-700 hover:bg-solar-100 rounded-lg border border-solar-200 transition-colors shadow-sm"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Review
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleOpenEditor(item.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Pagination Placeholder */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredItems.length} drafts</span>
              <div className="flex gap-2">
                 <button disabled className="px-2 py-1 bg-white border border-slate-200 rounded opacity-50 cursor-not-allowed">Previous</button>
                 <button disabled className="px-2 py-1 bg-white border border-slate-200 rounded opacity-50 cursor-not-allowed">Next</button>
              </div>
            </div>
          </div>

          {/* Floating Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up w-[90%] max-w-2xl">
              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border border-slate-700">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start pl-2">
                  <span className="bg-white text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedIds.size}
                  </span>
                  <span className="text-sm font-medium whitespace-nowrap">Selected</span>
                </div>
                
                <div className="h-px w-full sm:h-8 sm:w-px bg-slate-700"></div>
                
                <div className="flex items-center gap-2 flex-wrap justify-center w-full sm:w-auto">
                   <button onClick={handleBulkApprove} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2" title="Approve Selected">
                     <ThumbsUp className="w-4 h-4" /> <span className="hidden sm:inline">Approve</span>
                   </button>
                   <button onClick={handleBulkReject} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2" title="Reject Selected">
                     <ThumbsDown className="w-4 h-4" /> <span className="hidden sm:inline">Reject</span>
                   </button>
                   <button onClick={() => setAssignModalOpen(true)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2" title="Assign Reviewer">
                     <Users className="w-4 h-4" /> <span className="hidden sm:inline">Assign</span>
                   </button>
                   
                   <div className="w-px h-6 bg-slate-700 mx-2 hidden sm:block"></div>
                   
                   <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap">
                     Clear
                   </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EngineDrafts;
