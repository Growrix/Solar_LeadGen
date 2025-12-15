# Neumorphism Design System - Implementation Guide

## Overview
This guide documents the neumorphism design system implementation for the dark theme (#101010 background).

## Core Components Created

### 1. Button Component (`/components/ui/button.tsx`)
Updated with neumorphic styling:

**Variants:**
- `default`: White background with black text, rounded-full, active scale effect
- `secondary`: Dark background with neumorphic outset shadow that inverts on hover
- `outline`: Transparent with border, neumorphic shadow effects
- `ghost`: Minimal hover effects
- `link`: Underline text style

**Sizes:**
- `default`: h-12 px-8 py-4
- `sm`: h-9 px-4
- `lg`: h-14 px-10
- `icon`: 12x12 circular with neumorphic shadows

**Usage:**
```tsx
import { Button } from "@/components/ui/button";

// Primary button (white bg, black text)
<Button variant="default">Sign Up</Button>

// Secondary button (neumorphic outset)
<Button variant="secondary">Start a Project</Button>

// Icon button
<Button variant="default" size="icon">
  <Icon />
</Button>
```

### 2. MenuToggleButton Component (`/components/ui/menu-toggle-button.tsx`)
Circular neumorphic button for mobile navigation.

**Features:**
- Animated hamburger/close icon
- Neumorphic shadow effects (outset → inset on active)
- Scale animation on click
- Accessible ARIA attributes

**Usage:**
```tsx
import { MenuToggleButton } from "@/components/ui/menu-toggle-button";

const [isOpen, setIsOpen] = useState(false);

<MenuToggleButton 
  isOpen={isOpen} 
  onClick={() => setIsOpen(!isOpen)} 
/>
```

### 3. NeumorphicCard Component (`/components/ui/neumorphic-card.tsx`)
Reusable card with neumorphic styling.

**Variants:**
- `flat`: Standard outset shadow (default)
- `pressed`: Inset shadow for pressed/concave effect
- `floating`: Enhanced elevation with larger shadows

**Sub-components:**
- `NeumorphicIconContainer`: Circular container with inset shadow for icons

**Usage:**
```tsx
import { NeumorphicCard, NeumorphicIconContainer } from "@/components/ui/neumorphic-card";

<NeumorphicCard variant="flat" hover>
  <NeumorphicIconContainer size="md">
    <Icon className="w-8 h-8 text-white" />
  </NeumorphicIconContainer>
  <h3 className="text-xl font-bold text-white mt-4">Title</h3>
  <p className="text-white/80 mt-2">Description</p>
</NeumorphicCard>
```

### 4. NeumorphicInput Component (`/components/ui/neumorphic-input.tsx`)
Form input with inset neumorphic shadow.

**Features:**
- Inset shadow for concave appearance
- Enhanced shadow on focus
- White text with semi-transparent placeholder
- Full accessibility support

**Usage:**
```tsx
import { NeumorphicInput } from "@/components/ui/neumorphic-input";

<NeumorphicInput 
  type="email" 
  placeholder="Enter your email" 
/>
```

## Design Tokens

### CSS Variables (in `globals.css`)
```css
.dark {
  /* Neumorphism shadows */
  --neu-shadow-light: rgba(40, 40, 40, 0.5);
  --neu-shadow-dark: rgba(0, 0, 0, 0.9);
  --neu-shadow-inset-light: rgba(40, 40, 40, 0.3);
  --neu-shadow-inset-dark: rgba(0, 0, 0, 0.7);
  
  /* Presets */
  --shadow-neu-outset: 6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light);
  --shadow-neu-inset: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light);
  --shadow-neu-outset-sm: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
  --shadow-neu-inset-sm: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light);
}
```

### Tailwind Utilities (in `tailwind.config.js`)
```javascript
boxShadow: {
  'neu-outset': 'var(--shadow-neu-outset)',
  'neu-inset': 'var(--shadow-neu-inset)',
  'neu-outset-sm': 'var(--shadow-neu-outset-sm)',
  'neu-inset-sm': 'var(--shadow-neu-inset-sm)',
}
```

## Design Principles

### 1. Shadows Create Depth
- **Outset shadows**: Create raised/extruded appearance (buttons, cards)
- **Inset shadows**: Create pressed/concave appearance (inputs, pressed states)

### 2. Hover States
- Reduce shadow distance on hover for "coming closer" effect
- Add slight translate-y for raised elements

### 3. Active States
- Switch to inset shadows for pressed appearance
- Add scale-[0.98] for subtle press feedback

### 4. Colors
- Background: #101010 (very dark)
- Text: #FFFFFF (pure white)
- Shadows: Dark (#000) and Light (rgba(40,40,40))

## Implementation Checklist

- [x] Updated `globals.css` with neumorphism CSS variables
- [x] Updated `tailwind.config.js` with shadow utilities
- [x] Created `Button` component with neumorphic variants
- [x] Created `MenuToggleButton` for navigation
- [x] Created `NeumorphicCard` for content sections
- [x] Created `NeumorphicIconContainer` for icons
- [x] Created `NeumorphicInput` for forms

## Next Steps

1. **Update existing components** to use new neumorphic components:
   - Replace standard buttons with the new Button component
   - Use NeumorphicCard for service cards, feature cards, etc.
   - Replace form inputs with NeumorphicInput

2. **Create additional neumorphic components** as needed:
   - NeumorphicTextarea
   - NeumorphicSelect
   - NeumorphicCheckbox
   - NeumorphicRadio
   - NeumorphicSwitch

3. **Test across different sections** of the application

4. **Fine-tune shadow values** based on visual feedback

## Reference Design
Based on the Next-Gen Web Agency design from Google AI Studio, adapted for dark theme (#101010 background) instead of light theme (#E0E5EC).
