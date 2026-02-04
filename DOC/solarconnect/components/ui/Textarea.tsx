import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  className = '', 
  fullWidth = false,
  ...props 
}) => {
  return (
    <textarea
      className={`
        px-5 py-3.5 rounded-lg 
        bg-slate-900/40 border border-white/10 
        text-white placeholder-slate-300 
        focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent 
        transition-all disabled:opacity-50 disabled:cursor-not-allowed
        min-h-[100px] resize-y
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      {...props}
    />
  );
};