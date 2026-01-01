
import React, { useState } from 'react';
import { 
  X, 
  RefreshCcw, 
  Globe, 
  MessageSquare, 
  Play, 
  ExternalLink, 
  CheckCircle2, 
  Cpu,
  FileText,
  AlertCircle
} from 'lucide-react';

interface TestPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToDrafts: (data: { title: string; summary: string }) => void;
  onSimulatePublish: (data: { title: string; summary: string }) => void;
}

type TestState = 'idle' | 'running' | 'completed';

const TestPreviewModal: React.FC<TestPreviewModalProps> = ({ isOpen, onClose, onSaveToDrafts, onSimulatePublish }) => {
  const [testState, setTestState] = useState<TestState>('idle');
  const [sourceType, setSourceType] = useState<'existing' | 'custom'>('existing');
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');

  // Mock generated data to pass back
  const mockResult = {
    title: "Next-Gen Silicon Photonics Breakthrough set to Revolutionize Data Centers",
    summary: "Researchers at the Global Innovation Hub have successfully demonstrated a 400Gbps transmission over standard fiber using a new silicon-based laser array, potentially slashing cloud latency and energy consumption."
  };

  if (!isOpen) return null;

  const handleRunTest = () => {
    setTestState('running');
    // Simulate generation process
    setTimeout(() => {
      setTestState('completed');
    }, 2500);
  };

  const resetTest = () => {
    setTestState('idle');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <RefreshCcw size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Test & Preview</h2>
              <p className="text-xs text-slate-500 font-medium">Verify AI generation parameters before live deployment.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          
          {/* Controls Sidebar */}
          <aside className="w-full lg:w-80 border-r border-slate-100 p-6 space-y-6 bg-slate-50/20">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Input</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                  <button 
                    onClick={() => setSourceType('existing')}
                    className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${sourceType === 'existing' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Saved Source
                  </button>
                  <button 
                    onClick={() => setSourceType('custom')}
                    className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${sourceType === 'custom' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Custom URL
                  </button>
                </div>
              </div>

              {sourceType === 'existing' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Select Existing Source</label>
                  <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20">
                    <option>TechCrunch Main Feed</option>
                    <option>Reuters Business</option>
                    <option>The Verge Science</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5 animate-in slide-in-from-left-2 duration-200">
                  <label className="text-xs font-bold text-slate-700">Target Article URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="url" 
                      placeholder="https://example.com/news/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Prompt Override Topic (Optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="e.g. Focus on technical specs..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button 
                onClick={handleRunTest}
                disabled={testState === 'running'}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {testState === 'running' ? (
                  <>
                    <RefreshCcw className="animate-spin" size={18} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" />
                    Run Test Generation
                  </>
                )}
              </button>
              {testState === 'completed' && (
                <button 
                  onClick={resetTest}
                  className="w-full mt-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Clear Results
                </button>
              )}
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Test Mode</span>
              </div>
              <p className="text-[10px] text-amber-800 leading-relaxed">
                Running a test will consume AI tokens but will not create a persistent record in the drafts database until manually saved.
              </p>
            </div>
          </aside>

          {/* Preview Panel */}
          <main className="flex-1 bg-white p-8 relative min-h-[400px]">
            {testState === 'idle' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                  <Cpu size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Ready to Test</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">Configure your inputs and click "Run Test" to see how the AI handles the content.</p>
                </div>
              </div>
            )}

            {testState === 'running' && (
              <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                  <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
                </div>
                <div className="space-y-4 w-full max-w-sm">
                  <div className="flex justify-between text-xs font-bold text-indigo-600 mb-1">
                    <span className="animate-pulse">Analyzing Source...</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 w-[65%] rounded-full transition-all duration-1000" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-3 bg-slate-50 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-slate-50 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {testState === 'completed' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    <span className="text-sm font-bold text-slate-900">Generation Complete</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Model: Gemini 3 Pro</span>
                    <span>Tokens: 1,420</span>
                    <span>Time: 2.4s</span>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Draft Headline</label>
                    <h4 className="text-2xl font-bold text-slate-900 leading-tight">
                      {mockResult.title}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Article Body Preview</label>
                    <div className="prose prose-sm font-serif text-slate-700 leading-relaxed text-lg">
                      <p>
                        {mockResult.summary}
                      </p>
                      <p>
                        The technology, which integrates optical components directly onto standard CMOS wafers, addresses one of the most significant bottlenecks in modern hyperscale computing. Industry analysts predict that this approach could accelerate the deployment of AI-intensive workloads...
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-700">
                      <ExternalLink size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Research Citations</span>
                    </div>
                    <ul className="text-xs text-indigo-600 font-medium space-y-1 underline">
                      <li>Source: Nature Electronics (Oct 2023)</li>
                      <li>Source: Advanced Computing Consortium Analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
          >
            Close
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              disabled={testState !== 'completed'}
              onClick={() => onSimulatePublish(mockResult)}
              className="px-6 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              Simulate Publish
            </button>
            <button 
              disabled={testState !== 'completed'}
              onClick={() => onSaveToDrafts(mockResult)}
              className="flex items-center gap-2 px-8 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
            >
              <FileText size={18} />
              Save to Drafts
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TestPreviewModal;
