export const layout = {
  // Predictable layering scale. Values come from CSS variables in `src/app/globals.css`.
  zIndex: {
    base: 'var(--z-base)',
    dropdown: 'var(--z-dropdown)',
    sticky: 'var(--z-sticky)',
    fixed: 'var(--z-fixed)',
    'modal-backdrop': 'var(--z-modal-backdrop)',
    modal: 'var(--z-modal)',
    popover: 'var(--z-popover)',
    tooltip: 'var(--z-tooltip)',
  },

  // Semantic sizing helpers to reduce arbitrary viewport constraints.
  maxWidth: {
    'viewport-98': 'var(--size-viewport-98w)',
  },
  maxHeight: {
    modal: 'var(--size-modal-max-h)',
    'modal-lg': 'var(--size-modal-max-h-lg)',
    'modal-sm': 'var(--size-modal-max-h-sm)',
    'viewport-98': 'var(--size-viewport-98h)',
  },

  // Semantic min-heights for viewport-aware sections.
  minHeight: {
    'viewport-minus-header': 'var(--size-viewport-minus-header)',
    hero: 'var(--size-hero-min-h)',
  },
} as const;

export type LayoutTokens = typeof layout;
