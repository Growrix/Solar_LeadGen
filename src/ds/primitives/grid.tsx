import * as React from 'react';

import { cn } from '@/lib/utils';

type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;

type GridProps<T extends React.ElementType> = {
  as?: T;
  gap?: GridGap;
  cols?: GridCols;
  colsSm?: GridCols;
  colsMd?: GridCols;
  colsLg?: GridCols;
  colsXl?: GridCols;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

const gapClasses: Record<GridGap, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const colsClass = (n: GridCols) => `grid-cols-${n}`;
const colsSmClass = (n: GridCols) => `sm:grid-cols-${n}`;
const colsMdClass = (n: GridCols) => `md:grid-cols-${n}`;
const colsLgClass = (n: GridCols) => `lg:grid-cols-${n}`;
const colsXlClass = (n: GridCols) => `xl:grid-cols-${n}`;

export function Grid<T extends React.ElementType = 'div'>(props: GridProps<T>) {
  const {
    as,
    gap = 'md',
    cols,
    colsSm,
    colsMd,
    colsLg,
    colsXl,
    className,
    children,
    ...rest
  } = props;

  const Component = (as ?? 'div') as React.ElementType;

  return (
    <Component
      className={cn(
        'grid',
        gapClasses[gap],
        cols ? colsClass(cols) : null,
        colsSm ? colsSmClass(colsSm) : null,
        colsMd ? colsMdClass(colsMd) : null,
        colsLg ? colsLgClass(colsLg) : null,
        colsXl ? colsXlClass(colsXl) : null,
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
