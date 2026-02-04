import * as React from 'react';

import { cn } from '@/lib/utils';

type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type StackProps = {
  as?: React.ElementType;
  direction?: 'vertical' | 'horizontal';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  gap?: StackGap;
  wrap?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const gapClasses: Record<StackGap, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const;

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const;

export function Stack({
  as: Component = 'div',
  direction = 'vertical',
  align = 'stretch',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className,
  children,
}: StackProps) {
  return (
    <Component
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        alignClasses[align],
        justifyClasses[justify],
        gapClasses[gap],
        wrap ? 'flex-wrap' : null,
        className
      )}
    >
      {children}
    </Component>
  );
}
