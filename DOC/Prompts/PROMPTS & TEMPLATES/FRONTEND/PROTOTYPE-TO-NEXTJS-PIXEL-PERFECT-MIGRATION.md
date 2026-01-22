# Prototype-to-Next.js Migration Policy (Pixel-Perfect Mirroring)

## Purpose
This file is the single, authoritative instruction for all prototype-to-Next.js migrations. It defines exactly how to mirror a Vite (or other) prototype into the Next.js structure, with a focus on pixel-perfect, structure-preserving migration. Use this file for all planning and execution—no other playbook is required.

---


## How to Use This File

**For any migration from a prototype (e.g., Vite, Google AI Studio) to Next.js:**

- Before starting, audit the current Next.js codebase structure and check for any existing files, components, or partial implementations that can be reused. Always prefer reusing or extending existing files over creating new ones to avoid duplication.
- The goal is to achieve a pixel-perfect, 1:1 mirroring of the prototype’s UI, structure, triggers, flows, and modals in the Next.js codebase.
- The prototype is the sole source of truth for visuals, layout, and behavior.
- Do NOT adapt, refactor, or convert styles to semantic tokens, theming, or design system classes unless explicitly requested after mirroring is complete.
- All triggers, flows, modals, and UI details must be preserved exactly as in the prototype. No changes, improvements, or design-system adaptation are required unless specifically requested.
- Hardcoded styles, custom classes, and non-semantic values are allowed and expected for this migration type.
- The only requirement is that the Next.js structure and UI match the prototype pixel-for-pixel and function-for-function.

---

## Steps for Pixel-Perfect Mirroring

1. Mirror the prototype’s UI, layout, triggers, flows, and styles exactly in the Next.js structure.
2. Do not adapt or refactor to semantic/theming tokens during this phase.
3. Only after pixel-perfect mirroring is complete, optionally proceed to semantic adaptation if explicitly requested.

---

## Example

- If a prototype card uses a custom shadow, spacing, or color, copy those styles exactly into the Next.js component, even if they are hardcoded or not present in the semantic system.
- If a prototype uses a unique font, size, layout, or modal flow, mirror it exactly, regardless of semantic tokens or design system conventions.
- If a button, modal, or trigger works a certain way in the prototype, it must work identically in the Next.js implementation.

---

## Compliance

- Compliance means the Next.js UI and structure match the prototype exactly, with no adaptation to semantic/theming/design system unless explicitly requested.
- All triggers, flows, and modals must be preserved and function as in the prototype.

---

## Optional: Semantic System Adaptation (Secondary Path)

If, after pixel-perfect mirroring, you wish to adapt the codebase to the semantic system and design tokens, follow these steps (optional, not required for initial migration):

1. Identify missing component or typography classes during migration.
2. Propose new component or typography classes with rationale and usage examples.
3. Add new classes to the design system documentation and update globals.css if needed (never add new color tokens).
4. Refactor migrated components to use only semantic tokens/classes and follow layout conventions.
5. Report completion only when all hardcoded styles are eliminated and layout is compliant.

---

**This file replaces all previous playbooks for prototype-to-Next.js migration. Reference it in all migration plans and documentation.**
