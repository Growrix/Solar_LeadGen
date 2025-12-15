# Visual Testing Guide - Instant Quote UX Fixes

## Issue #1: Quote Result Appears Below the Fold (CRITICAL!)

### ❌ BEFORE (Wrong) - Screenshot 2
```
Hero Section (top of page)
      ↓
Calculator Section 
  [Step 1 & 2 form - User scrolled past this]
      ↓
      ↓ [User's viewport is HERE after clicking "Get My Quote"]
      ↓
Newsletter Section
  [Quote Result renders HERE - WRONG! User can't see it!]
```

**Problem**: 
- User clicks "Get My Quote" 
- Loading spinner shows
- Result renders at BOTTOM of page (below newsletter)
- User sees blank space and wonders "where's my quote?"
- User must scroll UP to find the result

**Visual Evidence**: Screenshot 2 shows result with newsletter section visible = WRONG!

---

### ✅ AFTER (Correct) - Screenshot 1
```
Hero Section (top of page)
      ↓
[User's viewport scrolls HERE automatically] 🎯
      ↓
Calculator Section (at TOP of screen)
  [Step Indicator: 1 → 2 → ✓]
  [Quote Result appears HERE - CORRECT!]
  [User sees result immediately!]
      ↓
Newsletter Section (below, out of view)
```

**Fixed**: 
- User clicks "Get My Quote"
- Loading spinner shows
- Result renders AND page auto-scrolls to show it at TOP
- User immediately sees their quote prominently displayed
- Natural, expected behavior

**Visual Evidence**: Screenshot 1 shows step indicators at top = CORRECT!

---

## Issue #2: "Get Another Quote" Jump Bug (CRITICAL!)

### ❌ BEFORE (Wrong) - Jarring Jump

**User Journey**:
1. User fills out form → Gets quote result
2. User scrolls down to newsletter section (bottom of page)
3. User clicks "Get Another Quote" button
4. ❌ **BUG**: Page jumps DOWN to newsletter, then scrolls back UP to calculator
5. ❌ Jarring "bounce" effect - looks broken!

```
[Hero Section]
       ↓
[Calculator] ← Target destination
       ↓
       ↓ 
       ↓
[Newsletter] ← Page jumps HERE first! 🐛
       ⤴
       ⤴ Then scrolls back up (bounce effect)
       ⤴
[Calculator] ← Finally arrives here
```

**What User Sees**:
- Click button
- Page jumps down (WTF?)
- Page scrolls back up (confusing!)
- Looks like a bug/glitch

---

### ✅ AFTER (Correct)

**User Journey**:
1. User fills out form → Gets quote result
2. User scrolls down to newsletter section (bottom of page)
3. User clicks "Get Another Quote" button
4. ✅ Form resets AND page auto-scrolls back up
5. ✅ User immediately sees fresh form ready to use

```
[Hero Section]
       ↓
[Calculator] ← Auto-scrolls here! 🎯
  [Fresh Form Ready]
       ↓
       ↓ (User was here)
       ↓
[Newsletter]
```

---

## How to Test

### Test #1: Result Appears at Top (PRIMARY TEST)

**Steps**:
1. Open the homepage
2. Scroll to "How Much Could You Save?" section
3. Click "Instant Quote" tab (should be active by default)
4. Fill in Step 1: Postcode (e.g., 2000), Location (Sydney), State (NSW) → Click "Next Step"
5. Fill in Step 2: 
   - Select "Quarterly bill" 
   - Enter $600
   - Select Budget "$10,000 - $20,000"
   - Select Roof Type "Tile"
6. Click "Get My Quote" button
7. **WATCH YOUR SCREEN POSITION**: 
   - Loading spinner shows
   - Page should smoothly scroll up
   - Result appears AT TOP of your viewport

**CRITICAL CHECKS**:
- ✅ **PASS**: Step indicator (1 → 2 → ✓) is visible at top of screen
- ✅ **PASS**: "Your Instant Residential Solar Quote" header is immediately visible
- ✅ **PASS**: You see the three metric cards (Out-of-Pocket, Payback, Savings) without scrolling
- ✅ **PASS**: Matches Screenshot 1 layout
- ❌ **FAIL**: Result is below the fold (need to scroll up to see it)
- ❌ **FAIL**: Matches Screenshot 2 layout (newsletter visible = wrong!)

**Expected Behavior**:
- Smooth scroll animation (~0.5 seconds)
- Calculator section appears at top of viewport
- Result is prominently displayed
- No manual scrolling needed to see quote

---

### Test #2: No Jump on Reset (PRIMARY TEST)

**Steps**:
1. Complete Test #1 above (get to quote result screen)
2. **Scroll all the way down** to the Newsletter section at bottom of page
3. You should see: "Stay Updated" newsletter signup form
4. Scroll back up to the quote result section
5. Locate the **"Get Another Quote"** button (gray button on the right side)
6. Click it
7. **WATCH VERY CLOSELY**: Your screen should scroll smoothly UP to calculator

**CRITICAL CHECKS**:
- ✅ **PASS**: Single smooth scroll motion directly to calculator
- ✅ **PASS**: NO intermediate jump to newsletter section
- ✅ **PASS**: NO "bounce" effect (down then up)
- ✅ **PASS**: Form resets to Step 1 during scroll (seamless)
- ✅ **PASS**: Calculator appears at top of viewport
- ❌ **FAIL**: Page jumps down briefly before scrolling up
- ❌ **FAIL**: You see newsletter section flash during transition
- ❌ **FAIL**: Multiple scroll movements instead of one smooth scroll

**Expected Behavior**:
- Click button
- Smooth single scroll animation (~0.5-1 second)
- Direct path to calculator (no detours!)
- Form resets to Step 1 with empty fields
- Calculator section at top of viewport
- Professional, polished feel

---

## Edge Cases to Test

### Accessibility - Reduced Motion
**Setup**:
- **Windows**: Settings > Ease of Access > Display > Show animations
- **macOS**: System Preferences > Accessibility > Display > Reduce motion
- **Linux**: Depends on DE (GNOME: Settings > Universal Access)

**Expected**:
- Animation still works but without motion effects
- Instant appearance instead of slide/fade
- Scroll behavior may be instant instead of smooth

---

### Mobile Testing
**Devices to test**:
- iOS Safari (iPhone)
- Android Chrome
- Tablet (iPad/Android)

**Expected**:
- Touch scrolling should work smoothly
- Animation should perform at 60fps
- No layout shifts or jumping

---

### Different Screen Sizes
**Test at**:
- Desktop: 1920x1080
- Laptop: 1366x768
- Tablet: 768x1024
- Mobile: 375x667

**Expected**:
- Animation works at all sizes
- Scroll position correctly targets calculator
- No horizontal scrolling

---

## Common Issues & Solutions

### Issue: Animation looks choppy
**Cause**: Low-end device or too many browser tabs  
**Solution**: Close other tabs, check GPU acceleration enabled

### Issue: Scroll doesn't happen
**Cause**: JavaScript error or ID mismatch  
**Solution**: Open DevTools Console, check for errors

### Issue: Scroll happens but wrong position
**Cause**: Calculator section ID not found  
**Solution**: Verify `calculator-section` ID exists in page.tsx

---

## Sign-off Checklist

Test these scenarios and check each box:

**Animation**:
- [ ] Result slides DOWN from top (not up from bottom)
- [ ] Animation is smooth (~0.5s duration)
- [ ] Opacity fades in during animation
- [ ] Works on Chrome/Edge
- [ ] Works on Firefox
- [ ] Works on Safari
- [ ] Works on mobile browsers

**Navigation**:
- [ ] "Get Another Quote" resets form
- [ ] Page auto-scrolls to calculator section
- [ ] Calculator appears at top of viewport
- [ ] No manual scrolling needed
- [ ] Works from any scroll position
- [ ] Works on all browsers
- [ ] Works on mobile devices

**Accessibility**:
- [ ] Animation respects "reduce motion" setting
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announces changes properly

---

## Approval

**QA Tester**: ___________________  
**Date**: ___________________  
**Status**: [ ] PASS [ ] FAIL  
**Notes**: ___________________

---

If all checkboxes are ✅, this feature is **READY FOR PRODUCTION**! 🚀
