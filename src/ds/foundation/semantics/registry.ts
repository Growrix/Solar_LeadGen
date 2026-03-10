export const SEMANTIC_CLASSES = {
  page: "ui-page",
  pageMain: "ui-page-main",
  band: "ui-band",
  bandSurface: "ui-band--surface",
  container: "ui-container",
  containerNarrow: "ui-container--narrow",
  containerWide: "ui-container--wide",
  containerFull: "ui-container--full",

  row: "ui-row",
  rowBetween: "ui-row--between",
  rowCenter: "ui-row--center",

  stack: "ui-stack",
  focusRing: "ui-focus-ring",
} as const;

export type SemanticClassKey = keyof typeof SEMANTIC_CLASSES;
export type SemanticClassName = (typeof SEMANTIC_CLASSES)[SemanticClassKey];

export function semanticClass(key: SemanticClassKey): SemanticClassName {
  return SEMANTIC_CLASSES[key];
}
