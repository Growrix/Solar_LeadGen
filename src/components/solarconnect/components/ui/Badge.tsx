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
    solid: "bg-accent text-accent border border-transparent shadow-lg",
    soft: "bg-accent/10 text-accent border border-accent/20",
    glass: "bg-accent/20 text-accent border border-accent/30 backdrop-blur-md",
    outline: "bg-transparent text-accent border border-accent",
    surface: "bg-background text-foreground-secondary border border-border shadow-md",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full uppercase tracking-widest text-caption ${variants[variant]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};