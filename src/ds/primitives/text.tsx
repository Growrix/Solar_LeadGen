import * as React from 'react';

import { cn } from '@/lib/utils';

type TextVariant = 'body' | 'body-large' | 'body-small' | 'caption' | 'label';

type TextTone = 'default' | 'muted' | 'subtle' | 'secondary' | 'brand' | 'danger' | 'success' | 'warning' | 'info';

type TextProps<T extends React.ElementType> = {
  as?: T;
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

const variantClasses: Record<TextVariant, string> = {
  body: 'text-body',
  'body-large': 'text-body-large',
  'body-small': 'text-body-small',
  caption: 'text-caption',
  label: 'text-label',
};

const toneClasses: Record<TextTone, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  subtle: 'text-foreground-tertiary',
  secondary: 'text-foreground-secondary',
  brand: 'text-accent',
  danger: 'text-error',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
};

export function Text<T extends React.ElementType = 'p'>(props: TextProps<T>) {
  const { as, variant = 'body', tone = 'default', className, children, ...rest } = props;
  const Component = (as ?? 'p') as React.ElementType;

  return (
    <Component className={cn(variantClasses[variant], toneClasses[tone], className)} {...rest}>
      {children}
    </Component>
  );
}
