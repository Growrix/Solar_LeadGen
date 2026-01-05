# Semantic Classes Registry
**Auto-Generated from:** `src/app/globals.css`  
**Last Updated:** November 3, 2025  
**Purpose:** Complete reference of all available semantic CSS classes

---

## 📋 QUICK REFERENCE

**Total Classes:** 65+  
**Categories:** Containers, Forms, Cards, Text, Animations, Neumorphic  
**Usage:** Check this before writing inline Tailwind - class may already exist!

---

## 🗂️ CLASS CATEGORIES

### Container Classes

#### `.theme-card`
**Purpose:** Base container for modals, panels, elevated surfaces  
**Properties:** `bg-surface`, `rounded-xl`, `shadow-outset-xl`, `border`  
**When to Use:** Modals, sidebars, dropdown menus, auth cards  
**When NOT to Use:** Inline cards within pages (use `.detail-card`)  
**Example:**
```tsx
<div className="theme-card p-8">
  <h2>Modal Title</h2>
  <p>Modal content...</p>
</div>
```

---

#### `.detail-card`
**Purpose:** Result/data display cards within page content  
**Properties:** `bg-surface`, `rounded-lg`, `shadow-outset-md`, `p-6`, `border`  
**When to Use:** Data cards, result sections, info boxes, stat displays  
**When NOT to Use:** Modal containers (use `.theme-card`)  
**Example:**
```tsx
<div className="detail-card">
  <h3 className="detail-card-header">Cost Breakdown</h3>
  <div className="cost-item">...</div>
</div>
```

---

#### `.neu-card` (Neumorphic Card)
**Purpose:** Base neumorphic card with outset shadow  
**Properties:** Full neumorphic styling with 3D effect  
**Variants:**
- `.neu-card-compact` - Smaller padding
- `.neu-card-elevated` - Stronger shadow
- `.neu-card-pressed` - Inset shadow (pressed state)

---

### Form Element Classes

#### `.form-input`
**Purpose:** Text input fields with embossed style  
**Properties:** `bg-surface`, `border`, `rounded-xl`, `shadow-inset-md`  
**When to Use:** `<input type="text">`, `<input type="number">`, `<textarea>`  
**When NOT to Use:** Dropdowns (use `.form-select`)  
**Example:**
```tsx
<input 
  type="text"
  className="form-input w-full"
  placeholder="Enter value"
/>
```

---

#### `.form-select`
**Purpose:** Dropdown/select elements with arrow icon  
**Properties:** `bg-surface`, `border`, `rounded-xl`, `shadow-inset-md`, dropdown SVG  
**When to Use:** `<select>` elements ONLY  
**When NOT to Use:** Text inputs (shows unwanted arrow)  
**Example:**
```tsx
<select className="form-select w-full">
  <option>Select option</option>
</select>
```

**⚠️ WARNING:** Do NOT use on `<input>` - it will show a dropdown arrow!

---

#### `.neu-input` (Alternative Input Style)
**Purpose:** Alternative neumorphic input style  
**Properties:** Full neumorphic styling  
**Variants:**
- `.neu-input-with-icon` - Input with icon wrapper
- `.neu-input-icon` - Icon positioning

---

#### `.neu-btn` (Neumorphic Button)
**Purpose:** Alternative button styling (if not using `<Button>` component)  
**Properties:** Full neumorphic button styling  
**Variants:**
- `.neu-btn-secondary` - Secondary style
- `.neu-btn-link` - Link style
- `.neu-btn-icon` - Icon button

**Note:** Prefer `<Button>` component from `ui/button.tsx` for consistency

---

### Data Display Classes

#### Cost Item Classes
**Purpose:** Display cost breakdowns and financial data  
**Classes:**
- `.cost-item` - Container for cost row
- `.cost-item-label` - Label text (muted color)
- `.cost-item-value` - Value text (bold, primary color)

**Example:**
```tsx
<div className="cost-item">
  <span className="cost-item-label">System Cost</span>
  <span className="cost-item-value">$15,000</span>
</div>
```

---

#### Metric Card Classes
**Purpose:** Display key metrics and KPIs  
**Classes:**
- `.metric-card` - Container with neumorphic styling
- `.metric-card-label` - Metric name
- `.metric-card-value` - Large metric value
- `.metric-card-description` - Description text

**Example:**
```tsx
<div className="metric-card">
  <div className="metric-card-label">Annual Savings</div>
  <div className="metric-card-value">$2,400</div>
  <div className="metric-card-description">Per year</div>
</div>
```

---

#### Performance Item Classes
**Purpose:** Display system performance metrics  
**Classes:**
- `.performance-item` - Container for performance row
- `.performance-item-label` - Label text
- `.performance-item-value` - Value text

---

#### Spec Card Classes
**Purpose:** Display system specifications  
**Classes:**
- `.spec-card` - Container with neumorphic styling
- `.spec-card-label` - Spec name
- `.spec-card-value` - Spec value

---

#### Summary Box Classes
**Purpose:** Display summary information  
**Classes:**
- `.summary-box` - Container with enhanced styling
- `.summary-box-label` - Label text
- `.summary-box-value` - Value text (large, prominent)

---

#### Rebate Item Classes
**Purpose:** Display rebate information  
**Classes:**
- `.rebate-item` - Container for rebate row
- `.rebate-item-label` - Rebate type label
- `.rebate-item-value` - Rebate amount

---

### Text & Typography Classes

#### `.detail-card-header`
**Purpose:** Header text for detail cards  
**Properties:** Larger font, bold, theme color  
**Usage:** Card titles, section headers

---

#### `.text-balance`
**Purpose:** Balanced text wrapping  
**Properties:** `text-wrap: balance`  
**Usage:** Headlines, short paragraphs for better readability

---

### Layout & Structural Classes

#### `.info-section`
**Purpose:** Information section container  
**Properties:** Standard padding and spacing  
**Variant:** `.info-section-lg` - Larger version

---

#### `.neu-divider`
**Purpose:** Neumorphic divider line  
**Properties:** 3D divider effect with shadow

---

#### `.disclaimer-box`
**Purpose:** Disclaimer/notice container  
**Properties:** Warning/info box styling  
**Classes:**
- `.disclaimer-box` - Container
- `.disclaimer-box-title` - Title text
- `.disclaimer-box-list` - List items

---

### Animation Classes

#### `.animate-fade-in-up`
**Purpose:** Fade in and slide up animation  
**Properties:** Entrance animation from bottom

---

#### `.animate-slide-in-top`
**Purpose:** Slide in from top animation  
**Properties:** Entrance animation from top

---

#### `.animate-float`
**Purpose:** Floating animation  
**Properties:** Continuous up/down motion

---

#### `.animate-pulse`
**Purpose:** Pulse animation  
**Properties:** Scale pulse effect

---

### Background & Effect Classes

#### `.bg-animated-gradient`
**Purpose:** Animated gradient background  
**Properties:** Moving gradient effect

---

#### `.glass-header`
**Purpose:** Glassmorphic header  
**Properties:** Blurred glass effect

---

#### `.glass-sidebar`
**Purpose:** Glassmorphic sidebar  
**Properties:** Blurred glass effect for sidebar

---

#### `.panel-glow`
**Purpose:** Glowing panel effect  
**Properties:** Glow around panel

---

#### `.icon-container`
**Purpose:** Container for icon elements  
**Properties:** Proper sizing and alignment

---

#### `.particle`, `.ray`
**Purpose:** Decorative animation elements  
**Properties:** Background animation effects

---

### Toggle/Switch Classes

**Purpose:** Custom toggle switch styling  
**Classes:**
- `.toggle-switch` - Base switch container
- `.toggle-switch-sm` - Small size
- `.toggle-switch-md` - Medium size
- `.toggle-switch-on` - On state styling
- `.toggle-switch-off` - Off state styling
- `.toggle-knob` - Switch knob
- `.toggle-knob-sm` - Small knob
- `.toggle-knob-md` - Medium knob
- `.toggle-knob-on-sm` - Small knob on state
- `.toggle-knob-off-sm` - Small knob off state
- `.toggle-knob-on-md` - Medium knob on state
- `.toggle-knob-off-md` - Medium knob off state

---

### Slider Classes

#### `.slider-track`
**Purpose:** Custom range slider track  
**Properties:** Track styling for sliders

---

## 🗺️ CLASS HIERARCHY & DECISION TREE

### Container Decision Tree

```
Need a container?
├─ Modal/Dialog → .theme-card (strong shadow, elevated)
├─ Data Card → .detail-card (medium shadow, inline)
├─ Neumorphic Card → .neu-card (3D effect)
└─ Info Section → .info-section (no shadow, simple)
```

### Form Element Decision Tree

```
Form element type?
├─ <input type="text/number/email"> → .form-input (no arrow)
├─ <select> → .form-select (with arrow)
├─ <textarea> → .form-input (embossed)
└─ <button> → Use <Button> component (not class)
```

### Data Display Decision Tree

```
What kind of data?
├─ Financial/Cost → .cost-item + .cost-item-label + .cost-item-value
├─ Metrics/KPIs → .metric-card + .metric-card-label + .metric-card-value
├─ Performance → .performance-item + .performance-item-label + .performance-item-value
├─ Specifications → .spec-card + .spec-card-label + .spec-card-value
└─ Summary → .summary-box + .summary-box-label + .summary-box-value
```

---

## 🔍 QUICK SEARCH GUIDE

**Finding the right class:**

1. **Check this registry first** - Don't recreate what exists!
2. **Use Ctrl+F** to search by keyword:
   - "input" → form-input, neu-input
   - "card" → theme-card, detail-card, metric-card, neu-card
   - "cost" → cost-item, cost-item-label, cost-item-value
   - "button" → neu-btn (but prefer `<Button>` component)
3. **Check category** - Container, Form, Data Display, etc.
4. **Verify in globals.css** - Search for class definition to see full properties

---

## ⚠️ COMMON PITFALLS

### ❌ Don't Use .form-select on Text Inputs
```tsx
// WRONG - Shows dropdown arrow on text input
<input type="text" className="form-select" />

// CORRECT
<input type="text" className="form-input" />
```

### ❌ Don't Mix Container Classes
```tsx
// WRONG - Conflicting styles
<div className="theme-card detail-card">

// CORRECT - Pick one based on use case
<div className="theme-card">  {/* For modals */}
<div className="detail-card">  {/* For inline cards */}
```

### ❌ Don't Forget Companion Classes
```tsx
// INCOMPLETE - Missing label/value classes
<div className="cost-item">
  <span>System Cost</span>  {/* No class! */}
  <span>$15,000</span>  {/* No class! */}
</div>

// COMPLETE - Full pattern
<div className="cost-item">
  <span className="cost-item-label">System Cost</span>
  <span className="cost-item-value">$15,000</span>
</div>
```

---

## 📚 MIGRATION CHECKLIST

Before writing inline Tailwind:
- [ ] Searched this registry for existing class
- [ ] Checked category (Container, Form, Data Display)
- [ ] Verified class exists in globals.css
- [ ] Checked for companion classes (label, value, header)
- [ ] Reviewed decision tree for correct class
- [ ] Tested in all 3 themes (Dark, Light, Purple)

---

## 🔄 AUTO-REGENERATE THIS FILE

**Command to update this registry:**
```powershell
Select-String -Path "src\app\globals.css" -Pattern "^\s*\.[a-z-]+\s*{" | ForEach-Object { $_.Line.Trim() } | Sort-Object -Unique > "DOC\semantic-classes-list.txt"
```

**Note:** This registry file is manually curated with descriptions. Run command above to get raw class list.

---

**Last Updated:** November 3, 2025  
**Next Update:** After adding new semantic classes to globals.css  
**Maintainer:** Update this file when adding new classes to design system
