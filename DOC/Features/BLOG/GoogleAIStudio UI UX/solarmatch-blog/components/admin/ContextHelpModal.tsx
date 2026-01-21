
import React from 'react';
import { X, HelpCircle, Info, BookOpen } from 'lucide-react';

interface HelpContent {
  title: string;
  description: string;
  features: string[];
  tips?: string[];
}

interface ContextHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  content?: HelpContent;
}

const ContextHelpModal: React.FC<ContextHelpModalProps> = ({ isOpen, onClose, content }) => {
  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{content.title}</h3>
              <p className="text-sm text-slate-500">Module Guide</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-sm text-slate-600 leading-relaxed">
            <p>{content.description}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" /> Key Features & Controls
            </h4>
            <ul className="space-y-3">
              {content.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {content.tips && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" /> Pro Tip
              </h4>
              <ul className="space-y-1">
                 {content.tips.map((tip, i) => (
                   <li key={i} className="text-sm text-amber-900">{tip}</li>
                 ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors text-sm"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextHelpModal;
