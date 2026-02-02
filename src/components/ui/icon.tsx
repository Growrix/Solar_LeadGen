'use client';

import * as React from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';

import { cn } from '@/lib/utils';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<IconSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export interface IconProps extends Omit<LucideProps, 'size'> {
  icon: LucideIcon;
  size?: IconSize | number;
}

export function Icon({
  icon: IconComponent,
  size = 'md',
  className,
  ...props
}: IconProps) {
  const pixelSize = typeof size === 'number' ? size : sizeMap[size];

  return (
    <IconComponent
      aria-hidden={props['aria-label'] ? undefined : true}
      focusable={false}
      size={pixelSize}
      className={cn('shrink-0', className)}
      {...props}
    />
  );
}
