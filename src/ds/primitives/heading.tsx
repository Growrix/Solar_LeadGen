import * as React from 'react';

import { cn } from '@/lib/utils';

type HeadingLevel = 1 | 2 | 3 | 4;

type HeadingProps<T extends React.ElementType> = {
  as?: T;
  level?: HeadingLevel;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

const levelClasses: Record<HeadingLevel, string> = {
  1: 'text-heading-1',
  2: 'text-heading-2',
  3: 'text-heading-3',
  4: 'text-heading-4',
};

export function Heading<T extends React.ElementType = 'h2'>(props: HeadingProps<T>) {
  const { as, level = 2, className, children, ...rest } = props;
  const Component = (as ?? (level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4')) as React.ElementType;

  return (
    <Component className={cn(levelClasses[level], 'text-foreground', className)} {...rest}>
      {children}
    </Component>
  );
}
