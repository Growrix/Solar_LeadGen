
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Sparkles, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play,
  RefreshCw,
  Calendar
} from 'lucide-react';
import SkeletonAdminTable from './SkeletonAdminTable';
import ReviewDraftModal from './ReviewDraftModal';
import { DraftItem } from './EngineDrafts';

// Mock Data for fallback
const MOCK_ENGINE_ITEMS: DraftItem[] = [
  { id: '1', title: 'The Future of Solar Batteries', excerpt: 'Exploring the next generation of energy storage.', status: 'needs_review', source: 'ai_assistant', author: 'AI Assistant', updatedAt: '10 mins ago' },
  { id: '2', title: 'Top 10 Solar Incentives 2024', excerpt: 'A comprehensive list of federal and state rebates.', status: 'draft_ready', source: 'manual', author: 'Admin User', updatedAt: '2 hours ago' },
  { id: '3', title: 'Understanding Net Metering 2.0', excerpt: 'How the new policies affect your ROI.', status: 'draft_ready', source: 'ai_assistant', author: 'AI Assistant', updatedAt: '5 hours ago' },
];

interface EngineDashboardProps {
  stats?: {
    drafts: number;
    needsReview: number;
    scheduled: number;
    published: number;
  };
  recentItems?: DraftItem[];
}

const EngineDashboard: React.FC<EngineDashboardProps> = ({ stats, recentItems }) => {
  const [viewState, setViewState] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DraftItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync props to state
  useEffect(() => {
    if (recentItems) {
      setItems(recentItems);
      if (viewState === 'loading') setViewState('success');
    } else {
      // Fallback
      const timer = setTimeout(() => {
        setItems(MOCK_ENGINE_ITEMS);
        setViewState('success');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [recentItems]);

  const handleReview = (item: DraftItem) => {
    setSelectedItem(item);
    setReviewModalOpen(true);
  };

  const handleReviewAction = (action: string) => {
    if (!selectedItem) return;
    
    // Optimistic UI update
    const actionMap: Record<string, string> = {
      'published': 'Content published successfully!',
      'scheduled': 'Content scheduled successfully!',
      'rejected': 'Content rejected.',
      'rewrite_requested': 'Rewrite requested.'
    };

    setToastMessage(actionMap[action] || 'Action completed.');
    
    // In a real app we'd bubble this up, but for dashboard view, local optimistic update is fine
    if (action === 'rejected' || action === 'published' || action === 'scheduled') {
        setItems(prev => prev.filter(i => i.id !== selectedItem.id));
    }

    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      draft_ready: 'bg-slate-100 text-slate-700 border-slate-200',
      needs_review: 'bg-amber-50 text-amber-700 border-amber-200',
      scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
      published: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };

    const displayStatus = status.replace('_', ' ');

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status] || styles['draft_ready']}`}>
        {status === 'needs_review' && <AlertCircle className="w-3 h-3 mr-1" />}
        {status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
        {displayStatus}
      </span>
    );
  };

  const kpiData = [
    { label: 'Drafts Today', value: stats?.drafts ?? 12, change: '+2', trend: 'up', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'Needs Review', value: stats?.needsReview ?? 5, change: '+1', trend: 'down', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Scheduled', value: stats?.scheduled ?? 8, change: '0', trend: 'neutral', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Published', value: stats?.published ?? 145, change: '+3', trend: 'up', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  // KPI Skeleton
  const KPISkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
       {[1,2,3,4].map(i => (
         <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse">
            <div className="h-4 w-24 bg-slate-100 rounded mb-3" />
            <div className="h-8 w-16 bg-slate-100 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
         </div>
       ))}
    </div>
  );

  return (
    <div className="space-y-8">
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
        draft={selectedItem ? {
          id: selectedItem.id,
          title: selectedItem.title,
          status: selectedItem.status,
          source: selectedItem.source,
          author: selectedItem.author
        } : null}
        onActionComplete={handleReviewAction}
        onEdit={() => {
          setReviewModalOpen(false);
          if (selectedItem) window.location.hash = `#/admin/blog/${selectedItem.id}`;
        }}
      />

      {/* KPI Section */}
      {viewState === 'loading' && !stats ? <KPISkeleton /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-500">{kpi.label}</span>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{kpi.value}</span>
                <div className={`flex items-center text-xs font-medium ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-slate-400'}`}>
                  {kpi.trend === 'up' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                  {kpi.trend === 'down' && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {kpi.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
           {/* Status Filter */}
           <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
             >
               <option value="all">All Status</option>
               <option value="draft_ready">Drafts</option>
               <option value="needs_review">Needs Review</option>
               <option value="scheduled">Scheduled</option>
               <option value="published">Published</option>
             </select>
           </div>
           
           {/* Search */}
           <div className="relative flex-grow sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input
               type="text"
               placeholder="Search items..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all placeholder-slate-400"
             />
           </div>
        </div>
      </div>

      {/* Content Table */}
      {viewState === 'loading' && !recentItems && <SkeletonAdminTable />}

      {viewState === 'error' && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-red-900 mb-1">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">We couldn't fetch the latest engine data.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {viewState === 'success' && filteredItems.length === 0 && (
         <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center">
           <div className="bg-slate-50 p-4 rounded-full mb-4">
             <Search className="w-6 h-6 text-slate-400" />
           </div>
           <h3 className="text-lg font-medium text-slate-900">No items found</h3>
           <p className="text-slate-500 mt-1 mb-4">Try adjusting your search or filters.</p>
           <button 
             onClick={() => {setSearchQuery(''); setStatusFilter('all');}}
             className="text-solar-600 font-medium text-sm hover:underline"
           >
             Clear all filters
           </button>
         </div>
      )}

      {viewState === 'success' && filteredItems.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Origin
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${item.source === 'ai_assistant' ? 'bg-purple-50' : item.source === 'automation' ? 'bg-blue-50' : 'bg-slate-100'}`}>
                           {item.source === 'ai_assistant' ? <Sparkles className="w-4 h-4 text-purple-600" /> : item.source === 'automation' ? <RefreshCw className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-slate-500" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{item.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">by {item.author}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded ${
                        item.source === 'ai_assistant' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.source === 'ai_assistant' ? 'AI Assistant' : item.source === 'automation' ? 'Auto-Engine' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {item.updatedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleReview(item)}
                        className="text-solar-600 hover:text-solar-700 font-medium text-sm inline-flex items-center gap-1 opacity-80 hover:opacity-100 transition-all bg-solar-50 hover:bg-solar-100 px-3 py-1.5 rounded-lg"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredItems.length} items</span>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
              <button disabled className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineDashboard;
