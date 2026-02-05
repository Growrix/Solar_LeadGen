import * as React from 'react';

import { cn } from '@/lib/utils';

type GlassSurfaceAs =
  | 'div'
  | 'header'
  | 'section'
  | 'article'
  | 'nav'
  | 'main'
  | 'footer'
  | 'aside';

export type GlassSurfaceProps = React.HTMLAttributes<HTMLElement> & {
  as?: GlassSurfaceAs;
  enabled?: boolean;
};

export function GlassSurface({
  as: Component = 'div',
  className,
  enabled = true,
  ...props
}: GlassSurfaceProps) {
  return (
    <Component className={cn(enabled && 'surface-glass', className)} {...props} />
  );
}
