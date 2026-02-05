"use client";

import * as React from "react";

import { Button } from "../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type CarouselProps = {
  children: React.ReactNode;
  className?: string;
};

export function Carousel({ children, className }: CarouselProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  const scrollBy = (delta: number) => {
    ref.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className={cx("ui-carousel", className)}>
      <div className="ui-carousel__controls">
        <Button size="sm" variant="secondary" onClick={() => scrollBy(-320)} aria-label="Previous">
          Prev
        </Button>
        <Button size="sm" variant="secondary" onClick={() => scrollBy(320)} aria-label="Next">
          Next
        </Button>
      </div>
      <div ref={ref} className="ui-carousel__track" role="region" aria-label="Carousel">
        {children}
      </div>
    </div>
  );
}

export type CarouselItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function CarouselItem({ children, className }: CarouselItemProps) {
  return <div className={cx("ui-carousel__item", className)}>{children}</div>;
}
