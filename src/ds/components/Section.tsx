import * as React from 'react';

import { cn } from '@/lib/utils';

import { Container } from '../primitives';

type SectionContainerSize = 'content' | 'wide' | 'full';

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  containerSize?: SectionContainerSize;
  containerClassName?: string;
  withContainer?: boolean;
};

export function Section({
  className,
  children,
  containerSize = 'content',
  containerClassName,
  withContainer = true,
  ...props
}: SectionProps) {
  return (
    <section className={cn(className)} {...props}>
      {withContainer ? (
        <Container size={containerSize} className={containerClassName}>
          {children}
        </Container>
      ) : (
        children
      )}
    </section>
  );
}
