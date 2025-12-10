# Instant Quote Form - Partial Migration Progress Tracker

**File**: `src/components/InstantQuoteForm.tsx`  
**Date Started**: 2025-10-29  
**Approach**: Strategic partial migration (theme-critical elements only)  
**Target**: ~131 out of 840 total values (16%)

---

## Migration Status: IN PROGRESS (16%)

### ✅ Completed Migrations (21/131 values = 16%)

#### 1. Base Input Styles (Line 717) - ✅ DONE
**Values Migrated**: 4/4 (100%)
- `bg-gray-100 dark:bg-slate-900` → `bg-surface`
- `border-gray-300 dark:border-slate-700` → `border-border`
- `text-slate-900 dark:text-white` → `text-foreground`
- `placeholder-slate-500 dark:placeholder-slate-400` → `placeholder-subtle`

**Impact**: ALL 20+ input fields now theme-aware automatically

---

#### 2. Quote Type Selector (Lines 740-770) - ✅ DONE
**Values Migrated**: 12/12 (100%)

**Cards** (Residential/Commercial):
- Selected border: `border-primary` (already semantic) ✅
- Selected bg: `bg-primary/10` (already semantic) ✅
- Inactive border: `border-gray-300 dark:border-slate-700` → `border-border`
- Inactive bg: `bg-gray-100/20 dark:bg-slate-800/20` → `bg-surface/20`
- Hover border: `hover:border-slate-400 dark:hover:border-slate-600` → `hover:border-muted`

**Icon Backgrounds**:
- Active: `bg-primary/20 text-primary` (already semantic) ✅
- Inactive: `bg-gray-200 dark:bg-slate-700` → `bg-muted`
- Inactive text: `text-slate-600 dark:text-slate-300` → `text-subtle`

**Text**:
- Title: `text-slate-900 dark:text-white` → `text-foreground`
- Subtitle: `text-slate-500 dark:text-slate-400` → `text-subtle`

---

#### 3. Step Indicators (Lines 778-781) - ✅ DONE
**Values Migrated**: 4/4 (100%)

**Circle Indicators**:
- Active: `bg-primary text-white` (already semantic) ✅
- Inactive bg: `bg-gray-200 dark:bg-slate-800` → `bg-muted`
- Inactive text: `text-slate-500 dark:text-slate-400` → `text-subtle`

**Progress Lines**:
- Completed: `bg-primary` (already semantic) ✅
- Pending: `bg-gray-200 dark:bg-slate-800` → `bg-muted`

---

#### 4. Section Heading (Line 790) - ✅ DONE
**Values Migrated**: 1/15 headings (7%)
- "Step 1: Your Property Details": `text-slate-900 dark:text-white` → `text-foreground`

**Remaining Headings**: 14 more (Lines 945, 1106, 1288, 1383, etc.)

---

#### 5. Field Label (Line 794) - ✅ DONE
**Values Migrated**: 1/20 labels (5%)
- "Postcode" label: `text-slate-600 dark:text-slate-300` → `text-label`

**Remaining Labels**: 19 more labels throughout form

---

### ⏳ In Progress (0/131 = 0%)

Currently working on next batch...

---

### ❌ Not Started (110/131 = 84%)

#### High Priority - Toggle Switches (20 values)
**Locations**: Lines 896, 1100, 1261, 1276, 1398, 1535, 1550, 1565, 1580
**Pattern**:
- Active: `bg-primary` (already semantic, no change needed)
- Inactive: `bg-slate-300 dark:bg-slate-600` → `bg-toggle-inactive` (NEW TOKEN NEEDED)
- Thumb: `bg-white` → Keep as-is (functional, not thematic)

**Examples**:
- "Do you already have solar panels?" toggle
- "Is it a three-phase power supply?" toggle
- "Power Optimizers", "Microinverters" toggles
- "Include Battery Storage" toggle
- VPP, EV Charging, Smart Home, Grid Services toggles

---

#### High Priority - Card/Section Backgrounds (14 values)
**Pattern 1**: Fieldset backgrounds
- Lines: 886, 1100, 1247, 1521
- Current: `bg-gray-100/30 dark:bg-slate-800/30`
- Target: `bg-card/30`

**Pattern 2**: Info card backgrounds
- Lines: 1025, 1247, 1671, 1741
- Current: `bg-gray-50/50 dark:bg-slate-800/50`
- Target: `bg-surface/50`

---

#### High Priority - Electricity Usage Options (10 values)
**Location**: Lines 955, 990
**Pattern**:
- Selected: `border-primary bg-primary/10` (already semantic)
- Unselected border: `border-gray-300 dark:border-slate-700` → `border-border`
- Unselected bg: `bg-gray-100/20 dark:bg-slate-800/20` → `bg-surface/20`
- Hover: `hover:border-slate-400` → `hover:border-muted`
- Radio indicator: `border-slate-400` → `border-muted`
- Text: `text-slate-900 dark:text-white` → `text-foreground`
- Subtitle: `text-slate-600 dark:text-slate-400` → `text-subtle`

---

#### Medium Priority - Primary Buttons (3 values)
**Location**: Lines 935, 1593
**Pattern**:
- Base: `bg-primary text-white` (already semantic)
- Hover: `hover:bg-teal-700` → `hover:bg-primary-hover`
- Focus ring: `focus:ring-primary` (already semantic)

---

#### Medium Priority - Secondary Buttons (4 values)
**Location**: Line 1593
**Pattern**:
- Base bg: `bg-gray-200 dark:bg-slate-700` → `bg-secondary`
- Base text: `text-slate-700 dark:text-slate-300` → `text-secondary-foreground`
- Hover: `hover:bg-gray-300 dark:hover:bg-slate-600` → `hover:bg-secondary-hover`

---

#### Medium Priority - Slider Track (1 value)
**Location**: Line 1084
- Current: `bg-gray-200 dark:bg-gray-700`
- Target: `bg-slider-track` (NEW TOKEN NEEDED)

---

#### Medium Priority - Info/Highlight Boxes (6 values)
**Pattern 1**: Primary info box
- Location: Lines 1036
- Current: `bg-primary/10 border border-primary/30`
- Target: Already semantic ✅

**Pattern 2**: Blue info box
- Location: Lines 1408, 1603
- Current: `bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`
- Target: `bg-info-subtle border-info` (NEW TOKENS NEEDED)

---

#### Low Priority - Results Section - Cost Breakdown (12 values)
**Location**: Lines 1671-1733
**Patterns**:
- Container: `bg-slate-50/50 dark:bg-slate-800/50` → `bg-surface/50`
- Border: `border-slate-200 dark:border-slate-700` → `border-border`
- Row backgrounds: `bg-white/50 dark:bg-slate-700/30` → `bg-card/50`
- Final price section: `bg-primary/5 dark:bg-primary/10 border-primary/20` (already semantic)

---

#### Low Priority - Results Section - System Specs (6 values)
**Location**: Lines 1741-1760
**Same patterns as cost breakdown**:
- Container: `bg-surface/50 border-border`
- Stat cards: `bg-card/50`

---

#### Remaining Section Headings (14 values)
**Locations**: Lines 945, 1106, 1288, 1383, plus more
**Pattern**: `text-slate-900 dark:text-white` → `text-foreground`

---

#### Remaining Field Labels (19 values)
**Pattern**: `text-slate-600 dark:text-slate-300` → `text-label`
**Locations**: Throughout form (lines 815, 834, 862, 907, etc.)

---

## New Tokens Added to Design System

### ✅ Added
1. **`text-label`** - Form field labels (added to semantic/colors.ts + tailwind.config.js)
   - Light: `#6b7280`
   - Dark: `#A0A0A0`

### ⚠️ Still Needed
1. **`bg-toggle-inactive`** - Inactive toggle switch background
2. **`bg-slider-track`** - Range slider track background
3. **`bg-info-subtle`** - Info box subtle background
4. **`border-info`** - Info box border
5. **`bg-secondary`** - Secondary button background
6. **`text-secondary-foreground`** - Secondary button text
7. **`hover:bg-secondary-hover`** - Secondary button hover
8. **`bg-card`** - Card/container backgrounds (may already exist)

---

## Testing Checklist

### ✅ Completed
- [x] TypeScript compilation (0 errors after initial changes)
- [x] Added `text-label` token to semantic colors
- [x] Updated tailwind config with new token

### ⏳ In Progress
- [ ] Complete all 131 target migrations
- [ ] Build test
- [ ] Visual inspection

### ❌ Not Started
- [ ] Theme switching (Light/Dark/System)
- [ ] Interactive states testing
- [ ] Chromatic snapshot
- [ ] QA checklist

---

## Time Estimates

- **Completed**: ~30 minutes (21/131 values = 16%)
- **Remaining High Priority**: ~60 minutes (toggle switches, cards, usage options = 44 values)
- **Remaining Medium Priority**: ~30 minutes (buttons, slider, info boxes = 14 values)
- **Remaining Low Priority**: ~45 minutes (results sections, remaining headings/labels = 51 values)

**Total Estimated Remaining**: ~2.5 hours

---

## Deferred Work (709/840 values = 84%)

See `instant-quote-form-audit-PARTIAL.md` for full details.

**Key Deferred Categories**:
- Form validation colors (red-500, etc.) - Functional, not thematic
- Spacing/sizing utilities - Not color-related
- Loading spinners - Minor UI elements
- Chart/graph colors - Separate system
- Success/warning/error semantic colors - Already correct

---

## Notes

**Current State**: Partial migration in progress. Core input system and quote type selector fully migrated. Toggle switches and card backgrounds are the next high-impact targets.

**Next Actions**:
1. Complete toggle switch migrations (20 values)
2. Migrate card/section backgrounds (14 values)
3. Update electricity usage options (10 values)
4. Test build and theme switching
5. Create Storybook story
6. Run Chromatic
7. Commit with clear documentation

**Future Full Migration**: 709 values remaining (84% of total), estimated 6-8 additional hours.
