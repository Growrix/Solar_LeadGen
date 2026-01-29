
import React from 'react';
import { X, Target, PenTool, Link, Sliders, FileText, Zap, DollarSign, Clock } from 'lucide-react';

interface PromptDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: {
    intent: string;
    topic: string;
    keywords: string[];
    sources: string[];
    constraints: {
      tone: string;
      length: string;
      model: string;
    };
    execution?: {
      duration: string;
      tokens: number;
      cost: string;
    }
  } | null;
}

const PromptDetailsModal: React.FC<PromptDetailsModalProps> = ({ isOpen, onClose, details }) => {
  if (!isOpen || !details) return null;

  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
           {/* Header */}
           <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
             <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               <FileText className="w-5 h-5 text-slate-500" />
               Prompt Transparency Record
             </h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
               <X className="w-5 h-5" />
             </button>
           </div>
           
           {/* Content */}
           <div className="p-6 space-y-8">
              
              {/* Execution Metrics Banner */}
              {details.execution && (
                <div className="grid grid-cols-3 gap-4 bg-slate-900 rounded-lg p-4 text-white">
                   <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Tokens</span>
                      <span className="font-mono font-bold text-lg">{details.execution.tokens}</span>
                   </div>
                   <div className="flex flex-col border-l border-slate-700 pl-4">
                      <span className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Latency</span>
                      <span className="font-mono font-bold text-lg">{details.execution.duration}</span>
                   </div>
                   <div className="flex flex-col border-l border-slate-700 pl-4">
                      <span className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Cost Est.</span>
                      <span className="font-mono font-bold text-lg text-green-400">{details.execution.cost}</span>
                   </div>
                </div>
              )}

              {/* Intent & Topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" /> Intent
                    </h4>
                    <div className="text-slate-900 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 inline-block">
                      {details.intent}
                    </div>
                 </div>
                 <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5" /> Topic Input
                    </h4>
                    <div className="text-slate-900 text-sm leading-relaxed">{details.topic}</div>
                 </div>
              </div>

              {/* Keywords */}
              <div>
                 <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Keywords</h4>
                 <div className="flex flex-wrap gap-2">
                   {details.keywords.map((k, i) => (
                     <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-100">
                       {k}
                     </span>
                   ))}
                 </div>
              </div>

              {/* Sources */}
              <div>
                 <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                   <Link className="w-3.5 h-3.5" /> Context Sources Used
                 </h4>
                 {details.sources.length > 0 ? (
                   <ul className="space-y-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
                     {details.sources.map((source, i) => (
                       <li key={i} className="flex items-center gap-2 text-sm text-slate-600 truncate">
                         <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                         <a href={source} target="_blank" rel="noreferrer" className="hover:text-solar-600 hover:underline truncate">
                           {source}
                         </a>
                       </li>
                     ))}
                   </ul>
                 ) : (
                   <div className="text-sm text-slate-400 italic">No external sources used for this generation.</div>
                 )}
              </div>

              {/* Constraints */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                 <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                   <Sliders className="w-3.5 h-3.5" /> Model Constraints
                 </h4>
                 <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Tone</div>
                      <div className="text-sm font-medium text-slate-700 capitalize">{details.constraints.tone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Target Length</div>
                      <div className="text-sm font-medium text-slate-700">{details.constraints.length} words</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Model Version</div>
                      <div className="text-sm font-medium text-slate-700">{details.constraints.model}</div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Footer */}
           <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
             <button 
               onClick={onClose}
               className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm focus:ring-2 focus:ring-slate-200"
             >
               Close
             </button>
           </div>
        </div>
     </div>
  );
};

export default PromptDetailsModal;
