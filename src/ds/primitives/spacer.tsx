import * as React from 'react';

import { cn } from '@/lib/utils';

type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type SpacerAxis = 'vertical' | 'horizontal';

type SpacerProps = {
  axis?: SpacerAxis;
  size?: SpacerSize;
  className?: string;
};

const verticalSizeClasses: Record<SpacerSize, string> = {
  xs: 'h-2',
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-6',
  xl: 'h-8',
};

const horizontalSizeClasses: Record<SpacerSize, string> = {
  xs: 'w-2',
  sm: 'w-3',
  md: 'w-4',
  lg: 'w-6',
  xl: 'w-8',
};

export function Spacer({ axis = 'vertical', size = 'md', className }: SpacerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'shrink-0',
        axis === 'vertical' ? verticalSizeClasses[size] : horizontalSizeClasses[size],
        className
      )}
    />
  );
}
