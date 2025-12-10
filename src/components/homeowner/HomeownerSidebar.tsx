'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Icon Components
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const LayoutDashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>;
const PhoneCallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const FileSignatureIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M12 18h.01"/><path d="M16 12.5a2.5 2.5 0 0 0-5 0"/><path d="m15 18-2-2-2 2"/></svg>;
const GavelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m14 12-8.5 8.5"/><path d="m18 16 1-1"/><path d="m17 11 4.3 4.3c.6.6.6 1.5 0 2.1l-2.1 2.1c-.6.6-1.5.6-2.1 0L12.8 16"/><path d="m3 3 8.5 8.5"/><path d="m13 7 4-4"/><path d="m14 11-4 4"/></svg>;
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>;
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${className || ''}`}><path d="m6 9 6 6 6-6"/></svg>;
const CollapseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;

// NavItem Component
const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  isActive: boolean; 
  onClick: () => void; 
  badgeCount?: number; 
  isCollapsed?: boolean;
}> = ({ icon, title, isActive, onClick, badgeCount, isCollapsed = false }) => (
  <button 
    onClick={onClick} 
    className={`dashboard-nav-item ${isCollapsed ? 'dashboard-nav-item--collapsed' : 'dashboard-nav-item--expanded'} ${isActive ? 'dashboard-nav-item--active' : ''}`}
    title={isCollapsed ? title : undefined}
  >
    <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
      <span className="dashboard-nav-item__icon">{icon}</span>
      {!isCollapsed && <span className="dashboard-nav-item__text">{title}</span>}
    </div>
    {!isCollapsed && badgeCount && badgeCount > 0 && (
      <span className="dashboard-nav-badge">
        {badgeCount}
      </span>
    )}
  </button>
);

// HomeownerSidebar Props
interface HomeownerSidebarProps {
  activePage: string;
  onLogoutClick: () => void;
  onHomeClick: () => void;
  onMessagesClick: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

// HomeownerSidebar Component
const HomeownerSidebar: React.FC<HomeownerSidebarProps> = ({ 
  activePage, 
  onLogoutClick, 
  onHomeClick, 
  onMessagesClick, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  
  return (
    <aside className={`dashboard-sidebar-container ${isCollapsed ? 'dashboard-sidebar-container--collapsed' : 'dashboard-sidebar-container--expanded'}`}>
      {/* Header with Logo/Icon and Collapse Button */}
      <div className="dashboard-sidebar-header">
        <button
          onClick={onHomeClick}
          className={`dashboard-sidebar-logo ${isCollapsed ? 'dashboard-sidebar-logo--collapsed' : 'dashboard-sidebar-logo--expanded'}`}
        >
          <SunIcon />
          {!isCollapsed && <span className="dashboard-sidebar-logo-text">SolarMatch</span>}
        </button>
        {/* Collapse Toggle Button */}
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="dashboard-collapse-btn--floating dashboard-collapse-btn--floating-left"
            title="Expand sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : (
          <button
            onClick={() => setIsCollapsed(true)}
            className="absolute top-1/2 -translate-y-1/2 right-2 dashboard-collapse-btn"
            title="Collapse sidebar"
          >
            <CollapseIcon />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className={`dashboard-sidebar-nav ${isCollapsed ? 'dashboard-sidebar-nav--collapsed' : 'dashboard-sidebar-nav--expanded'}`}>
        <Link href="/homeowner/dashboard">
          <NavItem
            icon={<LayoutDashboardIcon />}
            title="Dashboard Overview"
            isActive={activePage === 'Dashboard Overview'}
            onClick={() => {}}
            isCollapsed={isCollapsed}
          />
        </Link>
        <NavItem
          icon={<MessageSquareIcon />}
          title="Messages"
          isActive={activePage === 'Messages'}
          onClick={onMessagesClick}
          badgeCount={3}
          isCollapsed={isCollapsed}
        />
        <Link href="/homeowner/profile">
          <NavItem
            icon={<UserIcon />}
            title="My Profile"
            isActive={activePage === 'My Profile'}
            onClick={() => {}}
            isCollapsed={isCollapsed}
          />
        </Link>
      </nav>

      {/* Logout Button */}
      <div className={`dashboard-sidebar-footer ${isCollapsed ? 'dashboard-sidebar-footer--collapsed' : 'dashboard-sidebar-footer--expanded'}`}>
        <button
          onClick={onLogoutClick}
          className={`dashboard-nav-item ${isCollapsed ? 'dashboard-nav-item--collapsed' : 'dashboard-nav-item--expanded'}`}
          title={isCollapsed ?"Logout" : undefined}
        >
          <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
            <span className="dashboard-nav-item__icon"><LogOutIcon /></span>
            {!isCollapsed && <span className="dashboard-nav-item__text">Logout</span>}
          </div>
        </button>
      </div>
    </aside>
  );
};

export default HomeownerSidebar;
