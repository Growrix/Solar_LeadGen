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
    default: "bg-surface border-border",
    glass: "bg-surface/90 backdrop-blur-md border-border",
    highlight: "bg-accent border-accent shadow-xl shadow-brand-glow-sm",
  };

  const baseStyles = "relative rounded-xl border transition duration-300";
  const hoverStyles = hoverEffect ? "hover:border-border hover:shadow-2xl hover:-translate-y-1" : "";

  return (
    <Tag 
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`} 
      {...props}
    >
      {children}
    </Tag>
  );
};