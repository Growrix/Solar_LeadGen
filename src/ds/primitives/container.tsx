import * as React from 'react';

import { cn } from '@/lib/utils';

type ContainerSize = 'content' | 'wide' | 'full';

type ContainerProps<T extends React.ElementType> = {
  as?: T;
  size?: ContainerSize;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'size' | 'className' | 'children'>;

const sizeClasses: Record<ContainerSize, string> = {
  content: 'max-w-7xl',
  wide: 'max-w-screen-xl',
  full: 'max-w-none',
};

export function Container<T extends React.ElementType = 'div'>(
  props: ContainerProps<T>
) {
  const { as, size = 'content', className, children, ...rest } = props;
  const Component = (as ?? 'div') as React.ElementType;

  return (
    <Component
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
