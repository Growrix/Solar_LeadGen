import * as React from 'react';

import { cn } from '@/lib/utils';

type PublicShellProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export function PublicShell({ header, footer, className, children }: PublicShellProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {header}
      {children}
      {footer}
    </div>
  );
}
