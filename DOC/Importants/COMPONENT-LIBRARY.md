# Solar Match Component Library
**Version:** 1.0.0  
**Last Updated:** November 3, 2025  
**Design System:** Neumorphic Multi-Theme  
**Themes Supported:** Dark, Light, Purple

---

## 📋 TABLE OF CONTENTS

1. [Container Components](#container-components)
2. [Form Components](#form-components)
3. [Data Display Components](#data-display-components)
4. [Button Components](#button-components)
5. [Card Components](#card-components)
6. [Typography Components](#typography-components)
7. [Layout Components](#layout-components)
8. [Animation Components](#animation-components)
9. [Specialized Components](#specialized-components)

---

## 🎯 DESIGN PRINCIPLES

**ALL components follow these rules:**
- ✅ Use semantic classes from `globals.css`
- ✅ Theme-adaptive via CSS variables
- ✅ No hardcoded colors (`bg-blue-500`, `text-red-600`, etc.)
- ✅ No raw typography (`text-xl`, `font-bold`, etc.)
- ✅ Support all 3 themes (Dark, Light, Purple)
- ✅ Neumorphic design language

---

## 1. CONTAINER COMPONENTS

### 1.1 Modal Container

**Semantic Class:** `.theme-card`  
**Purpose:** Elevated modals, dialogs, overlays  
**Properties:** Strong shadow, rounded corners, theme-adaptive background

```tsx
// ✅ CORRECT - Semantic class
<div className="theme-card p-8 max-w-2xl mx-auto">
  <h2 className="detail-card-header mb-6">Modal Title</h2>
  <p className="text-body mb-4">Modal content goes here...</p>
  <div className="flex gap-4 justify-end">
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </div>
</div>

// ❌ WRONG - Hardcoded styles
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
  <h2 className="text-2xl font-bold mb-6">Modal Title</h2>
  {/* ... */}
</div>
```

**Variants:**
```tsx
// Compact modal
<div className="theme-card p-6 max-w-md">

// Full-width modal
<div className="theme-card p-8 w-full max-w-4xl">

// No padding (custom layout)
<div className="theme-card overflow-hidden">
```

---

### 1.2 Content Card

**Semantic Class:** `.detail-card`  
**Purpose:** Inline data cards, result sections, info boxes  
**Properties:** Medium shadow, subtle elevation, theme-adaptive

```tsx
// ✅ CORRECT - Semantic class
<div className="detail-card">
  <h3 className="detail-card-header mb-4">System Details</h3>
  <div className="space-y-3">
    <div className="cost-item">
      <span className="cost-item-label">Panel Count</span>
      <span className="cost-item-value">24 panels</span>
    </div>
    <div className="cost-item">
      <span className="cost-item-label">System Size</span>
      <span className="cost-item-value">9.6 kW</span>
    </div>
  </div>
</div>

// ❌ WRONG - Hardcoded styles
<div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200">
  <h3 className="text-xl font-semibold mb-4">System Details</h3>
  {/* ... */}
</div>
```

**Variants:**
```tsx
// Compact card
<div className="detail-card p-4">

// Full-width card
<div className="detail-card w-full">

// Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="detail-card">{/* Card 1 */}</div>
  <div className="detail-card">{/* Card 2 */}</div>
  <div className="detail-card">{/* Card 3 */}</div>
</div>
```

---

### 1.3 Neumorphic Card

**Semantic Class:** `.neu-card`  
**Purpose:** Enhanced 3D cards with strong neumorphic effect  
**Properties:** Outset shadow, 3D appearance, theme-adaptive

```tsx
// ✅ CORRECT - Semantic class
<div className="neu-card">
  <div className="metric-card-label">Total Savings</div>
  <div className="metric-card-value">$45,600</div>
  <div className="metric-card-description">Over 25 years</div>
</div>

// Variants
<div className="neu-card-compact">  {/* Smaller padding */}
<div className="neu-card-elevated">  {/* Stronger shadow */}
<div className="neu-card-pressed">  {/* Inset shadow - pressed state */}
```

---

## 2. FORM COMPONENTS

### 2.1 Text Input

**Semantic Class:** `.form-input`  
**Purpose:** Text, number, email, password inputs  
**Properties:** Inset shadow (embossed), theme-adaptive

```tsx
// ✅ CORRECT - Semantic class
<div className="space-y-2">
  <label className="text-body-small block">
    Postcode
  </label>
  <input
    type="text"
    className="form-input w-full"
    placeholder="Enter your postcode"
    value={postcode}
    onChange={(e) => setPostcode(e.target.value)}
  />
</div>

// ❌ WRONG - Hardcoded styles + wrong class
<input
  type="text"
  className="form-select w-full bg-white dark:bg-gray-800 border-gray-300"
  {/* form-select shows dropdown arrow on text input! */}
/>
```

**Variants:**
```tsx
// Full width input
<input className="form-input w-full" />

// Fixed width input
<input className="form-input w-64" />

// Input with icon
<div className="relative">
  <input className="form-input w-full pl-10" />
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
</div>

// Disabled input
<input className="form-input w-full opacity-50 cursor-not-allowed" disabled />
```

---

### 2.2 Select Dropdown

**Semantic Class:** `.form-select`  
**Purpose:** Dropdown select elements ONLY  
**Properties:** Inset shadow + dropdown arrow, theme-adaptive

```tsx
// ✅ CORRECT - Semantic class for <select>
<div className="space-y-2">
  <label className="text-body-small block">
    System Type
  </label>
  <select
    className="form-select w-full"
    value={systemType}
    onChange={(e) => setSystemType(e.target.value)}
  >
    <option value="">Select system type</option>
    <option value="residential">Residential</option>
    <option value="commercial">Commercial</option>
  </select>
</div>

// ❌ WRONG - Using form-select on input
<input type="text" className="form-select" />  {/* Shows unwanted arrow! */}
```

**⚠️ CRITICAL WARNING:** Only use `.form-select` on `<select>` elements. It adds a dropdown arrow background image that will appear on text inputs if misused.

---

### 2.3 Textarea

**Semantic Class:** `.form-input`  
**Purpose:** Multi-line text input  
**Properties:** Same as text input (embossed style)

```tsx
// ✅ CORRECT
<div className="space-y-2">
  <label className="text-body-small block">
    Additional Notes
  </label>
  <textarea
    className="form-input w-full resize-none"
    rows={4}
    placeholder="Enter any additional information..."
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />
</div>
```

---

### 2.4 Toggle Switch

**Semantic Classes:** `.toggle-switch`, `.toggle-knob`  
**Purpose:** On/off toggle switches  
**Properties:** Custom styled switch with smooth animation

```tsx
// ✅ CORRECT - Medium size toggle
<div className="flex items-center gap-3">
  <span className="text-body-small">Enable notifications</span>
  <button
    onClick={() => setEnabled(!enabled)}
    className={`toggle-switch toggle-switch-md ${
      enabled ? 'toggle-switch-on' : 'toggle-switch-off'
    }`}
    aria-pressed={enabled}
  >
    <span className={`toggle-knob toggle-knob-md ${
      enabled ? 'toggle-knob-on-md' : 'toggle-knob-off-md'
    }`} />
  </button>
</div>

// Small size toggle
<button className="toggle-switch toggle-switch-sm">
  <span className="toggle-knob toggle-knob-sm toggle-knob-on-sm" />
</button>
```

---

### 2.5 Range Slider

**Semantic Class:** `.slider-track`  
**Purpose:** Range input sliders  
**Properties:** Custom track styling

```tsx
// ✅ CORRECT
<div className="space-y-2">
  <label className="text-body-small flex justify-between">
    <span>System Size</span>
    <span className="text-body font-semibold">{size} kW</span>
  </label>
  <input
    type="range"
    min="3"
    max="15"
    step="0.5"
    value={size}
    onChange={(e) => setSize(parseFloat(e.target.value))}
    className="slider-track w-full"
  />
</div>
```

---

## 3. DATA DISPLAY COMPONENTS

### 3.1 Cost Item

**Semantic Classes:** `.cost-item`, `.cost-item-label`, `.cost-item-value`  
**Purpose:** Display financial data, cost breakdowns  
**Properties:** Label (muted) + Value (bold, prominent)

```tsx
// ✅ CORRECT - Full pattern
<div className="space-y-3">
  <div className="cost-item">
    <span className="cost-item-label">System Cost</span>
    <span className="cost-item-value">$15,000</span>
  </div>
  <div className="cost-item">
    <span className="cost-item-label">Installation</span>
    <span className="cost-item-value">$3,500</span>
  </div>
  <div className="cost-item">
    <span className="cost-item-label">Rebates</span>
    <span className="cost-item-value text-success">-$2,500</span>
  </div>
  <div className="cost-item border-t border-border pt-3 mt-3">
    <span className="cost-item-label font-semibold">Total Cost</span>
    <span className="cost-item-value">$16,000</span>
  </div>
</div>

// ❌ WRONG - Missing semantic classes
<div className="flex justify-between">
  <span className="text-gray-500">System Cost</span>
  <span className="font-bold">$15,000</span>
</div>
```

**Variants:**
```tsx
// With icon
<div className="cost-item">
  <span className="cost-item-label flex items-center gap-2">
    <DollarIcon className="w-4 h-4" />
    System Cost
  </span>
  <span className="cost-item-value">$15,000</span>
</div>

// Highlighted value
<div className="cost-item">
  <span className="cost-item-label">Savings</span>
  <span className="cost-item-value text-success">$2,400/year</span>
</div>
```

---

### 3.2 Metric Card

**Semantic Classes:** `.metric-card`, `.metric-card-label`, `.metric-card-value`, `.metric-card-description`  
**Purpose:** Display KPIs, key metrics, statistics  
**Properties:** Card container with prominent value display

```tsx
// ✅ CORRECT - Full pattern
<div className="metric-card">
  <div className="metric-card-label">Annual Savings</div>
  <div className="metric-card-value">$2,400</div>
  <div className="metric-card-description">Per year average</div>
</div>

// Grid of metrics
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="metric-card">
    <div className="metric-card-label">System Size</div>
    <div className="metric-card-value">9.6 kW</div>
    <div className="metric-card-description">24 panels</div>
  </div>
  <div className="metric-card">
    <div className="metric-card-label">ROI Period</div>
    <div className="metric-card-value">8.5 years</div>
    <div className="metric-card-description">Break-even point</div>
  </div>
  <div className="metric-card">
    <div className="metric-card-label">Total Savings</div>
    <div className="metric-card-value">$45,600</div>
    <div className="metric-card-description">25 year lifetime</div>
  </div>
</div>

// ❌ WRONG - Hardcoded styles
<div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-6">
  <div className="text-sm text-white/80">Annual Savings</div>
  <div className="text-4xl font-bold text-white">$2,400</div>
</div>
```

---

### 3.3 Performance Item

**Semantic Classes:** `.performance-item`, `.performance-item-label`, `.performance-item-value`  
**Purpose:** Display system performance metrics  
**Properties:** Similar to cost-item but for performance data

```tsx
// ✅ CORRECT
<div className="space-y-2">
  <div className="performance-item">
    <span className="performance-item-label">Panel Efficiency</span>
    <span className="performance-item-value">22.5%</span>
  </div>
  <div className="performance-item">
    <span className="performance-item-label">System Capacity Factor</span>
    <span className="performance-item-value">18.2%</span>
  </div>
  <div className="performance-item">
    <span className="performance-item-label">Annual Production</span>
    <span className="performance-item-value">12,480 kWh</span>
  </div>
</div>
```

---

### 3.4 Spec Card

**Semantic Classes:** `.spec-card`, `.spec-card-label`, `.spec-card-value`  
**Purpose:** Display technical specifications  
**Properties:** Card format for spec display

```tsx
// ✅ CORRECT
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="spec-card">
    <div className="spec-card-label">Panel Type</div>
    <div className="spec-card-value">Monocrystalline</div>
  </div>
  <div className="spec-card">
    <div className="spec-card-label">Warranty</div>
    <div className="spec-card-value">25 years</div>
  </div>
  <div className="spec-card">
    <div className="spec-card-label">Inverter</div>
    <div className="spec-card-value">String Inverter</div>
  </div>
  <div className="spec-card">
    <div className="spec-card-label">Monitoring</div>
    <div className="spec-card-value">WiFi Enabled</div>
  </div>
</div>
```

---

### 3.5 Summary Box

**Semantic Classes:** `.summary-box`, `.summary-box-label`, `.summary-box-value`  
**Purpose:** Display summary information prominently  
**Properties:** Enhanced styling for important summaries

```tsx
// ✅ CORRECT
<div className="summary-box">
  <div className="summary-box-label">Your Estimated Quote</div>
  <div className="summary-box-value">$16,000</div>
</div>
```

---

### 3.6 Rebate Item

**Semantic Classes:** `.rebate-item`, `.rebate-item-label`, `.rebate-item-value`  
**Purpose:** Display rebate and incentive information  
**Properties:** Specialized for rebate data display

```tsx
// ✅ CORRECT
<div className="space-y-2">
  <div className="rebate-item">
    <span className="rebate-item-label">Federal Tax Credit (30%)</span>
    <span className="rebate-item-value">$4,800</span>
  </div>
  <div className="rebate-item">
    <span className="rebate-item-label">State Rebate</span>
    <span className="rebate-item-value">$1,500</span>
  </div>
  <div className="rebate-item">
    <span className="rebate-item-label">Utility Incentive</span>
    <span className="rebate-item-value">$750</span>
  </div>
</div>
```

---

## 4. BUTTON COMPONENTS

### 4.1 Primary Button

**Component:** `<Button variant="primary">`  
**Purpose:** Main call-to-action buttons  
**Properties:** Theme-adaptive, semantic colors

```tsx
// ✅ CORRECT - Use Button component
import { Button } from '@/components/ui/button';

<Button variant="primary" onClick={handleSubmit}>
  Get Instant Quote
</Button>

// With icon
<Button variant="primary">
  <ArrowRightIcon className="w-5 h-5 mr-2" />
  Continue
</Button>

// Full width
<Button variant="primary" className="w-full">
  Submit Application
</Button>

// ❌ WRONG - Hardcoded button
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg">
  Get Quote
</button>
```

---

### 4.2 Secondary Button

**Component:** `<Button variant="secondary">`  
**Purpose:** Secondary actions, cancel buttons  
**Properties:** Subtle styling, theme-adaptive

```tsx
// ✅ CORRECT
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Button group
<div className="flex gap-3">
  <Button variant="secondary">Back</Button>
  <Button variant="primary">Next</Button>
</div>
```

---

### 4.3 Outline Button

**Component:** `<Button variant="outline">`  
**Purpose:** Tertiary actions, less prominent  
**Properties:** Border only, theme-adaptive

```tsx
// ✅ CORRECT
<Button variant="outline" onClick={handleReset}>
  Reset Form
</Button>
```

---

### 4.4 Ghost Button

**Component:** `<Button variant="ghost">`  
**Purpose:** Minimal buttons, inline actions  
**Properties:** No background, hover effect only

```tsx
// ✅ CORRECT
<Button variant="ghost" onClick={handleClose}>
  <XIcon className="w-5 h-5" />
</Button>
```

---

### 4.5 Neumorphic Button (Alternative)

**Semantic Class:** `.neu-btn`  
**Purpose:** Alternative button style with neumorphic effect  
**Use:** Only when Button component is not suitable

```tsx
// ✅ CORRECT - When Button component can't be used
<button className="neu-btn">
  Click Me
</button>

// Variants
<button className="neu-btn-secondary">Secondary</button>
<button className="neu-btn-link">Link Style</button>
<button className="neu-btn-icon">
  <IconComponent />
</button>
```

---

## 5. CARD COMPONENTS

### 5.1 Theme Card (Modal/Dialog)

**Use Case:** Authentication modals, confirmation dialogs, overlays

```tsx
// ✅ CORRECT - Auth modal
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="theme-card p-8 max-w-md w-full mx-4">
    <h2 className="detail-card-header mb-6">Sign In</h2>
    
    <form className="space-y-4">
      <div>
        <label className="text-body-small block mb-2">Email</label>
        <input type="email" className="form-input w-full" />
      </div>
      
      <div>
        <label className="text-body-small block mb-2">Password</label>
        <input type="password" className="form-input w-full" />
      </div>
      
      <Button variant="primary" className="w-full">
        Sign In
      </Button>
    </form>
  </div>
</div>
```

---

### 5.2 Detail Card (Content)

**Use Case:** Quote results, system details, data display

```tsx
// ✅ CORRECT - Quote result card
<div className="detail-card">
  <h3 className="detail-card-header mb-6">Your Solar Quote</h3>
  
  <div className="space-y-4">
    <div className="cost-item">
      <span className="cost-item-label">System Size</span>
      <span className="cost-item-value">9.6 kW</span>
    </div>
    
    <div className="cost-item">
      <span className="cost-item-label">Total Cost</span>
      <span className="cost-item-value">$16,000</span>
    </div>
    
    <div className="cost-item">
      <span className="cost-item-label">Annual Savings</span>
      <span className="cost-item-value text-success">$2,400</span>
    </div>
  </div>
  
  <div className="mt-6">
    <Button variant="primary" className="w-full">
      Request Detailed Quote
    </Button>
  </div>
</div>
```

---

### 5.3 Metric Card Grid

**Use Case:** Dashboard KPIs, statistics overview

```tsx
// ✅ CORRECT - Dashboard metrics
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="metric-card">
    <div className="metric-card-label">Total Leads</div>
    <div className="metric-card-value">247</div>
    <div className="metric-card-description">↑ 12% this month</div>
  </div>
  
  <div className="metric-card">
    <div className="metric-card-label">Active Quotes</div>
    <div className="metric-card-value">64</div>
    <div className="metric-card-description">Awaiting response</div>
  </div>
  
  <div className="metric-card">
    <div className="metric-card-label">Conversion Rate</div>
    <div className="metric-card-value">34.5%</div>
    <div className="metric-card-description">↑ 2.3% from last month</div>
  </div>
  
  <div className="metric-card">
    <div className="metric-card-label">Revenue</div>
    <div className="metric-card-value">$124K</div>
    <div className="metric-card-description">This quarter</div>
  </div>
</div>
```

---

## 6. TYPOGRAPHY COMPONENTS

### 6.1 Headings

**Semantic Classes:** Use semantic text classes, not raw Tailwind

```tsx
// ✅ CORRECT - Semantic typography
<h1 className="text-heading-1">Main Page Title</h1>
<h2 className="text-heading-2">Section Title</h2>
<h3 className="detail-card-header">Card Header</h3>

// ❌ WRONG - Raw Tailwind typography
<h1 className="text-4xl font-bold">Title</h1>
<h2 className="text-2xl font-semibold">Subtitle</h2>
```

---

### 6.2 Body Text

**Semantic Classes:** `text-body`, `text-body-small`

```tsx
// ✅ CORRECT
<p className="text-body">
  Regular paragraph text with proper semantic class.
</p>

<p className="text-body-small">
  Smaller text for captions or secondary information.
</p>

<p className="text-caption">
  Very small caption text.
</p>

// ❌ WRONG
<p className="text-base">Regular text</p>
<p className="text-sm">Small text</p>
```

---

### 6.3 Balanced Text

**Semantic Class:** `.text-balance`  
**Purpose:** Better text wrapping for headlines

```tsx
// ✅ CORRECT - Headlines with better wrapping
<h1 className="text-heading-1 text-balance">
  Get Your Instant Solar Quote in 60 Seconds
</h1>

<h2 className="text-heading-2 text-balance">
  Compare Quotes from Top Local Installers
</h2>
```

---

## 7. LAYOUT COMPONENTS

### 7.1 Info Section

**Semantic Classes:** `.info-section`, `.info-section-lg`  
**Purpose:** Standard content sections with proper spacing

```tsx
// ✅ CORRECT
<section className="info-section">
  <h2 className="text-heading-2 mb-6">How It Works</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Section content */}
  </div>
</section>

// Large section
<section className="info-section-lg">
  <h2 className="text-heading-2 mb-8">Features</h2>
  {/* Large section content */}
</section>
```

---

### 7.2 Divider

**Semantic Class:** `.neu-divider`  
**Purpose:** Neumorphic divider between sections

```tsx
// ✅ CORRECT
<div className="detail-card">
  <div className="space-y-4">
    {/* First section */}
  </div>
  
  <div className="neu-divider my-6" />
  
  <div className="space-y-4">
    {/* Second section */}
  </div>
</div>
```

---

### 7.3 Disclaimer Box

**Semantic Classes:** `.disclaimer-box`, `.disclaimer-box-title`, `.disclaimer-box-list`  
**Purpose:** Display disclaimers, warnings, notices

```tsx
// ✅ CORRECT
<div className="disclaimer-box">
  <div className="disclaimer-box-title">Important Information</div>
  <ul className="disclaimer-box-list">
    <li>Estimates are based on average usage and may vary</li>
    <li>Final pricing subject to site inspection</li>
    <li>Rebates and incentives subject to eligibility</li>
  </ul>
</div>
```

---

## 8. ANIMATION COMPONENTS

### 8.1 Fade In Up

**Semantic Class:** `.animate-fade-in-up`  
**Purpose:** Entrance animation from bottom

```tsx
// ✅ CORRECT
<div className="animate-fade-in-up">
  <div className="detail-card">
    {/* Content fades in and slides up */}
  </div>
</div>
```

---

### 8.2 Slide In Top

**Semantic Class:** `.animate-slide-in-top`  
**Purpose:** Entrance animation from top

```tsx
// ✅ CORRECT
<div className="animate-slide-in-top">
  <div className="theme-card">
    {/* Modal slides in from top */}
  </div>
</div>
```

---

### 8.3 Float Animation

**Semantic Class:** `.animate-float`  
**Purpose:** Continuous floating motion

```tsx
// ✅ CORRECT - Decorative elements
<div className="animate-float">
  <IconComponent className="w-16 h-16" />
</div>
```

---

### 8.4 Pulse Animation

**Semantic Class:** `.animate-pulse`  
**Purpose:** Pulsing scale effect

```tsx
// ✅ CORRECT - Loading states
<div className="animate-pulse">
  <div className="metric-card">
    {/* Card pulses while loading */}
  </div>
</div>
```

---

## 9. SPECIALIZED COMPONENTS

### 9.1 Glass Header

**Semantic Class:** `.glass-header`  
**Purpose:** Glassmorphic header with blur effect

```tsx
// ✅ CORRECT
<header className="glass-header">
  <div className="container mx-auto px-4 py-4">
    <nav className="flex items-center justify-between">
      <Logo />
      <NavLinks />
    </nav>
  </div>
</header>
```

---

### 9.2 Glass Sidebar

**Semantic Class:** `.glass-sidebar`  
**Purpose:** Glassmorphic sidebar navigation

```tsx
// ✅ CORRECT
<aside className="glass-sidebar">
  <nav className="space-y-2">
    <a href="/dashboard" className="nav-link">Dashboard</a>
    <a href="/leads" className="nav-link">Leads</a>
    <a href="/quotes" className="nav-link">Quotes</a>
  </nav>
</aside>
```

---

### 9.3 Animated Gradient Background

**Semantic Class:** `.bg-animated-gradient`  
**Purpose:** Moving gradient background effect

```tsx
// ✅ CORRECT - Hero section
<section className="bg-animated-gradient min-h-screen flex items-center justify-center">
  <div className="theme-card p-12 text-center">
    <h1 className="text-heading-1 mb-6">Solar Match</h1>
    <p className="text-body mb-8">Find your perfect solar installer</p>
    <Button variant="primary" size="lg">Get Started</Button>
  </div>
</section>
```

---

### 9.4 Icon Container

**Semantic Class:** `.icon-container`  
**Purpose:** Proper icon sizing and alignment

```tsx
// ✅ CORRECT
<div className="icon-container">
  <SunIcon className="w-8 h-8" />
</div>
```

---

## 🎨 COMPLETE FORM EXAMPLE

**Full form with all semantic classes:**

```tsx
import { Button } from '@/components/ui/button';

export default function QuoteRequestForm() {
  return (
    <div className="theme-card p-8 max-w-2xl mx-auto">
      <h2 className="detail-card-header mb-6">Get Your Free Quote</h2>
      
      <form className="space-y-6">
        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-body-small block">Full Name</label>
          <input
            type="text"
            className="form-input w-full"
            placeholder="John Smith"
            required
          />
        </div>
        
        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-body-small block">Email Address</label>
          <input
            type="email"
            className="form-input w-full"
            placeholder="john@example.com"
            required
          />
        </div>
        
        {/* Postcode Input */}
        <div className="space-y-2">
          <label className="text-body-small block">Postcode</label>
          <input
            type="text"
            className="form-input w-full"
            placeholder="2000"
            required
          />
        </div>
        
        {/* Select Dropdown */}
        <div className="space-y-2">
          <label className="text-body-small block">Property Type</label>
          <select className="form-select w-full" required>
            <option value="">Select property type</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        
        {/* Range Slider */}
        <div className="space-y-2">
          <label className="text-body-small flex justify-between">
            <span>Quarterly Power Bill</span>
            <span className="text-body font-semibold">$600</span>
          </label>
          <input
            type="range"
            min="200"
            max="2000"
            step="50"
            className="slider-track w-full"
          />
        </div>
        
        {/* Textarea */}
        <div className="space-y-2">
          <label className="text-body-small block">Additional Notes</label>
          <textarea
            className="form-input w-full resize-none"
            rows={4}
            placeholder="Any specific requirements or questions?"
          />
        </div>
        
        {/* Toggle Switch */}
        <div className="flex items-center justify-between">
          <span className="text-body-small">Send me updates via email</span>
          <button type="button" className="toggle-switch toggle-switch-md toggle-switch-on">
            <span className="toggle-knob toggle-knob-md toggle-knob-on-md" />
          </button>
        </div>
        
        {/* Disclaimer */}
        <div className="disclaimer-box">
          <div className="disclaimer-box-title">Privacy Notice</div>
          <p className="text-body-small">
            Your information will be shared with verified solar installers in your area.
          </p>
        </div>
        
        {/* Button Group */}
        <div className="flex gap-4">
          <Button variant="secondary" type="button" className="flex-1">
            Clear Form
          </Button>
          <Button variant="primary" type="submit" className="flex-1">
            Get Instant Quote
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

## 🎨 COMPLETE DASHBOARD EXAMPLE

**Full dashboard with metrics, cards, and data display:**

```tsx
import { Button } from '@/components/ui/button';

export default function InstallerDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-heading-1">Installer Dashboard</h1>
        <Button variant="primary">New Lead</Button>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="metric-card-label">Active Leads</div>
          <div className="metric-card-value">24</div>
          <div className="metric-card-description">3 new today</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-card-label">Quotes Sent</div>
          <div className="metric-card-value">156</div>
          <div className="metric-card-description">This month</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-card-label">Conversion Rate</div>
          <div className="metric-card-value">32%</div>
          <div className="metric-card-description">↑ 5% from last month</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-card-label">Revenue</div>
          <div className="metric-card-value">$42K</div>
          <div className="metric-card-description">This quarter</div>
        </div>
      </div>
      
      {/* Lead Details Card */}
      <div className="detail-card">
        <h3 className="detail-card-header mb-6">Recent Lead Details</h3>
        
        {/* Customer Info */}
        <div className="space-y-3 mb-6">
          <div className="cost-item">
            <span className="cost-item-label">Customer Name</span>
            <span className="cost-item-value">Sarah Johnson</span>
          </div>
          <div className="cost-item">
            <span className="cost-item-label">Location</span>
            <span className="cost-item-value">Sydney, NSW 2000</span>
          </div>
          <div className="cost-item">
            <span className="cost-item-label">Property Type</span>
            <span className="cost-item-value">Residential House</span>
          </div>
        </div>
        
        <div className="neu-divider my-6" />
        
        {/* System Requirements */}
        <div className="space-y-3 mb-6">
          <div className="performance-item">
            <span className="performance-item-label">Quarterly Bill</span>
            <span className="performance-item-value">$650</span>
          </div>
          <div className="performance-item">
            <span className="performance-item-label">Estimated System Size</span>
            <span className="performance-item-value">9.6 kW</span>
          </div>
          <div className="performance-item">
            <span className="performance-item-label">Budget Range</span>
            <span className="performance-item-value">$15,000 - $20,000</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="primary" className="flex-1">
            Send Quote
          </Button>
          <Button variant="secondary" className="flex-1">
            Schedule Call
          </Button>
        </div>
      </div>
      
      {/* System Specs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="spec-card">
          <div className="spec-card-label">Panel Count</div>
          <div className="spec-card-value">24 panels</div>
        </div>
        <div className="spec-card">
          <div className="spec-card-label">Panel Type</div>
          <div className="spec-card-value">Mono PERC</div>
        </div>
        <div className="spec-card">
          <div className="spec-card-label">Inverter</div>
          <div className="spec-card-value">5kW Hybrid</div>
        </div>
        <div className="spec-card">
          <div className="spec-card-label">Warranty</div>
          <div className="spec-card-value">25 years</div>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ COMPONENT CHECKLIST

Before creating any component, verify:

- [ ] **No hardcoded colors** - Use semantic classes or CSS variables
- [ ] **No raw typography** - Use `text-heading-*`, `text-body`, etc.
- [ ] **Semantic classes checked** - Reviewed SEMANTIC-CLASSES-REGISTRY.md
- [ ] **Button component used** - Not raw `<button>` with Tailwind
- [ ] **Form classes correct** - `.form-input` for inputs, `.form-select` for selects
- [ ] **Data display patterns** - Using `.cost-item`, `.metric-card`, etc.
- [ ] **Theme tested** - Works in Dark, Light, and Purple themes
- [ ] **Responsive** - Mobile, tablet, desktop tested
- [ ] **Accessible** - Proper labels, ARIA attributes, keyboard navigation

---

## 🔄 MIGRATION FROM OLD CODE

### Before (❌ Hardcoded):
```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
    Quote Results
  </h2>
  
  <div className="flex justify-between items-center mb-4">
    <span className="text-sm text-gray-500">System Cost</span>
    <span className="text-lg font-semibold text-gray-900 dark:text-white">$15,000</span>
  </div>
  
  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
    Get Quote
  </button>
</div>
```

### After (✅ Semantic):
```tsx
<div className="detail-card">
  <h2 className="detail-card-header mb-6">
    Quote Results
  </h2>
  
  <div className="cost-item mb-4">
    <span className="cost-item-label">System Cost</span>
    <span className="cost-item-value">$15,000</span>
  </div>
  
  <Button variant="primary" className="w-full">
    Get Quote
  </Button>
</div>
```

---

## 📚 RELATED DOCUMENTATION

- **Semantic Classes Registry:** `DOC/SEMANTIC-CLASSES-REGISTRY.md`
- **Design System SOT:** `DOC/DESIGN-SYSTEM-SOT.md`
- **Migration Guide:** `DOC/MIGRATION-PAIN-POINTS-AUDIT.md`
- **Color System:** `DOC/COLOR-SYSTEM-STANDARDS.md`
- **Tasks & Checklist:** `specs/006-component-by-component/tasks.md`

---

**Version:** 1.0.0  
**Last Updated:** November 3, 2025  
**Maintainer:** Update when adding new components or semantic classes  
**License:** Internal use - Solar Match project
