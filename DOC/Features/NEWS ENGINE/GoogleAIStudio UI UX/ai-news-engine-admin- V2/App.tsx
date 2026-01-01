
import React, { useState, useEffect } from 'react';
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
  Eye
} from 'lucide-react';
import { NewsStatus, NewsItem, KPI, AppView, RSSSource, LogEntry } from './types';
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
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

const DashboardView: React.FC<{ 
  isLoading: boolean; 
  news: NewsItem[]; 
  searchTerm: string; 
  setSearchTerm: (s: string) => void;
  handleNewsAction: (item: NewsItem, action: string) => void;
  systemStatus: 'nominal' | 'paused' | 'emergency';
}> = ({ isLoading, news, searchTerm, setSearchTerm, handleNewsAction, systemStatus }) => {
  const kpis: KPI[] = [
    { label: 'Total Stories', value: 1284, trend: 12.5, icon: <Rss size={20} />, description: 'Last 30 days' },
    { label: 'Avg. Relevance', value: '92%', trend: 4.2, icon: <Activity size={20} />, description: 'AI quality score' },
    { label: 'Automations', value: systemStatus === 'nominal' ? 'Active' : systemStatus === 'paused' ? 'Paused' : 'Stopped', trend: 0, icon: <Zap size={20} />, description: 'System status' },
    { label: 'Review Queue', value: 12, trend: -18, icon: <Clock size={20} />, description: 'Pending approval' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} kpi={kpi} />
        ))}
      </section>

      <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search articles, summaries or categories..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <Filter size={16} />
            Status
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            Category
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
          <button className="text-indigo-600 text-sm font-medium hover:underline px-2">
            Clear all
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-bold text-lg">AI News Feed</h2>
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
        ) : news.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
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
                {news.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
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
                      <div className="inline-flex items-center justify-center px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">
                        {item.relevanceScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700">{item.createdAt}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.aiModel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleNewsAction(item, 'Review')}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1"
                        >
                          Review
                          <ChevronRight size={16} />
                        </button>
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <Rss className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No news drafts yet</h3>
            <p className="text-slate-500 text-center max-w-xs mb-6">Start by connecting a data source or triggering a test run to generate AI news articles.</p>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium">
              <Plus size={20} />
              Create Manual Draft
            </button>
          </div>
        )}
        
        {!isLoading && news.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">Showing {news.length} results</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed">Previous</button>
              <button className="px-3 py-1 text-sm bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50">Next</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [systemStatus, setSystemStatus] = useState<'nominal' | 'paused' | 'emergency'>('nominal');
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  
  // Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [isTestPreviewModalOpen, setIsTestPreviewModalOpen] = useState(false);
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
    variant: 'warning' | 'danger' | 'info';
    onConfirm: () => void;
  } | null>(null);

  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [selectedSource, setSelectedSource] = useState<RSSSource | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockNews: NewsItem[] = [
        { id: '1', title: 'Quantum Computing Breakthrough in Silicon Photonics', summary: 'Researchers at the National Lab have achieved a new coherence record using standard CMOS manufacturing...', status: NewsStatus.NEEDS_REVIEW, category: 'Tech', relevanceScore: 94, aiModel: 'Gemini 3 Pro', createdAt: '10 mins ago' },
        { id: '2', title: 'Global Markets React to Fed Interest Rate Projections', summary: 'Volatility spiked in early trading as Jerome Powell hinted at a "higher for longer" stance despite cooling inflation...', status: NewsStatus.PUBLISHED, category: 'Finance', relevanceScore: 88, aiModel: 'Gemini 3 Flash', createdAt: '2 hours ago' },
        { id: '3', title: 'New Study Links Biodiversity to Urban Mental Health', summary: 'A longitudinal study across 20 European cities suggests that proximity to high-biodiversity green spaces...', status: NewsStatus.SCHEDULED, category: 'Health', relevanceScore: 82, aiModel: 'Gemini 3 Flash', createdAt: '5 hours ago' },
        { id: '4', title: 'AI Governance: EU Parliament Finalizes New Safety Framework', summary: 'The landmark legislation sets tiered risk categories for foundation models and strict transparency mandates...', status: NewsStatus.DRAFT, category: 'Politics', relevanceScore: 91, aiModel: 'Gemini 3 Pro', createdAt: '1 day ago' },
        { id: '5', title: 'Mars Rover Discovers Carbon Complex Molecules in Gale Crater', summary: 'NASA scientists confirm that organic compounds found in surface samples are indigenous to Mars and suggest...', status: NewsStatus.ERROR, category: 'Science', relevanceScore: 97, aiModel: 'Gemini 3 Flash', createdAt: '2 days ago' }
      ];
      setNews(mockNews);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleGlobalAction = (action: 'Pause' | 'Resume' | 'Emergency') => {
    if (action === 'Pause') {
      setConfirmModalConfig({
        title: "Pause News Pipeline?",
        message: "This will stop all active AI research, drafting, and automated scheduling tasks immediately. You will need to manually resume the pipeline later.",
        confirmLabel: "Yes, Pause Pipeline",
        variant: "warning",
        onConfirm: () => setSystemStatus('paused')
      });
    } else if (action === 'Resume') {
      setConfirmModalConfig({
        title: "Resume All Automations?",
        message: "This will restart all paused services including RSS ingestion, research agents, and the drafting engine.",
        confirmLabel: "Yes, Resume Everything",
        variant: "info",
        onConfirm: () => setSystemStatus('nominal')
      });
    } else if (action === 'Emergency') {
      setConfirmModalConfig({
        title: "EMERGENCY SYSTEM STOP",
        message: "CRITICAL: This will immediately terminate all active processes, clear volatile research buffers, and lock the system. This action is logged as a critical event.",
        confirmLabel: "ACTIVATE EMERGENCY STOP",
        variant: "danger",
        onConfirm: () => setSystemStatus('emergency')
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
      createdAt: 'Just now'
    };
    setNews(prev => [newItem, ...prev]);
    setIsTestPreviewModalOpen(false);
    setCurrentView('drafts');
  };

  const handleSimulatePublishFromTest = (testData: { title: string; summary: string }) => {
    setConfirmModalConfig({
      title: "Confirm Immediate Publication?",
      message: "This will bypass the review queue and publish the AI-generated analysis directly to the live feed. This action is recorded in the audit logs.",
      confirmLabel: "Publish Immediately",
      variant: "warning",
      onConfirm: () => {
        const newItem: NewsItem = {
          id: Math.random().toString(36).substr(2, 9),
          title: testData.title,
          summary: testData.summary,
          status: NewsStatus.PUBLISHED,
          category: 'Tech',
          relevanceScore: 98,
          aiModel: 'Gemini 3 Pro',
          createdAt: 'Just now'
        };
        setNews(prev => [newItem, ...prev]);
        setIsTestPreviewModalOpen(false);
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
      setNews(prev => prev.map(item => item.id === selectedNewsItem.id ? { ...item, status: NewsStatus.SCHEDULED } : item));
    }
    setIsSchedulingModalOpen(false);
  };

  const handleAddSource = () => {
    setSelectedSource(null);
    setIsSourceModalOpen(true);
  };

  const handleEditSource = (source: RSSSource) => {
    setSelectedSource(source);
    setIsSourceModalOpen(true);
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
      {/* Sidebar - Only show for Admin views */}
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
              <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
              <SidebarItem icon={<ClipboardList size={20} />} label="Drafts & Reviews" active={currentView === 'drafts'} onClick={() => setCurrentView('drafts')} />
              <SidebarItem icon={<History size={20} />} label="Audit & Logs" active={currentView === 'audit'} onClick={() => setCurrentView('audit')} />
              <SidebarItem icon={<ShieldAlert size={20} />} label="Automation Control" active={currentView === 'control'} onClick={() => setCurrentView('control')} />
              <SidebarItem icon={<Cpu size={20} />} label="Rules & Logic" active={currentView === 'automation'} onClick={() => setCurrentView('automation')} />
              <SidebarItem icon={<BookOpen size={20} />} label="Sources & Research" active={currentView === 'sources'} onClick={() => setCurrentView('sources')} />
              <SidebarItem icon={<SettingsIcon size={20} />} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
              <div className="pt-4 mt-4 border-t border-slate-800">
                <SidebarItem icon={<Eye size={20} />} label="Public View" active={false} onClick={() => setCurrentView('public-news')} />
              </div>
            </nav>
          </div>
        </aside>
      )}

      <main className={`flex-1 flex flex-col h-full overflow-y-auto ${isPublicView ? 'bg-white' : ''}`}>
        {/* Header - Only show for Admin views */}
        {!isPublicView && (
          <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {currentView === 'dashboard' ? 'News Engine Dashboard' : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
              </h1>
              <p className="text-slate-500 text-sm">Manage your automated news pipeline.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => setIsTestPreviewModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm">
                <RefreshCcw size={16} /> Test & Preview
              </button>
              <button 
                onClick={() => handleGlobalAction(systemStatus === 'nominal' ? 'Pause' : 'Resume')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                  systemStatus !== 'nominal' 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                {systemStatus !== 'nominal' ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                {systemStatus !== 'nominal' ? 'Resume Automation' : 'Pause Automation'}
              </button>
            </div>
          </header>
        )}

        {/* View Router */}
        {currentView === 'dashboard' && <DashboardView isLoading={isLoading} news={news} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleNewsAction={handleNewsAction} systemStatus={systemStatus} />}
        {currentView === 'sources' && <SourcesPage onAddSource={handleAddSource} onEditSource={handleEditSource} />}
        {currentView === 'drafts' && <DraftsPage onReviewDraft={(item) => handleNewsAction(item, 'Review')} />}
        {currentView === 'automation' && <AutomationPage />}
        {currentView === 'audit' && <AuditLogsPage onViewPrompt={handleViewPrompt} />}
        {currentView === 'settings' && <SettingsPage />}
        {currentView === 'control' && <ControlPage systemStatus={systemStatus} onGlobalAction={handleGlobalAction} />}
        {currentView === 'public-news' && <PublicNewsPage onBackToAdmin={() => setCurrentView('dashboard')} onArticleClick={navigateToArticle} />}
        {currentView === 'public-news-details' && <PublicNewsDetailsPage slug={selectedSlug} onBack={() => setCurrentView('public-news')} onShare={handleOpenShare} />}
      </main>

      {/* Global Modals */}
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} item={selectedNewsItem} onApprove={handleApproveForScheduling} onRewrite={() => {setIsReviewModalOpen(false); setIsRewriteModalOpen(true);}} onReject={() => {setIsReviewModalOpen(false); setIsRejectModalOpen(true);}} />
      <SchedulingModal isOpen={isSchedulingModalOpen} onClose={() => setIsSchedulingModalOpen(false)} onConfirm={handleScheduleConfirm} item={selectedNewsItem} />
      <TestPreviewModal 
        isOpen={isTestPreviewModalOpen} 
        onClose={() => setIsTestPreviewModalOpen(false)} 
        onSaveToDrafts={handleSaveTestToDrafts}
        onSimulatePublish={handleSimulatePublishFromTest}
      />
      <RewriteModal isOpen={isRewriteModalOpen} onClose={() => {setIsRewriteModalOpen(false); setIsReviewModalOpen(true);}} onConfirm={() => setIsRewriteModalOpen(false)} item={selectedNewsItem} />
      <RejectModal isOpen={isRejectModalOpen} onClose={() => {setIsRejectModalOpen(false); setIsReviewModalOpen(true);}} onConfirm={() => setIsRejectModalOpen(false)} item={selectedNewsItem} />
      <SourceModal isOpen={isSourceModalOpen} onClose={() => setIsSourceModalOpen(false)} onSave={() => setIsSourceModalOpen(false)} source={selectedSource} />
      <PromptDetailsModal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} log={selectedLog} />
      
      <ConfirmationModal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)} 
        onConfirm={confirmModalConfig?.onConfirm || (() => {})}
        title={confirmModalConfig?.title || ""}
        message={confirmModalConfig?.message || ""}
        confirmLabel={confirmModalConfig?.confirmLabel || ""}
        variant={confirmModalConfig?.variant || "warning"}
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
