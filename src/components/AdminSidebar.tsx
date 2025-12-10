"use client";
import React from"react";

// Icon components (copy from dashboard page)
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07-1.41-1.41M6.34 6.34 4.93 4.93m12.02 0-1.41 1.41M6.34 17.66l-1.41 1.41" />
  </svg>
);
const LayoutDashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);
const ClipboardListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 14h6" />
    <path d="M9 18h6" />
    <path d="M9 10h6" />
  </svg>
);
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M3 9.5L12 4l9 5.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
    <path d="M9 22V12h6v10" />
  </svg>
);
const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="4" height="16" x="3" y="4" rx="1" />
    <rect width="4" height="9" x="10" y="11" rx="1" />
    <rect width="4" height="6" x="17" y="14" rx="1" />
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const WrenchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const CalculatorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="16" height="20" x="4" y="2" rx="2"/>
    <line x1="8" x2="16" y1="6" y2="6"/>
    <line x1="16" x2="16" y1="14" y2="18"/>
    <path d="M16 10h.01"/>
    <path d="M12 10h.01"/>
    <path d="M8 10h.01"/>
    <path d="M12 14h.01"/>
    <path d="M8 14h.01"/>
    <path d="M12 18h.01"/>
    <path d="M8 18h.01"/>
  </svg>
);
const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const LayersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

import { useState } from"react";

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg className={`h-4 w-4 ml-2 transition-transform duration-300 ${open ?"rotate-180" :""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const NavItem: React.FC<{ icon: React.ReactNode; title: string; isActive: boolean; onClick: () => void; isCollapsed?: boolean }> = ({ icon, title, isActive, onClick, isCollapsed }) => (
  <button
    onClick={onClick}
    className={`dashboard-nav-item ${isCollapsed ? 'dashboard-nav-item--collapsed' : 'dashboard-nav-item--expanded'} ${isActive ? 'dashboard-nav-item--active' : ''}`}
    title={isCollapsed ? title : undefined}
  >
    <div className="flex items-center space-x-3">
      <span className="dashboard-nav-item__icon">{icon}</span>
      {!isCollapsed && <span className="dashboard-nav-item__text">{title}</span>}
    </div>
  </button>
);

const AdminSidebar: React.FC<{ activePage?: string }> = ({ activePage = 'Dashboard' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [leadsOpen, setLeadsOpen] = useState(true);
  return (
    <aside className={`dashboard-sidebar-container ${isCollapsed ? 'dashboard-sidebar-container--collapsed' : 'dashboard-sidebar-container--expanded'}`}>
      <div className="dashboard-sidebar-header">
        <button
          className={`dashboard-sidebar-logo ${isCollapsed ? 'dashboard-sidebar-logo--collapsed' : 'dashboard-sidebar-logo--expanded'}`}
        >
          <SunIcon />
          {!isCollapsed && <span className="dashboard-sidebar-logo-text">SolarMatch</span>}
        </button>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="absolute top-1/2 -translate-y-1/2 right-2 dashboard-collapse-btn"
            title="Collapse sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="dashboard-uncollapse-btn absolute top-1/2 -translate-y-1/2 right-2"
            title="Expand sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
      <p className={`dashboard-sidebar-section-label ${isCollapsed ? 'dashboard-sidebar-section-label--hidden' : ''}`}>Admin Panel</p>
      <nav className={`dashboard-sidebar-nav ${isCollapsed ? 'dashboard-sidebar-nav--collapsed' : 'dashboard-sidebar-nav--expanded'}`}>
        <NavItem icon={<LayoutDashboardIcon />} title="Dashboard" isActive={activePage === 'Dashboard'} onClick={() => { window.location.href = '/admin/dashboard'; }} isCollapsed={isCollapsed} />
        <NavItem icon={<ClipboardListIcon />} title="Leads" isActive={activePage === 'Leads'} onClick={() => { window.location.href = '/admin/leads'; }} isCollapsed={isCollapsed} />
        <NavItem icon={<LayersIcon />} title="Components" isActive={activePage === 'Components'} onClick={() => { window.location.href = '/admin/components'; }} isCollapsed={isCollapsed} />
        <NavItem icon={<MailIcon />} title="Newsletter" isActive={activePage === 'Newsletter'} onClick={() => { window.location.href = '/admin/newsletter'; }} isCollapsed={isCollapsed} />
        <NavItem icon={<CalculatorIcon />} title="Instant Quotes" isActive={activePage === 'Instant Quotes'} onClick={() => { window.location.href = '/admin/instant-quotes'; }} isCollapsed={isCollapsed} />
        <NavItem icon={<HomeIcon />} title="Homeowners" isActive={activePage === 'Homeowners'} onClick={() => { window.location.href = '/admin/homeowners'; }} isCollapsed={isCollapsed} />
        <NavItem icon={<WrenchIcon />} title="Installers" isActive={activePage === 'Installers'} onClick={() => { window.location.href = '/admin/installers'; }} isCollapsed={isCollapsed} />
      </nav>
      <div className={`dashboard-sidebar-footer ${isCollapsed ? 'dashboard-sidebar-footer--collapsed' : 'dashboard-sidebar-footer--expanded'}`}>
        <NavItem icon={<LogOutIcon />} title="Logout" isActive={false} onClick={() => { window.location.href = '/logout'; }} isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

export default AdminSidebar;
