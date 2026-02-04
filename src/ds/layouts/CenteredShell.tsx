import * as React from 'react';

import { cn } from '@/lib/utils';

type CenteredShellProps = {
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
};

export function CenteredShell({ className, contentClassName, children }: CenteredShellProps) {
  return (
    <div className={cn('min-h-screen bg-background flex items-center justify-center px-4 py-12', className)}>
      <div className={cn('w-full max-w-md', contentClassName)}>{children}</div>
    </div>
  );
}
