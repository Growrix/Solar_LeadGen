
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileEdit, 
  GitBranch, 
  Database, 
  Activity, 
  Sliders, 
  Settings,
  Play,
  Pause,
  Zap,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { ViewState } from '../../types';
import EngineDashboard from './EngineDashboard';
import EngineDrafts, { DraftItem, MOCK_DRAFTS } from './EngineDrafts';
import EngineLogic from './EngineLogic';
import EngineSources from './EngineSources';
import EngineLogs, { LogItem, MOCK_LOGS } from './EngineLogs';
import EngineControl, { EngineStatus } from './EngineControl';
import EngineSettings from './EngineSettings';
import ConfirmationModal from './ConfirmationModal';
import ContextHelpModal from './ContextHelpModal';

const HELP_CONTENT_MAP: Record<string, any> = {
  dashboard: {
    title: 'Engine Dashboard',
    description: 'The command center for your autonomous blogging system. Monitor the health of your content pipeline and track generation velocity.',
    features: [
      'View real-time generation metrics and queue statuses.',
      'Track daily drafts, scheduled posts, and items needing review.',
      'Identify bottlenecks in the publishing workflow.'
    ],
    tips: ['Check "Needs Review" daily to keep the pipeline moving smoothly.']
  },
  drafts: {
    title: 'Drafts & Reviews',
    description: 'Human-in-the-loop workspace. This is where AI-generated content waits for your approval before going live.',
    features: [
      'Review AI drafts with confidence scores.',
      'Edit content, requesting rewrites, or rejecting low-quality outputs.',
      'Bulk assign reviewers or approve high-confidence drafts.',
      'Filter by "Min Confidence" to prioritize risky content.'
    ]
  },
  logic: {
    title: 'Automation Logic',
    description: 'The brain of the operation. Configure how and when the engine generates content.',
    features: [
      'Set "Time Windows" to control when posts are published.',
      'Configure throughput limits to control costs and frequency.',
      'Define quality gates like "Min Word Count" or "Require Images".',
      'Toggle AI Image Generation settings.'
    ]
  },
  sources: {
    title: 'Data Sources',
    description: 'Feed the engine with knowledge. Manage the inputs used to discover trending topics and facts.',
    features: [
      'Add RSS feeds, competitor sites (scrapers), or manual uploads.',
      'Enable/Disable specific sources to tune content relevance.',
      'View the status of source ingestion.'
    ]
  },
  logs: {
    title: 'Audit Logs',
    description: 'Complete transparency. Track every decision made by the AI and every action taken by admins.',
    features: [
      'Filter logs by Actor (AI, Automation, Admin).',
      'View performance metrics like Token Usage and Latency.',
      'Inspect the exact prompt used for AI generations (transparency record).'
    ]
  },
  control: {
    title: 'Master Control',
    description: 'Safety overrides. Manage the global state of the automation engine.',
    features: [
      'Pause the engine to stop all new generation and publishing.',
      'Resume operations after maintenance.',
      'Emergency Stop to kill all active processes immediately.'
    ]
  },
  settings: {
    title: 'System Settings',
    description: 'Global configuration for the underlying AI models and integrations.',
    features: [
      'Configure AI Model Profiles (GPT-4, Claude, Gemini).',
      'Manage API Credentials securely.',
      'Set routing rules for different tasks (e.g. use GPT-4 for writing, Gemini for SEO).'
    ]
  }
};

const SkeletonHub = () => (
  <div className="min-h-screen bg-slate-50 animate-pulse">
    <div className="bg-white border-b border-slate-200 px-6 py-5">
       <div className="h-8 w-48 bg-slate-200 rounded mb-2" />
       <div className="h-4 w-96 bg-slate-200 rounded mb-8" />
       <div className="flex gap-4">
         <div className="h-10 w-24 bg-slate-200 rounded" />
         <div className="h-10 w-24 bg-slate-200 rounded" />
         <div className="h-10 w-24 bg-slate-200 rounded" />
       </div>
    </div>
    <div className="p-6">
      <div className="h-96 bg-white rounded-xl border border-slate-200" />
    </div>
  </div>
);

const BlogEngineHub: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mode, setMode] = useState<'manual' | 'assisted' | 'automatic'>('assisted');
  
  // Lifted Engine Status State
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('running');
  const [draftItems, setDraftItems] = useState<DraftItem[]>(MOCK_DRAFTS);
  const [logs, setLogs] = useState<LogItem[]>(MOCK_LOGS);

  // UI States
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setViewState('success');
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Toast Timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'drafts', label: 'Drafts & Reviews', icon: FileEdit },
    { id: 'logic', label: 'Automation Logic', icon: GitBranch },
    { id: 'sources', label: 'Sources', icon: Database },
    { id: 'logs', label: 'Audit Logs', icon: Activity },
    { id: 'control', label: 'Master Control', icon: Sliders },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleRetry = () => {
    setViewState('loading');
    setTimeout(() => setViewState('success'), 800);
  };

  const handlePauseToggle = () => {
    if (engineStatus === 'running') {
      setIsPauseModalOpen(true);
    } else {
      // If paused or stopped, just switch to control tab to let user handle resume
      setActiveTab('control');
    }
  };

  const confirmPause = () => {
    setIsPausing(true);
    setTimeout(() => {
      setEngineStatus('paused');
      setIsPausing(false);
      setIsPauseModalOpen(false);
      setToastMessage('Automation paused successfully.');
      handleAddSystemLog({ 
        action: 'Pause Engine', 
        target: 'System State', 
        result: 'success', 
        actorType: 'admin',
        actorName: 'Admin User' 
      });
    }, 1000);
  };

  const handleTestGenerate = () => {
    setActiveTab('drafts');
    
    // Create a new mock draft
    const newDraft: DraftItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Solar Technologies 2024 (Test Gen)',
      excerpt: 'This is a test draft generated by the manual trigger from the Engine Hub.',
      source: 'automation',
      status: 'needs_review',
      author: 'Auto-Engine (Test)',
      updatedAt: 'Just now',
      confidenceScore: 92
    };

    setDraftItems(prev => [newDraft, ...prev]);
    handleAddSystemLog({ 
      action: 'Generate Test Draft', 
      target: newDraft.title, 
      result: 'success', 
      actorType: 'automation',
      actorName: 'Auto-Engine' 
    });
    setToastMessage('Test generation queued (UI-only). New draft added.');
  };

  const handleAddSystemLog = (entry: Partial<LogItem>) => {
    const newLog: LogItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actorType: 'automation',
      actorName: 'Auto-Engine',
      action: 'Unknown Action',
      target: 'System',
      result: 'success',
      ...entry
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Test Harness Handler
  const handleSimulateAction = (action: string) => {
    if (action === 'generate_draft') {
      const newDraft: DraftItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: `Simulated Draft: ${new Date().toLocaleTimeString()}`,
        excerpt: 'This content was generated by the simulation test harness.',
        source: 'automation',
        status: 'draft_ready',
        author: 'Test Harness',
        updatedAt: 'Just now',
        confidenceScore: 100
      };
      setDraftItems(prev => [newDraft, ...prev]);
      
      handleAddSystemLog({ 
        action: 'Simulated Draft Generation', 
        target: newDraft.title, 
        result: 'success', 
        actorType: 'automation',
        actorName: 'Test Harness',
        metrics: { duration: '0.8s', tokens: 450, cost: '$0.00', model: 'Simulation' }
      });
    }
  };

  // Derive Dashboard Stats from real Drafts state
  const dashboardStats = {
    drafts: draftItems.filter(d => d.status === 'draft_ready').length,
    needsReview: draftItems.filter(d => d.status === 'needs_review').length,
    scheduled: 8, // Mock for now as DraftItem doesn't strictly track scheduled, mostly review pipeline
    published: 145 // Mock historical
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EngineDashboard stats={dashboardStats} recentItems={draftItems.slice(0, 5)} />;
      case 'drafts':
        return <EngineDrafts items={draftItems} setItems={setDraftItems} />;
      case 'logic':
        return <EngineLogic />;
      case 'sources':
        return <EngineSources />;
      case 'logs':
        return <EngineLogs items={logs} />;
      case 'control':
        return <EngineControl 
          status={engineStatus} 
          onStatusChange={setEngineStatus} 
          onSimulateAction={handleSimulateAction} 
          onSystemLog={handleAddSystemLog}
        />;
      case 'settings':
        return <EngineSettings />;
      default:
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              {React.createElement(
                tabs.find(t => t.id === activeTab)?.icon || Activity, 
                { className: "w-8 h-8 text-slate-400" }
              )}
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-slate-500 max-w-sm mt-2 leading-relaxed">
              This module is ready for configuration. Active data visualization and controls will be displayed here.
            </p>
          </div>
        );
    }
  };

  if (viewState === 'loading') {
    return <SkeletonHub />;
  }

  if (viewState === 'error') {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Engine Connection Failed</h3>
        <p className="text-slate-500 mb-6 max-w-sm">
          Unable to establish a connection to the automation engine. Please check your system status.
        </p>
        <button 
          onClick={handleRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
           <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">{toastMessage}</span>
           </div>
        </div>
      )}

      {/* Confirmation Modal for Pause */}
      <ConfirmationModal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        onConfirm={confirmPause}
        isLoading={isPausing}
        title="Pause Automation?"
        message="Automated drafts, scheduling, and publishing workflows will stop until resumed. Current tasks may complete."
        confirmLabel="Pause Engine"
        isDestructive={false}
      />

      {/* Context Help Modal */}
      <ContextHelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        content={HELP_CONTENT_MAP[activeTab]} 
      />

      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          
          {/* Title & Helper */}
          <div className="flex items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-solar-500 fill-solar-500" />
                Blog Engine Hub
                {engineStatus !== 'running' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${
                    engineStatus === 'paused' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {engineStatus}
                  </span>
                )}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage automated content generation, review workflows, and system inputs.
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            
            {/* Mode Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              {(['manual', 'assisted', 'automatic'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`
                    px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize
                    ${mode === m 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-100' 
                      : 'text-slate-500 hover:text-slate-700'}
                  `}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsHelpOpen(true)}
                className="p-2 text-slate-400 hover:text-solar-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                title="Help & Guide"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              <button 
                onClick={handlePauseToggle}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors shadow-sm focus:ring-2 focus:ring-slate-200 ${
                  engineStatus === 'running' 
                    ? 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                    : 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700'
                }`}
              >
                {engineStatus === 'running' ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Automation
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Resume Automation
                  </>
                )}
              </button>
              
              <button 
                onClick={handleTestGenerate}
                disabled={engineStatus !== 'running'}
                className="flex items-center gap-2 px-4 py-2 bg-solar-600 hover:bg-solar-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-solar-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" />
                Test Generate
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex space-x-1 overflow-x-auto no-scrollbar -mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'border-solar-500 text-solar-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
              `}
            >
              <tab.icon className={`w-4 h-4 transition-colors ${activeTab === tab.id ? 'text-solar-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default BlogEngineHub;
