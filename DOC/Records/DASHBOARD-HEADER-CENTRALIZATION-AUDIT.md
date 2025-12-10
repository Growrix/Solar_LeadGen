# Dashboard Header Centralization - Audit Report
**Date**: November 6, 2025  
**Phase**: 7  
**Status**: Planning  
**Purpose**: Centralize dashboard header UI/UX across all 3 user dashboards using semantic CSS classes

---

## 🎯 Objective

Create a unified, semantic CSS class-based approach for dashboard headers across Admin, Homeowner, and Installer dashboards. Similar to sidebar centralization, we want to:
- Control header styling from one place (`globals.css`)
- Maintain functionality differences per dashboard
- Remove hardcoded colors and typography
- Ensure multi-theme support (Dark, Light, Purple)

---

## 📊 Current State Analysis

### 1. **AdminHeader** (Extracted Component - ✅ SOT)
**Location**: `src/components/AdminHeader.tsx`  
**Lines**: 12 lines  
**Status**: ✅ Already extracted, simple and clean

**Structure**:
```tsx
<header className="h-20 flex items-center justify-end px-4 sm:px-8 bg-transparent">
  <ThemeSwitcher />
</header>
```

**Features**:
- ✅ Fixed height: `h-20`
- ✅ Semantic background: `bg-transparent`
- ✅ Responsive padding: `px-4 sm:px-8`
- ✅ Right-aligned content: `justify-end`
- ✅ Only ThemeSwitcher (minimal design)

**Issues**: NONE ✅

---

### 2. **HomeownerDashboardHeader** (Embedded Component - ⚠️ Needs Extraction)
**Location**: `src/app/homeowner/dashboard/page.tsx` (lines 274-330)  
**Lines**: 56 lines  
**Status**: ⚠️ Embedded in 1386-line page file

**Structure**:
```tsx
<header className="h-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 bg-transparent backdrop-blur-sm">
  <div>{pageTitle}</div>
  <div>
    <SearchInput />
    <ThemeSwitcher />
    <HelpButton />
    <NotificationButton />
    <UserAvatar />
  </div>
</header>
```

**Features**:
- ✅ Fixed height: `h-20`
- ✅ Semantic background: `bg-transparent backdrop-blur-sm`
- ✅ Page title display
- ✅ Expandable search input
- ✅ Theme switcher
- ✅ Help button
- ✅ Notification badge (animated pulse)
- ✅ User avatar with Image component

**Issues**:
- ❌ Embedded in large page file (56 lines)
- ❌ Some hardcoded typography: `text-heading-4`, `text-body-small`
- ⚠️ Uses mostly semantic classes (good!)
- ⚠️ Search toggle state management

---

### 3. **InstallerDashboardHeader** (Embedded Component - ⚠️ Needs Extraction)
**Location**: `src/app/installer/dashboard/page.tsx` (lines 184-245)  
**Lines**: 61 lines  
**Status**: ⚠️ Embedded in 444-line page file

**Structure**:
```tsx
<header className="glass-header h-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-8">
  <div>{pageTitle}</div>
  <div>
    <SearchInput />
    <ThemeSwitcher theme={theme} setTheme={setTheme} />
    <HelpButton />
    <NotificationButton />
    <UserAvatar />
  </div>
</header>
```

**Features**:
- ✅ Fixed height: `h-20`
- ⚠️ Custom class: `glass-header` (may be legacy)
- ✅ Page title display
- ✅ Expandable search input
- ✅ Theme switcher (with explicit props)
- ✅ Help button
- ✅ Notification badge
- ✅ User avatar with img tag

**Issues**:
- ❌ Embedded in page file (61 lines)
- ❌ Uses `glass-header` class (check if needed)
- ❌ Hardcoded typography: `text-lg font-bold`, `text-sm`
- ❌ Hardcoded colors: `ring-white dark:ring-black/50` (notification badge)
- ❌ Non-semantic classes: `bg-surface`, `hover:bg-surface-hover`, `text-subtle`
- ⚠️ Uses img tag instead of Next Image
- ⚠️ ThemeSwitcher props inconsistency

---

## 🔍 Comparison Table

| Feature | Admin | Homeowner | Installer | Notes |
|---------|-------|-----------|-----------|-------|
| **Location** | Extracted ✅ | Embedded ⚠️ | Embedded ⚠️ | Need to extract 2 |
| **Lines of Code** | 12 | 56 | 61 | - |
| **Height** | `h-20` | `h-20` | `h-20` | ✅ Consistent |
| **Background** | `bg-transparent` | `bg-transparent backdrop-blur-sm` | `glass-header` | ⚠️ Inconsistent |
| **Page Title** | NO | YES | YES | Different needs |
| **Search Input** | NO | YES | YES | Different needs |
| **Theme Switcher** | YES | YES | YES | ✅ All have it |
| **Help Button** | NO | YES | YES | Different needs |
| **Notifications** | NO | YES | YES | Different needs |
| **User Avatar** | NO | YES | YES | Different needs |
| **Semantic Classes** | ✅ 100% | ✅ 90% | ⚠️ 60% | Installer needs work |
| **Hardcoded Colors** | ✅ NONE | ✅ NONE | ❌ YES | `ring-white dark:ring-black` |
| **Hardcoded Typography** | ✅ NONE | ⚠️ Semantic tokens | ❌ YES | `text-lg font-bold text-sm` |

---

## 🎨 Proposed Semantic Class System

Based on the **AdminHeader** as SOT, here are the semantic classes needed:

### **Base Header**
```css
.dashboard-header {
  @apply h-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 bg-transparent;
}

.dashboard-header--blur {
  @apply backdrop-blur-sm;
}
```

### **Header Section (Left/Right)**
```css
.dashboard-header__left {
  @apply flex items-center space-x-4;
}

.dashboard-header__right {
  @apply flex items-center space-x-1 sm:space-x-2;
}
```

### **Page Title**
```css
.dashboard-header__title {
  @apply text-heading-4 font-bold text-foreground;
}
```

### **Search Input Container**
```css
.dashboard-header__search {
  @apply flex items-center justify-end transition-colors duration-normal;
}

.dashboard-header__search--active {
  @apply bg-muted rounded-card;
}

.dashboard-header__search-input {
  @apply bg-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-normal ease-in-out text-body-small text-foreground placeholder:text-muted-foreground;
}

.dashboard-header__search-input--collapsed {
  @apply w-0 p-0;
}

.dashboard-header__search-input--expanded {
  @apply w-32 sm:w-40 py-2 pl-3 pr-2;
}
```

### **Action Buttons (Search, Help, Notifications)**
```css
.dashboard-header__action-btn {
  @apply p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors duration-fast shadow-neu-inset hover:shadow-neu-outset-sm;
}

.dashboard-header__action-btn--hidden-sm {
  @apply hidden sm:block;
}
```

### **Notification Badge**
```css
.dashboard-header__notification-badge {
  @apply absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-error ring-2 ring-background animate-pulse;
}
```

### **User Avatar**
```css
.dashboard-header__avatar {
  @apply rounded-full ring-2 ring-border hover:ring-primary transition-all duration-fast shadow-neu-outset;
}

.dashboard-header__avatar-img {
  @apply w-9 h-9 sm:w-10 sm:h-10 rounded-full;
}
```

---

## 📋 Implementation Plan

### **Phase 7: Dashboard Header Centralization**

**Total Tasks**: 8 subtasks  
**Estimated Time**: 2 hours

### **Task 7.1**: Create semantic CSS classes in globals.css (20 min)
- Add all header classes listed above
- Follow BEM-like naming convention
- Use semantic tokens only

### **Task 7.2**: Extract HomeownerDashboardHeader to component (25 min)
- Create `src/components/homeowner/HomeownerDashboardHeader.tsx`
- Apply semantic classes
- Update `homeowner/dashboard/page.tsx` to import
- Remove embedded component (56 lines)

### **Task 7.3**: Extract InstallerDashboardHeader to component (25 min)
- Create `src/components/installer/InstallerDashboardHeader.tsx`
- Apply semantic classes
- Fix hardcoded colors (`ring-white dark:ring-black/50` → `ring-background`)
- Fix hardcoded typography (`text-lg font-bold` → `.dashboard-header__title`)
- Update `installer/dashboard/page.tsx` to import
- Remove embedded component (61 lines)

### **Task 7.4**: Update AdminHeader to use semantic classes (10 min)
- Already extracted ✅
- Apply `.dashboard-header` class
- Ensure consistency with other 2 headers

### **Task 7.5**: Fix ThemeSwitcher prop inconsistencies (15 min)
- Homeowner: Uses no props (reads from context)
- Installer: Uses explicit `theme` and `setTheme` props
- Standardize approach (prefer context-based)

### **Task 7.6**: Run 6-command verification on all 3 headers (10 min)
- Check for hardcoded gray/slate colors
- Check for dark: mode classes
- Check for hardcoded white/black
- Check for RGB/HEX colors
- Check for hardcoded typography
- Check for manual responsive classes
- **Expected Result**: 0/0/0/0/0/0 for all 3 headers

### **Task 7.7**: Visual verification - All 3 themes (15 min)
- Test Dark, Light, Purple themes on all 3 dashboards
- Verify header height, spacing, alignment
- Check hover states, focus states
- Verify search input animation
- Check notification badge animation

### **Task 7.8**: Functional verification (10 min)
- Test search input expand/collapse
- Test theme switcher on all 3 dashboards
- Test help button (if implemented)
- Test notification badge visibility
- Test user avatar click (if implemented)

---

## ✅ Success Criteria

1. **All 3 headers extracted** to separate component files
2. **Zero hardcoded colors** - 100% semantic tokens
3. **Zero hardcoded typography** - Use semantic text classes
4. **6-command verification passed** - 0/0/0/0/0/0 for all headers
5. **Multi-theme support** - Works in Dark, Light, Purple
6. **Consistent structure** - All use same semantic class pattern
7. **Functionality preserved** - Search, theme switcher, badges work identically
8. **TypeScript compiles** - No header-related errors

---

## 📁 Files to Modify

### **New Files** (2):
- `src/components/homeowner/HomeownerDashboardHeader.tsx`
- `src/components/installer/InstallerDashboardHeader.tsx`

### **Modified Files** (6):
- `src/app/globals.css` (add ~120 lines of header classes)
- `src/components/AdminHeader.tsx` (apply semantic classes)
- `src/app/homeowner/dashboard/page.tsx` (import header, remove 56 lines)
- `src/app/installer/dashboard/page.tsx` (import header, remove 61 lines)
- `src/components/ThemeSwitcher.tsx` (potentially standardize props)
- `specs/006-component-by-component/tasks.md` (add Phase 7)

---

## 🔗 Dependencies

- **Phase 6 Complete** ✅ (Dashboard Sidebar Centralization)
- **globals.css** - Where semantic classes will be added
- **ThemeSwitcher component** - Already exists, may need prop standardization
- **Next.js Image component** - For Homeowner avatar (already used)

---

## 🚨 Risks & Mitigations

**Risk 1**: Breaking search input functionality during extraction  
**Mitigation**: Test search expand/collapse on all dashboards after extraction

**Risk 2**: Theme switcher prop inconsistencies cause errors  
**Mitigation**: Standardize to context-based approach before extraction

**Risk 3**: Notification badge animation may break with semantic classes  
**Mitigation**: Test animation in all 3 themes after migration

**Risk 4**: `glass-header` class removal may change Installer header appearance  
**Mitigation**: Check if `glass-header` has styles in globals.css, replicate if needed

---

## 💡 Design Decision: Keep It Simple

Following the same successful approach as Phase 6:
1. **Semantic CSS classes** in `globals.css` (not a wrapper component)
2. **Extract embedded components** to separate files
3. **Preserve all functionality** - only change className strings
4. **Use AdminHeader as the reference** - simplest, cleanest structure

**Why this approach?**
- ✅ 90% of benefits, 10% of complexity
- ✅ Easy to update styling (one place)
- ✅ No component wrapper overhead
- ✅ Proven success with sidebar centralization

---

## 📝 Notes

- **AdminHeader is already perfect** - minimal, clean, extracted
- **Homeowner header is mostly good** - uses semantic tokens, just needs extraction
- **Installer header needs most work** - hardcoded colors, typography, needs extraction
- **All 3 headers have different features** - this is intentional, preserve it!
- **Total code reduction**: ~117 lines (56 + 61 removed from page files)

---

**Next Step**: Add Phase 7 to `tasks.md` and begin implementation! 🚀
