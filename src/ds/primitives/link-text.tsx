import * as React from 'react';

import Link, { type LinkProps } from 'next/link';

import { cn } from '@/lib/utils';

type LinkTextVariant = 'body' | 'body-large' | 'body-small' | 'caption' | 'label';

type LinkTextTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'secondary'
  | 'brand'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info';

type LinkTextProps = LinkProps & {
  variant?: LinkTextVariant;
  tone?: LinkTextTone;
  underline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const variantClasses: Record<LinkTextVariant, string> = {
  body: 'text-body',
  'body-large': 'text-body-large',
  'body-small': 'text-body-small',
  caption: 'text-caption',
  label: 'text-label',
};

const toneClasses: Record<LinkTextTone, string> = {
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

export function LinkText({
  variant = 'body',
  tone = 'default',
  underline = false,
  className,
  children,
  ...rest
}: LinkTextProps) {
  return (
    <Link
      className={cn(
        variantClasses[variant],
        toneClasses[tone],
        underline ? 'underline underline-offset-4' : 'hover:underline underline-offset-4',
        className
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
