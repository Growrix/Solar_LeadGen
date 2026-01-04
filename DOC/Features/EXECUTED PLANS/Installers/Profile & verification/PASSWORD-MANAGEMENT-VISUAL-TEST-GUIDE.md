# Password Management Visual Test Guide

**Location**: Installer Profile Page → Security Section  
**URL**: `/installer/dashboard` → Click "Profile" in sidebar → Scroll to "Security" section

---

## 📍 Where to Find It

1. Log in as an installer
2. Navigate to Profile page
3. Scroll down past:
   - Company Details section
   - Services & Coverage section
   - Documents & Logo section
4. **Security section** should be visible with:
   - Heading: "Security"
   - Subheading: "Manage your password and security settings"

---

## 🎨 What You Should See

### Security Section Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Security                                                      │
│ Manage your password and security settings                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Current Password *                                            │
│ [Enter current password                        ]              │
│                                                               │
│ New Password *                                                │
│ [Enter new password                           ]              │
│ Password must contain:                                        │
│ • At least 12 characters                                      │
│ • Uppercase letter (A-Z)                                      │
│ • Lowercase letter (a-z)                                      │
│ • Number (0-9)                                                │
│ • Special character (!@#$%)                                   │
│                                                               │
│ Confirm New Password *                                        │
│ [Confirm new password                         ]              │
│                                                               │
│ [Change Password]  (button)                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Visual Checks

### 1. Card Styling
- [ ] Card has neumorphic shadow (`shadow-neu-outset`)
- [ ] Card has rounded corners (`rounded-xl`)
- [ ] Card has border (`border-border`)
- [ ] Background color matches theme

### 2. Input Fields
- [ ] All 3 input fields have neumorphic inset shadow
- [ ] Input fields have rounded corners
- [ ] Placeholder text is visible
- [ ] Border color matches theme
- [ ] Focus state shows primary color ring

### 3. Password Requirements
- [ ] Requirements list is visible below "New Password"
- [ ] Requirements show as bullet points
- [ ] Text color is muted when not met
- [ ] Text color changes to **green** when requirement is met (while typing)

### 4. Button
- [ ] "Change Password" button is visible
- [ ] Button is **disabled** (grayed out) when fields are empty
- [ ] Button is **enabled** (clickable) when all fields are filled
- [ ] Button has hover effect

### 5. Error Messages
- [ ] Space below each input for error messages
- [ ] Error text appears in **red** color
- [ ] Error text is small but readable

---

## 🧪 Interactive Checks

### Test 1: Real-time Validation Indicators

**Action**: Start typing in "New Password" field

**Expected Behavior**:
```
Type: "a"
• At least 12 characters          (gray)
• Uppercase letter (A-Z)          (gray)
• Lowercase letter (a-z)          (✓ GREEN)
• Number (0-9)                    (gray)
• Special character (!@#$%)       (gray)

Type: "aB1@"
• At least 12 characters          (gray)
• Uppercase letter (A-Z)          (✓ GREEN)
• Lowercase letter (a-z)          (✓ GREEN)
• Number (0-9)                    (✓ GREEN)
• Special character (!@#$%)       (✓ GREEN)

Type: "aB1@aB1@aB1@"  (12 chars)
• At least 12 characters          (✓ GREEN)
• Uppercase letter (A-Z)          (✓ GREEN)
• Lowercase letter (a-z)          (✓ GREEN)
• Number (0-9)                    (✓ GREEN)
• Special character (!@#$%)       (✓ GREEN)
```

### Test 2: Button State

**Scenario A**: Empty fields
- [ ] Button text is "Change Password"
- [ ] Button is grayed out (disabled)
- [ ] Cannot click button

**Scenario B**: All fields filled
- [ ] Button becomes clickable
- [ ] Button has hover effect
- [ ] Can click button

### Test 3: Error Display

**Action**: Fill wrong current password + click button

**Expected**:
- [ ] Red error text appears below "Current Password" field
- [ ] Error message: "Current password is incorrect"
- [ ] Other fields remain filled

**Action**: Fill mismatched passwords + click button

**Expected**:
- [ ] Red error text appears below "Confirm New Password" field
- [ ] Error message: "Passwords do not match"

---

## 🎨 Theme Testing

### Dark Theme
- [ ] Background: Dark surface color
- [ ] Text: Light foreground color
- [ ] Borders: Visible but subtle
- [ ] Shadows: Neumorphic depth visible

### Light Theme
- [ ] Background: Light surface color
- [ ] Text: Dark foreground color
- [ ] Borders: Visible but subtle
- [ ] Shadows: Neumorphic depth visible

### Purple Theme
- [ ] Background: Purple-tinted surface
- [ ] Text: Appropriate contrast
- [ ] Primary color: Purple accent
- [ ] Shadows: Purple-tinted depth

---

## 📱 Responsive Testing

### Desktop (1440px)
- [ ] Security card width: Max 500-600px
- [ ] All elements visible without scroll
- [ ] Proper spacing

### Tablet (768px)
- [ ] Card adjusts to screen width
- [ ] Input fields stack properly
- [ ] Button remains at bottom

### Mobile (375px)
- [ ] Card takes full width (with margins)
- [ ] Text remains readable
- [ ] Button accessible
- [ ] Requirements list readable

---

## 🔍 Accessibility Checks

### Keyboard Navigation
- [ ] Can tab through all 3 input fields
- [ ] Can tab to button
- [ ] Enter key submits form (when button focused)

### Screen Reader
- [ ] Label "Current Password *" associated with input
- [ ] Label "New Password *" associated with input
- [ ] Label "Confirm New Password *" associated with input
- [ ] Required field indicator (*) announced

### Contrast
- [ ] Text color has sufficient contrast with background
- [ ] Error messages clearly visible
- [ ] Success indicators clearly visible

---

## ✅ Final Checklist

Before marking as complete, verify:
- [ ] All visual elements render correctly
- [ ] Real-time validation works
- [ ] Button state changes work
- [ ] Error messages display correctly
- [ ] All 3 themes look good
- [ ] Mobile responsive works
- [ ] Keyboard navigation works

---

## 🐛 Common Issues to Watch For

### If password requirements don't change color:
- **Cause**: JavaScript validation not running
- **Fix**: Check browser console for errors

### If button stays disabled:
- **Cause**: State not updating
- **Fix**: Check all 3 fields are filled

### If styling looks wrong:
- **Cause**: Semantic classes not loading
- **Fix**: Check globals.css is loaded

### If submit doesn't work:
- **Cause**: API endpoint issue
- **Fix**: Check browser Network tab for 401/403/500 errors

---

**Status**: Ready for visual testing  
**Time Required**: 10 minutes  
**Prerequisites**: Logged in as installer with profile access
