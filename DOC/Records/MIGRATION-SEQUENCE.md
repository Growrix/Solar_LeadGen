# Component Migration Sequence - UI Hierarchy Approach

**Strategy**: Top-to-bottom, gradual migration following user visual journey  
**Principle**: Migrate navigation element + ALL connected modals atomically for complete user flow testing

---

## 🎯 Visual Migration Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PHASE 3: TOP NAVIGATION LAYER                   │
│  TopBar (visible first) → Connected Modals (installer auth flow)   │
├─────────────────────────────────────────────────────────────────────┤
│  TopBar                                                             │
│    ├─→ "Become a Partner" → InstallerEligibilityModal             │
│    │                        ├─→ Eligible → InstallerSignupModal    │
│    │                        └─→ Already have account?              │
│    └─→ "Partner Sign In"  → InstallerSignInModal                   │
│                              └─→ Success → Installer Dashboard      │
│                                                                     │
│  ✅ Complete installer onboarding flow migrated atomically         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   PHASE 4: MAIN NAVIGATION LAYER                    │
│   HeaderMenu (main nav) → Connected Modals (homeowner auth flow)   │
├─────────────────────────────────────────────────────────────────────┤
│  HeaderMenu (Header.tsx/HeaderMenu.tsx)                            │
│    ├─→ Logo / Brand                                                │
│    ├─→ Navigation Links                                            │
│    ├─→ "Sign Up" → HomeownerSignupModal                            │
│    │               └─→ Success → Homeowner Dashboard               │
│    ├─→ "Log In"  → HomeownerSignInModal                            │
│    │               └─→ Success → Homeowner Dashboard               │
│    ├─→ Theme Switcher (dark mode)                                  │
│    └─→ (If logged in) Dashboard Links                              │
│                                                                     │
│  Dashboard-Connected Modals:                                        │
│    ├─→ NewQuoteRequestModal (request new quote from dashboard)     │
│    └─→ MessagingModal (homeowner messaging)                        │
│                                                                     │
│  ✅ Complete homeowner auth + dashboard flows migrated atomically  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      PHASE 5: HERO SECTION                          │
│            First content section after navigation                   │
├─────────────────────────────────────────────────────────────────────┤
│  Hero                                                               │
│    ├─→ Headline (responsive typography: text-heading-1)            │
│    ├─→ Subheadline (text-muted-foreground)                         │
│    └─→ CTA Button → Scroll to quote form / Navigate                │
│                                                                     │
│  ✅ High-visibility content with responsive design tokens          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              PHASE 6: QUOTE CONVERSION FUNNEL (CRITICAL)            │
│          All quote-related forms and modals (core business)        │
├─────────────────────────────────────────────────────────────────────┤
│  Quote Flow (Guest User):                                           │
│    1. InstantQuoteForm (50+ violations - HIGHEST)                  │
│         ├─→ Email, phone, address, system size inputs              │
│         ├─→ Quote calculation, validation                          │
│         └─→ Submit → Quote calculated                              │
│                                                                     │
│    2. "Get Detailed Quote" → QuoteOptionsModal                     │
│         ├─→ "Instant Quote" (quick estimate)                       │
│         └─→ "Detailed Quote" (requires auth)                       │
│                                                                     │
│    3. If "Detailed" selected → DetailedQuoteAuthModal              │
│         ├─→ Signup → HomeownerSignupModal (if not logged in)      │
│         ├─→ Login  → HomeownerSignInModal (if has account)        │
│         └─→ Success → Quote form prefilled                         │
│                                                                     │
│    4. SimplifiedQuoteForm (alternative, 35+ violations)            │
│         ├─→ Simpler input fields                                   │
│         ├─→ Validation, submission                                 │
│         └─→ Submit → Quote calculated                              │
│                                                                     │
│    5. Quote submission success → QuoteSuccessModal                 │
│         └─→ "Go to Dashboard" → Homeowner Dashboard                │
│                                                                     │
│  ✅ Complete quote conversion funnel (guest → quote → auth → dashboard) │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  PHASE 7: MOBILE NAVIGATION LAYER                   │
│           Mobile-specific navigation (responsive UX)                │
├─────────────────────────────────────────────────────────────────────┤
│  Mobile Sidebar:                                                    │
│    └─→ HomeownerMobileSidebarMenu (20+ violations)                 │
│         ├─→ Hamburger icon → Sidebar slides in                     │
│         ├─→ Navigation items (active state: bg-primary)            │
│         ├─→ Inactive items (bg-surface, text-muted-foreground)     │
│         └─→ Close (X button, backdrop tap, ESC key)                │
│                                                                     │
│  Bottom Navigation Bars (Mobile < 768px):                           │
│    ├─→ GuestBottomNavBar (guest users)                             │
│    │    └─→ Home, Quotes, Blog, etc.                               │
│    └─→ HomeownerBottomNavBar (logged-in homeowners)                │
│         └─→ Dashboard, Quotes, Messages, Profile, etc.             │
│                                                                     │
│  ✅ Complete mobile navigation consistency                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                PHASE 8: CONTENT SECTIONS & FOOTER                   │
│              Supporting content (blog, newsletter, footer)          │
├─────────────────────────────────────────────────────────────────────┤
│  Content Sections:                                                  │
│    ├─→ BlogSection                                                  │
│    │    ├─→ Section heading (text-heading-2)                       │
│    │    ├─→ Article cards (neumorphic styling)                     │
│    │    ├─→ Article titles, excerpts                               │
│    │    └─→ "See All Posts" button                                 │
│    │                                                                │
│    └─→ NewsletterSignup                                             │
│         ├─→ Email input (AuthInput)                                │
│         ├─→ Subscribe button (AuthButton)                          │
│         └─→ Success/error messages                                 │
│                                                                     │
│  Footer:                                                            │
│    ├─→ Footer sections (About, Links, Social)                      │
│    ├─→ Section headings (typography tokens)                        │
│    ├─→ Footer links (hover states, design tokens)                  │
│    ├─→ Social media icons                                          │
│    └─→ Copyright text (text-muted-foreground)                      │
│                                                                     │
│  ✅ Complete homepage content and footer consistency               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│             PHASE 9: ADMIN & SPECIALIZED COMPONENTS                 │
│            Less frequently used but critical specialty flows        │
├─────────────────────────────────────────────────────────────────────┤
│  Admin Components:                                                  │
│    └─→ AdminSignInModal                                             │
│         ├─→ Admin email, password (AuthInput)                      │
│         ├─→ Admin-specific styling (if different)                  │
│         └─→ Success → Admin Dashboard                              │
│                                                                     │
│  Verification Components:                                           │
│    └─→ OTPVerificationModal                                         │
│         ├─→ OTP input fields (6-digit code)                        │
│         ├─→ Verify button (AuthButton)                             │
│         ├─→ Resend code button                                     │
│         └─→ Success → Email/phone verified                         │
│                                                                     │
│  Account Management:                                                │
│    └─→ DeleteAccountModal                                           │
│         ├─→ Warning message styling                                │
│         ├─→ Password confirmation (AuthInput)                      │
│         ├─→ Delete button (danger variant)                         │
│         └─→ Success → Logout, redirect to home                     │
│                                                                     │
│  ✅ All specialty flows complete (admin, verification, management) │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              PHASE 10: VERIFICATION SCRIPT & TOOLING                │
│               Automated checks for 100% compliance                  │
├─────────────────────────────────────────────────────────────────────┤
│  Verification Script:                                               │
│    ├─→ scripts/verify-component.js                                 │
│    ├─→ Scans for hardcoded class violations                        │
│    ├─→ Returns list with line numbers (if violations)              │
│    ├─→ Exit code 0 (clean) or 1 (violations)                       │
│    └─→ Can be used in pre-commit hooks, CI/CD                      │
│                                                                     │
│  Optional CI/CD Integration:                                        │
│    ├─→ GitHub Actions workflow                                     │
│    ├─→ Pre-commit hook (.husky/)                                   │
│    └─→ Prevent merging if violations detected                      │
│                                                                     │
│  ✅ Automated enforcement of design system compliance              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    PHASE 11: POLISH & DOCUMENTATION                 │
│              Final audit, documentation, lessons learned            │
├─────────────────────────────────────────────────────────────────────┤
│  Documentation Updates:                                             │
│    ├─→ DESIGN-SYSTEM-SOT.md (lessons learned, common patterns)     │
│    ├─→ COMPONENT-MIGRATION-GUIDE.md (8-step process)               │
│    └─→ constitution.md (workflow improvements, if any)             │
│                                                                     │
│  Final Audit:                                                       │
│    ├─→ Run verification on ALL 20+ components                      │
│    ├─→ Confirm 95%+ compliance                                     │
│    ├─→ Document exceptions (if any, e.g., third-party libs)        │
│    └─→ Update migration tracker (15/15 or 20/20 complete)          │
│                                                                     │
│  Performance & Accessibility:                                       │
│    ├─→ Bundle size check (no increase)                             │
│    ├─→ Runtime performance check (no degradation)                  │
│    └─→ WCAG 2.1 AA compliance audit (keyboard nav, focus, ARIA)    │
│                                                                     │
│  Visual Comparison:                                                 │
│    └─→ Before/after screenshots (InstantQuoteForm, Hero, Modals)   │
│                                                                     │
│  ✅ Migration complete, documented, 95%+ design system compliance  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Migration Progress Tracking

### Visual Progress Indicators

As you complete each phase, you can **visually see** the migration progress:

- ✅ **Phase 3 Complete**: TopBar styled correctly, all installer modals work
- ✅ **Phase 4 Complete**: Header styled correctly, all homeowner modals work
- ✅ **Phase 5 Complete**: Hero section uses responsive typography
- ✅ **Phase 6 Complete**: All quote forms work, entire conversion funnel migrated
- ✅ **Phase 7 Complete**: Mobile navigation consistent (sidebar + bottom nav)
- ✅ **Phase 8 Complete**: Homepage content sections and footer styled
- ✅ **Phase 9 Complete**: Admin and specialty flows work
- ✅ **Phase 10 Complete**: Verification script enforces compliance
- ✅ **Phase 11 Complete**: Documentation updated, final audit passed

### Component Count by Phase

| Phase | Components | Violations Fixed | User Flow Completed |
|-------|-----------|------------------|---------------------|
| Phase 3 | 4 (TopBar, 3 installer modals) | ~30 | Installer onboarding |
| Phase 4 | 5 (Header, 4 homeowner modals) | ~40 | Homeowner auth + dashboard |
| Phase 5 | 1 (Hero) | ~6 | Homepage hero |
| Phase 6 | 5 (Quote forms + modals) | ~85+ | Complete quote funnel |
| Phase 7 | 3 (Mobile nav) | ~25 | Mobile navigation |
| Phase 8 | 3 (Content + footer) | ~20 | Homepage content |
| Phase 9 | 3+ (Admin + specialty) | ~15 | Admin + specialty flows |
| **Total** | **24+ components** | **~221+ violations** | **All user flows** |

---

## 🎯 Key Benefits of This Approach

### 1. **Gradual Visual Progress**
- After Phase 3: "TopBar and installer signup/login are done"
- After Phase 4: "Header and homeowner signup/login are done"
- After Phase 6: "All quote forms work end-to-end"
- **Easy to track**: "We've completed navigation, now working on content"

### 2. **Atomic User Flow Testing**
- Each phase migrates a **complete user journey**
- Phase 3: Become partner → eligibility → signup → signin → dashboard
- Phase 4: Homeowner signup → signin → dashboard → request quote → messaging
- Phase 6: Guest → instant quote → options → detailed quote (with auth) → success
- **No broken flows**: All connected components migrated together

### 3. **Logical Grouping**
- All installer auth in Phase 3
- All homeowner auth in Phase 4
- All quote forms in Phase 6
- All mobile navigation in Phase 7
- **Easier to review**: "Let's review the entire installer onboarding flow"

### 4. **Smooth Developer Experience**
- Top-to-bottom follows user visual journey
- Each phase has clear "done" criteria (all connected modals work)
- Easy to demo progress: "Let me show you the migrated topbar and signup flow"

### 5. **No Rework**
- Once TopBar + connected modals are done, they're **done**
- No need to revisit for UI scaling or theme updates
- Design tokens centralize all styling

---

## 🚀 Getting Started

1. **Phase 1-2 (Setup + Foundation)**: ~1-2 hours
   - Create migration tracker, audits directory
   - Verify design token system completeness

2. **Phase 3 (TopBar + Installer Auth)**: ~3-4 hours
   - Migrate TopBar (minimal work, already mostly compliant)
   - Migrate InstallerEligibilityModal, InstallerSignupModal, InstallerSignInModal
   - Test complete installer flow: Become partner → signup → signin → dashboard

3. **Phase 4 (Header + Homeowner Auth)**: ~4-5 hours
   - Migrate HeaderMenu
   - Migrate HomeownerSignupModal, HomeownerSignInModal
   - Migrate NewQuoteRequestModal, MessagingModal
   - Test complete homeowner flow: Signup → signin → dashboard → request quote

4. **Phase 5 (Hero)**: ~1 hour
   - Migrate Hero section (responsive typography)
   - Test CTA button navigation

5. **Phase 6 (Quote Forms)**: ~5-6 hours
   - Migrate InstantQuoteForm (50+ violations)
   - Migrate QuoteOptionsModal, DetailedQuoteAuthModal
   - Migrate SimplifiedQuoteForm (35+ violations)
   - Migrate QuoteSuccessModal
   - Test complete quote funnel: Instant → options → detailed (auth) → success

6. **Phases 7-11**: ~6-8 hours
   - Mobile navigation, content sections, admin, verification, polish

**Total**: 20-25 hours over 7-10 days (2-3 hours per day)

---

## ✅ Success Criteria

- All 20+ components pass verification (zero hardcoded classes)
- Migration tracker shows 100% complete
- All user flows work end-to-end:
  - ✅ Installer: Become partner → eligibility → signup → signin → dashboard
  - ✅ Homeowner: Signup → signin → dashboard → request quote → messaging
  - ✅ Guest Quote: Instant → options → detailed (with auth) → success → dashboard
  - ✅ Admin: Signin → admin dashboard
  - ✅ Mobile: Sidebar navigation, bottom nav bars work
- Build passes with 0 errors
- Design system compliance: 95%+
- No need to revisit components for UI updates (all centralized)
