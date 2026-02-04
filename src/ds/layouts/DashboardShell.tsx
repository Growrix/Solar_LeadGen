import * as React from 'react';

import { cn } from '@/lib/utils';

type DashboardShellProps = {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  mainClassName?: string;
  children?: React.ReactNode;
};

export function DashboardShell({ header, sidebar, footer, className, contentClassName, mainClassName, children }: DashboardShellProps) {
  return (
    <div className={cn('min-h-screen bg-background text-foreground', className)}>
      {sidebar}
      <div className={cn('flex-1 flex flex-col min-h-screen', contentClassName)}>
        {header}
        <main className={cn('flex-1', mainClassName)}>{children}</main>
        {footer}
      </div>
    </div>
  );
}
