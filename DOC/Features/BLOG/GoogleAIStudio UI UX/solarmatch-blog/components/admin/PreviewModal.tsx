
import React, { useState } from 'react';
import { X, Smartphone, Monitor, Tablet } from 'lucide-react';
import BlogPostDetail from '../BlogPostDetail';
import { BlogPost } from '../../types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  postData: BlogPost;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, postData }) => {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  if (!isOpen) return null;

  const widthClass = {
    mobile: 'max-w-[375px]',
    tablet: 'max-w-[768px]',
    desktop: 'max-w-full' 
  }[device];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-100 animate-fade-in">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-sm tracking-wide">Live Preview</h3>
          <div className="bg-slate-800 rounded-lg p-1 flex items-center gap-1">
             <button 
               onClick={() => setDevice('mobile')}
               className={`p-1.5 rounded transition-all ${device === 'mobile' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
               title="Mobile View"
             >
               <Smartphone className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setDevice('tablet')}
               className={`p-1.5 rounded transition-all ${device === 'tablet' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
               title="Tablet View"
             >
               <Tablet className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setDevice('desktop')}
               className={`p-1.5 rounded transition-all ${device === 'desktop' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
               title="Desktop View"
             >
               <Monitor className="w-4 h-4" />
             </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-xs text-slate-400 hidden sm:inline">Preview mode - changes not saved</span>
           <button 
             onClick={onClose}
             className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"
           >
             <X className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-y-auto p-0 sm:p-4 md:p-8 flex justify-center bg-slate-200/50 backdrop-blur-sm">
        <div className={`${widthClass} w-full transition-all duration-300 bg-white shadow-2xl sm:rounded-xl overflow-hidden min-h-full sm:min-h-[auto] border border-slate-300 flex flex-col`}>
           {/* We pass a modified onBack that doesn't navigate but closes modal */}
           <div className="flex-1 overflow-y-auto bg-white relative h-full">
              <BlogPostDetail initialPost={postData} onBack={onClose} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
