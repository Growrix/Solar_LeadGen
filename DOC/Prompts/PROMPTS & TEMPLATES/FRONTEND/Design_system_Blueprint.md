
# 🧭 UNIVERSAL FRONTEND DEVELOPMENT BLUEPRINT

### (Next.js · Human + AI Safe · Design-System First)

---

## 🎯 PURPOSE (Why this exists)

এই blueprint এর লক্ষ্য:

* Frontend development কে **predictable** করা
* Design, layout, structure — সবকিছু **centrally controllable** রাখা
* Human বা AI যেন:

  * hardcode না করে
  * structure ভাঙে না
  * layout inconsistency না আনে

👉 **Pages কখনো design invent করবে না**
👉 **System design dictate করবে**

---

## 🧠 CORE PHILOSOPHY (Non-Negotiable)

এই নিয়মগুলো **ভাঙা যাবে না**:

1. **Design is centralized**
2. **Pages are consumers, not decision makers**
3. **No hardcoded values (colors, spacing, sizes, layout)**
4. **Everything reusable or forbidden**
5. **Layout is part of the design system**
6. **Consistency > creativity at page level**

---

## 🧱 SYSTEM LAYERS (Mental Model)

```txt
Design Tokens
   ↓
Themes
   ↓
Primitive Components
   ↓
Composed Components
   ↓
Layout / Shell Components
   ↓
Pages & Features
```

👉 **উপরের লেয়ার নিচের লেয়ারকে control করে**
👉 নিচের লেয়ার উপরের লেয়ারকে override করতে পারবে না

---

## 📁 CANONICAL PROJECT STRUCTURE (MANDATORY)

```txt
src/
│
├── ds/                       # Design System (Product)
│   ├── tokens/               # Source of truth (values)
│   ├── themes/               # Light / Dark / Brand
│   ├── primitives/           # Button, Text, Stack, Grid
│   ├── components/           # Card, Table, FormSection
│   ├── layouts/              # Page shells (CRITICAL)
│   ├── styles/               # CSS variables & base styles
│   ├── index.ts              # Single public entry
│
├── app/                      # Next.js routing ONLY
│
├── features/                 # Business logic (optional)
├── hooks/
├── lib/
├── utils/
└── tests/
```

❌ `app/` এর ভিতরে design logic রাখা যাবে না
❌ `pages` / `app` এ layout বানানো যাবে না

---

## 🎨 1️⃣ DESIGN TOKENS (Source of Truth)

### Tokens define:

* colors
* spacing
* typography
* shadows
* z-index
* layout dimensions

### RULES

* Tokens MUST be semantic (primary, surface, danger)
* Tokens MUST NOT be hardcoded in components/pages
* Tokens MUST be platform-agnostic

✅ Correct:

```ts
color.primary
spacing.md
layout.sidebarWidth
```

❌ Forbidden:

```ts
"#2563eb"
"24px"
```

---

## 🌗 2️⃣ THEMES (Runtime Variants)

Themes override tokens, NOT components.

### RULES

* Components NEVER check light/dark
* Theme switch happens via CSS variables
* No conditional styles inside components

```txt
themes/
  default.theme.ts
  dark.theme.ts
```

---

## 🧩 3️⃣ PRIMITIVE COMPONENTS (UI Alphabet)

### What primitives are:

* Button
* Text
* Input
* Stack
* Grid
* Container
* Icon
* Divider
* Spacer

### RULES

* No business logic
* No layout decisions
* No page awareness
* Fully token-driven

👉 **Spacing is done ONLY via Stack / Grid / Container**

---

## 🧱 4️⃣ COMPOSED COMPONENTS (Reusable Blocks)

### Examples:

* Card
* Table
* Modal
* Sidebar
* Navbar
* PageHeader
* FormSection

### RULES

* Built ONLY from primitives
* No raw HTML styling
* No inline styles
* No page-specific assumptions

---

## 🧠 5️⃣ LAYOUT / SHELL COMPONENTS (MOST IMPORTANT)

👉 **This is where 90% projects fail**

### Layouts define:

* page structure
* regions
* spacing
* max-width
* grid rules

### REQUIRED LAYOUTS

```txt
layouts/
  DashboardShell
  PublicShell
  CenteredShell
  DocsShell (optional)
```

### RULES (NON-NEGOTIABLE)

* Every page MUST use a shell
* Pages MUST NOT define padding / max-width
* Layout change happens in ONE place
* Layout owns responsiveness

✅ Correct:

```tsx
<DashboardShell>
  <PageHeader />
  <Content />
</DashboardShell>
```

❌ Forbidden:

```tsx
<div className="px-10 max-w-7xl">
```

---

## 📄 6️⃣ PAGES & FEATURES (Consumers Only)

### Pages can:

* Compose components
* Fetch data
* Handle routing

### Pages CANNOT:

* Define layout
* Define spacing
* Define typography
* Define colors
* Use raw tokens

👉 Page = **assembly layer only**

---

## 📐 7️⃣ RESPONSIVENESS RULES

* Mobile is NOT scaled desktop
* Layout shells define breakpoints
* Pages do not handle breakpoints

### Mobile Rules:

* Touch targets ≥ 44px
* Bottom navigation preferred
* Modals → bottom sheets
* Cards stack vertically

---

## ♿ 8️⃣ ACCESSIBILITY (Always ON)

MANDATORY:

* WCAG AA contrast
* Keyboard navigation
* Focus states
* aria-* attributes
* prefers-reduced-motion

❌ Accessibility is NOT optional
❌ No “we’ll add later”

---

## 🧪 9️⃣ TESTING & ENFORCEMENT

### Required:

* Component tests
* Layout snapshot tests
* Accessibility tests
* Visual regression (optional)

### Enforce via:

* ESLint rules
* Restricted imports
* Code review checklist

---

## 🚫 10️⃣ FORBIDDEN PATTERNS (VERY IMPORTANT)

AI / Human MUST NOT:

* Hardcode spacing, colors, font sizes
* Add layout styles in pages
* Create one-off UI components
* Use inline styles
* Skip design system imports
* Create new patterns without system update

---

## 🔗 11️⃣ IMPORT RULES (STRICT)

```ts
// Allowed
import { Button, Stack, DashboardShell } from "@/ds"

// Forbidden
import Button from "../components/Button"
```

👉 Single public entry only

---

## 🧠 12️⃣ CHANGE MANAGEMENT RULE

| Want to change   | Where            |
| ---------------- | ---------------- |
| Brand color      | tokens           |
| Theme            | themes           |
| Spacing rhythm   | tokens           |
| Dashboard layout | DashboardShell   |
| Button look      | Button primitive |
| Page spacing     | NEVER            |

---

## 🤖 13️⃣ AI INSTRUCTION CONTRACT (IMPORTANT)

When using AI:

* Treat this blueprint as **constitution**
* AI must ask before violating rules
* If unsure → follow system, not creativity
* No silent assumptions

