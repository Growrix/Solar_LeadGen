'use client';

import React from 'react';

// --- Icon Components ---
const LayoutDashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <rect width="7" height="9" x="3" y="3" rx="1"/>
    <rect width="7" height="5" x="14" y="3" rx="1"/>
    <rect width="7" height="9" x="14" y="12" rx="1"/>
    <rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ClipboardListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M9 14h6"/>
    <path d="M9 18h6"/>
    <path d="M9 10h6"/>
  </svg>
);

const PaintbrushIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M17 3a2.85 2.85 0 0 0-4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    <path d="m15 5 4 4"/>
    <path d="M22 11.5c0 2-1.5 3.5-3.5 3.5S15 13.5 15 11.5 16.5 8 18.5 8s3.5 1.5 3.5 3.5z"/>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

interface AdminBottomNavBarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onMenuClick: () => void;
  onThemeClick: () => void;
}

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
}> = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center space-y-1 w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive 
        ? 'text-primary' 
        : 'text-muted-foreground hover:text-primary/80'
    }`}
  >
    {icon}
    <span className="text-caption">{label}</span>
  </button>
);

const AdminBottomNavBar: React.FC<AdminBottomNavBarProps> = ({ 
  activePage, 
  setActivePage, 
  onMenuClick, 
  onThemeClick
}) => {
  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border shadow-neu-outset z-40"
      style={{
        height: `calc(4rem + env(safe-area-inset-bottom))`,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="grid grid-cols-4 items-center h-full max-w-md mx-auto px-1">
        <NavItem 
          icon={<LayoutDashboardIcon />} 
          label="Dashboard" 
          isActive={activePage === 'Dashboard'} 
          onClick={() => setActivePage('Dashboard')} 
        />
        <NavItem 
          icon={<ClipboardListIcon />} 
          label="Leads" 
          isActive={false} 
          onClick={() => window.location.href = '/admin/leads'} 
        />
        <NavItem 
          icon={<UsersIcon />} 
          label="Users" 
          isActive={activePage === 'User Management'} 
          onClick={() => setActivePage('User Management')} 
        />
        <NavItem 
          icon={<MenuIcon />} 
          label="Menu" 
          isActive={false} 
          onClick={onMenuClick} 
        />
      </div>
    </div>
  );
};

export default AdminBottomNavBar;
