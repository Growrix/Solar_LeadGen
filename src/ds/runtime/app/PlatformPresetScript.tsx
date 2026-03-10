import * as React from "react";

export type PlatformPresetScriptProps = {
  /** CSS media query used to decide when mobile presets apply. */
  mediaQuery?: string;
  /** When matched, sets html[data-platform]. */
  platformAttr?: string;
  /** When matched, sets html[data-density]. */
  densityAttr?: "compact" | "default";
  /** Optional visual mode token for app-like styling (e.g. sleek). */
  visualAttr?: "glass" | "neumorph" | "sleek";
};

/**
 * Injects a tiny script that toggles platform presets on <html>.
 * This keeps desktop classic and enables app-like mobile styling via tokens.
 */
export function PlatformPresetScript({
  mediaQuery = "(max-width: 48rem)",
  platformAttr = "mobile",
  densityAttr = "compact",
  visualAttr = "sleek",
}: PlatformPresetScriptProps) {
  const script = `(() => {
  const root = document.documentElement;
  const mq = window.matchMedia(${JSON.stringify(mediaQuery)});

  const apply = () => {
    if (mq.matches) {
      root.setAttribute("data-platform", ${JSON.stringify(platformAttr)});
      root.setAttribute("data-density", ${JSON.stringify(densityAttr)});
      ${visualAttr ? `root.setAttribute("data-visual", ${JSON.stringify(visualAttr)});` : ""}
      return;
    }
    root.removeAttribute("data-platform");
    root.removeAttribute("data-density");
    root.removeAttribute("data-visual");
  };

  apply();

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", apply);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(apply);
  }
})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
