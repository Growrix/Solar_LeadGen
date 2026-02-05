"use client";

import * as React from "react";

import { Button } from "../primitives/Button";

export type ScrollToTopButtonProps = {
  label?: string;
};

export function ScrollToTopButton({ label = "Scroll to top" }: ScrollToTopButtonProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="ui-scrolltop">
      <Button
        variant="fab"
        aria-label={label}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        ↑
      </Button>
    </div>
  );
}
