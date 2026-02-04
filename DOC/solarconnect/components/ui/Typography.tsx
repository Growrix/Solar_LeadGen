import React from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type TextVariant = 'default' | 'muted' | 'white' | 'brand';
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  children: React.ReactNode;
}

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  size?: TextSize;
  as?: 'p' | 'span' | 'div';
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ 
  level = 2, 
  children, 
  className = '', 
  ...props 
}) => {
  const Tag = `h${level}` as React.ElementType;
  
  const styles = {
    1: "text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white",
    2: "text-3xl md:text-4xl font-bold tracking-tight text-white",
    3: "text-2xl font-bold text-white",
    4: "text-xl font-bold text-white",
    5: "text-lg font-bold text-white",
    6: "text-base font-bold text-white",
  };

  return (
    <Tag className={`${styles[level]} ${className}`} {...props}>
      {children}
    </Tag>
  );
};

export const Text: React.FC<TextProps> = ({ 
  variant = 'default', 
  size = 'base', 
  as = 'p', 
  children, 
  className = '', 
  ...props 
}) => {
  const Tag = as as React.ElementType;
  
  const variants = {
    default: "text-slate-400",
    muted: "text-slate-500",
    white: "text-slate-100",
    brand: "text-brand-400",
  };

  const sizes = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <Tag className={`${variants[variant]} ${sizes[size]} leading-relaxed ${className}`} {...props}>
      {children}
    </Tag>
  );
};