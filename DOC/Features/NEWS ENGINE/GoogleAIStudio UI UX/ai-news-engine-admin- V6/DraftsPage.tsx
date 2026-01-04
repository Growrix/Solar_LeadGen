
import React from 'react';
import { 
  MoreVertical, 
  Clock, 
  Zap, 
  Search, 
  Filter,
  Plus
} from 'lucide-react';
import { NewsStatus, NewsItem, BoardColumn } from './types';

const columns: BoardColumn[] = [
  { id: NewsStatus.RESEARCH_DONE, title: 'Research Done', color: 'bg-blue-500' },
  { id: NewsStatus.DRAFT_READY, title: 'Draft Ready', color: 'bg-indigo-500' },
  { id: NewsStatus.NEEDS_REVIEW, title: 'Needs Review', color: 'bg-amber-500' },
  { id: NewsStatus.SCHEDULED, title: 'Scheduled', color: 'bg-emerald-500' },
  { id: NewsStatus.PUBLISHED, title: 'Published', color: 'bg-slate-500' },
];

const DraftCard: React.FC<{ item: NewsItem; onClick: () => void }> = ({ item, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group mb-3 relative overflow-hidden"
  >
    <div className="flex items-start justify-between mb-2">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
        {item.category}
      </span>
      <button className="text-slate-300 group-hover:text-slate-500" aria-label="More options">
        <MoreVertical size={14} />
      </button>
    </div>
    
    <h4 className="text-sm font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
      {item.title}
    </h4>
    
    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-50">
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
        <Clock size={12} />
        {item.createdAt}
      </div>
      <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600">
        <Zap size={12} fill="currentColor" />
        {item.relevanceScore}%
      </div>
      <div className="ml-auto text-[10px] font-bold text-slate-400 italic">
        {item.aiModel.split(' ').length > 2 ? item.aiModel.split(' ')[2] : item.aiModel}
      </div>
    </div>
  </div>
);

const ColumnSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-32 bg-slate-100/50 rounded-xl animate-pulse" />
    ))}
  </div>
);

interface DraftsPageProps {
  items: NewsItem[];
  isLoading: boolean;
  onReviewDraft: (item: NewsItem) => void;
  onQuickDraft?: () => void;
}

const DraftsPage: React.FC<DraftsPageProps> = ({ items, isLoading, onReviewDraft, onQuickDraft }) => {
  return (
    <div className="h-full flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Board Controls */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter board..." 
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <Filter size={14} />
            View Options
          </button>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                U{i}
              </div>
            ))}
          </div>
          <button 
            onClick={onQuickDraft}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-black hover:bg-indigo-700 shadow-sm transition-all uppercase tracking-widest"
            aria-label="Create Manual Draft"
          >
            Create Manual Draft
          </button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto p-6 bg-slate-50/50">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map((col) => {
            const columnItems = items.filter(item => item.status === col.id);
            
            return (
              <div key={col.id} className="w-80 flex flex-col">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.color} shadow-sm`} />
                    <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">{col.title}</h3>
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {columnItems.length}
                    </span>
                  </div>
                  <button 
                    onClick={onQuickDraft}
                    className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                    title="Create Manual Draft"
                    aria-label={`Create Manual Draft in ${col.title} column`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex-1 bg-slate-100/30 rounded-3xl p-2 border border-dashed border-slate-200 min-h-[500px]">
                  {isLoading ? (
                    <ColumnSkeleton />
                  ) : columnItems.length > 0 ? (
                    columnItems.map(item => (
                      <DraftCard 
                        key={item.id} 
                        item={item} 
                        onClick={() => onReviewDraft(item)} 
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-40">
                      <div className="w-10 h-10 border-2 border-dashed border-slate-400 rounded-lg mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Empty State</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DraftsPage;
