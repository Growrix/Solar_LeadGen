"use client";

import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type KeyboardAvoidingProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * When true, uses the VisualViewport API (when available) to push content above the on-screen keyboard.
   * On unsupported browsers this becomes a no-op wrapper.
   */
  enabled?: boolean;
};

export function KeyboardAvoiding({ enabled = true, className, ...props }: KeyboardAvoidingProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // Approx keyboard inset: difference between layout viewport and visual viewport.
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      el.style.setProperty("--ui-keyboard-inset", `${inset}px`);
    };

    update();

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [enabled]);

  return <div ref={ref} className={cx("ui-kb-avoid", className)} {...props} />;
}
