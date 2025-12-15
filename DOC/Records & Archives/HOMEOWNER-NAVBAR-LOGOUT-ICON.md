# Homeowner Bottom Navbar - Logout Icon on Homepage

## Date
October 13, 2025

## Change Requested
When homeowners are logged in and visit the homepage, the bottom navbar should show a **Logout icon** instead of the **Menu icon**.

## Implementation

### Problem
Previously, homeowners saw the Menu icon on both the homepage and dashboard, which was inconsistent with the expected behavior where direct logout should be available on the homepage.

### Solution
Modified the `HomeownerBottomNavBar` component to conditionally render either:
- **Logout icon** - When `currentPage === 'home'` (on homepage)
- **Menu icon** - When `currentPage === 'dashboard'` (on dashboard)

## Files Modified

### 1. HomeownerBottomNavBar.tsx

#### Changes Made:

**a) Added Logout Icon Component**
```tsx
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
```

**b) Added `onLogoutClick` Prop**
```tsx
interface HomeownerBottomNavBarProps {
  // ... existing props
  onLogoutClick?: () => void; // NEW
}
```

**c) Conditional Rendering Logic**
```tsx
// BEFORE - Always showed Menu
<NavItem icon={<MenuIcon />} label="Menu" isActive={false} onClick={onMenuClick} />

// AFTER - Shows Logout on homepage, Menu on dashboard
{currentPage === 'home' && onLogoutClick ? (
  <NavItem icon={<LogoutIcon />} label="Logout" isActive={false} onClick={onLogoutClick} />
) : (
  <NavItem icon={<MenuIcon />} label="Menu" isActive={false} onClick={onMenuClick} />
)}
```

### 2. LayoutContent.tsx

#### Changes Made:

**Added `onLogoutClick` Prop to HomeownerBottomNavBar**
```tsx
<HomeownerBottomNavBar 
  activePage={activeDashboardPage}
  setActivePage={setActiveDashboardPage}
  onNewQuoteClick={handleNewQuoteClick}
  currentPage="home"
  onHomeClick={handleHomeownerHomeClick}
  onDashboardClick={handleHomeownerDashboardClick}
  onMenuClick={handleMobileSidebarOpen}
  onMessagesClick={handleMessagesClick}
  unreadMessagesCount={3}
  onLogoutClick={handleLogout} // NEW - passes logout handler
/>
```

## Behavior

### Homepage (currentPage === 'home')
```
┌────────────────────────────────────────────────────┐
│  📊      📋      ➕      💬      🚪                 │
│ Dash   Quotes  New   Messages Logout               │
│                Quote                               │
└────────────────────────────────────────────────────┘
```

When homeowner clicks **Logout**:
1. Triggers `handleLogout()` function
2. Calls NextAuth `signOut({ redirect: false })`
3. Clears JWT session
4. Redirects to homepage (`/`)

### Dashboard (currentPage === 'dashboard')
```
┌────────────────────────────────────────────────────┐
│  🏠      📋      ➕      💬      ☰                  │
│ Home   Quotes  New   Messages  Menu                │
│                Quote                               │
└────────────────────────────────────────────────────┘
```

When homeowner clicks **Menu**:
1. Opens `HomeownerMobileSidebarMenu`
2. Shows full navigation options
3. Logout option available in sidebar

## User Experience Flow

### On Homepage (Mobile):
1. **Homeowner logs in**
2. **Visits homepage** (`/`)
3. **Bottom navbar shows:**
   - Dashboard (navigate to /homeowner/dashboard)
   - Quotes (view quotes)
   - [+] New Quote (floating button)
   - Messages (view messages)
   - **Logout** (direct logout) ✅ NEW

### On Dashboard (Mobile):
1. **Homeowner on dashboard** (`/homeowner/dashboard`)
2. **Bottom navbar shows:**
   - Home (return to homepage)
   - Quotes (view quotes)
   - [+] New Quote (floating button)
   - Messages (view messages)
   - Menu (open sidebar with logout option)

## Logic Explanation

The component uses the `currentPage` prop to determine context:

```tsx
{currentPage === 'home' && onLogoutClick ? (
  // When on homepage AND logout handler provided
  <NavItem icon={<LogoutIcon />} label="Logout" isActive={false} onClick={onLogoutClick} />
) : (
  // When on dashboard OR logout handler not provided
  <NavItem icon={<MenuIcon />} label="Menu" isActive={false} onClick={onMenuClick} />
)}
```

**Conditions:**
- `currentPage === 'home'` → User is on homepage (/)
- `onLogoutClick` exists → Logout handler is provided
- **Both true** → Show Logout icon
- **Either false** → Show Menu icon (fallback)

## Icon Design

The Logout icon is a standard logout/exit icon showing:
- Door frame on the left
- Arrow pointing right (exit direction)
- Consistent with other Lucide icons used in the navbar

## Benefits

1. ✅ **Quick Logout** - Homeowners can logout directly from homepage without opening menu
2. ✅ **Intuitive UX** - Logout is immediately accessible when needed
3. ✅ **Consistent Design** - Maintains same navbar style and spacing
4. ✅ **Context-Aware** - Shows appropriate action based on current page
5. ✅ **Proper Session Handling** - Uses NextAuth signOut() for secure logout

## Testing Checklist

### On Homepage:
- ✅ Login as homeowner
- ✅ Visit homepage (/)
- ✅ Check bottom navbar - should show "Logout" icon (🚪)
- ✅ Click Logout - should logout and redirect to homepage
- ✅ Verify session cleared (can't access protected routes)

### On Dashboard:
- ✅ Login as homeowner
- ✅ Navigate to dashboard (/homeowner/dashboard)
- ✅ Check bottom navbar - should show "Menu" icon (☰)
- ✅ Click Menu - should open sidebar
- ✅ Logout option available in sidebar

### Edge Cases:
- ✅ Navigate between homepage and dashboard - icon should change
- ✅ Logout from homepage - should work properly
- ✅ Logout from sidebar on dashboard - should work properly
- ✅ Dark mode - icon should be visible in both themes

## Props Summary

### HomeownerBottomNavBar

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| activePage | string | Yes | Current active page |
| setActivePage | function | Yes | Set active page |
| onNewQuoteClick | function | Yes | Handle new quote click |
| currentPage | 'home' \| 'dashboard' | Yes | Current page context |
| onHomeClick | function | Yes | Handle home click |
| onDashboardClick | function | Yes | Handle dashboard click |
| onMenuClick | function | Yes | Handle menu click |
| onMessagesClick | function | Yes | Handle messages click |
| unreadMessagesCount | number | No | Unread message count |
| **onLogoutClick** | **function** | **No** | **Handle logout click (NEW)** |

## Status

✅ **COMPLETE** - Logout icon showing on homepage
✅ **TESTED** - Ready for production
✅ **DOCUMENTED** - Full documentation created

## Notes

- The logout functionality already existed (used in sidebar)
- We only added a new UI entry point for quicker access
- Both logout methods (navbar button and sidebar option) use the same `handleLogout()` function
- This ensures consistency and proper session cleanup
