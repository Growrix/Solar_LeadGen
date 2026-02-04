import React from 'react';

type BadgeVariant = 'solid' | 'soft' | 'glass' | 'outline' | 'surface';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'solid', 
  children, 
  className = '',
  icon
}) => {
  const variants = {
    solid: "bg-brand-500 text-brand-950 border border-transparent shadow-lg",
    soft: "bg-brand-500/10 text-brand-400 border border-brand-500/20",
    glass: "bg-brand-500/20 text-brand-300 border border-brand-500/30 backdrop-blur-md",
    outline: "bg-transparent text-brand-500 border border-brand-500",
    surface: "bg-slate-900 text-white border border-slate-700 shadow-md",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${variants[variant]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};