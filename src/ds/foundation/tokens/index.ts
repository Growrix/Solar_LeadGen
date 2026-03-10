// Tokens are implemented as CSS variables in src/ds/styles/ds.tokens.css.
// This module exists as a stable import surface for future token metadata.

export type DsTokenLayer = "palette" | "semantic" | "layout" | "motion";

export * from "./vars";
