
import React from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Database, 
  User, 
  Terminal, 
  ExternalLink,
  ChevronDown,
  Cpu,
  MousePointer2,
  FileText
} from 'lucide-react';
import { LogEntry, NewsStatus } from './types';

interface AuditLogsPageProps {
  logs: LogEntry[];
  isLoading: boolean;
  onViewPrompt: (log: LogEntry) => void;
}

const AuditLogsPage: React.FC<AuditLogsPageProps> = ({ logs, isLoading, onViewPrompt }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Audit Trail</h2>
          <p className="text-sm text-slate-500">A comprehensive record of all AI generations, manual edits, and system actions.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search logs (action, admin, source)..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        
        <button className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <span>Date Range</span>
          </div>
          <ChevronDown size={14} />
        </button>

        <button className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-slate-400" />
            <span>Origin: All</span>
          </div>
          <ChevronDown size={14} />
        </button>

        <button className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span>Status</span>
          </div>
          <ChevronDown size={14} />
        </button>
      </section>

      {/* Logs Table */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Origin</th>
                <th className="px-6 py-4">Performed By</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{log.action}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Database size={12} className="text-slate-400" />
                        {log.source}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        log.origin === 'AI' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {log.origin === 'AI' ? <Cpu size={10} /> : <MousePointer2 size={10} />}
                        {log.origin}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <User size={12} className="text-slate-400" />
                        {log.admin}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        log.status === NewsStatus.PUBLISHED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        log.status === NewsStatus.ERROR ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        log.status === 'System' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.promptUsed ? (
                        <button 
                          onClick={() => onViewPrompt(log)}
                          className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-all"
                          title="View Prompt Details"
                        >
                          <Terminal size={14} />
                        </button>
                      ) : (
                        <button 
                          className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg"
                          title="View Log Details"
                        >
                          <FileText size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Database size={32} />
                      <p className="font-medium">No audit logs found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-xs text-slate-400 px-2">
        <p>Retaining last 90 days of system activity.</p>
        <button className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
          <ExternalLink size={12} />
          Export CSV Log
        </button>
      </div>
    </div>
  );
};

export default AuditLogsPage;
