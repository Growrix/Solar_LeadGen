import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section' | 'li';
  variant?: 'default' | 'glass' | 'highlight';
  hoverEffect?: boolean;
  children: React.ReactNode;
}

const CardRoot: React.FC<CardProps> = ({ 
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

  const baseStyles = "relative rounded-xl border transition-all duration-300 overflow-hidden";
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

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 border-b border-white/5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 border-t border-white/5 bg-black/10 flex items-center ${className}`} {...props}>
    {children}
  </div>
);

// Export standalone Card for backward compatibility or simple use cases
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter
});