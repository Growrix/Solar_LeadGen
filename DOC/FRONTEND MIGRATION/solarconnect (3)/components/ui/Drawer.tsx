import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { ARIA_LABELS } from '../../constants/labels';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right';
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  position = 'right', 
  children 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const positions = {
    left: "left-0 -translate-x-full",
    right: "right-0 translate-x-full",
  };

  const openTransform = "translate-x-0";

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `} 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div 
        className={`
          fixed top-0 bottom-0 z-50 w-80 sm:w-96 bg-slate-900 border-x border-slate-700 shadow-2xl transition-transform duration-300 ease-in-out
          ${isOpen ? openTransform : positions[position]}
          ${position === 'left' ? 'left-0' : 'right-0'}
        `}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
           <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
             {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
             <button 
               onClick={onClose}
               className="text-slate-400 hover:text-white transition-colors"
               aria-label={ARIA_LABELS.close}
             >
               <X className="w-5 h-5" />
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 text-slate-300">
             {children}
           </div>
        </div>
      </div>
    </>
  );
};