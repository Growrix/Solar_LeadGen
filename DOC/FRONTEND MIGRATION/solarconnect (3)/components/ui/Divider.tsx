import React from 'react';

interface DividerProps {
  text?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ 
  text, 
  orientation = 'horizontal', 
  className = '' 
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`inline-block h-full w-px bg-slate-700 mx-2 ${className}`} />
    );
  }

  return (
    <div className={`relative flex items-center w-full py-2 ${className}`}>
      <div className="flex-grow border-t border-slate-700"></div>
      {text && (
        <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
          {text}
        </span>
      )}
      <div className="flex-grow border-t border-slate-700"></div>
    </div>
  );
};