
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCcw, 
  Save, 
  Clock,
  ArrowRight,
  Target,
  Search,
  CheckSquare,
  Globe
} from 'lucide-react';
import { NewsItem, NewsStatus } from './types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: NewsItem | null;
  onApprove?: () => void;
  onPublish?: () => void;
  onRewrite?: () => void;
  onReject?: () => void;
  onSave?: () => void;
}

type TabType = 'research' | 'article' | 'seo' | 'history';

const ReviewModal: React.FC<ReviewModalProps> = ({ 
  isOpen, 
  onClose, 
  item, 
  onApprove, 
  onPublish,
  onRewrite, 
  onReject, 
  onSave 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('article');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const isPublished = item.status === NewsStatus.PUBLISHED;

  const TabButton: React.FC<{ id: TabType; label: string; icon: React.ReactNode }> = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
        activeTab === id 
          ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' 
          : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-6xl h-full max-h-[92vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Zap size={28} fill="currentColor" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 uppercase tracking-widest border border-indigo-200">
                  {item.status}
                </span>
                <span className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  item.relevanceScore > 90 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                } uppercase tracking-widest`}>
                  <CheckCircle2 size={12} />
                  {item.relevanceScore}% AI Confidence
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{item.title}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="flex px-4 border-b border-slate-100 bg-white">
          <TabButton id="research" label="Research Summary" icon={<BookOpen size={18} />} />
          <TabButton id="article" label="Generated Article" icon={<FileText size={18} />} />
          <TabButton id="seo" label="SEO & Compliance" icon={<ShieldCheck size={18} />} />
          <TabButton id="history" label="Version History" icon={<History size={18} />} />
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          {isLoading ? (
            <div className="p-12 space-y-8 animate-pulse">
              <div className="h-8 bg-slate-100 rounded w-1/3" />
              <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
              <div className="h-48 bg-slate-100 rounded-2xl w-full" />
            </div>
          ) : (
            <div className="p-10 max-w-4xl mx-auto">
              {activeTab === 'article' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headline</label>
                      <input 
                        type="text" 
                        defaultValue={item.title}
                        className="w-full text-3xl font-black text-slate-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Body</label>
                      <textarea 
                        className="w-full h-[500px] text-slate-700 leading-[1.8] bg-transparent border-none p-0 focus:ring-0 resize-none font-serif text-xl"
                        defaultValue={`${item.summary}\n\nSilicon-based photonics is undergoing a massive transformation as hyperscale data centers reach the limits of electrical copper interconnects. By integrating laser arrays directly onto CMOS wafers, throughput can scale to 800G and beyond without the thermal bottleneck traditional systems face.\n\n"We are seeing a convergence of optical physics and high-volume semiconductor manufacturing," says Lead Researcher Dr. Elena Vance. This development is expected to slash latency for large-scale AI training clusters by as much as 35% within the next 24 months.`}
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-8 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Clock size={14} /> 4 min read
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <FileText size={14} /> 542 words
                      </div>
                      <div className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        Curated by {item.aiModel}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'research' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Target size={20} className="text-indigo-600" />
                        Verified Sources
                      </h3>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cross-verified (4/4)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Nature Electronics', 'Reuters Tech', 'IEEE Spectrum', 'SemiEngineering'].map((source, i) => (
                        <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all group flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                              <ExternalLink size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{source}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Reference_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                            </div>
                          </div>
                          <CheckCircle2 size={20} className="text-emerald-500" />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-black text-slate-900">Research Extraction Log</h3>
                    <div className="space-y-4">
                      {[
                        'Identified core breakthrough in Silicon-Photonics integration.',
                        'Verified energy efficiency claims against historical data.',
                        'Detected related patent filing from Global Innovation Hub.',
                        'Fact-checked Dr. Elena Vance’s professional affiliation.'
                      ].map((fact, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i+1}</div>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">{fact}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <Search size={18} className="text-indigo-600" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Search Metadata</span>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Keyword</label>
                          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-indigo-600">Silicon Photonics AI</div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta Description</label>
                          <textarea 
                            className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-0 resize-none"
                            defaultValue="Explore how new silicon-based laser arrays are achieving 400Gbps transmission speeds, potentially slashing cloud latency and energy consumption by 40%."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <Target size={18} className="text-emerald-600" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Compliance & Quality</span>
                      </div>
                      <div className="space-y-4">
                        {[
                          { label: 'Fact Consistency', status: 'Passed' },
                          { label: 'Plagiarism Scan', status: 'Passed (0%)' },
                          { label: 'Tone: Journalistic', status: 'Verified' },
                          { label: 'Hallucination Check', status: 'Passed' }
                        ].map((c, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                            <span className="text-xs font-bold text-slate-600">{c.label}</span>
                            <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                              <CheckSquare size={12} />
                              {c.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm animate-in fade-in duration-500">
                  <div className="space-y-8">
                    {[
                      { time: '12m ago', action: 'Draft Finalized', user: 'Gemini 3 Pro', icon: <CheckCircle2 size={16} /> },
                      { time: '14m ago', action: 'Fact Verification Success', user: 'System Agent', icon: <ShieldCheck size={16} /> },
                      { time: '18m ago', action: 'Research Extraction Complete', user: 'System Agent', icon: <BookOpen size={16} /> },
                      { time: '22m ago', action: 'Source Ingestion', user: 'TechCrunch RSS', icon: <RefreshCcw size={16} /> }
                    ].map((log, i) => (
                      <div key={i} className="flex gap-6 relative group">
                        {i !== 3 && <div className="absolute left-6 top-10 w-px h-12 bg-slate-100 group-hover:bg-indigo-100 transition-colors" />}
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all z-10">
                          {log.icon}
                        </div>
                        <div className="pt-1.5">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-black text-slate-900">{log.action}</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.time}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Triggered by: {log.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="px-8 py-6 border-t border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onReject}
              className="px-6 py-3 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-2xl transition-all uppercase tracking-widest border border-transparent hover:border-rose-100"
            >
              Reject
            </button>
            <button 
              onClick={onRewrite}
              className="flex items-center gap-2 px-6 py-3 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all uppercase tracking-widest"
            >
              <RefreshCcw size={16} />
              Request Rewrite
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setIsSaving(true);
                if (onSave) onSave();
                setTimeout(() => setIsSaving(false), 1000);
              }}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 text-xs font-black text-slate-900 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button 
              onClick={onPublish}
              disabled={isPublished}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-black rounded-2xl transition-all uppercase tracking-widest ${
                isPublished 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                  : 'text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 active:scale-95'
              }`}
            >
              <Globe size={18} />
              {isPublished ? 'Already Published' : 'Publish Now'}
            </button>
            <button 
              onClick={onApprove}
              className="flex items-center gap-2 px-10 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] uppercase tracking-[0.1em]"
            >
              Approve for Scheduling
              <ArrowRight size={18} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReviewModal;
