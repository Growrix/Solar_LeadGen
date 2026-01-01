
import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Type, 
  MessageSquare, 
  Hash, 
  ListOrdered, 
  ChevronRight,
  Loader2,
  Plus,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { NewsStatus } from './types';

interface ManualDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { title: string; prompt: string; category: string; tags: string[]; outline: string }) => void;
}

const ManualDraftModal: React.FC<ManualDraftModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('Tech');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [outline, setOutline] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    // Simulate AI Generation Process
    setTimeout(() => {
      onGenerate({ title, prompt, category, tags, outline });
      setIsGenerating(false);
      // Reset form
      setTitle('');
      setPrompt('');
      setCategory('Tech');
      setTags([]);
      setOutline('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh]">
        {/* Header */}
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Sparkles size={24} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Generate Targeted Draft</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Custom AI Intelligence Briefing</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Initializing AI Agents</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">Researching historical context and drafting your custom intelligence report...</p>
              </div>
              <div className="w-full max-w-sm h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-indigo-600 w-1/2 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Draft Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Type size={14} /> Working Title (Optional)
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Strategic Impact of MoE Architectures"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>

              {/* Prompt/Topic */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={14} /> Core Topic / AI Prompt
                </label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What should the AI research and write about? Provide context, key players, or specific data points..."
                  className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer"
                  >
                    <option>Tech</option>
                    <option>Finance</option>
                    <option>AI Tech</option>
                    <option>Science</option>
                    <option>Politics</option>
                    <option>Health</option>
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={14} /> Taxonomy Tags
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add tag..."
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                    <button 
                      onClick={handleAddTag}
                      className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border border-indigo-100">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-indigo-900 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional Outline */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ListOrdered size={14} /> Strategic Outline (Optional)
                </label>
                <textarea 
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  placeholder="Provide a structure for the AI to follow (e.g. 1. Introduction, 2. Core Market Analysis...)"
                  className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-8 py-6 border-t border-slate-100 bg-white flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
          >
            Cancel Draft
          </button>
          <button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs shadow-xl shadow-slate-200 transition-all active:scale-[0.98] uppercase tracking-[0.1em] ${(!prompt.trim() || isGenerating) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-indigo-600 hover:shadow-indigo-100 hover:-translate-y-0.5'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                Generate AI Draft
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </footer>
      </div>
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default ManualDraftModal;
