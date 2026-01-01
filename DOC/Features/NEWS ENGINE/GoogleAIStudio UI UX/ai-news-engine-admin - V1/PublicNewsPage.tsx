
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowRight, 
  Clock, 
  ChevronRight, 
  AlertCircle, 
  LayoutGrid,
  Rss,
  Mail,
  TrendingUp,
  Share2,
  Bookmark,
  Hash,
  X
} from 'lucide-react';
import { NewsItem, NewsStatus } from './types';

interface PublicNewsPageProps {
  onArticleClick: (slug: string) => void;
  onBackToAdmin: () => void;
}

const CategoryPill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
      active 
        ? 'bg-slate-900 text-white shadow-lg scale-105' 
        : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
    }`}
  >
    {label}
  </button>
);

const TagPill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
      active 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
    }`}
  >
    <Hash size={10} className={active ? 'text-indigo-200' : 'text-slate-300'} />
    {label}
  </button>
);

const SkeletonCard = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="aspect-[16/10] bg-slate-100 rounded-[32px]" />
    <div className="px-2 space-y-3">
      <div className="h-3 bg-slate-100 rounded w-1/4" />
      <div className="h-6 bg-slate-100 rounded w-full" />
      <div className="h-4 bg-slate-100 rounded w-2/3" />
    </div>
  </div>
);

const PublicNewsPage: React.FC<PublicNewsPageProps> = ({ onArticleClick, onBackToAdmin }) => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Tech', 'Finance', 'Science', 'Health', 'Politics'];
  const popularTags = ['AI', 'Markets', 'Semiconductors', 'Space', 'Innovation', 'Policy'];

  useEffect(() => {
    const fetchPublishedNews = async () => {
      setLoading(true);
      setError(false);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockPublished: NewsItem[] = [
          {
            id: 'p1',
            title: 'The Silicon Frontier: How Photonics is Redefining Data Speed',
            summary: 'Researchers at the Global Innovation Hub have successfully demonstrated a 400Gbps transmission over standard fiber using a new silicon-based laser array, potentially slashing cloud latency.',
            status: NewsStatus.PUBLISHED,
            category: 'Tech',
            tags: ['Semiconductors', 'Innovation', 'AI'],
            relevanceScore: 0,
            aiModel: '',
            createdAt: '2 hours ago',
            slug: 'silicon-photonics-frontier'
          },
          {
            id: 'p2',
            title: 'Market Volatility: Deciphering the Latest Fed Projections',
            summary: 'As interest rates hold steady, Wall Street analysts are looking toward the Q4 horizon for signals of a soft landing versus continued inflationary pressure.',
            status: NewsStatus.PUBLISHED,
            category: 'Finance',
            tags: ['Markets', 'Policy'],
            relevanceScore: 0,
            aiModel: '',
            createdAt: '4 hours ago',
            slug: 'market-volatility-projections'
          },
          {
            id: 'p3',
            title: 'Beyond the Red Planet: New Organic Discoveries on Mars',
            summary: 'The latest samples retrieved by the Mars Perseverance rover reveal complex carbon-based compounds that suggest a more diverse geochemical history than previously thought.',
            status: NewsStatus.PUBLISHED,
            category: 'Science',
            tags: ['Space', 'Science'],
            relevanceScore: 0,
            aiModel: '',
            createdAt: '1 day ago',
            slug: 'mars-organic-discovery'
          },
          {
            id: 'p4',
            title: 'European AI Act: A New Blueprint for Global Regulation',
            summary: 'With the final text agreed upon, European lawmakers have created the first comprehensive set of rules for artificial intelligence, focusing on safety and transparency.',
            status: NewsStatus.PUBLISHED,
            category: 'Politics',
            tags: ['AI', 'Policy', 'Innovation'],
            relevanceScore: 0,
            aiModel: '',
            createdAt: '2 days ago',
            slug: 'european-ai-act-blueprint'
          },
          {
            id: 'p5',
            title: 'Neural Mapping: The Quest to Decode the Human Connectome',
            summary: 'A multi-institutional effort has released the highest resolution map of human brain connectivity to date, offering new insights into cognitive function.',
            status: NewsStatus.PUBLISHED,
            category: 'Science',
            tags: ['Science', 'Health'],
            relevanceScore: 0,
            aiModel: '',
            createdAt: '3 days ago',
            slug: 'brain-mapping-connectome'
          }
        ];
        setItems(mockPublished);
        setLoading(false);
      } catch (e) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPublishedNews();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'All' || item.category === filter;
    const matchesTag = !selectedTag || item.tags?.includes(selectedTag);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTag && matchesSearch;
  });

  const heroStory = filteredItems[0];
  const otherStories = filteredItems.slice(1);

  const resetFilters = () => {
    setFilter('All');
    setSelectedTag(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-[60] bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={resetFilters}>
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <Rss size={22} fill="currentColor" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">THE FEED</span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search headlines and insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={onBackToAdmin}
              className="px-5 py-2.5 text-xs font-black text-slate-900 border border-slate-200 rounded-full hover:bg-slate-50 transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              Admin
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Filter Bar: Categories & Tags */}
      <div className="bg-white border-b border-slate-100 py-6 sticky top-20 z-50">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
            <TrendingUp size={16} className="text-indigo-600 shrink-0" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 shrink-0">Main Focus</span>
            {categories.map(cat => (
              <CategoryPill 
                key={cat} 
                label={cat} 
                active={filter === cat} 
                onClick={() => {setFilter(cat); setSelectedTag(null);}} 
              />
            ))}
          </div>
          
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <div className="w-4 h-px bg-slate-200 shrink-0" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 shrink-0">Popular Tags</span>
            {popularTags.map(tag => (
              <TagPill 
                key={tag} 
                label={tag} 
                active={selectedTag === tag} 
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} 
              />
            ))}
            {(filter !== 'All' || selectedTag || searchQuery) && (
              <button 
                onClick={resetFilters}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest ml-4 shrink-0 flex items-center gap-1"
              >
                <X size={12} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full space-y-16">
        {loading ? (
          <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-[16/10] bg-slate-100 rounded-[40px] animate-pulse" />
              <div className="space-y-6">
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="h-12 bg-slate-100 rounded w-full" />
                <div className="h-24 bg-slate-100 rounded w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 mb-6">
              <AlertCircle size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Something went wrong</h2>
            <p className="text-slate-500 max-w-sm mb-10 text-lg">We couldn't reach the news engine. Please check your connection or try refreshing.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:scale-105 transition-all uppercase text-xs tracking-widest"
            >
              Try Again
            </button>
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            {/* Hero Story */}
            {heroStory && !searchQuery && filter === 'All' && !selectedTag && (
              <section 
                onClick={() => onArticleClick(heroStory.slug || heroStory.id)}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center group cursor-pointer animate-in fade-in slide-in-from-bottom-8 duration-1000"
              >
                <div className="relative aspect-[16/10] rounded-[40px] overflow-hidden shadow-2xl">
                  <div className={`absolute inset-0 bg-gradient-to-br transition-transform duration-1000 group-hover:scale-105 ${
                    heroStory.category === 'Tech' ? 'from-indigo-600 via-indigo-500 to-blue-600' :
                    heroStory.category === 'Finance' ? 'from-emerald-600 to-teal-700' :
                    'from-slate-800 to-slate-950'
                  }`} />
                  <div className="absolute inset-0 flex items-center justify-center text-white/10">
                    <Rss size={200} strokeWidth={0.5} />
                  </div>
                  <div className="absolute top-8 left-8">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-xl border border-white/20 rounded-full text-xs font-black text-white uppercase tracking-widest">
                      Top Analysis
                    </span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-xs font-black text-indigo-600 uppercase tracking-widest">
                    <span>{heroStory.category}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-slate-400">{heroStory.createdAt}</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] group-hover:text-indigo-600 transition-colors">
                    {heroStory.title}
                  </h2>
                  <p className="text-lg text-slate-500 leading-relaxed line-clamp-3">
                    {heroStory.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {heroStory.tags?.map(t => (
                      <span key={t} className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">#{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <button className="px-8 py-3.5 bg-slate-900 text-white font-black text-sm rounded-full shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2 group/btn">
                      Read Analysis
                      <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Newsletter Section */}
            {!searchQuery && filter === 'All' && !selectedTag && (
              <section className="bg-indigo-600 rounded-[40px] p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Mail size={160} />
                </div>
                <div className="space-y-2 relative z-10 text-center md:text-left">
                  <h3 className="text-3xl font-black tracking-tight">Daily Intelligence</h3>
                  <p className="text-indigo-100 font-medium">Verified news reports delivered straight to your inbox.</p>
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 relative z-10">
                  <input 
                    type="email" 
                    placeholder="name@company.com" 
                    className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/30 w-full sm:w-80"
                  />
                  <button className="px-8 py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-lg hover:bg-indigo-50 transition-all whitespace-nowrap">
                    Join Feed
                  </button>
                </div>
              </section>
            )}

            {/* Stories Grid */}
            <section className="space-y-12 animate-in fade-in duration-700">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {searchQuery ? 'Search Results' : filter !== 'All' ? `${filter} Stories` : 'Latest Stories'}
                  </h3>
                  {filteredItems.length > 0 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded uppercase tracking-wider">
                      {filteredItems.length} found
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  Grid View
                  <button className="p-1.5 bg-slate-100 text-slate-900 rounded-md"><LayoutGrid size={16} /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {(searchQuery || filter !== 'All' || selectedTag ? filteredItems : otherStories).map(item => (
                  <article 
                    key={item.id} 
                    onClick={() => onArticleClick(item.slug || item.id)}
                    className="group flex flex-col cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="aspect-[16/10] rounded-3xl bg-slate-100 relative mb-6 overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500">
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-80 group-hover:scale-110 transition-transform duration-700 ${
                        item.category === 'Tech' ? 'from-indigo-500 to-blue-600' :
                        item.category === 'Finance' ? 'from-emerald-500 to-teal-600' :
                        item.category === 'Science' ? 'from-amber-500 to-rose-600' :
                        'from-slate-400 to-slate-600'
                      }`} />
                      <div className="absolute inset-0 flex items-center justify-center p-6 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest border border-white/30">
                          Read Now
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 px-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock size={12} />
                        {item.createdAt}
                      </div>
                      <h4 className="text-xl font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                        {item.summary}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {item.tags?.slice(0, 2).map(t => (
                          <span key={t} className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-6">
              <Search size={48} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No results found</h3>
            <p className="text-slate-500 max-w-sm mb-10 text-lg">We couldn't find any stories matching your search or filters. Try adjusting your criteria or reset to browse all news.</p>
            <div className="flex gap-4">
              <button 
                onClick={resetFilters}
                className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:scale-105 transition-all uppercase text-xs tracking-widest"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-950 text-white py-20 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                <Rss size={20} fill="currentColor" />
              </div>
              <span className="text-2xl font-black tracking-tighter">THE FEED</span>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Objective and verified insights across the global news landscape.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Topics</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Technology</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Global Markets</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Science & Space</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Health Care</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Disclosure</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Follow</h4>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all"><Share2 size={18} /></a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all"><TrendingUp size={18} /></a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all"><Rss size={18} /></a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-20 border-t border-white/5 mt-20">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center sm:text-left">
            &copy; 2024 AI NEWS ENGINE &bull; ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicNewsPage;
