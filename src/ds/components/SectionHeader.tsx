import * as React from 'react';

import { cn } from '@/lib/utils';

export type SectionHeaderProps = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end justify-between gap-6',
        className
      )}
    >
      <div className={cn(contentClassName)}>
        {eyebrow ? (
          <div className="flex items-center gap-2 mb-3 text-accent">{eyebrow}</div>
        ) : null}
        <h2 className={cn('text-foreground-secondary mb-3 text-heading-1', titleClassName)}>
          {title}
        </h2>
        {description ? (
          <p className={cn('text-foreground max-w-2xl text-body-large', descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className={cn(actionsClassName)}>{actions}</div> : null}
    </div>
  );
}
