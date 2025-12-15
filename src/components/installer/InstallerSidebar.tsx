'use client';

import { useState } from 'react';
import Link from 'next/link';

// --- Icon Components ---
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

const LayoutDashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="7" height="9" x="3" y="3" rx="1"/>
    <rect width="7" height="5" x="14" y="3" rx="1"/>
    <rect width="7" height="9" x="14" y="12" rx="1"/>
    <rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
);

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/>
  </svg>
);

const MarketplaceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <circle cx="8" cy="8" r="6"/>
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
    <path d="M7 6h1v4"/>
    <path d="m16.71 13.88.7.71-2.82 2.82"/>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ClipboardCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="m9 14 2 2 4-4"/>
  </svg>
);

const GavelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="m14 12-8.5 8.5"/>
    <path d="m18 16 1-1"/>
    <path d="m17 11 4.3 4.3c.6.6.6 1.5 0 2.1l-2.1 2.1c-.6.6-1.5.6-2.1 0L12.8 16"/>
    <path d="m3 3 8.5 8.5"/>
    <path d="m13 7 4-4"/>
    <path d="m14 11-4 4"/>
  </svg>
);

const MessageSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
);

const CollapseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

// NavItem Component
interface NavItemProps {
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, title, isActive, onClick, badgeCount, isCollapsed }) => {
  return (
    <button
      onClick={onClick}
      className={`dashboard-nav-item ${isActive ? 'dashboard-nav-item--active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
      title={isCollapsed ? title : undefined}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!isCollapsed && (
        <>
          <span className="flex-grow text-left">{title}</span>
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className="dashboard-nav-badge">{badgeCount}</span>
          )}
        </>
      )}
      {isCollapsed && badgeCount !== undefined && badgeCount > 0 && (
        <span className="dashboard-nav-badge dashboard-nav-badge--collapsed">{badgeCount}</span>
      )}
    </button>
  );
};

// Installer Sidebar Component
interface InstallerSidebarProps {
  activePage: string;
  onLogoutClick: () => void;
  onHomeClick: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const InstallerSidebar: React.FC<InstallerSidebarProps> = ({
  activePage,
  onLogoutClick,
  onHomeClick,
  isCollapsed,
  setIsCollapsed,
}) => {
  return (
      <aside className={`dashboard-sidebar-container ${isCollapsed ? 'dashboard-sidebar-container--collapsed' : 'dashboard-sidebar-container--expanded'}`}>
      {/* Header with Logo/Icon and Collapse Button */}
      <div className="dashboard-sidebar-header">
        <button
          onClick={onHomeClick}
          className={`flex items-center ${isCollapsed ? 'flex-col' : 'space-x-3'} hover:opacity-80 transition-opacity`}
          style={{ width: isCollapsed ? '100%' : undefined, justifyContent: 'center' }}
        >
          <SunIcon />
          {!isCollapsed && <span className="text-heading-2 text-primary">SolarMatch</span>}
        </button>
        {/* Collapse Toggle Button */}
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="dashboard-collapse-btn dashboard-collapse-btn--floating dashboard-collapse-btn--floating-left"
            title="Expand sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => setIsCollapsed(true)}
            className="dashboard-collapse-btn"
            title="Collapse sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className={`dashboard-nav ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <Link href="/installer/leads">
          <NavItem
            icon={<ZapIcon />}
            title="Lead Feed"
            isActive={activePage === 'Lead Feed'}
            onClick={() => {}}
            badgeCount={5}
            isCollapsed={isCollapsed}
          />
        </Link>
        <Link href="/installer/purchased-leads">
          <NavItem
            icon={<ClipboardCheckIcon />}
            title="Purchased Leads"
            isActive={activePage === 'Purchased Leads'}
            onClick={() => {}}
            isCollapsed={isCollapsed}
          />
        </Link>
        <Link href="/installer/profile">
          <NavItem
            icon={<UserIcon />}
            title="Profile"
            isActive={activePage === 'Profile'}
            onClick={() => {}}
            isCollapsed={isCollapsed}
          />
        </Link>
      </nav>

      {/* Logout Button */}
      <div className={`dashboard-sidebar-footer ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <button
          onClick={onLogoutClick}
          className={`dashboard-nav-item ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOutIcon />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
      </aside>
  );
};

export default InstallerSidebar;
