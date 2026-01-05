# Migration Quick Reference Card

**Use this checklist for EVERY component migration to avoid false completion reports.**

---

## ⚠️ BEFORE YOU START

### Step 1: Map Component Tree
```powershell
# Find all imports in main file
Select-String -Path "src\app\[path]\page.tsx" -Pattern "import.*from.*@/components"
```

**List ALL files:**
- Main file: `src/app/[path]/page.tsx`
- Child 1: `src/components/[name].tsx`
- Child 2: `src/components/[name].tsx`
- Child 3: `src/components/[name].tsx`

**DO NOT proceed without this list!**

---

## 🔍 VERIFICATION (Run on EVERY file)

```powershell
# Copy this exact script and modify $file paths:

$file = "src\components\YourComponent.tsx"  # Change this

Write-Host "`n=== Verifying $file ===" -ForegroundColor Cyan

# Command 1: Gray/slate colors
$cmd1 = (Select-String -Path $file -Pattern "text-gray-|text-slate-|text-zinc-|bg-gray-|bg-slate-|bg-zinc-|border-gray-|border-slate-" -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "1. Gray/slate: $cmd1" -ForegroundColor $(if ($cmd1 -eq 0) { "Green" } else { "Red" })

# Command 2: Dark mode classes
$cmd2 = (Select-String -Path $file -Pattern "dark:" -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "2. Dark mode: $cmd2" -ForegroundColor $(if ($cmd2 -eq 0) { "Green" } else { "Red" })

# Command 3: RGB/HEX colors
$cmd3 = (Select-String -Path $file -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" -ErrorAction SilentlyContinue | Where-Object { $_.Line -notmatch "viewBox|fill=|d=" } | Measure-Object).Count
Write-Host "3. RGB/HEX: $cmd3" -ForegroundColor $(if ($cmd3 -eq 0) { "Green" } else { "Red" })

# Command 4: White/black
$cmd4 = (Select-String -Path $file -Pattern "text-white\b|bg-white\b|text-black\b|bg-black\b|border-white\b" -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "4. White/black: $cmd4" -ForegroundColor $(if ($cmd4 -eq 0) { "Green" } else { "Red" })

# Command 5: Typography
$cmd5 = (Select-String -Path $file -Pattern "text-xs|text-sm|text-lg|text-xl|text-2xl|text-3xl|font-bold|font-semibold|font-medium" -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "5. Typography: $cmd5" -ForegroundColor $(if ($cmd5 -eq 0) { "Green" } else { "Red" })

# Command 6: Responsive
$cmd6 = (Select-String -Path $file -Pattern "sm:text-|md:text-|lg:text-|xl:text-" -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "6. Responsive: $cmd6" -ForegroundColor $(if ($cmd6 -eq 0) { "Green" } else { "Red" })

# Summary
$total = $cmd1 + $cmd2 + $cmd3 + $cmd4 + $cmd5 + $cmd6
if ($total -eq 0) {
    Write-Host "✅ CLEAN: 0/0/0/0/0/0" -ForegroundColor Green
} else {
    Write-Host "❌ INCOMPLETE: $total violations ($cmd1/$cmd2/$cmd3/$cmd4/$cmd5/$cmd6)" -ForegroundColor Red
}
```

**Expected Result:** `✅ CLEAN: 0/0/0/0/0/0` for EVERY file

---

## 🎨 SEMANTIC TOKENS (Use These)

### ✅ What EXISTS:
```tsx
// Backgrounds
className="bg-background"  // Body, structural containers
className="bg-surface"     // Cards, modals, inputs (elevated)

// Text
className="text-foreground"       // Primary text
className="text-muted-foreground" // Secondary text
className="text-success"          // Success text
className="text-error"            // Error text

// Borders
className="border-border"   // Standard borders
className="border-success"  // Success borders
className="border-error"    // Error borders

// Shadows (neumorphic)
className="shadow-neu-outset"  // Elevated elements (cards, modals)
className="shadow-neu-inset"   // Pressed/input elements
```

### ❌ What DOES NOT EXIST (Never Use):
```tsx
className="bg-card"          // ❌ Use bg-surface instead
className="bg-elevated"      // ❌ Use bg-surface instead
className="bg-modal"         // ❌ Use bg-surface instead
className="text-default"     // ❌ Use text-foreground instead
className="border-default"   // ❌ Use border-border instead
```

---

## 📋 COMMON REPLACEMENTS

### Card/Modal Containers:
```tsx
// ❌ OLD:
className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"

// ✅ NEW:
className="bg-surface shadow-neu-outset border-border"
```

### Text:
```tsx
// ❌ OLD:
className="text-gray-900 dark:text-white"

// ✅ NEW:
className="text-foreground"
```

### Status Colors:
```tsx
// ❌ OLD:
className="text-green-600 dark:text-green-400"

// ✅ NEW:
className="text-success"
```

### Input Fields:
```tsx
// ❌ OLD:
className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"

// ✅ NEW:
className="bg-surface border-border shadow-neu-inset"
```

---

## 🧪 VISUAL TESTING (Mandatory)

1. Open browser to component
2. Open DevTools (F12) → Console tab
3. Test each theme:

### Dark Theme (#121212):
- [ ] No white cards/areas visible
- [ ] Text is readable (good contrast)
- [ ] Shadows visible on cards/modals
- [ ] No gray bleed-through

### Light Theme (#E0E5EC):
- [ ] Neumorphic shadows visible (soft, subtle)
- [ ] Text is readable (not too light)
- [ ] Cards appear slightly raised
- [ ] No harsh shadows

### Purple Theme (#2C1D4D):
- [ ] Purple accent colors visible
- [ ] Purple shadows on cards
- [ ] Text is readable
- [ ] Status colors (success/error) still work

### Theme Switching:
- [ ] No flash of wrong colors
- [ ] Smooth transition
- [ ] No console errors
- [ ] No CSS variable warnings

---

## 📝 REPORTING FORMAT (Copy This)

```markdown
### Migration Verification Report: [Component Name]

**Component Tree:**
- Main: src/app/[path]/page.tsx
- Child 1: src/components/[name].tsx
- Child 2: src/components/[name].tsx

**Verification Results:**
- Main: 0/0/0/0/0/0 ✅ CLEAN
- Child 1: 0/0/0/0/0/0 ✅ CLEAN
- Child 2: 15/47/0/8/0/0 ❌ INCOMPLETE

**Visual Testing:**
- Dark: ❌ Not tested (Child 2 incomplete)
- Light: ❌ Not tested (Child 2 incomplete)
- Purple: ❌ Not tested (Child 2 incomplete)

**Runtime Testing:**
- Console: N/A (incomplete)
- Theme switch: N/A (incomplete)

**Migration Status: INCOMPLETE** ❌

**Reason:** Child 2 has 70 violations (15 gray + 47 dark + 8 white)

**Next Steps:**
1. Migrate Child 2
2. Re-verify Child 2 (expect 0/0/0/0/0/0)
3. When all clean → Run visual tests
4. When visual tests pass → Mark complete
```

---

## 🚫 NEVER DO THIS

### ❌ False Completion Report:
```
Migration complete! ✅
```
**Why it's wrong:** Doesn't show which files were checked, doesn't show verification results.

### ❌ Vague Status:
```
All components migrated
```
**Why it's wrong:** No proof (no 0/0/0/0/0/0 results), no file list.

### ❌ Main File Only:
```
page.tsx verified clean ✅
```
**Why it's wrong:** Doesn't check child components. Page can still show white areas if children have hardcoded colors.

### ❌ Assuming Clean:
```
Child components should be fine, they were migrated before
```
**Why it's wrong:** Never assume. Always verify. Components may have been partially migrated or regressed.

---

## ✅ COMPLETION CHECKLIST

**ONLY mark complete when ALL are true:**

- [ ] Component tree mapped (all files listed)
- [ ] ALL files show 0/0/0/0/0/0 verification
- [ ] Dark theme visual test passed
- [ ] Light theme visual test passed
- [ ] Purple theme visual test passed
- [ ] Console shows 0 errors during interaction
- [ ] Theme switching is smooth (no flash)
- [ ] Detailed report created with all file results
- [ ] User explicitly confirmed visual appearance is correct

**If ANY checkbox is unchecked, status is INCOMPLETE.**

---

## 📚 Reference Documents

- Full spec: `specs/006-component-by-component/DESIGN-SYSTEM-SOT.md`
- Pain points: `specs/006-component-by-component/MIGRATION-PAIN-POINTS.md`
- Token reference: `DOC/COLOR-PALETTE-GUIDE.md`
- Migration standards: `DOC/MIGRATION-REFERENCE.md`

---

## 🆘 Troubleshooting

### "I see white areas after migration"
→ Run 6-command verification on ALL child components, not just main file

### "Dark theme shows gray instead of theme color"
→ Search for `dark:` classes, replace with semantic tokens

### "Shadows don't appear in Light theme"
→ Check if `shadow-neu-outset` is applied to cards/modals

### "Status colors (green/red) don't work"
→ Use `text-success`/`text-error`, not `text-green-600 dark:text-green-400`

### "Theme switching causes flash"
→ Check for hardcoded colors (RGB/HEX) in inline styles

---

**Version:** 1.0 (November 5, 2025)  
**Purpose:** Prevent false completion reports and ensure thorough migrations  
**Mandatory for:** ALL component migrations going forward
