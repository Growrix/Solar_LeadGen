import * as React from 'react';

import { cn } from '@/lib/utils';

type DividerTone = 'default' | 'subtle';

type DividerProps<T extends React.ElementType> = {
  as?: T;
  tone?: DividerTone;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className'>;

const toneClasses: Record<DividerTone, string> = {
  default: 'border-border',
  subtle: 'border-border/40',
};

export function Divider<T extends React.ElementType = 'hr'>(props: DividerProps<T>) {
  const { as, tone = 'default', className, ...rest } = props;
  const Component = (as ?? 'hr') as React.ElementType;

  return (
    <Component
      role={Component === 'hr' ? undefined : 'separator'}
      className={cn('w-full border-t', toneClasses[tone], className)}
      {...rest}
    />
  );
}
