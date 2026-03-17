import React from 'react';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

export const Stack: React.FC<StackProps> = ({ 
  children, 
  direction = 'col', 
  spacing = 'md', 
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className = '', 
  ...props 
}) => {
  const directions = {
    row: "flex-row",
    col: "flex-col",
  };

  const spaces = {
    none: "gap-0",
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  const alignments = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  };

  const justifications = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div 
      className={`
        flex 
        ${directions[direction]} 
        ${spaces[spacing]} 
        ${alignments[align]} 
        ${justifications[justify]} 
        ${wrap ? 'flex-wrap' : 'flex-nowrap'}
        ${className}
      `} 
      {...props}
    >
      {children}
    </div>
  );
};