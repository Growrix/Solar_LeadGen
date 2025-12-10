# Animation Patterns Guide

Comprehensive guide to animation durations, easing functions, keyframe animations, and best practices in the SolarMatch design system.

## Table of Contents
- [Animation Token Scale](#animation-token-scale)
- [Duration Guidelines](#duration-guidelines)
- [Easing Functions](#easing-functions)
- [Keyframe Animations](#keyframe-animations)
- [Component-Specific Patterns](#component-specific-patterns)
- [Best Practices](#best-practices)
- [Performance Optimization](#performance-optimization)
- [Accessibility](#accessibility)
- [Testing Checklist](#testing-checklist)
- [Troubleshooting](#troubleshooting)

---

## Animation Token Scale

### Duration Tokens

Our animation system uses 4 standard durations optimized for different interaction types:

```typescript
// Duration tokens (in milliseconds)
duration-150  // 150ms - Fast transitions
duration-200  // 200ms - Normal transitions (default)
duration-300  // 300ms - Slow transitions
duration-500  // 500ms - Slower transitions
```

### Visual Duration Scale

```
Fast     ▁       150ms   Quick feedback (hover states)
         │
Normal   ▂       200ms   UI changes (button clicks, focus)
         │
Slow     ▃       300ms   Complex animations (modals, cards)
         │
Slower   ▄       500ms   Page transitions (rare)
```

### Duration Usage Matrix

| Duration | Use Case | Example |
|----------|----------|---------|
| **150ms** | Instant feedback | Button hover, link hover, color changes |
| **200ms** | Default UI transitions | Button clicks, input focus, dropdown open |
| **300ms** | Complex animations | Modal open, card flip, multi-property transitions |
| **500ms** | Page-level changes | Route transitions, skeleton loaders (use sparingly) |

---

## Duration Guidelines

### Fast (150ms) - Instant Feedback

**When to Use:**
- Color changes on hover
- Scale changes on hover (small scale: 1.05)
- Border color changes
- Opacity changes
- Quick visual feedback

**Example:**
```tsx
// Button hover color change
<button className="bg-primary hover:bg-primary-dark transition-colors duration-150">
  Hover Me
</button>

// Link hover underline
<a className="underline-offset-2 hover:underline transition-all duration-150">
  Click Here
</a>
```

**Visual Timeline:**
```
0ms     75ms    150ms
│───────┼───────│
Hover   50%     Complete
Start   done    transition
```

### Normal (200ms) - Default UI Changes

**When to Use (DEFAULT for most interactions):**
- Button clicks
- Input focus states
- Dropdown/select open
- Tab switches
- Toggle switches
- Checkbox/radio changes

**Example:**
```tsx
// Input focus with border + shadow
<input className="border-2 border-border transition-all duration-200 focus:border-primary focus:shadow-focus" />

// Button with multiple properties
<button className="bg-primary shadow-button transition-all duration-200 hover:bg-primary-dark hover:shadow-card">
  Click Me
</button>
```

**Visual Timeline:**
```
0ms     100ms   200ms
│───────┼───────│
Click   50%     Complete
Start   done    transition
```

### Slow (300ms) - Complex Animations

**When to Use:**
- Modal open/close
- Card flip/rotate
- Multi-step animations
- Combined scale + shadow + color
- Panel slide in/out

**Example:**
```tsx
// Modal with scale + fade
<div className="animate-in zoom-in-95 fade-in duration-300">
  <div className="bg-surface rounded-2xl p-8">Modal Content</div>
</div>

// Card with lift + shadow + border
<div className="transition-all duration-300 hover:shadow-dropdown hover:-translate-y-2 hover:border-primary">
  Card Content
</div>
```

**Visual Timeline:**
```
0ms     150ms   300ms
│───────┼───────│
Open    50%     Complete
Start   done    animation
```

### Slower (500ms) - Page Transitions

**When to Use (SPARINGLY):**
- Page route changes
- Skeleton loaders
- Loading overlays
- Major state changes
- Hero animations (once per page load)

**Example:**
```tsx
// Page transition wrapper
<div className="animate-in fade-in slide-in-from-bottom duration-500">
  <PageContent />
</div>

// Skeleton loader
<div className="bg-border animate-pulse duration-500 h-20 rounded-lg" />
```

**⚠️ Warning:** 500ms feels slow. Only use for significant state changes.

---

## Easing Functions

### Available Easing Functions

```typescript
// Tailwind easing classes
ease-linear      // Constant speed (mechanical)
ease             // Default ease (ease-in-out equivalent)
ease-in          // Start slow, end fast (exits)
ease-out         // Start fast, end slow (entrances)
ease-in-out      // Slow start and end (state changes)
```

### Easing Curves Visualization

```
Linear (mechanical, rarely used):
Speed: ─────────────────────
       │                   │
       Start              End

Ease-in (exits/dismissals):
Speed: ╭────────────────────
       │                   │
       Start              End

Ease-out (entrances/reveals):
Speed: ────────────────────╮
       │                   │
       Start              End

Ease-in-out (state changes):
Speed: ╭──────────────────╮
       │                   │
       Start              End
```

### Easing Selection Guide

| Easing | Use Case | Example |
|--------|----------|---------|
| **ease-linear** | Loading spinners, progress bars | Spinner rotation, progress fill |
| **ease** | General purpose (default) | Button hover, link effects |
| **ease-in** | Exits, dismissals | Modal close, toast disappear |
| **ease-out** | Entrances, reveals | Modal open, dropdown appear |
| **ease-in-out** | State changes, toggles | Tab switch, accordion expand |

### Easing Best Practices

**DO:**
```tsx
// Use ease-out for entrances (feels snappy)
<div className="animate-in slide-in-from-bottom ease-out duration-300">
  Entering content
</div>

// Use ease-in for exits (feels natural)
<div className="animate-out slide-out-to-top ease-in duration-200">
  Exiting content
</div>

// Use ease or ease-in-out for state changes
<button className="scale-100 hover:scale-105 transition-transform ease-out duration-150">
  Hover me
</button>
```

**DON'T:**
```tsx
// ❌ Don't use ease-in for entrances (feels sluggish)
<div className="animate-in ease-in duration-300">
  Slow start feels bad
</div>

// ❌ Don't use ease-out for exits (feels abrupt)
<div className="animate-out ease-out duration-200">
  Doesn't feel complete
</div>

// ❌ Don't use linear for UI interactions (feels robotic)
<button className="hover:bg-primary transition-colors ease-linear">
  Mechanical feeling
</button>
```

---

## Keyframe Animations

### Built-in Keyframes

```typescript
// Tailwind animation classes
animate-spin     // 360° rotation (1s linear infinite)
animate-pulse    // Opacity fade (2s ease-in-out infinite)
animate-bounce   // Bounce effect (1s infinite)
animate-ping     // Scale + fade ring (1s cubic-bezier infinite)
```

### Spin Animation

**Use Cases:** Loading indicators, processing states, refresh icons

```tsx
// Button spinner (most common)
<button disabled className="flex items-center gap-2">
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  Processing...
</button>

// Icon spinner
<svg className="w-6 h-6 animate-spin text-primary">
  {/* Icon path */}
</svg>

// Refresh button
<button className="group">
  <svg className="w-5 h-5 group-hover:animate-spin">
    {/* Refresh icon */}
  </svg>
</button>
```

**Visual:**
```
    0°
    │
270°┼90°
    │
   180°

Rotates continuously at constant speed (1 second per rotation)
```

### Pulse Animation

**Use Cases:** Notifications, live indicators, skeleton loaders

```tsx
// Notification dot
<div className="relative">
  <div className="w-3 h-3 bg-info rounded-full animate-pulse" />
</div>

// Skeleton loader (loading state)
<div className="space-y-3">
  <div className="h-4 bg-border rounded animate-pulse" />
  <div className="h-4 bg-border rounded animate-pulse w-3/4" />
</div>

// Live status badge
<span className="flex items-center gap-2">
  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
  Live
</span>
```

**Visual:**
```
Opacity:
100% ╱╲    ╱╲    ╱╲
     ╱  ╲  ╱  ╲  ╱  ╲
0%  ╱    ╲╱    ╲╱    ╲

Fades between 100% and 0% opacity (2 seconds per cycle)
```

### Bounce Animation

**Use Cases:** Success feedback, notifications, call-to-action emphasis

```tsx
// Success checkmark
<div className="text-success animate-bounce">
  <svg className="w-6 h-6">
    <path d="M5 13l4 4L19 7" />
  </svg>
</div>

// New notification badge
<span className="bg-info text-white px-2 py-1 rounded-full text-xs animate-bounce">
  New
</span>

// Scroll down indicator
<button className="animate-bounce">
  <svg className="w-6 h-6">
    <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
</button>
```

**Visual:**
```
Position:
 0  ▄
-5  │ ▄
-10 │ │ ▄
-15 │ │ │
    └─┴─┴─> Time

Bounces up and down with decreasing amplitude
```

### Ping Animation

**Use Cases:** Real-time indicators, active states, radar effects

```tsx
// Real-time lead notification
<div className="relative">
  <div className="absolute inset-0 bg-info rounded-full animate-ping" />
  <div className="relative w-3 h-3 bg-info rounded-full" />
</div>

// Active connection status
<div className="flex items-center gap-2">
  <div className="relative w-2 h-2">
    <span className="absolute inset-0 bg-success rounded-full animate-ping" />
    <span className="relative block w-2 h-2 bg-success rounded-full" />
  </div>
  <span className="text-sm">Connected</span>
</div>

// Live dashboard indicator
<div className="relative">
  <span className="flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
  </span>
</div>
```

**Visual:**
```
Scale + Opacity:
      ○○○○     Expands and fades
     ○    ○
    ○  ●  ○   ● = Core dot
     ○    ○   ○ = Expanding ring
      ○○○○

Ring expands from 100% to 200% scale while fading from 100% to 0% opacity
```

### Animation Combination Patterns

```tsx
// Staggered list animation
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-in slide-in-from-left duration-300"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {item.content}
  </div>
))}

// Multi-state loading indicator
<div className="flex gap-1">
  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
</div>

// Pulse with ping (double emphasis)
<div className="relative">
  <div className="absolute inset-0 bg-info rounded-full animate-ping" />
  <div className="relative w-3 h-3 bg-info rounded-full animate-pulse" />
</div>
```

---

## Component-Specific Patterns

### Buttons

**Standard Button Hover:**
```tsx
<button className="bg-primary text-white px-6 py-3 rounded-lg transition-all duration-150 hover:bg-primary-dark hover:shadow-card active:scale-95">
  Click Me
</button>
```
- **Duration:** 150ms (instant feedback)
- **Properties:** Color + shadow
- **Easing:** Default ease (or ease-out for snappier feel)
- **Active state:** Scale down slightly for press feedback

**Outlined Button Fill:**
```tsx
<button className="border-2 border-primary text-primary px-6 py-3 rounded-lg transition-all duration-200 hover:bg-primary hover:text-white">
  Learn More
</button>
```
- **Duration:** 200ms (fills need slightly more time)
- **Properties:** Background + text color
- **Easing:** Default ease

**Icon Button Rotate:**
```tsx
<button className="p-2 rounded-lg transition-all duration-200 hover:bg-surface hover:rotate-90">
  <svg className="w-5 h-5">...</svg>
</button>
```
- **Duration:** 200ms (rotation needs time to be perceived)
- **Properties:** Background + rotation
- **Easing:** Default ease

**Loading Button:**
```tsx
<button disabled className="bg-primary text-white px-6 py-3 rounded-lg opacity-75 flex items-center gap-2">
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  Processing...
</button>
```
- **Animation:** Spin (continuous)
- **State:** Disabled with opacity reduction

### Cards

**Hover Lift:**
```tsx
<div className="bg-surface rounded-xl p-6 shadow-card transition-all duration-200 hover:shadow-dropdown hover:-translate-y-1">
  Card Content
</div>
```
- **Duration:** 200ms
- **Properties:** Shadow + translateY
- **Easing:** Default ease (or ease-out for more responsive feel)

**Border Highlight:**
```tsx
<div className="bg-surface border-2 border-border rounded-xl p-6 transition-all duration-200 hover:border-primary hover:shadow-card">
  Card Content
</div>
```
- **Duration:** 200ms
- **Properties:** Border color + shadow
- **Easing:** Default ease

**Scale on Hover:**
```tsx
<div className="bg-surface rounded-xl p-6 shadow-card transition-transform duration-200 hover:scale-105">
  Interactive Card
</div>
```
- **Duration:** 200ms
- **Property:** Scale only (performant)
- **Easing:** ease-out (snappy feel)

### Modals

**Scale Fade Open:**
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
  <div className="absolute inset-0 bg-black/50" />
  <div className="relative bg-surface rounded-2xl p-8 shadow-modal animate-in zoom-in-95 duration-300">
    Modal Content
  </div>
</div>
```
- **Overlay:** 200ms fade
- **Modal:** 300ms scale + fade (95% → 100%)
- **Easing:** ease-out (snappy entrance)

**Slide Up from Bottom:**
```tsx
<div className="fixed inset-0 z-50 flex items-end animate-in fade-in duration-200">
  <div className="absolute inset-0 bg-black/50" />
  <div className="relative bg-surface rounded-t-2xl p-8 w-full shadow-modal animate-in slide-in-from-bottom duration-300">
    Modal Content
  </div>
</div>
```
- **Overlay:** 200ms fade
- **Modal:** 300ms slide from bottom
- **Easing:** ease-out
- **Use case:** Mobile-first designs, bottom sheets

### Forms

**Input Focus:**
```tsx
<input className="px-4 py-3 rounded-lg border-2 border-border transition-all duration-200 focus:border-primary focus:shadow-focus focus:outline-none" />
```
- **Duration:** 200ms
- **Properties:** Border color + shadow
- **Easing:** Default ease

**Success Validation:**
```tsx
<input className="px-4 py-3 rounded-lg border-2 border-success bg-success-light" />
<p className="text-success mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
  <svg className="animate-bounce">✓</svg>
  Valid email
</p>
```
- **Input:** Instant color change (no transition needed)
- **Message:** 200ms fade + slide in
- **Icon:** Bounce animation (continuous for 1s)

**Error Validation:**
```tsx
<input className="px-4 py-3 rounded-lg border-2 border-error bg-error-light" />
<p className="text-error mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
  <svg className="animate-pulse">✗</svg>
  Invalid format
</p>
```
- **Message:** 200ms fade + slide in
- **Icon:** Pulse animation (continuous)

### Dropdowns

**Standard Dropdown:**
```tsx
<div className="absolute mt-2 bg-surface border border-border rounded-xl shadow-dropdown animate-in fade-in zoom-in-95 duration-200">
  <div className="p-2">
    {/* Dropdown items */}
  </div>
</div>
```
- **Duration:** 200ms
- **Animation:** Scale (95% → 100%) + fade
- **Easing:** ease-out

**Dropdown Item Hover:**
```tsx
<button className="w-full px-4 py-2 rounded-lg text-left transition-colors duration-150 hover:bg-primary-light">
  Menu Item
</button>
```
- **Duration:** 150ms (instant feedback)
- **Property:** Background color
- **Easing:** Default ease

### Notifications/Toasts

**Slide In from Right:**
```tsx
<div className="fixed top-4 right-4 bg-surface border-l-4 border-success rounded-lg shadow-card p-4 animate-in slide-in-from-right duration-300">
  Success message
</div>
```
- **Duration:** 300ms
- **Animation:** Slide from right
- **Easing:** ease-out

**Fade Out on Dismiss:**
```tsx
<div className="animate-out fade-out slide-out-to-right duration-200">
  Dismissing notification
</div>
```
- **Duration:** 200ms (faster exit)
- **Animation:** Fade + slide right
- **Easing:** ease-in (exit pattern)

---

## Best Practices

### ✅ DO

1. **Use consistent durations across similar interactions:**
   ```tsx
   // All button hovers use 150ms
   <button className="transition-colors duration-150 hover:bg-primary-dark">Button 1</button>
   <button className="transition-colors duration-150 hover:bg-secondary-dark">Button 2</button>
   ```

2. **Prefer transform and opacity for performance:**
   ```tsx
   // ✅ GPU-accelerated (fast)
   <div className="transition-transform duration-200 hover:scale-105">Fast</div>
   <div className="transition-opacity duration-200 hover:opacity-75">Fast</div>
   ```

3. **Use ease-out for entrances (feels snappy):**
   ```tsx
   <div className="animate-in slide-in-from-bottom ease-out duration-300">
     Snappy entrance
   </div>
   ```

4. **Keep animations short (150-300ms for UI):**
   ```tsx
   // UI interactions should be quick
   <button className="transition-all duration-200">Good</button>
   ```

5. **Use keyframe animations for loading states:**
   ```tsx
   <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
   ```

6. **Add active states for button press feedback:**
   ```tsx
   <button className="transition-all duration-150 hover:scale-105 active:scale-95">
     Press feedback
   </button>
   ```

7. **Respect prefers-reduced-motion:**
   ```tsx
   // Automatically disabled by Tailwind when user prefers reduced motion
   <div className="transition-all duration-200 animate-spin">
     Respects accessibility
   </div>
   ```

8. **Use staggered delays for list animations:**
   ```tsx
   {items.map((item, i) => (
     <div
       className="animate-in slide-in-from-left duration-300"
       style={{ animationDelay: `${i * 100}ms` }}
     >
       {item}
     </div>
   ))}
   ```

### ❌ DON'T

1. **Don't use slow animations for frequent interactions:**
   ```tsx
   // ❌ 500ms is too slow for button hover
   <button className="transition-colors duration-500 hover:bg-primary-dark">
     Feels laggy
   </button>
   ```

2. **Don't animate layout properties (width, height, margin):**
   ```tsx
   // ❌ Causes layout shifts and repaints (slow)
   <div className="transition-all duration-200 hover:w-64">Slow</div>
   
   // ✅ Use transform instead
   <div className="transition-transform duration-200 hover:scale-x-110">Fast</div>
   ```

3. **Don't use ease-in for entrances (feels sluggish):**
   ```tsx
   // ❌ Starts slow, feels unresponsive
   <div className="animate-in ease-in duration-300">Sluggish</div>
   
   // ✅ Use ease-out or ease
   <div className="animate-in ease-out duration-300">Snappy</div>
   ```

4. **Don't animate everything:**
   ```tsx
   // ❌ Overkill, distracting
   <div className="transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-2xl hover:bg-gradient-to-r">
     Too much
   </div>
   
   // ✅ Subtle and purposeful
   <div className="transition-all duration-200 hover:shadow-card hover:-translate-y-1">
     Just right
   </div>
   ```

5. **Don't use linear easing for UI interactions:**
   ```tsx
   // ❌ Feels robotic
   <button className="transition-colors ease-linear duration-200">Mechanical</button>
   
   // ✅ Use ease or ease-out
   <button className="transition-colors ease-out duration-200">Natural</button>
   ```

6. **Don't forget loading states:**
   ```tsx
   // ❌ Button changes instantly with no feedback
   <button onClick={submit}>Submit</button>
   
   // ✅ Show loading state
   <button disabled={loading}>
     {loading ? <Spinner /> : 'Submit'}
   </button>
   ```

7. **Don't use will-change everywhere:**
   ```tsx
   // ❌ Overuse hurts performance
   <div className="will-change-transform transition-all">Bad</div>
   
   // ✅ Only for complex animations that need optimization
   <div className="will-change-transform transition-all duration-300 hover:scale-150 hover:rotate-180">
     Justified
   </div>
   ```

8. **Don't chain multiple slow animations:**
   ```tsx
   // ❌ Total 1000ms feels forever
   <div className="animate-in fade-in duration-500">
     <div className="animate-in slide-in-from-bottom duration-500">
       Way too slow
     </div>
   </div>
   
   // ✅ Keep combined animations under 500ms
   <div className="animate-in fade-in duration-200">
     <div className="animate-in slide-in-from-bottom duration-200" style={{ animationDelay: '100ms' }}>
       Better timing
     </div>
   </div>
   ```

---

## Performance Optimization

### GPU-Accelerated Properties (FAST ✅)

**Prefer these properties for animations:**

1. **Transform:**
   ```tsx
   // Scale
   <div className="transition-transform duration-200 hover:scale-105">Fast</div>
   
   // Translate
   <div className="transition-transform duration-200 hover:-translate-y-1">Fast</div>
   
   // Rotate
   <div className="transition-transform duration-200 hover:rotate-3">Fast</div>
   ```

2. **Opacity:**
   ```tsx
   <div className="transition-opacity duration-200 hover:opacity-75">Fast</div>
   ```

3. **Filter (use cautiously):**
   ```tsx
   <div className="transition-all duration-200 hover:blur-sm">OK</div>
   ```

### Layout-Shifting Properties (SLOW ❌)

**Avoid animating these (causes reflows and repaints):**

1. **Width/Height:**
   ```tsx
   // ❌ Causes layout shift
   <div className="transition-all duration-200 hover:w-64">Slow</div>
   
   // ✅ Use transform scale instead
   <div className="transition-transform duration-200 hover:scale-x-110">Fast</div>
   ```

2. **Margin/Padding:**
   ```tsx
   // ❌ Causes layout shift
   <div className="transition-all duration-200 hover:m-8">Slow</div>
   
   // ✅ Use transform translate instead
   <div className="transition-transform duration-200 hover:translate-x-4">Fast</div>
   ```

3. **Top/Left/Right/Bottom:**
   ```tsx
   // ❌ Causes reflow
   <div className="relative transition-all duration-200 hover:top-4">Slow</div>
   
   // ✅ Use transform translate instead
   <div className="transition-transform duration-200 hover:translate-y-4">Fast</div>
   ```

4. **Box-shadow (use moderately):**
   ```tsx
   // ⚠️ Shadow is expensive but OK for hover states
   <div className="transition-shadow duration-200 hover:shadow-dropdown">OK</div>
   
   // ✅ For complex shadows, consider using pseudo-elements
   ```

### Performance Checklist

- [ ] Use `transform` and `opacity` for animations
- [ ] Avoid animating `width`, `height`, `margin`, `padding`, `top`, `left`
- [ ] Keep animations under 300ms for UI interactions
- [ ] Use `will-change` sparingly (only for complex animations)
- [ ] Test on mobile devices (animations can be slower)
- [ ] Use Chrome DevTools Performance tab to profile
- [ ] Respect `prefers-reduced-motion` (Tailwind does this automatically)
- [ ] Limit number of simultaneous animations (max 5-10 on screen)

---

## Accessibility

### Reduced Motion Support

**Automatic with Tailwind:**

Tailwind CSS automatically disables animations and transitions when users have `prefers-reduced-motion` enabled in their OS settings.

```tsx
// This animation will be disabled for users with prefers-reduced-motion
<div className="transition-all duration-300 animate-spin">
  Automatically respects user preferences
</div>
```

**Manual Implementation (if needed):**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Accessibility Best Practices

1. **Ensure animations don't prevent interaction:**
   ```tsx
   // ✅ Button is clickable during animation
   <button className="transition-colors duration-150 hover:bg-primary-dark">
     Always clickable
   </button>
   
   // ❌ Long animation blocks interaction
   <button className="transition-all duration-5000 hover:bg-primary-dark">
     Feels broken
   </button>
   ```

2. **Provide non-animated alternatives:**
   ```tsx
   // Loading state with and without animation
   {isLoading && (
     <div className="flex items-center gap-2">
       <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
       <span>Loading...</span> {/* Text provides context even if animation disabled */}
     </div>
   )}
   ```

3. **Don't rely solely on animation to convey information:**
   ```tsx
   // ✅ Color + icon + text (multiple signals)
   <div className="text-success flex items-center gap-2">
     <svg className="animate-bounce">✓</svg>
     <span>Success</span>
   </div>
   
   // ❌ Only animation (insufficient)
   <div className="animate-bounce">✓</div>
   ```

4. **Test with animations disabled:**
   - Open browser DevTools
   - Search for "prefers-reduced-motion" in settings
   - Verify UI is still usable and clear

---

## Testing Checklist

### Visual Testing

- [ ] All animations complete smoothly (no jank)
- [ ] Animations are consistent across similar components
- [ ] Loading states are clearly visible
- [ ] Hover effects provide immediate feedback (150-200ms)
- [ ] Modal animations feel natural (300ms max)
- [ ] No animation conflicts (multiple animations on same element)
- [ ] Staggered animations have appropriate delays (100-150ms between items)

### Performance Testing

- [ ] No layout shifts during animations (check with Chrome DevTools)
- [ ] Animations run at 60 FPS (check Performance tab)
- [ ] Transform and opacity are used (not width/height/margin)
- [ ] will-change is only used when necessary
- [ ] Mobile devices can handle animations (test on real device)
- [ ] Multiple simultaneous animations don't cause lag

### Accessibility Testing

- [ ] Animations respect `prefers-reduced-motion`
- [ ] Interactive elements remain clickable during animations
- [ ] Loading states have text alternatives
- [ ] Success/error feedback doesn't rely solely on animation
- [ ] Keyboard focus is visible during transitions
- [ ] Screen readers can still access content during animations

### Cross-Browser Testing

- [ ] Chrome/Edge (Blink engine)
- [ ] Firefox (Gecko engine)
- [ ] Safari (WebKit engine)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Troubleshooting

### Issue 1: Animation Feels Slow/Laggy

**Symptoms:**
- Animation doesn't reach 60 FPS
- Janky or choppy movement
- Delay before animation starts

**Diagnosis:**
```tsx
// Check what properties you're animating
<div className="transition-all duration-200 hover:w-64 hover:h-64 hover:m-4">
  Animating layout properties
</div>
```

**Solution:**
```tsx
// Use transform and opacity instead
<div className="transition-transform duration-200 hover:scale-110">
  GPU-accelerated animation
</div>
```

**Additional Steps:**
1. Open Chrome DevTools → Performance tab
2. Record animation
3. Look for "Layout" and "Paint" events (should be minimal)
4. Ensure "Composite" is doing most of the work (green bars)

### Issue 2: Animation Not Running

**Symptoms:**
- No animation visible
- Instant state change instead of transition

**Diagnosis:**
```tsx
// Missing transition class
<div className="hover:scale-105">No transition defined</div>
```

**Solution:**
```tsx
// Add transition class
<div className="transition-transform duration-200 hover:scale-105">
  Now animates
</div>
```

**Additional Checks:**
- Ensure `duration-*` class is present
- Check if `prefers-reduced-motion` is enabled in your OS
- Verify element is not `display: none` (can't animate)

### Issue 3: Multiple Animations Conflict

**Symptoms:**
- Animations cancel each other out
- Unexpected behavior when combining animations
- Animation restarts mid-transition

**Diagnosis:**
```tsx
// Conflicting animations
<div 
  className="animate-spin" 
  style={{ animation: 'bounce 1s infinite' }}
>
  Two animations on rotation
</div>
```

**Solution:**
```tsx
// Use CSS for custom keyframes or combine with transform
<div className="animate-spin">
  <div className="animate-bounce">
    Nested animations
  </div>
</div>
```

### Issue 4: Modal Opens Too Slowly

**Symptoms:**
- Modal feels sluggish
- User clicks and waits too long
- Poor perceived performance

**Diagnosis:**
```tsx
// Animation too slow
<div className="animate-in zoom-in-95 duration-500">
  Takes half a second to open
</div>
```

**Solution:**
```tsx
// Reduce duration to 300ms max
<div className="animate-in zoom-in-95 duration-300">
  Opens quickly
</div>
```

**Overlay vs Content Timing:**
```tsx
// Fast overlay, slightly slower content for polish
<div className="fixed inset-0 animate-in fade-in duration-200">
  <div className="absolute inset-0 bg-black/50" />
  <div className="relative animate-in zoom-in-95 duration-300">
    Modal content
  </div>
</div>
```

---

## Quick Reference

### Animation Speed Guide

| Interaction | Duration | Example |
|-------------|----------|---------|
| Button hover | 150ms | Color change, scale |
| Link hover | 150ms | Underline, color |
| Input focus | 200ms | Border, shadow |
| Button click | 200ms | Scale, shadow |
| Dropdown open | 200ms | Fade + scale |
| Card hover | 200ms | Lift, shadow |
| Modal open | 300ms | Scale + fade |
| Toast slide | 300ms | Slide + fade |
| Page transition | 500ms | Full page change (rare) |

### Easing Quick Pick

| Use Case | Easing | Why |
|----------|--------|-----|
| Entrance | ease-out | Starts fast, feels responsive |
| Exit | ease-in | Ends fast, feels complete |
| State change | ease-in-out | Smooth start and end |
| Hover | ease or ease-out | Quick response |
| Loading spinner | linear | Constant rotation |

### Common Patterns

```tsx
// Button hover (most common)
className="transition-all duration-150 hover:bg-primary-dark hover:shadow-card active:scale-95"

// Input focus
className="transition-all duration-200 focus:border-primary focus:shadow-focus"

// Card hover lift
className="transition-all duration-200 hover:shadow-dropdown hover:-translate-y-1"

// Modal open
className="animate-in zoom-in-95 fade-in duration-300"

// Loading spinner
className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"

// Success feedback
className="text-success animate-bounce"

// Live indicator
className="relative">
  <span className="absolute animate-ping bg-success rounded-full" />
  <span className="relative bg-success rounded-full" />
</div>
```

---

## Migration Guide

### Step 1: Identify Current Animations

```bash
# Search for inline styles with transition
grep -r "style={{.*transition" src/

# Search for arbitrary Tailwind durations
grep -r "duration-\[" src/

# Search for custom animation CSS
grep -r "@keyframes" src/
```

### Step 2: Map to Design Tokens

| Current | New Token | Reason |
|---------|-----------|--------|
| `transition: 0.1s` | `duration-150` | Closest standard |
| `transition: 0.15s` | `duration-150` | Exact match |
| `transition: 0.2s` | `duration-200` | Exact match |
| `transition: 0.25s` | `duration-200` | Round down |
| `transition: 0.3s` | `duration-300` | Exact match |
| `transition: 0.5s` | `duration-500` | Exact match |
| `transition: 1s` | `duration-500` | Use shorter duration |

### Step 3: Replace Inline Styles

**Before:**
```tsx
<button style={{ transition: 'all 0.2s ease' }} onMouseEnter={...}>
  Hover Me
</button>
```

**After:**
```tsx
<button className="transition-all duration-200">
  Hover Me
</button>
```

### Step 4: Validate with Storybook

1. Check animation stories: `npm run storybook`
2. Navigate to "Design Tokens / Animations"
3. Verify all patterns match your use cases
4. Test in Light and Dark themes

### Step 5: Performance Audit

```bash
# Run Lighthouse audit
npm run build
npm run start
# Open Chrome DevTools → Lighthouse → Performance

# Check for layout shifts during animations
# Ensure all animations hit 60 FPS
```

---

**Related Documentation:**
- [Border Radius Patterns](./radius-patterns.md)
- [Shadow Patterns](./shadow-patterns.md)
- [Color Tokens](./color-tokens.md)
- [Typography Guidelines](./typography-guidelines.md)

**Last Updated:** 2025-01-28
