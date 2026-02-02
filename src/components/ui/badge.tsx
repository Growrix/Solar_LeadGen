import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-badge border px-2.5 py-0.5 text-caption transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent text-background shadow-neu-outset-sm hover:bg-accent/90',
        secondary: 'border-transparent bg-background-alt text-foreground shadow-neu-inset-sm hover:bg-background-alt/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-neu-outset-sm hover:bg-destructive/90',
        outline: 'border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants };
