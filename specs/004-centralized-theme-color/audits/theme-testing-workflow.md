# Theme Testing Workflow

Step-by-step workflow for QA teams to test theme consistency and accessibility in the SolarMatch design system.

**Version**: 1.0  
**Last Updated**: 2025-01-28  
**Testing Tools**: Storybook, Browser DevTools, Accessibility Addon  
**Estimated Time**: 2-3 hours per full theme test cycle

---

## Overview

This workflow guides QA teams through a comprehensive testing process for the SolarMatch design token system. It combines **visual theme consistency testing** with **WCAG AA accessibility compliance testing**.

### Goals
1. Ensure all components render correctly in Light, Dark, and System themes
2. Verify WCAG AA contrast compliance (4.5:1 for text, 3:1 for UI components)
3. Test keyboard navigation and screen reader support
4. Document issues systematically for developer fixes

### Prerequisites
- Storybook is running locally (`npm run storybook`)
- Browser DevTools available (Chrome/Firefox recommended)
- `theme-qa-checklist.md` printed or open in separate tab

---

## Phase 1: Initial Setup (5 minutes)

### Step 1.1: Start Storybook

```powershell
# Navigate to project directory
cd "d:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch"

# Install dependencies (if first time)
npm install

# Start Storybook development server
npm run storybook
```

**Expected Result**: Storybook opens at `http://localhost:6006` in your browser.

### Step 1.2: Verify Storybook Addons

1. **Open Storybook** in Chrome or Firefox
2. **Check bottom panel** for these addons:
   - **Accessibility** tab (icon: wheelchair symbol)
   - **Controls** tab
   - **Actions** tab
3. **If Accessibility addon is missing**:
   - Check `.storybook/main.js` includes `@storybook/addon-a11y`
   - Restart Storybook

### Step 1.3: Prepare Testing Environment

- [ ] Open `specs/004-centralized-theme-color/checklists/theme-qa-checklist.md` in separate window
- [ ] Create new document for tracking issues (Google Doc, Notion, or GitHub Issues)
- [ ] Set browser zoom to 100% (Ctrl+0 / Cmd+0)
- [ ] Close unnecessary browser tabs (reduce distraction)

---

## Phase 2: Theme Consistency Testing (60-90 minutes)

### Step 2.1: Navigate to Theme Consistency Test Page

1. **In Storybook sidebar**, navigate to:
   ```
   Pages → ThemeConsistencyTest
   ```
2. **Click** "All Components Test" story
3. **Verify** page loads with all component sections visible

**Page Structure**:
- **Sticky Theme Switcher** at top (☀️ Light / 🌙 Dark / 💻 System)
- **8 Test Sections**:
  1. Typography Test (H1-H4, body, caption, label)
  2. Color System Test (Brand, Status, Backgrounds, Text)
  3. Button Test (Primary, Secondary, Status variants)
  4. Form Elements Test (Inputs, Select, Checkboxes)
  5. Cards & Elevation (Standard, Hover, Status cards)
  6. Badges & Status (Filled, Outlined, Live indicators)
  7. Alerts (Success, Warning, Error, Info)
  8. Integrated QA Checklist (Visual, Interactive, Theme categories)

### Step 2.2: Test LIGHT Theme

1. **Click** ☀️ Light button in theme switcher
2. **Verify** button shows active state (darker background, white text)
3. **Work through** `theme-qa-checklist.md` Section 1-8 for Light theme
4. **Focus on**:
   - **Colors**: Are brand colors (teal-600, amber-500) visible and distinct?
   - **Contrast**: Is all text readable? Use Accessibility addon to check.
   - **Typography**: Are headings clearly hierarchical (H1 largest → H4 smallest)?
   - **Spacing**: Are cards, buttons, and forms evenly spaced?
   - **Shadows**: Are shadows visible on cards, buttons, and modals?
   - **Interactive Elements**: 
     - Hover over buttons (do they darken or lift?)
     - Focus on inputs with Tab key (does focus ring appear?)
     - Click checkboxes (do they toggle?)
   - **Animations**: Are hover transitions smooth (not janky)?

5. **Document issues** in your tracking document:
   ```
   Issue #1 - Light Theme
   Component: Button - Primary Variant
   Description: Hover state not visible (same color as normal state)
   Severity: High
   Browser: Chrome 120
   Screenshot: [Attach or link]
   ```

6. **Use Integrated QA Checklist** at bottom of page:
   - Check off items as you test
   - If unchecked, note why (e.g., "Hover not working")

### Step 2.3: Test DARK Theme

1. **Click** 🌙 Dark button in theme switcher
2. **Verify** page updates to dark mode (dark background, light text)
3. **Work through** `theme-qa-checklist.md` Section 1-8 for Dark theme
4. **Focus on Dark-Specific Issues**:
   - **No hardcoded light colors**: Are all components using dark variants automatically?
   - **Text contrast**: Is text readable on dark backgrounds? (white/gray text on gray-900)
   - **Borders**: Are borders visible on dark surfaces? (use border-gray-700 or lighter)
   - **Shadows**: Are shadows visible in dark mode? (should be lighter than background)
   - **Images/Logos**: Do images have dark variants if needed?

5. **Common Dark Theme Issues**:
   - White borders disappearing on dark backgrounds
   - Shadows too dark to see (need lighter shadow-dark variants)
   - Hardcoded `text-gray-900` not switching to `text-gray-100`
   - Status colors too bright (may need darker variants for dark mode)

6. **Document any new issues** found in dark theme

### Step 2.4: Test SYSTEM Theme

1. **Click** 💻 System button in theme switcher
2. **Change OS theme preference**:
   - **Windows**: Settings → Personalization → Colors → Choose your mode (Light/Dark)
   - **macOS**: System Preferences → General → Appearance (Light/Dark)
3. **Verify** Storybook theme updates automatically to match OS
4. **Test both OS themes**:
   - Set OS to Light → Verify Storybook is light
   - Set OS to Dark → Verify Storybook is dark
5. **Check for**:
   - Flash of unstyled content (FOUC) when page loads
   - Theme persists after page refresh
   - No console errors related to theme switching

### Step 2.5: Test Responsive Layouts (Optional but Recommended)

1. **Open Browser DevTools** (F12 / Cmd+Option+I)
2. **Click** Device Toolbar icon (Ctrl+Shift+M / Cmd+Shift+M)
3. **Test these viewports**:
   - **iPhone SE (375px)**: All components visible, no overflow
   - **iPad (768px)**: Tablet-optimized layout
   - **Desktop (1920px)**: Full desktop layout
4. **Check for**:
   - Responsive spacing (mobile tighter, desktop more generous)
   - Font sizes scale appropriately
   - Buttons remain tappable (at least 44x44px)

---

## Phase 3: Accessibility Testing (30-45 minutes)

### Step 3.1: Navigate to Accessibility Test Page

1. **In Storybook sidebar**, navigate to:
   ```
   Pages → AccessibilityTest → Contrast Ratio Test
   ```
2. **Open Accessibility addon panel** (bottom of Storybook):
   - Click **Accessibility** tab
   - Wait for automated scan to complete (~5 seconds)

### Step 3.2: Review Contrast Violations

**Accessibility Panel Shows**:
- **Violations**: Red badge with count (e.g., "3 Violations")
- **Passes**: Green badge with count (e.g., "12 Passes")
- **Incomplete**: Yellow badge (manual checks needed)

**For Each Violation**:
1. **Click** on violation in list
2. **Read** the violation description (e.g., "Text has insufficient contrast ratio")
3. **Inspect** highlighted element in story
4. **Note**:
   - Which element (e.g., "Muted text on light background")
   - Current contrast ratio (e.g., "3.2:1")
   - Required ratio (e.g., "4.5:1 for normal text")
   - Which token needs adjustment (e.g., `text-foreground-muted`)

**Common Contrast Issues**:
- **Muted text** too light (gray-400 on white = 2.9:1 ❌, need gray-600 = 4.8:1 ✅)
- **Secondary text** not enough contrast (gray-500 on white = 3.9:1 ❌, need gray-600 ✅)
- **Status text on tinted backgrounds** (e.g., warning-dark on warning-light = 3.1:1 ❌)
- **Outlined buttons** border contrast too low (need darker borders)

### Step 3.3: Test Light vs Dark Contrast

1. **Test Contrast Ratio Test story in LIGHT theme**:
   - Note all violations in Accessibility addon panel
   - Document violations with section name (e.g., "Section 1: Text on Backgrounds")

2. **Switch to DARK theme** (use theme switcher in story)
   - **Re-run** Accessibility addon scan (should auto-refresh)
   - Note if NEW violations appear in dark theme
   - Common issue: Dark mode text too dark on dark background

3. **Compare results**:
   - Are there MORE violations in dark theme?
   - Are specific components failing only in one theme?

### Step 3.4: Keyboard Navigation Testing

1. **In Storybook sidebar**, navigate to:
   ```
   Pages → AccessibilityTest → Keyboard Navigation Test
   ```

2. **Test Focus Indicators**:
   - **Press Tab repeatedly** to cycle through all interactive elements
   - **Check**:
     - Focus ring appears on each element (4px ring at primary color with 30% opacity)
     - Focus ring is clearly visible (contrast ≥ 3:1 against background)
     - Focus order is logical (left-to-right, top-to-bottom)
   - **Common issues**:
     - Focus ring missing on custom components
     - Focus ring same color as background (invisible)
     - Tab order jumps around randomly

3. **Test Screen Reader Labels**:
   - **Enable screen reader** (optional, requires NVDA/JAWS/VoiceOver installed)
   - **Tab to icon-only buttons** (e.g., Edit, Delete, Confirm)
   - **Verify** screen reader announces button purpose (e.g., "Edit item button")
   - **If no screen reader available**:
     - Right-click button → Inspect
     - Check for `aria-label` attribute (e.g., `aria-label="Edit item"`)

4. **Test Keyboard Interactions**:
   - **Buttons**: Press Enter to activate
   - **Checkboxes**: Press Space to toggle
   - **Links**: Press Enter to follow
   - **Dropdowns**: Use Arrow keys to navigate options
   - **Modals**: Press Esc to close (if testing modal stories)

5. **Complete Keyboard Testing Checklist** in story:
   - Check off each criterion as you test
   - Note failures (e.g., "Dropdown not reachable with Tab")

---

## Phase 4: Cross-Browser Testing (30-45 minutes)

### Step 4.1: Test in Multiple Browsers

**Required Browsers**:
- [ ] **Chrome** (most common)
- [ ] **Firefox** (Gecko engine - different rendering)
- [ ] **Safari** (WebKit - macOS/iOS only, known for CSS bugs)
- [ ] **Edge** (Chromium-based, similar to Chrome but test anyway)

**For Each Browser**:
1. Open Storybook at `http://localhost:6006`
2. Navigate to **ThemeConsistencyTest → All Components Test**
3. **Quick visual scan**:
   - Do all components render correctly?
   - Are there any layout shifts or broken styles?
   - Are animations smooth (no jank)?
4. **Test Light and Dark themes**
5. **Document browser-specific issues**:
   ```
   Issue #5 - Safari Dark Theme
   Component: Card hover effect
   Description: Shadow does not increase on hover in Safari 17
   Severity: Medium
   Browser: Safari 17 (macOS Ventura)
   Screenshot: [Attach]
   ```

### Step 4.2: Test on Mobile Devices (Optional but Recommended)

1. **Open Storybook on mobile device**:
   - Same WiFi network: Access `http://<your-local-ip>:6006`
   - Or use ngrok for external access: `npx ngrok http 6006`

2. **Test on**:
   - [ ] **iPhone** (iOS Safari - WebKit)
   - [ ] **Android** (Chrome Mobile - Blink)

3. **Check**:
   - Touch targets are large enough (44x44px minimum)
   - Pinch-to-zoom works (unless intentionally disabled)
   - No hover-only interactions (all features work via tap)

---

## Phase 5: Issue Documentation & Reporting (15-30 minutes)

### Step 5.1: Organize Issues by Severity

**Review all documented issues** and categorize by severity:

#### Critical Issues (Block Production)
- Page completely unusable (e.g., white text on white background)
- Core functionality broken (e.g., buttons not clickable)
- **Action**: Fix immediately before deployment

#### High Issues (Fix Before Launch)
- Major visual problem affecting many users (e.g., poor contrast making text unreadable)
- Accessibility violation affecting keyboard/screen reader users
- **Action**: Fix in next sprint before production

#### Medium Issues (Fix Soon)
- Noticeable inconsistency but workaround available (e.g., spacing off by 4px)
- Minor accessibility issues (e.g., missing alt text on decorative image)
- **Action**: Add to backlog, fix within 1-2 sprints

#### Low Issues (Nice to Have)
- Minor visual inconsistency (e.g., 1px border difference)
- Polishing tasks (e.g., animation timing slightly off)
- **Action**: Add to backlog, fix when time permits

### Step 5.2: Create GitHub Issues

For each **Critical** and **High** issue:

1. **Go to GitHub Issues** in project repository
2. **Create new issue** with template:

```markdown
**Title**: [Component] - [Brief Description] ([Theme])

**Labels**: `bug`, `design-system`, `accessibility` (if applicable)

**Description**:
- **Component/Page**: Button - Primary Variant
- **Theme**: Light Theme
- **Browser**: Chrome 120 (Windows 11)
- **Viewport**: 1920x1080

**Issue**:
Hover state not visible on primary buttons. Button remains the same color when hovered.

**Expected Behavior**:
Button should darken or show shadow on hover (as per design spec).

**Actual Behavior**:
No visual change on hover.

**Contrast Check** (if accessibility issue):
- Current contrast: 3.2:1
- Required contrast: 4.5:1
- WCAG Level: AA (Fail)

**Token to Adjust**:
`src/design-tokens/semantic/colors.ts` → `--color-primary-hover`

**Screenshot**:
[Attach screenshot showing issue]

**Reproduction Steps**:
1. Open Storybook → Pages → ThemeConsistencyTest
2. Switch to Light theme
3. Hover over "Primary Button" in Section 3
4. Observe no color change

**Severity**: High
**Priority**: P1 (Fix before launch)

**Acceptance Criteria**:
- [ ] Hover state shows visible color change (darker primary color)
- [ ] Transition is smooth (150ms duration)
- [ ] Hover state tested in Light, Dark, and System themes
- [ ] Accessibility addon shows no contrast violations
```

3. **Assign issue** to developer or design team
4. **Link related issues** if multiple issues affect same component

### Step 5.3: Create Summary Report

**Create a "Theme QA Test Report"** document with:

```markdown
# Theme QA Test Report

**Test Date**: 2025-01-28  
**Tester**: [Your Name]  
**Storybook Version**: 8.0.0  
**Browser**: Chrome 120, Firefox 121, Safari 17

---

## Summary

- **Total Issues Found**: 12
  - Critical: 1
  - High: 4
  - Medium: 5
  - Low: 2

- **Themes Tested**:
  - ✅ Light Theme (3 issues)
  - ✅ Dark Theme (6 issues)
  - ✅ System Theme (0 issues)

- **Accessibility**:
  - ✅ Contrast violations: 3 (all documented)
  - ✅ Keyboard navigation: 2 issues (focus ring missing)
  - ✅ Screen reader labels: 1 issue (icon button missing aria-label)

---

## Critical Issues

### Issue #1: Button Not Clickable in Dark Theme
- **Component**: Button - Primary Variant (Dark Theme)
- **Description**: Button does not respond to clicks in dark theme
- **GitHub Issue**: #123
- **Status**: Assigned to @developer

---

## High Issues

### Issue #2: Muted Text Insufficient Contrast
- **Component**: Typography - Muted Text (Light Theme)
- **Description**: Muted text (gray-400) has 2.9:1 contrast, needs 4.5:1
- **GitHub Issue**: #124
- **Token to Fix**: `text-foreground-muted` in colors.ts
- **Status**: Assigned to @designer

### Issue #3: Focus Ring Not Visible
- **Component**: Form Input (Dark Theme)
- **Description**: Focus ring uses same color as background, invisible when focused
- **GitHub Issue**: #125
- **Status**: Assigned to @developer

... (continue for all high issues)

---

## Next Steps

1. **Developers fix Critical/High issues** (Est. 2-3 days)
2. **Retest** all affected components (use this workflow again)
3. **Run accessibility scan** again (target: 0 violations)
4. **Get stakeholder approval** (show before/after screenshots)
5. **Deploy to staging** for final QA

---

## Approval Status

- [ ] All Critical issues resolved
- [ ] All High issues resolved or accepted as known limitations
- [ ] Accessibility scan passes (0 violations or only low-severity)
- [ ] Stakeholder sign-off obtained

**QA Lead Approval**: ________________  
**Date**: ________________
```

---

## Phase 6: Retesting After Fixes (1-2 hours)

### Step 6.1: Pull Latest Changes

```powershell
# Update local repository with latest fixes
git pull origin main

# Restart Storybook to reflect changes
npm run storybook
```

### Step 6.2: Focused Retesting

**Instead of full test cycle**, focus on **fixed components only**:

1. **Review GitHub Issues** marked "Fixed"
2. **For each fixed issue**:
   - Navigate to component in Storybook
   - Verify fix is applied (e.g., hover state now works)
   - Test in BOTH Light and Dark themes
   - Run Accessibility addon scan (contrast should now pass)
   - Mark issue as **"Verified"** or **"Still Broken"**

3. **If issue still broken**:
   - Add comment to GitHub Issue with details
   - Re-assign to developer
   - Add "retest-needed" label

### Step 6.3: Regression Testing

**Check that fixes didn't break other components**:

1. **Open ThemeConsistencyTest → All Components Test**
2. **Quick visual scan** of ALL sections
3. **Look for**:
   - New visual bugs introduced by fix
   - Unintended side effects (e.g., fixing button broke card style)
4. **If regression found**:
   - Create new GitHub Issue
   - Link to original fix (e.g., "Regression introduced by #124")

---

## Best Practices

### For Efficient Testing

✅ **Test in this order**: Light → Dark → System (most issues in dark theme)  
✅ **Use Accessibility addon** for automated contrast checks (saves time)  
✅ **Take screenshots immediately** when issue found (easier to document later)  
✅ **Test one theme at a time** (don't switch themes mid-section)  
✅ **Use integrated QA checklist** in ThemeConsistencyTest story (track progress)  

### For Accurate Reporting

✅ **Be specific**: "Muted text on white background" not just "text color wrong"  
✅ **Include contrast ratios**: "3.2:1 (needs 4.5:1)" not just "fails contrast"  
✅ **Note which token to fix**: "`text-foreground-muted` in colors.ts"  
✅ **Provide reproduction steps**: Step-by-step instructions for developer  
✅ **Attach screenshots**: Visual proof of issue (with annotations if needed)  

### Common Pitfalls

❌ **Avoid testing at wrong zoom level** (use 100% zoom for accurate results)  
❌ **Don't skip dark theme** (most issues found in dark mode)  
❌ **Don't ignore accessibility violations** (legal requirement in many jurisdictions)  
❌ **Don't batch test multiple themes** (easy to lose track of which theme has issue)  
❌ **Don't forget to retest** after fixes (developers make mistakes too)  

---

## Tools & Resources

### Required Tools
- **Storybook**: Component development environment
- **Accessibility Addon**: Built-in WCAG compliance checker
- **Browser DevTools**: Inspect elements, responsive design mode

### Recommended Browser Extensions
- **Axe DevTools**: Advanced accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Google's accessibility/performance auditor
- **ColorZilla**: Color picker for manual contrast checks

### External Tools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Responsive Viewer**: Test multiple viewports simultaneously
- **ngrok**: Expose localhost for mobile device testing

### Documentation
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Design Token Specification**: `specs/004-centralized-theme-color/user-stories/`
- **Theme QA Checklist**: `specs/004-centralized-theme-color/checklists/theme-qa-checklist.md`

---

## Frequently Asked Questions

### Q: How long does a full test cycle take?
**A**: 2-3 hours for comprehensive testing (Light, Dark, System themes + accessibility + cross-browser). Focused retesting takes 1 hour.

### Q: Do I need to test every single component on every page?
**A**: No. Use **ThemeConsistencyTest story** as your primary test page (has all component types). Then spot-check a few real pages (homepage, dashboard) for context-specific issues.

### Q: What if Accessibility addon shows 50+ violations?
**A**: This is common in early testing. **Prioritize contrast violations** (most common and easiest to fix). Document top 5-10 violations first, then batch the rest in a single "Accessibility Audit" issue.

### Q: Should I test in Internet Explorer?
**A**: **No**. IE is officially unsupported by Microsoft (June 2022). Focus on evergreen browsers (Chrome, Firefox, Safari, Edge).

### Q: What if I find an issue but don't know which token to fix?
**A**: Document the issue anyway with as much detail as possible. Developer will identify the correct token. You can hint at it (e.g., "likely text-foreground-muted") but not required.

### Q: Can I test without Storybook (directly on live site)?
**A**: **Not recommended**. Storybook provides isolated component testing + Accessibility addon integration. Live site testing is for **final validation** only (after Storybook testing passes).

---

## Changelog

**v1.0 (2025-01-28)**:
- Initial workflow created
- Includes Light/Dark/System theme testing
- WCAG AA accessibility compliance testing
- Keyboard navigation and screen reader testing
- Cross-browser testing guidelines
- Issue documentation templates

**Future Improvements**:
- Add Chromatic visual regression testing (once account set up)
- Add performance testing (Lighthouse scores)
- Add automated screenshot diffing
- Add localization testing (RTL languages)

---

**Questions or Feedback?**  
Contact the Design System team or create an issue in GitHub with the `design-system` label.
