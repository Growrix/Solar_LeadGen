
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Bot, 
  Zap, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Terminal,
  FileText,
  Filter,
  Clock,
  Cpu
} from 'lucide-react';
import SkeletonAdminTable from './SkeletonAdminTable';
import PromptDetailsModal from './PromptDetailsModal';

export type ActorType = 'ai' | 'automation' | 'admin';
export type ResultStatus = 'success' | 'error' | 'warning';

export interface LogMetrics {
  duration: string;
  tokens?: number;
  cost?: string;
  model?: string;
}

export interface LogItem {
  id: string;
  timestamp: string;
  actorType: ActorType;
  actorName: string;
  action: string;
  target: string;
  result: ResultStatus;
  errorMessage?: string;
  hasPromptDetails?: boolean;
  metrics?: LogMetrics;
}

// Mock Data
export const MOCK_LOGS: LogItem[] = [
  { 
    id: '1', 
    timestamp: '10:42 AM', 
    actorType: 'ai', 
    actorName: 'AI Assistant', 
    action: 'Generated Draft', 
    target: 'The Future of Solar Batteries', 
    result: 'success',
    hasPromptDetails: true,
    metrics: { duration: '3.2s', tokens: 1450, cost: '$0.04', model: 'GPT-4o' }
  },
  { 
    id: '2', 
    timestamp: '10:41 AM', 
    actorType: 'automation', 
    actorName: 'Auto-Engine', 
    action: 'Scheduled Publish', 
    target: 'Understanding Net Metering 2.0', 
    result: 'success',
    metrics: { duration: '0.4s' }
  },
  { 
    id: '3', 
    timestamp: '09:15 AM', 
    actorType: 'admin', 
    actorName: 'Sarah Jenkins', 
    action: 'Manual Edit', 
    target: 'Commercial Solar ROI Analysis', 
    result: 'success' 
  },
  { 
    id: '4', 
    timestamp: '08:30 AM', 
    actorType: 'automation', 
    actorName: 'Auto-Engine', 
    action: 'Fetch RSS Feeds', 
    target: 'CleanTechnica Source', 
    result: 'error',
    errorMessage: 'Connection timeout (504)',
    metrics: { duration: '30.0s' }
  },
  { 
    id: '5', 
    timestamp: 'Yesterday', 
    actorType: 'ai', 
    actorName: 'AI Assistant', 
    action: 'Optimize SEO', 
    target: 'Green Energy Policy Updates', 
    result: 'warning',
    errorMessage: 'Keywords density low',
    hasPromptDetails: true,
    metrics: { duration: '1.1s', tokens: 320, cost: '$0.01', model: 'Claude 3.5 Sonnet' }
  },
  { 
    id: '6', 
    timestamp: 'Yesterday', 
    actorType: 'admin', 
    actorName: 'Admin User', 
    action: 'Update Settings', 
    target: 'Automation Logic', 
    result: 'success' 
  },
];

interface EngineLogsProps {
  items?: LogItem[];
}

const EngineLogs: React.FC<EngineLogsProps> = ({ items = MOCK_LOGS }) => {
  const [viewState, setViewState] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [actorFilter, setActorFilter] = useState<string>('all');
  
  // Prompt Details Modal State
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Simulate Data Fetching or Update on items change
  useEffect(() => {
    if (viewState === 'loading') {
      const timer = setTimeout(() => {
        setViewState('success');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [viewState]);

  // If items update, ensure we show success
  useEffect(() => {
    if (items.length > 0 && viewState !== 'loading') {
        setViewState('success');
    }
  }, [items]);

  // Mock Prompt Data Generator
  const getMockPromptDetails = (id: string) => {
    const log = items.find(l => l.id === id);
    return {
      intent: log?.action || 'Unknown Intent',
      topic: log?.target || 'Unknown Topic',
      keywords: ['LFP Batteries', 'Energy Storage', 'Residential Solar', 'Grid Independence', 'ROI'],
      sources: [
         'https://cleantechnica.com/2023/10/20/battery-tech-breakthroughs/',
         'https://www.energy.gov/eere/solar/solar-plus-storage'
      ],
      constraints: {
        tone: 'Professional & Informative',
        length: '1200',
        model: log?.metrics?.model || 'GPT-4o'
      },
      execution: log?.metrics ? {
        duration: log.metrics.duration,
        tokens: log.metrics.tokens || 0,
        cost: log.metrics.cost || '$0.00'
      } : undefined
    };
  };

  const handlePromptDetails = (id: string) => {
    setSelectedLogId(id);
    setPromptModalOpen(true);
  };

  const filteredLogs = items.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesActor = actorFilter === 'all' || log.actorType === actorFilter;
    
    return matchesSearch && matchesActor;
  });

  const ActorIcon = ({ type }: { type: ActorType }) => {
    switch (type) {
      case 'ai':
        return <Bot className="w-4 h-4 text-purple-600" />;
      case 'automation':
        return <Zap className="w-4 h-4 text-blue-600 fill-blue-100" />;
      case 'admin':
        return <User className="w-4 h-4 text-slate-600" />;
    }
  };

  const ResultBadge = ({ result, error }: { result: ResultStatus, error?: string }) => {
    if (result === 'success') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
          <CheckCircle className="w-3 h-3 mr-1" /> Success
        </span>
      );
    }
    if (result === 'error') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100" title={error}>
          <XCircle className="w-3 h-3 mr-1" /> Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100" title={error}>
        <AlertTriangle className="w-3 h-3 mr-1" /> Warning
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Prompt Details Modal */}
      <PromptDetailsModal 
        isOpen={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        details={selectedLogId ? getMockPromptDetails(selectedLogId) : null}
      />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">System Audit Logs</h2>
          <p className="text-sm text-slate-500">Track actions performed by AI, automation rules, and administrators.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
           {/* Actor Filter */}
           <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <select 
               value={actorFilter}
               onChange={(e) => setActorFilter(e.target.value)}
               className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none appearance-none cursor-pointer hover:bg-slate-50 transition-colors w-full sm:w-auto"
             >
               <option value="all">All Actors</option>
               <option value="ai">AI Assistant</option>
               <option value="automation">Automation</option>
               <option value="admin">Admin</option>
             </select>
           </div>
           
           {/* Search */}
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input
               type="text"
               placeholder="Search logs..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all placeholder-slate-400 w-full sm:w-64"
             />
           </div>
        </div>
      </div>

      {/* Content */}
      {viewState === 'loading' && <SkeletonAdminTable />}

      {viewState === 'error' && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-red-900 mb-1">Failed to load logs</h3>
          <button onClick={() => window.location.reload()} className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {viewState === 'success' && filteredLogs.length === 0 && (
         <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center">
           <div className="bg-slate-50 p-4 rounded-full mb-4">
             <Activity className="w-6 h-6 text-slate-400" />
           </div>
           <h3 className="text-lg font-medium text-slate-900">No logs found</h3>
           <p className="text-slate-500 mt-1 mb-4">No activity matches your current filters.</p>
           <button 
             onClick={() => {setActorFilter('all'); setSearchQuery('')}}
             className="text-solar-600 font-medium text-sm hover:underline"
           >
             Clear filters
           </button>
         </div>
      )}

      {viewState === 'success' && filteredLogs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors animate-fade-in">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${
                          log.actorType === 'ai' ? 'bg-purple-50' : 
                          log.actorType === 'automation' ? 'bg-blue-50' : 'bg-slate-100'
                        }`}>
                          <ActorIcon type={log.actorType} />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{log.actorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm text-slate-700 font-medium">{log.action}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                         <span className="text-sm text-slate-600 truncate max-w-[180px]" title={log.target}>
                           {log.target}
                         </span>
                       </div>
                       {log.errorMessage && (
                         <div className="text-xs text-red-500 mt-1 ml-5.5">
                           {log.errorMessage}
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.metrics ? (
                        <div className="flex items-center gap-3 text-xs">
                          {log.metrics.duration && (
                            <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              <Clock className="w-3 h-3" /> {log.metrics.duration}
                            </span>
                          )}
                          {log.metrics.tokens && (
                            <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                              <Cpu className="w-3 h-3" /> {log.metrics.tokens}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3">
                        <ResultBadge result={log.result} error={log.errorMessage} />
                        {log.hasPromptDetails && (
                          <button 
                            onClick={() => handlePromptDetails(log.id)}
                            className="text-slate-400 hover:text-purple-600 p-1.5 hover:bg-purple-50 rounded transition-colors"
                            title="View AI Prompt Details"
                          >
                            <Terminal className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Placeholder */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredLogs.length} events</span>
            <div className="flex gap-2">
               <button disabled className="px-2 py-1 bg-white border border-slate-200 rounded opacity-50 cursor-not-allowed">Previous</button>
               <button disabled className="px-2 py-1 bg-white border border-slate-200 rounded opacity-50 cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineLogs;
