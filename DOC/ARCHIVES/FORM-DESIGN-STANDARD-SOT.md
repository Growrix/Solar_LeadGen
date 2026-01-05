# Form Design Standard - Source of Truth (SOT)
**Purpose**: Unified design system for all form components  
**Date**: November 1, 2025  
**Status**: Active Standard

---

## 🎯 Overview

This document defines the **single source of truth** for all form designs in the application. Every form component—whether authentication, user profile, lead generation, or admin panels—should follow these standards.

---

## 📋 Design Principles

1. **Neumorphic Design**: All form elements use shadow-neu-outset/inset
2. **Design Tokens Only**: Zero hardcoded colors or typography
3. **Consistent Spacing**: Standardized padding, margins, and gaps
4. **Accessible**: WCAG 2.1 AA compliant
5. **Type-Safe**: Full TypeScript interfaces
6. **Reusable**: Component-based architecture

---

## 🎨 CSS Classes (globals.css)

### Input Fields

#### `.neu-input` - Standard Input
```css
.neu-input {
  @apply w-full bg-surface border border-border rounded-xl py-3 px-4;
  @apply text-foreground placeholder:text-muted-foreground;
  @apply transition-all duration-200;
  @apply focus:border-primary focus:shadow-neu-inset focus:outline-none;
  @apply shadow-neu-inset;
}
```

**Features:**
- ✅ Neumorphic inset shadow (gives depth)
- ✅ Focus state with enhanced shadow
- ✅ Smooth transitions
- ✅ Semantic color tokens

**Usage:**
```tsx
<input className="neu-input" />
// OR use AuthInput component which applies this automatically
```

---

#### Placeholder Styling
```css
.neu-input::placeholder {
  @apply text-muted-foreground opacity-60;
  @apply transition-opacity duration-200;
}

.neu-input:focus::placeholder {
  @apply opacity-40; /* Fade on focus for better UX */
}
```

**Effect:**
- Placeholder starts at 60% opacity
- Fades to 40% when user focuses (less distraction)
- Smooth transition

---

#### `.neu-input-error` - Error State
```css
.neu-input-error {
  @apply neu-input border-destructive;
}
```

**Usage:**
```tsx
<input className={error ? 'neu-input-error' : 'neu-input'} />
```

---

### Input Icons

#### `.auth-input-icon` - Icon Inside Input (Left)
```css
.auth-input-icon {
  @apply absolute left-4 top-1/2 -translate-y-1/2;
  @apply text-muted-foreground pointer-events-none;
  @apply transition-colors duration-200;
}

/* Icon highlights slightly when input is focused */
.neu-input:focus ~ .auth-input-icon,
.neu-input:focus + .auth-input-icon {
  @apply text-subtle;
}
```

**Features:**
- ✅ Perfectly centered vertically
- ✅ 16px (1rem) spacing from left edge
- ✅ Non-interactive (pointer-events-none)
- ✅ Color transitions on focus

**HTML Structure:**
```tsx
<div className="relative">
  <input className="neu-input pl-12" />
  <div className="auth-input-icon">
    <MailIcon />
  </div>
</div>
```

**Important:** Input needs `pl-12` (48px) to accommodate icon

---

### Form Header Icons

#### `.auth-icon-container` - Neumorphic Icon Wrapper
```css
.auth-icon-container {
  @apply w-20 h-20 bg-surface rounded-[1.25rem];
  @apply flex items-center justify-center;
  @apply shadow-neu-outset;
  @apply transition-all duration-300;
}

.auth-icon-container:hover {
  @apply shadow-neu-outset-lg; /* Enhanced shadow on hover */
}
```

**Features:**
- ✅ **80x80px** (w-20 h-20) - optimal size for form headers
- ✅ **Neumorphic outset shadow** - appears raised
- ✅ **Rounded corners** (20px) for softer appearance
- ✅ **Hover effect** - shadow grows on hover
- ✅ **Surface background** - matches theme

**Usage:**
```tsx
<div className="auth-icon-container mx-auto mb-6">
  <UserIcon className="h-10 w-10 text-white" />
</div>
```

**Recommended Icon Sizes:**
- Form headers: `h-10 w-10` (40x40px)
- Input fields: `h-5 w-5` (20x20px)
- Buttons: `h-5 w-5` (20x20px)

---

#### `.auth-icon-container-pressed` - Pressed State (Optional)
```css
.auth-icon-container-pressed {
  @apply w-20 h-20 bg-surface rounded-[1.25rem];
  @apply flex items-center justify-center;
  @apply shadow-neu-inset; /* Inset = pressed in */
}
```

Use this for active/selected states in multi-step forms or toggles.

---

## 🧩 Component Architecture

### Standard Form Structure

```tsx
<AuthModal
  isOpen={isOpen}
  onClose={onClose}
  title="Form Title"
  description="Brief description of what this form does"
  icon={<IconComponent className="h-10 w-10 text-white" />}
>
  {/* Alerts at top */}
  {error && <AuthAlert type="error" message={error} />}
  {success && <AuthAlert type="success" message={success} />}
  
  {/* Optional: Social auth or alternative methods */}
  <SocialAuthButtons
    onGoogleSignIn={handleGoogle}
    onAppleSignIn={handleApple}
  />
  
  <AuthDivider />
  
  {/* Main form */}
  <form onSubmit={handleSubmit} className="space-y-4">
    {/* Input fields */}
    <AuthInput
      type="email"
      name="email"
      placeholder="Email Address"
      value={formData.email}
      onChange={handleChange}
      icon={<MailIcon />}
      error={errors.email}
      required
    />
    
    <AuthInput
      type="password"
      name="password"
      placeholder="Password"
      value={formData.password}
      onChange={handleChange}
      icon={<LockIcon />}
      showPasswordToggle
      error={errors.password}
      required
    />
    
    {/* Optional links */}
    <div className="text-right">
      <button
        type="button"
        onClick={handleForgotPassword}
        className="text-body-small text-primary hover:underline"
      >
        Forgot Password?
      </button>
    </div>
    
    {/* Submit button */}
    <AuthButton
      type="submit"
      variant="primary"
      loading={loading}
      disabled={loading}
    >
      Submit
    </AuthButton>
  </form>
  
  {/* Footer links */}
  <div className="mt-6 text-center">
    <p className="text-body-small text-subtle">
      Additional info or links here
    </p>
  </div>
</AuthModal>
```

---

## 📐 Spacing Standards

### Form Spacing (Inside Form Tag)
```tsx
<form className="space-y-4"> {/* 16px gap between children */}
```

### Modal Padding
```tsx
<div className="theme-card p-8"> {/* 32px padding all sides */}
```

### Header Spacing
```tsx
<div className="text-center mb-8"> {/* 32px bottom margin */}
  <div className="auth-icon-container mx-auto mb-6"> {/* 24px below icon */}
  <h2 className="mb-2"> {/* 8px below title */}
```

### Footer Spacing
```tsx
<div className="mt-6"> {/* 24px top margin */}
```

---

## 🎨 Color Token Reference

### Input Colors
- **Background**: `bg-surface`
- **Border**: `border-border`
- **Text**: `text-foreground`
- **Placeholder**: `text-muted-foreground`
- **Focus Border**: `border-primary`

### Icon Colors
- **Default**: `text-muted-foreground`
- **Focused**: `text-subtle`
- **Header Icon**: `text-white` (on primary background)

### Alert Colors
- **Error**: `text-destructive`, `bg-destructive/10`
- **Success**: `text-success`, `bg-success/10`
- **Warning**: `text-warning`, `bg-warning/10`
- **Info**: `text-info`, `bg-info/10`

---

## 📏 Typography Standards

### Form Headers
- **Title**: `text-heading-2` (2xl, 24px)
- **Description**: `text-body-small` (sm, 14px)

### Form Elements
- **Input text**: Inherits from `text-foreground`
- **Labels**: `text-body` (base, 16px)
- **Helper text**: `text-body-small` (sm, 14px)
- **Error messages**: `text-caption` (xs, 12px)

### Links
- **Standard**: `text-body-small text-primary hover:underline`
- **Small**: `text-caption text-primary hover:underline`

---

## 🔍 Validation & Error Handling

### Error Display Pattern
```tsx
// Individual field errors
<AuthInput
  error={errors.email}
  // Component handles error styling and message display
/>

// Form-level errors
{error && <AuthAlert type="error" message={error} />}

// Success messages
{success && <AuthAlert type="success" message={success} />}
```

### Error State Styling
- Input border changes to `border-destructive`
- Error message appears below in `text-destructive`
- Icon color remains `text-muted-foreground` (for consistency)

---

## ♿ Accessibility Requirements

### All Inputs Must Have:
```tsx
<input
  id="unique-id"
  name="fieldName"
  aria-label="Descriptive label"
  aria-invalid={hasError ? "true" : "false"}
  aria-describedby={hasError ? "field-error" : undefined}
  required={isRequired}
/>
```

### All Errors Must Have:
```tsx
<p
  id="field-error"
  role="alert"
  className="text-caption text-destructive"
>
  {errorMessage}
</p>
```

### All Modals Must Have:
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
```

---

## 🚀 Implementation Checklist

When creating a new form, ensure:

- [ ] Uses `AuthModal` wrapper (or equivalent themed container)
- [ ] Header icon uses `.auth-icon-container`
- [ ] All inputs use `AuthInput` component or `.neu-input` class
- [ ] Input icons properly positioned with `.auth-input-icon`
- [ ] Proper spacing (`space-y-4` for form, `mb-8` for header, etc.)
- [ ] All buttons use `AuthButton` component or `.neu-btn-*` classes
- [ ] Error/success states use `AuthAlert` component
- [ ] No hardcoded colors (only design tokens)
- [ ] No hardcoded typography (only semantic classes)
- [ ] Full accessibility (ARIA labels, keyboard nav, focus states)
- [ ] TypeScript types for all props
- [ ] Loading states handled properly
- [ ] Form validation implemented

---

## 📝 Examples

### Login Form
```tsx
<AuthModal icon={<UserIcon />} title="Welcome Back">
  <SocialAuthButtons onGoogleSignIn={...} />
  <AuthDivider />
  <form className="space-y-4">
    <AuthInput type="email" icon={<MailIcon />} />
    <AuthInput type="password" icon={<LockIcon />} showPasswordToggle />
    <AuthButton type="submit">Sign In</AuthButton>
  </form>
</AuthModal>
```

### Registration Form
```tsx
<AuthModal icon={<UserCircleIcon />} title="Create Account">
  <form className="space-y-4">
    <AuthInput type="text" icon={<UserIcon />} placeholder="Full Name" />
    <AuthInput type="email" icon={<MailIcon />} placeholder="Email" />
    <AuthInput type="tel" icon={<PhoneIcon />} placeholder="Phone" />
    <AuthInput type="password" icon={<LockIcon />} showPasswordToggle />
    <AuthButton type="submit" loading={loading}>Sign Up</AuthButton>
  </form>
</AuthModal>
```

### Profile Form
```tsx
<div className="theme-card p-8">
  <div className="text-center mb-8">
    <div className="auth-icon-container mx-auto mb-6">
      <UserIcon className="h-10 w-10 text-white" />
    </div>
    <h2 className="text-heading-2">Update Profile</h2>
  </div>
  
  <form className="space-y-4">
    {/* Form fields */}
  </form>
</div>
```

---

## 🔧 Customization Guidelines

### When to Customize
- Multi-step forms: Add progress indicator
- Complex inputs: Extend AuthInput with custom validation
- Unique layouts: Use base classes but maintain spacing standards

### What NOT to Customize
- ❌ Shadow styles (always use shadow-neu-*)
- ❌ Color tokens (always use design system)
- ❌ Typography scale (always use text-heading-*, text-body-*)
- ❌ Border radius (always use rounded-xl for consistency)

---

## 📊 Component Dependencies

```
AuthModal (wrapper)
  ├── auth-icon-container (header icon)
  ├── SocialAuthButtons (optional)
  │   └── AuthButton (social variant)
  ├── AuthDivider (optional)
  ├── AuthAlert (errors/success)
  ├── AuthInput (form fields)
  │   ├── neu-input (styling)
  │   ├── auth-input-icon (left icon)
  │   └── EyeIcon/EyeOffIcon (password toggle)
  └── AuthButton (submit)
```

---

## 🎯 Benefits of This Standard

1. **Consistency**: All forms look and feel the same
2. **Maintainability**: Update one place, affects all forms
3. **Speed**: New forms can be built in minutes
4. **Quality**: Built-in accessibility and best practices
5. **Scalability**: Easy to extend with new patterns
6. **Theming**: Change theme once, all forms update

---

## 📚 Related Documentation

- `AUTH-COMPONENTS-AUDIT.md` - Initial audit findings
- `AUTH-MIGRATION-PROGRESS.md` - Migration status
- `globals.css` (lines 760-820) - CSS implementation
- `/src/components/auth/` - Component implementations

---

**Maintained By**: Development Team  
**Last Updated**: November 1, 2025  
**Version**: 1.0.0

---

**Remember**: This is the **Source of Truth** for all form designs. When in doubt, refer to this document.
