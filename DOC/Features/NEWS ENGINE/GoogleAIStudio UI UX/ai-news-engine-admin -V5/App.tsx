
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  Rss, 
  Activity, 
  Zap, 
  Pause, 
  Play, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCcw,
  Clock,
  ChevronRight,
  Plus,
  BookOpen,
  ClipboardList,
  Cpu,
  ShieldAlert,
  History, 
  Eye,
  Box,
  ChevronDown,
  XCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { NewsStatus, NewsItem, KPI, AppView, RSSSource, LogEntry, SourceStatus } from './types';
import { ConfirmationVariant } from './ConfirmationModal';
import SourcesPage from './SourcesPage';
import DraftsPage from './DraftsPage';
import AutomationPage from './AutomationPage';
import ControlPage from './ControlPage';
import AuditLogsPage from './AuditLogsPage';
import SettingsPage from './SettingsPage';
import ReviewModal from './ReviewModal';
import SchedulingModal from './SchedulingModal';
import TestPreviewModal from './TestPreviewModal';
import RewriteModal from './RewriteModal';
import RejectModal from './RejectModal';
import SourceModal from './SourceModal';
import ConfirmationModal from './ConfirmationModal';
import PublicNewsPage from './PublicNewsPage';
import PublicNewsDetailsPage from './PublicNewsDetailsPage';
import ShareModal from './ShareModal';
import PromptDetailsModal from './PromptDetailsModal';
import ManualDraftModal from './ManualDraftModal';

// Components
const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const KPICard: React.FC<{ kpi: KPI }> = ({ kpi }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg text-indigo-600">
        {kpi.icon}
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${kpi.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {kpi.trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {Math.abs(kpi.trend)}%
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-sm text-slate-500 font-medium">{kpi.label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
      <p className="text-xs text-slate-400">{kpi.description}</p>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: NewsStatus }> = ({ status }) => {
  const styles = {
    [NewsStatus.DRAFT]: 'bg-slate-100 text-slate-600 border-slate-200',
    [NewsStatus.NEEDS_REVIEW]: 'bg-amber-100 text-amber-700 border-amber-200',
    [NewsStatus.PUBLISHED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [NewsStatus.SCHEDULED]: 'bg-blue-100 text-blue-700 border-blue-200',
    [NewsStatus.ERROR]: 'bg-rose-100 text-rose-700 border-rose-200',
    [NewsStatus.RESEARCH_DONE]: 'bg-blue-100 text-blue-700 border-blue-200',
    [NewsStatus.DRAFT_READY]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    [NewsStatus.REJECTED]: 'bg-slate-200 text-slate-600 border-slate-300',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

interface FilterState {
  status: NewsStatus | 'All';
  category: string;
  minScore: number;
  dateRange: 'All Time' | 'Today' | 'Yesterday' | 'Last 7 Days';
  sourceType: 'All Types' | 'RSS Feed' | 'AI Agent' | 'Manual Entry';
}

const DashboardView: React.FC<{ 
  isLoading: boolean; 
  news: NewsItem[]; 
  searchTerm: string; 
  setSearchTerm: (s: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  handleNewsAction: (item: NewsItem, action: string) => void;
  onCreateDraft: () => void;
  systemStatus: 'nominal' | 'paused' | 'emergency';
}> = ({ isLoading, news, searchTerm, setSearchTerm, filters, setFilters, handleNewsAction, onCreateDraft, systemStatus }) => {
  const kpis: KPI[] = [
    { label: 'Total Stories', value: 1284, trend: 12.5, icon: <Rss size={20} />, description: 'Last 30 days' },
    { label: 'Avg. Relevance', value: '92%', trend: 4.2, icon: <Activity size={20} />, description: 'AI quality score' },
    { label: 'Automations', value: systemStatus === 'nominal' ? 'Active' : systemStatus === 'paused' ? 'Paused' : 'Stopped', trend: 0, icon: <Zap size={20} />, description: 'System status' },
    { label: 'Review Queue', value: 12, trend: -18, icon: <Clock size={20} />, description: 'Pending approval' }
  ];

  const categories = useMemo(() => ['All', ...Array.from(new Set(news.map(n => n.category)))], [news]);
  const statuses = ['All', ...Object.values(NewsStatus)];
  const sourceTypes = ['All Types', 'RSS Feed', 'AI Agent', 'Manual Entry'];
  const dateRanges = ['All Time', 'Today', 'Yesterday', 'Last 7 Days'];

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status === 'All' || item.status === filters.status;
      const matchesCategory = filters.category === 'All' || item.category === filters.category;
      const matchesScore = item.relevanceScore >= filters.minScore;
      const matchesSourceType = filters.sourceType === 'All Types' || item.sourceType === filters.sourceType;
      
      // Basic mock date filtering
      let matchesDate = true;
      if (filters.dateRange === 'Today') matchesDate = item.createdAt.includes('min') || item.createdAt.includes('hour');
      else if (filters.dateRange === 'Yesterday') matchesDate = item.createdAt.includes('1 day');
      else if (filters.dateRange === 'Last 7 Days') matchesDate = !item.createdAt.includes('month');

      return matchesSearch && matchesStatus && matchesCategory && matchesScore && matchesSourceType && matchesDate;
    });
  }, [news, searchTerm, filters]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ 
      status: 'All', 
      category: 'All', 
      minScore: 0,
      dateRange: 'All Time',
      sourceType: 'All Types'
    });
  };

  const hasActiveFilters = searchTerm !== '' || 
    filters.status !== 'All' || 
    filters.category !== 'All' || 
    filters.minScore > 0 || 
    filters.dateRange !== 'All Time' || 
    filters.sourceType !== 'All Types';

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} kpi={kpi} />
        ))}
      </section>

      <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search articles, summaries or categories..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={clearFilters}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all ${hasActiveFilters ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-400 bg-slate-50 cursor-not-allowed opacity-50'}`}
          >
            <XCircle size={14} />
            Clear All
          </button>
        </div>

        <div className="flex items-center gap-3 w-full overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter By</span>
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* Status Filter */}
          <div className="relative group">
            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="appearance-none pl-3 pr-8 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'Status: All' : s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Category Filter */}
          <div className="relative group">
            <select 
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="appearance-none pl-3 pr-8 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'Category: All' : c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Source Type Filter */}
          <div className="relative group">
            <select 
              value={filters.sourceType}
              onChange={(e) => setFilters(prev => ({ ...prev, sourceType: e.target.value as any }))}
              className="appearance-none pl-3 pr-8 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {sourceTypes.map(st => <option key={st} value={st}>{st === 'All Types' ? 'Source: All' : st}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Date Range Filter */}
          <div className="relative group">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
            <select 
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
              className="appearance-none pl-7 pr-8 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {dateRanges.map(dr => <option key={dr} value={dr}>{dr === 'All Time' ? 'Date: All Time' : dr}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Score Filter */}
          <div className="relative group">
            <select 
              value={filters.minScore}
              onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
              className="appearance-none pl-3 pr-8 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={0}>Score: Any</option>
              <option value={80}>Score > 80</option>
              <option value={90}>Score > 90</option>
              <option value={95}>Score > 95</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg text-slate-900">AI News Feed</h2>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {filteredNews.length} Stories
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Latest updates</span>
        </div>

        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg w-full" />
              ))}
            </div>
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3">News Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-center">Score</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredNews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 max-w-md">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => handleNewsAction(item, 'View Details')}>
                          {item.title}
                        </span>
                        <span className="text-sm text-slate-500 truncate mt-1">{item.summary}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-black ${
                        item.relevanceScore >= 95 ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {item.relevanceScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700 font-medium">{item.createdAt}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{item.aiModel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleNewsAction(item, 'Review')}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-black flex items-center gap-1 uppercase tracking-widest"
                        >
                          Review
                          <ChevronRight size={14} strokeWidth={3} />
                        </button>
                        <button className="text-slate-300 hover:text-slate-600 p-1">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-slate-50/30">
            <div className="bg-slate-100 p-6 rounded-3xl mb-4 border border-slate-200/50">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">No results match your filters</h3>
            <p className="text-slate-500 text-center max-w-xs mt-2 text-sm">Try adjusting your search terms or filters to find what you're looking for.</p>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-6 py-2.5 rounded-xl hover:bg-slate-50 font-black text-xs uppercase tracking-widest shadow-sm transition-all active:scale-95"
              >
                Reset All Filters
              </button>
              <button 
                onClick={onCreateDraft}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                <Plus size={16} />
                Create Manual Draft
              </button>
            </div>
          </div>
        )}
        
        {!isLoading && filteredNews.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Showing {filteredNews.length} of {news.length} results
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed">Previous</button>
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const TabItem: React.FC<{ 
  label: string; 
  active: boolean; 
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
      active 
        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' 
        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
    }`}
  >
    {icon}
    {label}
  </button>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'admin' | 'public-news' | 'public-news-details'>('admin');
  const [activeTab, setActiveTab] = useState<AppView>('dashboard');
  const [systemStatus, setSystemStatus] = useState<'nominal' | 'paused' | 'emergency'>('nominal');
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<RSSSource[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  
  // Filters State
  const [dashboardFilters, setDashboardFilters] = useState<FilterState>({
    status: 'All',
    category: 'All',
    minScore: 0,
    dateRange: 'All Time',
    sourceType: 'All Types'
  });
  
  // Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [isTestPreviewModalOpen, setIsTestPreviewModalOpen] = useState(false);
  const [isManualDraftModalOpen, setIsManualDraftModalOpen] = useState(false);
  const [isRewriteModalOpen, setIsRewriteModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    variant: ConfirmationVariant;
    requireConfirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [selectedSource, setSelectedSource] = useState<RSSSource | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockNews: NewsItem[] = [
        { id: '1', title: 'Quantum Computing Breakthrough in Silicon Photonics', summary: 'Researchers at the National Lab have achieved a new coherence record using standard CMOS manufacturing...', status: NewsStatus.NEEDS_REVIEW, category: 'Tech', relevanceScore: 94, aiModel: 'Gemini 3 Pro', createdAt: '10 mins ago', sourceType: 'AI Agent' },
        { id: '2', title: 'Global Markets React to Fed Interest Rate Projections', summary: 'Volatility spiked in early trading as Jerome Powell hinted at a "higher for longer" stance despite cooling inflation...', status: NewsStatus.PUBLISHED, category: 'Finance', relevanceScore: 88, aiModel: 'Gemini 3 Flash', createdAt: '2 hours ago', sourceType: 'RSS Feed' },
        { id: '3', title: 'New Study Links Biodiversity to Urban Mental Health', summary: 'A longitudinal study across 20 European cities suggests that proximity to high-biodiversity green spaces...', status: NewsStatus.SCHEDULED, category: 'Health', relevanceScore: 82, aiModel: 'Gemini 3 Flash', createdAt: '5 hours ago', sourceType: 'AI Agent' },
        { id: '4', title: 'AI Governance: EU Parliament Finalizes New Safety Framework', summary: 'The landmark legislation sets tiered risk categories for foundation models and strict transparency mandates...', status: NewsStatus.DRAFT, category: 'Politics', relevanceScore: 91, aiModel: 'Gemini 3 Pro', createdAt: '1 day ago', sourceType: 'Manual Entry' },
        { id: '5', title: 'Mars Rover Discovers Carbon Complex Molecules in Gale Crater', summary: 'NASA scientists confirm that organic compounds found in surface samples are indigenous to Mars and suggest...', status: NewsStatus.ERROR, category: 'Science', relevanceScore: 97, aiModel: 'Gemini 3 Flash', createdAt: '2 days ago', sourceType: 'RSS Feed' },
        { id: '6', title: 'DeepSeek-V3 Architecture Deep Dive', summary: 'Analysis of the MoE implementation and training efficiency breakthroughs...', status: NewsStatus.RESEARCH_DONE, category: 'AI Tech', relevanceScore: 98, aiModel: 'Gemini 3 Pro', createdAt: '12m ago', sourceType: 'AI Agent' },
        { id: 'p1', title: 'The Future of AI Hardware', summary: 'A deep dive into the next generation of neural processing units...', status: NewsStatus.PUBLISHED, category: 'Tech', relevanceScore: 96, aiModel: 'Gemini 3 Pro', createdAt: '3h ago', slug: 'future-ai-hardware', sourceType: 'AI Agent' },
      ];
      setNews(mockNews);
      
      setSources([
        { id: '1', name: 'TechCrunch Main', url: 'https://techcrunch.com/feed/', status: SourceStatus.ACTIVE, lastSync: '12 mins ago', articleCount: 142 },
        { id: '2', name: 'Reuters Business', url: 'https://www.reuters.com/business/feed/', status: SourceStatus.ACTIVE, lastSync: '45 mins ago', articleCount: 890 },
        { id: '3', name: 'The Verge Science', url: 'https://www.theverge.com/science/rss/', status: SourceStatus.INACTIVE, lastSync: '2 days ago', articleCount: 56 },
        { id: '4', name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', status: SourceStatus.ACTIVE, lastSync: '1 hour ago', articleCount: 231 },
        { id: '5', name: 'Invalid Endpoint', url: 'https://api.unknown.news/v1/rss', status: SourceStatus.ERROR, lastSync: 'Never', articleCount: 0 },
      ]);

      setLogs([
        { id: 'l1', timestamp: '2023-10-24 14:20:01', source: 'TechCrunch RSS', origin: 'AI', promptUsed: 'SYSTEM INSTRUCTION: You are a tech journalist. Summarize DeepSeek V3...', action: 'Draft Generated', admin: 'System (Auto)', status: NewsStatus.DRAFT_READY },
        { id: 'l2', timestamp: '2023-10-24 13:45:12', source: 'Global Markets Feed', origin: 'AI', promptUsed: 'SYSTEM INSTRUCTION: Analyze Fed rate projections...', action: 'Research Complete', admin: 'System (Auto)', status: NewsStatus.RESEARCH_DONE },
        { id: 'l3', timestamp: '2023-10-24 12:30:45', source: 'Manual Entry', origin: 'Manual', action: 'Content Edit', admin: 'John Doe', status: NewsStatus.NEEDS_REVIEW }
      ]);
      
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Shared Log Helper
  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Shared state mutation logic
  const updateNewsItemStatus = (id: string, status: NewsStatus, extra?: Partial<NewsItem>) => {
    setNews(prev => prev.map(item => item.id === id ? { ...item, status, ...extra } : item));
  };

  const handleGlobalAction = (action: 'Pause' | 'Resume' | 'Emergency') => {
    if (action === 'Pause') {
      setConfirmModalConfig({
        title: "Pause Content Pipeline?",
        message: "This will halt all active AI research, RSS ingestion, and automated drafting tasks. Existing drafts will remain accessible for manual review.",
        confirmLabel: "Confirm Pipeline Pause",
        variant: "warning",
        onConfirm: () => {
          setSystemStatus('paused');
          addLog({ source: 'System', origin: 'Manual', action: 'Pipeline Paused', admin: 'John Doe', status: 'System' });
          setIsConfirmModalOpen(false);
        }
      });
    } else if (action === 'Resume') {
      setConfirmModalConfig({
        title: "Resume All Automations?",
        message: "This will re-activate all background services including the research agents and drafting engine.",
        confirmLabel: "Confirm Pipeline Resume",
        variant: "success",
        onConfirm: () => {
          setSystemStatus('nominal');
          addLog({ source: 'System', origin: 'Manual', action: 'Pipeline Resumed', admin: 'John Doe', status: 'System' });
          setIsConfirmModalOpen(false);
        }
      });
    } else if (action === 'Emergency') {
      setConfirmModalConfig({
        title: "CRITICAL: System Lockdown",
        message: "You are about to initiate an immediate emergency stop. All active processes will be killed and the system will require manual admin reset.",
        confirmLabel: "Initiate Emergency Stop",
        variant: "danger",
        requireConfirmText: "LOCKDOWN",
        onConfirm: () => {
          setSystemStatus('emergency');
          addLog({ source: 'System', origin: 'Manual', action: 'EMERGENCY STOP ACTIVATED', admin: 'John Doe', status: 'System' });
          setIsConfirmModalOpen(false);
        }
      });
    }
    setIsConfirmModalOpen(true);
  };

  const handleNewsAction = (item: NewsItem, action: string) => {
    if (action === 'Review' || action === 'View Details') {
      setSelectedNewsItem(item);
      setIsReviewModalOpen(true);
    }
  };

  const handleViewPrompt = (log: LogEntry) => {
    setSelectedLog(log);
    setIsPromptModalOpen(true);
  };

  const handleSaveTestToDrafts = (testData: { title: string; summary: string }) => {
    const newItem: NewsItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: testData.title,
      summary: testData.summary,
      status: NewsStatus.DRAFT_READY,
      category: 'Tech',
      relevanceScore: 98,
      aiModel: 'Gemini 3 Pro',
      createdAt: 'Just now',
      sourceType: 'AI Agent'
    };
    setNews(prev => [newItem, ...prev]);
    addLog({ source: newItem.title, origin: 'Manual', action: 'Saved from Test', admin: 'John Doe', status: NewsStatus.DRAFT_READY });
    setIsTestPreviewModalOpen(false);
    setActiveTab('drafts');
  };

  const handleManualDraftGenerate = (data: { title: string; prompt: string; category: string; tags: string[]; outline: string }) => {
    const newItem: NewsItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title || `Custom Analysis: ${data.category}`,
      summary: `AI generated brief based on custom prompt: ${data.prompt.substring(0, 100)}...`,
      status: NewsStatus.NEEDS_REVIEW,
      category: data.category,
      relevanceScore: 99,
      aiModel: 'Gemini 3 Pro',
      createdAt: 'Just now',
      sourceType: 'Manual Entry',
      tags: data.tags
    };
    setNews(prev => [newItem, ...prev]);
    addLog({ 
      source: newItem.title, 
      origin: 'Manual', 
      action: 'Targeted Draft Generated', 
      admin: 'John Doe', 
      status: NewsStatus.NEEDS_REVIEW,
      promptUsed: data.prompt 
    });
    setIsManualDraftModalOpen(false);
    setActiveTab('drafts');
  };

  const handleSimulatePublishFromTest = (testData: { title: string; summary: string }) => {
    setConfirmModalConfig({
      title: "Direct Publication",
      message: "This analysis will bypass the review queue and be visible on the public feed immediately. Are you sure you want to go live?",
      confirmLabel: "Publish Immediately",
      variant: "publish",
      requireConfirmText: "PUBLISH",
      onConfirm: () => {
        const newItem: NewsItem = {
          id: Math.random().toString(36).substr(2, 9),
          title: testData.title,
          summary: testData.summary,
          status: NewsStatus.PUBLISHED,
          category: 'Tech',
          relevanceScore: 98,
          aiModel: 'Gemini 3 Pro',
          createdAt: 'Just now',
          publishedAt: new Date().toLocaleString(),
          sourceType: 'AI Agent'
        };
        setNews(prev => [newItem, ...prev]);
        addLog({ source: newItem.title, origin: 'Manual', action: 'Direct Published (Test)', admin: 'John Doe', status: NewsStatus.PUBLISHED });
        setIsTestPreviewModalOpen(false);
        setIsConfirmModalOpen(false);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleApproveForScheduling = () => {
    setIsReviewModalOpen(false);
    setIsSchedulingModalOpen(true);
  };

  const handleScheduleConfirm = (scheduleData: any) => {
    if (selectedNewsItem) {
      updateNewsItemStatus(selectedNewsItem.id, NewsStatus.SCHEDULED);
      addLog({ source: selectedNewsItem.title, origin: 'Manual', action: `Scheduled for ${scheduleData.publishDate}`, admin: 'John Doe', status: NewsStatus.SCHEDULED });
    }
    setIsSchedulingModalOpen(false);
  };

  const handleRejectConfirm = (data: any) => {
    if (selectedNewsItem) {
      updateNewsItemStatus(selectedNewsItem.id, NewsStatus.REJECTED);
      addLog({ 
        source: selectedNewsItem.title, 
        origin: 'Manual', 
        action: 'Draft Rejected', 
        admin: 'John Doe', 
        status: NewsStatus.REJECTED,
        promptUsed: `Reason: ${data.reason}. Categories: ${data.categories.join(', ')}`
      });
    }
    setIsRejectModalOpen(false);
  };

  const handleRewriteConfirm = (data: any) => {
    if (selectedNewsItem) {
      updateNewsItemStatus(selectedNewsItem.id, NewsStatus.DRAFT);
      addLog({ source: selectedNewsItem.title, origin: 'AI', action: 'Rewrite Requested', admin: 'John Doe', status: NewsStatus.DRAFT, promptUsed: data.reason });
    }
    setIsRewriteModalOpen(false);
  };

  const handleSaveDraftUpdate = () => {
    if (selectedNewsItem) {
      updateNewsItemStatus(selectedNewsItem.id, NewsStatus.DRAFT_READY);
      addLog({ source: selectedNewsItem.title, origin: 'Manual', action: 'Manual Edit & Save', admin: 'John Doe', status: NewsStatus.DRAFT_READY });
    }
  };

  const handleReviewPublish = () => {
    if (!selectedNewsItem) return;
    // Do NOT close ReviewModal immediately; keep it in background
    setConfirmModalConfig({
      title: "Confirm Live Publication",
      message: `You are about to publish "${selectedNewsItem.title}" immediately to the live insights feed. This action cannot be undone.`,
      confirmLabel: "Publish Now",
      variant: "publish",
      requireConfirmText: "PUBLISH",
      onConfirm: () => {
        // Confirmation Logic
        updateNewsItemStatus(selectedNewsItem.id, NewsStatus.PUBLISHED, { 
          publishedAt: new Date().toLocaleString() 
        });
        addLog({ source: selectedNewsItem.title, origin: 'Manual', action: 'Published', admin: 'John Doe', status: NewsStatus.PUBLISHED });
        
        // Success behavior: Close BOTH modals
        setIsConfirmModalOpen(false);
        setIsReviewModalOpen(false);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleAddSource = () => {
    setSelectedSource(null);
    setIsSourceModalOpen(true);
  };

  const handleEditSource = (source: RSSSource) => {
    setSelectedSource(source);
    setIsSourceModalOpen(true);
  };

  const handleSaveSource = (data: Partial<RSSSource>) => {
    if (selectedSource) {
      setSources(prev => prev.map(s => s.id === selectedSource.id ? { ...s, ...data } : s));
      addLog({ source: data.name || selectedSource.name, origin: 'Manual', action: 'Source Configuration Updated', admin: 'John Doe', status: 'System' });
    } else {
      const newSource: RSSSource = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name || '',
        url: data.url || '',
        status: data.status || SourceStatus.ACTIVE,
        lastSync: 'Just now',
        articleCount: 0
      };
      setSources(prev => [newSource, ...prev]);
      addLog({ source: newSource.name, origin: 'Manual', action: 'New Source Connected', admin: 'John Doe', status: 'System' });
    }
    setIsSourceModalOpen(false);
  };

  const handleToggleSource = (id: string) => {
    setSources(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = s.status === SourceStatus.ACTIVE ? SourceStatus.INACTIVE : SourceStatus.ACTIVE;
        addLog({ source: s.name, origin: 'Manual', action: `Source ${newStatus}`, admin: 'John Doe', status: 'System' });
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const navigateToArticle = (slug: string) => {
    setSelectedSlug(slug);
    setCurrentView('public-news-details');
  };

  const handleOpenShare = () => {
    setIsShareModalOpen(true);
  };

  const isPublicView = currentView.startsWith('public-');

  return (
    <div className={`flex h-screen overflow-hidden text-slate-900 ${isPublicView ? 'bg-white' : 'bg-slate-50'}`}>
      {/* Sidebar - Simplified */}
      {!isPublicView && (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Zap size={18} fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">NewsEngine</span>
            </div>
            
            <nav className="space-y-1">
              <SidebarItem 
                icon={<Box size={20} />} 
                label="News Engine Hub" 
                active={currentView === 'admin'} 
                onClick={() => setCurrentView('admin')} 
              />
              <div className="pt-4 mt-4 border-t border-slate-800">
                <SidebarItem 
                  icon={<Eye size={20} />} 
                  label="Public View" 
                  active={false} 
                  onClick={() => setCurrentView('public-news')} 
                />
              </div>
            </nav>
          </div>
        </aside>
      )}

      <main className={`flex-1 flex flex-col h-full overflow-y-auto ${isPublicView ? 'bg-white' : ''}`}>
        {/* Header & Tabs for Admin */}
        {!isPublicView && (
          <div className="sticky top-0 z-20 bg-white shadow-sm">
            <header className="px-8 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">News Engine Hub</h1>
                <p className="text-slate-500 text-sm">Unified control center for AI pipeline.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button onClick={() => setIsTestPreviewModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                  <RefreshCcw size={16} /> Test & Preview
                </button>
                <button 
                  onClick={() => setIsManualDraftModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  <Sparkles size={16} fill="currentColor" /> Create Manual Draft
                </button>
                <button 
                  onClick={() => handleGlobalAction(systemStatus === 'nominal' ? 'Pause' : 'Resume')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                    systemStatus !== 'nominal' 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {systemStatus !== 'nominal' ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                  {systemStatus !== 'nominal' ? 'Pause Automation' : 'Resume Automation'}
                </button>
              </div>
            </header>

            <nav className="flex px-4 overflow-x-auto no-scrollbar bg-white">
              <TabItem label="Dashboard" icon={<LayoutDashboard size={18} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <TabItem label="Drafts & Reviews" icon={<ClipboardList size={18} />} active={activeTab === 'drafts'} onClick={() => setActiveTab('drafts')} />
              <TabItem label="Audit Logs" icon={<History size={18} />} active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
              <TabItem label="Master Control" icon={<ShieldAlert size={18} />} active={activeTab === 'control'} onClick={() => setActiveTab('control')} />
              <TabItem label="Automation Logic" icon={<Cpu size={18} />} active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} />
              <TabItem label="Sources" icon={<BookOpen size={18} />} active={activeTab === 'sources'} onClick={() => setActiveTab('sources')} />
              <TabItem label="Settings" icon={<SettingsIcon size={18} />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </nav>
          </div>
        )}

        {/* View Router */}
        {currentView === 'admin' && (
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <DashboardView 
                isLoading={isLoading} 
                news={news} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                filters={dashboardFilters}
                setFilters={setDashboardFilters}
                handleNewsAction={handleNewsAction} 
                onCreateDraft={() => setIsManualDraftModalOpen(true)}
                systemStatus={systemStatus} 
              />
            )}
            {activeTab === 'sources' && <SourcesPage sources={sources} isLoading={isLoading} onAddSource={handleAddSource} onEditSource={handleEditSource} onToggleSource={handleToggleSource} />}
            {activeTab === 'drafts' && <DraftsPage items={news} isLoading={isLoading} onReviewDraft={(item) => handleNewsAction(item, 'Review')} onQuickDraft={() => setIsManualDraftModalOpen(true)} />}
            {activeTab === 'automation' && <AutomationPage />}
            {activeTab === 'audit' && <AuditLogsPage logs={logs} isLoading={isLoading} onViewPrompt={handleViewPrompt} />}
            {activeTab === 'settings' && <SettingsPage />}
            {activeTab === 'control' && <ControlPage systemStatus={systemStatus} onGlobalAction={handleGlobalAction} />}
          </div>
        )}
        
        {currentView === 'public-news' && (
          <PublicNewsPage 
            news={news}
            isLoading={isLoading}
            onBackToAdmin={() => setCurrentView('admin')} 
            onArticleClick={navigateToArticle} 
          />
        )}
        {currentView === 'public-news-details' && (
          <PublicNewsDetailsPage 
            news={news}
            slug={selectedSlug} 
            isLoading={isLoading}
            onBack={() => setCurrentView('public-news')} 
            onShare={handleOpenShare} 
          />
        )}
      </main>

      {/* Global Modals */}
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        item={selectedNewsItem} 
        onApprove={handleApproveForScheduling} 
        onPublish={handleReviewPublish}
        onRewrite={() => {setIsReviewModalOpen(false); setIsRewriteModalOpen(true);}} 
        onReject={() => {setIsReviewModalOpen(false); setIsRejectModalOpen(true);}} 
        onSave={handleSaveDraftUpdate}
      />
      <SchedulingModal isOpen={isSchedulingModalOpen} onClose={() => setIsSchedulingModalOpen(false)} onConfirm={handleScheduleConfirm} item={selectedNewsItem} />
      <TestPreviewModal 
        isOpen={isTestPreviewModalOpen} 
        onClose={() => setIsTestPreviewModalOpen(false)} 
        onSaveToDrafts={handleSaveTestToDrafts}
        onSimulatePublish={handleSimulatePublishFromTest}
      />
      <ManualDraftModal 
        isOpen={isManualDraftModalOpen}
        onClose={() => setIsManualDraftModalOpen(false)}
        onGenerate={handleManualDraftGenerate}
      />
      <RewriteModal 
        isOpen={isRewriteModalOpen} 
        onClose={() => {setIsRewriteModalOpen(false); setIsReviewModalOpen(true);}} 
        onConfirm={handleRewriteConfirm} 
        item={selectedNewsItem} 
      />
      <RejectModal 
        isOpen={isRejectModalOpen} 
        onClose={() => {setIsRejectModalOpen(false); setIsReviewModalOpen(true);}} 
        onConfirm={handleRejectConfirm} 
        item={selectedNewsItem} 
      />
      <SourceModal isOpen={isSourceModalOpen} onClose={() => setIsSourceModalOpen(false)} onSave={handleSaveSource} source={selectedSource} />
      <PromptDetailsModal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} log={selectedLog} />
      
      <ConfirmationModal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)} 
        onConfirm={confirmModalConfig?.onConfirm || (() => {})}
        title={confirmModalConfig?.title || ""}
        message={confirmModalConfig?.message || ""}
        confirmLabel={confirmModalConfig?.confirmLabel || ""}
        variant={confirmModalConfig?.variant || "warning"}
        requireConfirmText={confirmModalConfig?.requireConfirmText}
      />

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={`${window.location.origin}/news/${selectedSlug}`}
        title="Insightful Analysis from NewsEngine"
      />
    </div>
  );
};

export default App;
