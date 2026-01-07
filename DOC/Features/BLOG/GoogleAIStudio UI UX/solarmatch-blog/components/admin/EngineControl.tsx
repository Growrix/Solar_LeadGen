
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Pause, 
  Play, 
  Octagon, 
  ShieldAlert, 
  History,
  Power,
  RefreshCw,
  Activity,
  CheckCircle,
  TestTube,
  Bug,
  Database,
  Terminal,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

export type EngineStatus = 'running' | 'paused' | 'stopped';

interface EngineControlProps {
  status: EngineStatus;
  onStatusChange: (status: EngineStatus) => void;
  onSimulateAction: (action: string) => void;
  onSystemLog: (entry: any) => void;
}

interface LogEntry {
  id: string;
  time: string;
  msg: string;
  type: 'info' | 'error' | 'success';
}

const EngineControl: React.FC<EngineControlProps> = ({ status, onStatusChange, onSimulateAction, onSystemLog }) => {
  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'pause' | 'resume' | 'stop' | null;
  }>({ isOpen: false, type: null });

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Simulation State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Toast Timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      msg,
      type
    };
    setLogs(prev => [...prev, entry].slice(-50)); // Keep last 50
  };

  const handleAction = (type: 'pause' | 'resume' | 'stop') => {
    setModalConfig({ isOpen: true, type });
  };

  const confirmAction = () => {
    if (!modalConfig.type) return;

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      let message = '';
      if (modalConfig.type === 'pause') {
        onStatusChange('paused');
        message = 'Engine paused successfully.';
        addLog('System state changed to PAUSED', 'info');
        onSystemLog({ action: 'Pause Engine', target: 'System', result: 'success', actorType: 'admin' });
      }
      if (modalConfig.type === 'resume') {
        onStatusChange('running');
        message = 'Engine resumed successfully.';
        addLog('System state changed to RUNNING', 'success');
        onSystemLog({ action: 'Resume Engine', target: 'System', result: 'success', actorType: 'admin' });
      }
      if (modalConfig.type === 'stop') {
        onStatusChange('stopped');
        message = 'Engine stopped immediately.';
        addLog('EMERGENCY STOP TRIGGERED', 'error');
        onSystemLog({ action: 'Emergency Stop', target: 'System', result: 'error', actorType: 'admin' });
      }
      
      setNotification({ message, type: 'success' });
      setIsLoading(false);
      setModalConfig({ isOpen: false, type: null });
    }, 1500);
  };

  // Simulation Handlers
  const handleTestGenerate = () => {
    setIsSimulating('draft');
    addLog('Initiating test draft generation...', 'info');
    
    setTimeout(() => {
      addLog('Source: "Internal Test Trigger"', 'info');
      addLog('Processing NLP context...', 'info');
      
      setTimeout(() => {
        onSimulateAction('generate_draft');
        addLog('Draft created and pushed to queue.', 'success');
        setIsSimulating(null);
        setNotification({ message: 'Test draft generated.', type: 'success' });
      }, 800);
    }, 600);
  };

  const handleIntegrityCheck = () => {
    setIsSimulating('integrity');
    addLog('Starting system integrity scan...', 'info');
    
    setTimeout(() => {
      addLog('Checking database connectivity... OK', 'info');
      addLog('Verifying API quotas... OK', 'info');
      
      setTimeout(() => {
        addLog('Integrity check passed. All systems nominal.', 'success');
        onSystemLog({ 
          action: 'System Integrity Scan', 
          target: 'Database & API', 
          result: 'success', 
          actorType: 'automation',
          metrics: { duration: '1.6s' }
        });
        setIsSimulating(null);
      }, 800);
    }, 800);
  };

  const handleErrorSim = () => {
    addLog('Injecting fault into pipeline...', 'info');
    setTimeout(() => {
      addLog('Error: 500 Internal Server Error (Simulated)', 'error');
      setNotification({ message: 'Simulated error event triggered.', type: 'error' });
      onSystemLog({ 
        action: 'Pipeline Process', 
        target: 'Simulated Fault Injection', 
        result: 'error', 
        errorMessage: '500 Internal Server Error (Test)',
        actorType: 'automation',
        metrics: { duration: '0.2s' }
      });
    }, 400);
  };

  const handleClearCache = () => {
    addLog('Flushing redis cache...', 'info');
    setTimeout(() => {
      addLog('Cache cleared. 42 keys removed.', 'success');
      setNotification({ message: 'System cache cleared.', type: 'success' });
      onSystemLog({ action: 'Clear Cache', target: 'Redis', result: 'success', actorType: 'admin' });
    }, 500);
  };

  // Helper to render current status visual
  const StatusDisplay = () => {
    if (status === 'running') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-white p-4 rounded-full border-4 border-green-100 shadow-sm">
              <Zap className="w-12 h-12 text-green-500 fill-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Engine is Running</h2>
          <p className="text-green-700 max-w-md">
            Automation logic is active. Drafts, scheduling, and publishing workflows are operating normally.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-green-800 bg-green-100/50 px-4 py-2 rounded-full">
            <Activity className="w-4 h-4" />
            Uptime: 14d 2h 15m
          </div>
        </div>
      );
    }

    if (status === 'paused') {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="bg-white p-4 rounded-full border-4 border-amber-100 shadow-sm mb-6">
            <Pause className="w-12 h-12 text-amber-500 fill-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-amber-800 mb-2">Engine is Paused</h2>
          <p className="text-amber-700 max-w-md">
            All automation tasks are suspended. No new content will be generated or published until resumed.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 10px, transparent 0, transparent 20px)' }}>
        </div>
        
        <div className="relative bg-white p-4 rounded-full border-4 border-red-100 shadow-sm mb-6 animate-pulse">
          <Octagon className="w-12 h-12 text-red-600 fill-red-100" />
        </div>
        <h2 className="text-2xl font-bold text-red-800 mb-2">EMERGENCY STOP ACTIVE</h2>
        <p className="text-red-700 max-w-md font-medium">
          System has been forcibly halted. All processes killed. Manual intervention required to reset.
        </p>
      </div>
    );
  };

  // Get Modal Content based on type
  const getModalContent = () => {
    switch (modalConfig.type) {
      case 'pause':
        return {
          title: 'Pause Automation?',
          message: 'Automated drafts, scheduling, and publishing workflows will stop until resumed. Current tasks may complete.',
          confirmLabel: 'Pause',
          isDestructive: false
        };
      case 'resume':
        return {
          title: 'Resume Automation?',
          message: 'The engine will resume scheduled activities immediately. It may take a few minutes to catch up on missed tasks.',
          confirmLabel: 'Resume Engine',
          isDestructive: false
        };
      case 'stop':
        return {
          title: 'Emergency stop?',
          message: 'WARNING: This will immediately halt all automation services, kill active connections, and discard unsaved data. The system will require a manual hard reset to come back online.',
          confirmLabel: 'Emergency Stop',
          isDestructive: true
        };
      default:
        return { title: '', message: '', confirmLabel: '' };
    }
  };

  const modalContent = getModalContent();

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative pb-20">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white ${notification.type === 'error' ? 'bg-red-600' : 'bg-slate-900'}`}>
             {notification.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
             <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={confirmAction}
        isLoading={isLoading}
        title={modalContent.title}
        message={modalContent.message}
        confirmLabel={modalContent.confirmLabel}
        isDestructive={modalContent.isDestructive}
      />

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Master Control Panel</h2>
        <p className="text-sm text-slate-500">High-level safety controls for the automation engine.</p>
      </div>

      {/* Status Indicator */}
      <StatusDisplay />

      {/* Control Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Standard Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-slate-100 rounded-lg">
               <Power className="w-5 h-5 text-slate-600" />
             </div>
             <div>
               <h3 className="font-semibold text-slate-900">Operational Controls</h3>
               <p className="text-xs text-slate-500">Standard flow management</p>
             </div>
          </div>
          
          <div className="pt-2 flex flex-col gap-3">
             {status === 'running' ? (
               <button 
                 onClick={() => handleAction('pause')}
                 className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg border border-amber-200 transition-colors"
               >
                 <Pause className="w-4 h-4 fill-current" />
                 Pause Automation
               </button>
             ) : (
               <button 
                 onClick={() => handleAction('resume')}
                 disabled={status === 'stopped'}
                 className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg border border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Play className="w-4 h-4 fill-current" />
                 {status === 'stopped' ? 'Requires Hard Reset' : 'Resume Automation'}
               </button>
             )}
             
             <p className="text-xs text-slate-400 text-center">
               {status === 'running' 
                 ? "Safely suspends new tasks." 
                 : status === 'paused' 
                   ? "Restores normal operation." 
                   : "System is locked."}
             </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
             <ShieldAlert className="w-32 h-32" />
          </div>

          <div className="flex items-center gap-3 mb-2 relative z-10">
             <div className="p-2 bg-red-50 rounded-lg">
               <ShieldAlert className="w-5 h-5 text-red-600" />
             </div>
             <div>
               <h3 className="font-semibold text-slate-900">Danger Zone</h3>
               <p className="text-xs text-slate-500">Emergency overrides</p>
             </div>
          </div>

          <div className="pt-2 flex flex-col gap-3 relative z-10">
             {status === 'stopped' ? (
                <button 
                  onClick={() => handleAction('resume')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset System & Restart
                </button>
             ) : (
                <button 
                  onClick={() => handleAction('stop')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-colors hover:shadow-lg"
                >
                  <Octagon className="w-4 h-4" />
                  EMERGENCY STOP
                </button>
             )}
             
             <p className="text-xs text-red-400/80 text-center font-medium">
               {status === 'stopped' 
                 ? "Requires manual verification before reset." 
                 : "Use only in critical failure scenarios."}
             </p>
          </div>
        </div>
      </div>

      {/* Test Harness Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          Simulation & Diagnostics
        </h3>
        
        <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-lg flex flex-col md:flex-row">
           {/* Harness Controls */}
           <div className="bg-slate-900 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Test Triggers</h4>
              
              <button 
                onClick={handleTestGenerate}
                disabled={status !== 'running' || !!isSimulating}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-3">
                  <TestTube className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                  Generate Draft
                </div>
                {isSimulating === 'draft' && <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />}
              </button>

              <button 
                onClick={handleIntegrityCheck}
                disabled={!!isSimulating}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  System Integrity
                </div>
                {isSimulating === 'integrity' && <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />}
              </button>

              <button 
                onClick={handleErrorSim}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-red-900/30 text-slate-200 hover:text-red-200 text-sm font-medium rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Bug className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                  Simulate Error
                </div>
              </button>

              <button 
                onClick={handleClearCache}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
                  Clear Cache
                </div>
              </button>
           </div>

           {/* Console Output */}
           <div className="flex-1 bg-black p-4 font-mono text-xs overflow-y-auto max-h-64 md:h-auto min-h-[250px]">
              <div className="text-slate-500 mb-2 border-b border-slate-800 pb-2">
                > System Output Stream initialized...
              </div>
              <div className="space-y-1.5">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 animate-fade-in">
                    <span className="text-slate-600 flex-shrink-0">[{log.time}]</span>
                    <span className={`break-all ${
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'success' ? 'text-green-400' : 
                      'text-slate-300'
                    }`}>
                      {log.msg}
                    </span>
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>
              {logs.length === 0 && (
                <div className="text-slate-700 italic mt-4 text-center">
                  Waiting for simulation events...
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Recent Control Logs (Visual only) */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          Recent Control Actions
        </h3>
        <div className="space-y-3">
          {[
            { action: 'System Resumed', user: 'Admin User', time: '2 days ago', status: 'success' },
            { action: 'Paused for Maintenance', user: 'Sarah Jenkins', time: '2 days ago', status: 'warning' },
            { action: 'Emergency Stop Triggered', user: 'System Watchdog', time: '5 days ago', status: 'failure' }
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-2 px-3 bg-white border border-slate-100 rounded-lg">
              <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${
                   log.status === 'success' ? 'bg-green-500' : 
                   log.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                 }`} />
                 <span className="font-medium text-slate-700">{log.action}</span>
              </div>
              <div className="text-slate-500 text-xs">
                {log.user} • {log.time}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default EngineControl;
