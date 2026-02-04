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
    1: "tracking-tight text-foreground-secondary text-heading-1",
    2: "tracking-tight text-foreground-secondary text-heading-2",
    3: "text-foreground-secondary text-heading-3",
    4: "text-foreground-secondary text-heading-4",
    5: "text-foreground-secondary text-body-large",
    6: "text-foreground-secondary text-body",
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
    default: "text-foreground",
    muted: "text-foreground-muted",
    white: "text-foreground-secondary",
    brand: "text-accent",
  };

  const sizes = {
    xs: "text-caption",
    sm: "text-body-small",
    base: "text-body",
    lg: "text-body-large",
    xl: "text-body-large",
  };

  return (
    <Tag className={`${variants[variant]} ${sizes[size]} leading-relaxed ${className}`} {...props}>
      {children}
    </Tag>
  );
};