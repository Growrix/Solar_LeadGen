# Countdown Timer UI Improvement Specification

## Current Implementation vs. Desired Implementation

### Current (Phase 4 - Basic)
- ❌ Shows static badge: "7 days remaining"
- ❌ Updates only every 10 seconds
- ❌ Simple color dot indicator
- ❌ Positioned inline with status badges

### Desired (Phase 4.5 - Enhanced Live Countdown)
- ✅ Shows **live countdown**: "5d 23h 45m 30s remaining"
- ✅ Updates **every second** (1000ms interval)
- ✅ Full-width progress bar at **top of lead card**
- ✅ Visual progress bar showing time remaining percentage
- ✅ Smooth animations and transitions

---

## Visual Design Specification

### Position & Layout
```
┌─────────────────────────────────────────────────────┐
│ [████████████████░░░░░░] 5d 23h 45m 30s remaining │ ← Countdown Bar (Top of Card)
├─────────────────────────────────────────────────────┤
│ Lead Card Content                                   │
│ • Quote Type Icon                                   │
│ • Status Badge                                      │
│ • Location, Property Details                        │
│ • Action Buttons                                    │
└─────────────────────────────────────────────────────┘
```

### Component Hierarchy
```tsx
<div className="lead-card">
  {expiresAt && (
    <LiveCountdownBar 
      expiresAt={expiresAt}
      leadId={leadId}
      position="top" // full-width bar at top
    />
  )}
  <div className="lead-card-content">
    {/* existing card content */}
  </div>
</div>
```

---

## Technical Specifications

### Time Format Display

#### Format Logic:
- **>= 1 day**: "Xd Yh Zm Ws remaining"
- **< 1 day, >= 1 hour**: "Xh Ym Zs remaining"
- **< 1 hour**: "Xm Ys remaining"
- **< 1 minute**: "Xs remaining"
- **Expired**: "EXPIRED" (red background, white text)

#### Examples:
- 7 days, 5 hours → "7d 5h 0m 0s remaining"
- 23 hours, 45 minutes → "23h 45m 30s remaining"
- 45 minutes, 12 seconds → "45m 12s remaining"
- 30 seconds → "30s remaining"
- 0 seconds → "EXPIRED"

### Progress Bar Calculation

```typescript
// Total duration = Initial countdown days converted to seconds
const totalSeconds = countdownDays * 24 * 60 * 60;

// Remaining seconds = Time left until expiresAt
const remainingSeconds = Math.max(0, (expiresAt.getTime() - now.getTime()) / 1000);

// Progress percentage
const progressPercent = (remainingSeconds / totalSeconds) * 100;
```

### Color Coding (Same as Phase 4)

- **Green (6+ days)**: `bg-green-500 text-green-50`
- **Yellow (3-5 days)**: `bg-yellow-500 text-yellow-50`
- **Red (1-2 days)**: `bg-red-500 text-red-50`
- **Expired (0 days)**: `bg-gray-700 text-white`

### Update Frequency

- **Current**: Every 10 seconds (10,000ms)
- **New**: Every 1 second (1,000ms) for live updates
- **Optimization**: Use `requestAnimationFrame` for smooth transitions

---

## Component Design

### New Component: `LiveCountdownBar.tsx`

```typescript
interface LiveCountdownBarProps {
  expiresAt: string;        // ISO timestamp
  leadId: string;
  position?: 'top' | 'inline'; // default: 'top'
  showProgressBar?: boolean;   // default: true
  compact?: boolean;           // default: false
}

interface LiveCountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  progressPercent: number;
  colorClass: 'green' | 'yellow' | 'red' | 'expired';
  isExpired: boolean;
}
```

### Visual States

#### State 1: Healthy (6+ days)
```
┌─────────────────────────────────────────────────────┐
│ [████████████████████████████████] 7d 5h 23m 45s   │ Green Bar
└─────────────────────────────────────────────────────┘
```

#### State 2: Warning (3-5 days)
```
┌─────────────────────────────────────────────────────┐
│ [████████████████████░░░░░░░░░░] 4d 12h 30m 15s    │ Yellow Bar
└─────────────────────────────────────────────────────┘
```

#### State 3: Critical (1-2 days)
```
┌─────────────────────────────────────────────────────┐
│ [██████░░░░░░░░░░░░░░░░░░░░░░░░░░] 1d 3h 15m 42s   │ Red Bar
└─────────────────────────────────────────────────────┘
```

#### State 4: Expired
```
┌─────────────────────────────────────────────────────┐
│ EXPIRED - Lead no longer available                  │ Gray Bar
└─────────────────────────────────────────────────────┘
```

---

## Implementation Locations

### 1. Homeowner Dashboard (`src/app/homeowner/dashboard/page.tsx`)
```tsx
<div className="lead-card">
  <LiveCountdownBar 
    expiresAt={lead.expiresAt} 
    leadId={lead.id}
    position="top"
  />
  {/* rest of lead card */}
</div>
```

### 2. Admin Leads Table (`src/app/admin/leads/page.tsx`)
```tsx
// Option A: Add column with compact countdown
<td>
  <LiveCountdownBar 
    expiresAt={lead.expiresAt}
    leadId={lead.id}
    position="inline"
    compact={true}
  />
</td>

// Option B: Keep existing column, upgrade to live updates
```

### 3. Installer Feed (`src/components/InstallerLeadFeed.tsx`)
```tsx
<div className="lead-card">
  <LiveCountdownBar 
    expiresAt={lead.expiresAt}
    leadId={lead.id}
    position="top"
  />
  {/* rest of lead card */}
</div>
```

---

## Performance Considerations

### Battery & CPU Optimization
- Use single interval per component (not per countdown element)
- Pause updates when tab/component not visible (`document.visibilityState`)
- Clear intervals on unmount to prevent memory leaks

### Animation Performance
- Use CSS transitions for progress bar width changes
- Use `transform` instead of `width` for smoother animations (optional)
- Throttle re-renders if needed (React.memo)

---

## Accessibility

### ARIA Labels
```tsx
<div 
  role="timer"
  aria-live="polite"
  aria-atomic="true"
  aria-label={`Lead expires in ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`}
>
```

### Screen Reader Announcements
- Announce major milestones: "1 day remaining", "1 hour remaining"
- Don't announce every second (too noisy)
- Announce when expired

---

## Dark Mode Support

### Light Mode Colors
- Green: `bg-green-500` + `text-green-50`
- Yellow: `bg-yellow-500` + `text-yellow-50`
- Red: `bg-red-500` + `text-red-50`
- Progress Track: `bg-gray-200`

### Dark Mode Colors
- Green: `dark:bg-green-600` + `dark:text-green-50`
- Yellow: `dark:bg-yellow-600` + `dark:text-yellow-50`
- Red: `dark:bg-red-600` + `dark:text-red-50`
- Progress Track: `dark:bg-gray-700`

---

## Migration Plan

### Phase 4.5 Tasks
1. Create new `LiveCountdownBar.tsx` component with 1-second updates
2. Update countdown calculation utility to return days/hours/minutes/seconds breakdown
3. Replace `CountdownTimerCompact` usage in homeowner dashboard
4. Update admin leads table countdown column
5. Update installer feed countdown display
6. Test live updates and performance
7. Verify dark mode appearance
8. Accessibility audit

### Backward Compatibility
- Keep existing `CountdownTimer.tsx` for reference
- Can deprecate after Phase 4.5 complete
- Or rename to `CountdownTimerLegacy.tsx`

---

## Success Criteria

✅ Countdown updates every second (live)
✅ Shows format: "Xd Yh Zm Ws remaining"
✅ Progress bar at top of lead card (full width)
✅ Color-coded based on time remaining
✅ Smooth transitions when time changes
✅ Works in light and dark mode
✅ Accessible to screen readers
✅ No performance issues (CPU/battery)
✅ Visible on all dashboards (homeowner, admin, installer)
✅ Pauses updates when tab inactive (optimization)
