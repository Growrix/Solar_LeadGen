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
      <div className={`inline-block h-full w-px bg-surface mx-2 ${className}`} />
    );
  }

  return (
    <div className={`relative flex items-center w-full py-2 ${className}`}>
      <div className="flex-grow border-t border-border"></div>
      {text && (
        <span className="flex-shrink-0 mx-4 text-foreground uppercase tracking-wider text-caption">
          {text}
        </span>
      )}
      <div className="flex-grow border-t border-border"></div>
    </div>
  );
};