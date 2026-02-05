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
      className={`px-5 py-3.5 rounded-lg bg-background/40 border border-border/10 text-foreground-secondary placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition disabled:opacity-50 disabled:cursor-not-allowed min-h-textarea resize-y${fullWidth ? ' w-full' : ''} 
        ${className}
      `}
      {...props}
    />
  );
};