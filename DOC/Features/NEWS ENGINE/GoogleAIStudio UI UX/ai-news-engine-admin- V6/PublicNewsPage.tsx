
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Clock, 
  ChevronRight, 
  Rss,
  TrendingUp,
  Hash,
  X,
  LayoutGrid,
  Filter,
  ArrowRight
} from 'lucide-react';
import { NewsItem, NewsStatus } from './types';

interface PublicNewsPageProps {
  news: NewsItem[];
  isLoading: boolean;
  onArticleClick: (slug: string) => void;
  onBackToAdmin: () => void;
}

const CategoryPill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
      active 
        ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
        : 'bg-white text-slate-400 hover:text-slate-900 border-slate-200 hover:border-slate-300'
    }`}
  >
    {label}
  </button>
);

const SkeletonCard = () => (
  <div className="flex flex-col gap-5 animate-pulse">
    <div className="aspect-[16/10] bg-slate-100 rounded-[32px]" />
    <div className="px-2 space-y-3">
      <div className="h-3 bg-slate-100 rounded w-1/4" />
      <div className="h-6 bg-slate-100 rounded w-full" />
      <div className="h-10 bg-slate-100 rounded w-full" />
    </div>
  </div>
);

const PublicNewsPage: React.FC<PublicNewsPageProps> = ({ news, isLoading, onArticleClick, onBackToAdmin }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sourced from shared news state, filtered for Published only
  const publishedNews = useMemo(() => {
    return news.filter(item => item.status === NewsStatus.PUBLISHED);
  }, [news]);

  const categories = useMemo(() => {
    const cats = new Set(publishedNews.map(n => n.category));
    return ['All', ...Array.from(cats)];
  }, [publishedNews]);

  const filteredItems = useMemo(() => {
    return publishedNews.filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [publishedNews, activeCategory, searchQuery]);

  const resetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Header */}
      <nav className="sticky top-0 z-[60] bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div 
            className="flex items-center gap-3 group cursor-pointer shrink-0" 
            onClick={resetFilters}
          >
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110 duration-300">
              <Rss size={20} fill="currentColor" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter hidden sm:block">INSIGHTS</span>
          </div>

          <div className="flex-1 max-w-2xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search published analysis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button 
            onClick={onBackToAdmin}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 text-[10px] font-black text-slate-900 border border-slate-200 rounded-full hover:bg-slate-50 transition-all uppercase tracking-widest shrink-0"
          >
            Admin Dashboard
            <ChevronRight size={14} />
          </button>
        </div>
      </nav>

      {/* Filter Strip */}
      <div className="bg-white border-b border-slate-100 py-6 sticky top-20 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Topics</span>
          </div>
          {categories.map(cat => (
            <CategoryPill 
              key={cat} 
              label={cat} 
              active={activeCategory === cat} 
              onClick={() => setActiveCategory(cat)} 
            />
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-16 animate-in fade-in duration-700">
            {/* Featured Story (First published item) */}
            {activeCategory === 'All' && searchQuery === '' && (
              <section 
                onClick={() => onArticleClick(filteredItems[0].slug || filteredItems[0].id)}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center group cursor-pointer"
              >
                <div className="relative aspect-[16/10] rounded-[40px] overflow-hidden shadow-2xl">
                  <div className={`absolute inset-0 bg-gradient-to-br transition-transform duration-1000 group-hover:scale-105 ${
                    filteredItems[0].category === 'Tech' ? 'from-indigo-600 via-indigo-500 to-blue-600' :
                    filteredItems[0].category === 'Finance' ? 'from-emerald-600 to-teal-700' :
                    'from-slate-800 to-slate-950'
                  }`} />
                  <div className="absolute inset-0 flex items-center justify-center text-white/5 pointer-events-none">
                    <TrendingUp size={300} strokeWidth={0.5} />
                  </div>
                  <div className="absolute top-8 left-8">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-xl border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                      Featured Analysis
                    </span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    <span>{filteredItems[0].category}</span>
                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <span className="text-slate-400">{filteredItems[0].publishedAt || filteredItems[0].createdAt}</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] group-hover:text-indigo-600 transition-colors">
                    {filteredItems[0].title}
                  </h2>
                  <p className="text-lg text-slate-500 leading-relaxed line-clamp-3">
                    {filteredItems[0].summary}
                  </p>
                  <button className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest group/btn">
                    Read Intelligence Report
                    <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-2" />
                  </button>
                </div>
              </section>
            )}

            {/* Grid for rest of the items */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {(activeCategory === 'All' && searchQuery === '' ? filteredItems.slice(1) : filteredItems).map(item => (
                <article 
                  key={item.id} 
                  onClick={() => onArticleClick(item.slug || item.id)}
                  className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] rounded-[32px] bg-slate-100 relative mb-6 overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br opacity-80 group-hover:scale-110 transition-transform duration-1000 ${
                      item.category === 'Tech' ? 'from-indigo-500 to-blue-600' :
                      item.category === 'Finance' ? 'from-emerald-500 to-teal-600' :
                      item.category === 'Science' ? 'from-amber-500 to-rose-600' :
                      'from-slate-400 to-slate-600'
                    }`} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/10 backdrop-blur-[2px]">
                      <span className="px-5 py-2.5 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
                        View Analysis
                      </span>
                    </div>
                    <div className="absolute bottom-5 left-5">
                      <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-white/50">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 px-1">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock size={12} />
                      {item.publishedAt || item.createdAt}
                    </div>
                    <h4 className="text-xl font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                  </div>
                </article>
              ))}
            </section>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
              <Search size={40} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No published stories found</h3>
            <p className="text-slate-500 max-w-sm mb-10 text-lg">We couldn't find any analysis matching your current criteria. Try resetting your filters to browse all published insights.</p>
            <button 
              onClick={resetFilters}
              className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:scale-105 transition-all uppercase text-xs tracking-widest active:scale-95"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <Rss size={16} fill="currentColor" />
              </div>
              <span className="text-xl font-black tracking-tighter">INSIGHTS</span>
            </div>
            <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-wider">
              Objective and verified intelligence across the global news landscape.
            </p>
          </div>
          <div className="hidden md:block"></div>
          <div className="hidden md:block"></div>
          <div className="flex flex-col items-end justify-end">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              &copy; 2024 NEWSENGINE &bull; AI POWERED
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicNewsPage;
