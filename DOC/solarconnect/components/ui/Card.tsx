import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section' | 'li';
  variant?: 'default' | 'glass' | 'highlight';
  hoverEffect?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  as = 'div', 
  variant = 'default',
  hoverEffect = false,
  className = '', 
  children, 
  ...props 
}) => {
  const Tag = as as React.ElementType;
  
  const variants = {
    default: "bg-slate-800 border-slate-700",
    glass: "bg-slate-800/90 backdrop-blur-md border-slate-700",
    highlight: "bg-brand-500 border-brand-400 shadow-xl shadow-brand-500/20",
  };

  const baseStyles = "relative rounded-xl border transition-all duration-300";
  const hoverStyles = hoverEffect ? "hover:border-slate-600 hover:shadow-2xl hover:-translate-y-1" : "";

  return (
    <Tag 
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`} 
      {...props}
    >
      {children}
    </Tag>
  );
};