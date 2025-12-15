# Accessibility Guidelines

## What It Is
Standards ensuring all UI components meet WCAG 2.2 AA accessibility requirements across themes and modes.

## Why It Matters
Guarantees inclusivity, avoids legal/compliance risk, and improves usability for assistive technologies.

## Core Principles
- Perceivable: Adequate contrast, alt text, captions.
- Operable: Keyboard navigation, focus visibility, non-trapped focus cycles.
- Understandable: Clear labels, consistent interactions, error messaging.
- Robust: Compatible with modern assistive tech (screen readers, high contrast modes).

## Contrast Requirements
| Element | Ratio Target |
|---------|--------------|
| Standard text | ≥ 4.5:1 |
| Large text (≥18pt) | ≥ 3:1 |
| UI components / icons | ≥ 3:1 |

## Implementation Practices
- Use semantic tokens ensuring contrast across modes.
- Provide focus ring using visible outline token.
- Associate labels via `label htmlFor` and `aria-describedby` for help text.
- Use `role="alert"` for critical messages.
```
<button aria-label="Open settings" class="focus-visible:ring">…</button>
```

## Testing Checklist
- Keyboard tab order logical.
- No duplicate IDs.
- Landmarks (header, main, nav) present.
- Form errors announced to assistive tech.

## Pitfalls / Anti-Patterns
- Relying solely on color for state indication.
- Removing outline styles globally.
- Placeholder text as sole label.

## AI Guidance
Ask: "Audit component X for accessibility; list contrast ratio risks and provide token-based improvement diff." Include current HTML snippet.
