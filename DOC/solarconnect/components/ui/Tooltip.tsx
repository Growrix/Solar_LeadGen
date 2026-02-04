import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top' 
}) => {
  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="group relative inline-block">
      {children}
      <div 
        className={`
          absolute z-50 px-2.5 py-1.5 
          bg-slate-800 text-white text-xs font-medium rounded shadow-xl border border-white/10 whitespace-nowrap
          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          transition-all duration-200 transform scale-95 group-hover:scale-100
          ${positions[position]}
        `}
      >
        {content}
      </div>
    </div>
  );
};