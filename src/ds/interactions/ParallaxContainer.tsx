"use client";

import * as React from "react";

import { a11y } from "../foundation";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ParallaxContainerProps = {
  children: React.ReactNode;
  strength?: "sm" | "md" | "lg";
  className?: string;
};

export function ParallaxContainer({ children, strength = "md", className }: ParallaxContainerProps) {
  const reducedMotion = a11y.usePrefersReducedMotion();
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = rect.top + rect.height / 2;
      const progress = (center - vh / 2) / vh;
      el.style.setProperty("--ui-parallax-progress", String(progress));
    };

    const onEvent = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    onEvent();
    window.addEventListener("scroll", onEvent, { passive: true });
    window.addEventListener("resize", onEvent);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onEvent);
      window.removeEventListener("resize", onEvent);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className={cx(
        "ui-parallax",
        strength === "sm" && "ui-parallax--sm",
        strength === "md" && "ui-parallax--md",
        strength === "lg" && "ui-parallax--lg",
        className
      )}
      data-reduced-motion={reducedMotion ? "true" : undefined}
    >
      {children}
    </div>
  );
}
