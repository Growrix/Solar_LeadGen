'use client';

import React, { useEffect } from 'react';

// --- Icon Components ---
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <line x1="18" x2="6" y1="6" y2="18"/>
    <line x1="6" x2="18" y1="6" y2="18"/>
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

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="9" x2="9" y1="22" y2="4"/>
    <line x1="15" x2="15" y1="22" y2="4"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
);

interface InstallerMobileSidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  onLogoutClick: () => void;
  unreadMessagesCount?: number;
  newLeadsCount?: number;
}

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  isActive: boolean; 
  onClick: () => void; 
  badgeCount?: number; 
}> = ({ icon, title, isActive, onClick, badgeCount }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-xl transition-colors text-body ${ 
      isActive 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-surface text-foreground hover:bg-surface-hover'
    }`}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span>{title}</span>
    </div>
    {badgeCount && badgeCount > 0 && (
      <span className="bg-destructive text-destructive-foreground text-caption w-5 h-5 rounded-full flex items-center justify-center">
        {badgeCount}
      </span>
    )}
  </button>
);

const InstallerMobileSidebarMenu: React.FC<InstallerMobileSidebarMenuProps> = ({ 
  isOpen, 
  onClose, 
  activePage, 
  setActivePage, 
  onLogoutClick, 
  unreadMessagesCount, 
  newLeadsCount 
}) => {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavClick = (page: string) => {
    setActivePage(page);
    onClose();
  };

  const handleLogoutClick = () => {
    onClose();
    onLogoutClick();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()} 
        className="relative w-full max-w-xs bg-background rounded-2xl shadow-2xl border border-border flex flex-col p-6 animate-slide-in-up"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading-3 text-foreground">Installer Menu</h2>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 rounded-md text-muted-foreground hover:bg-surface"
          >
            <XIcon />
          </button>
        </div>

        <nav className="flex-grow flex flex-col items-center space-y-3">
          <NavItem 
            icon={<LayoutDashboardIcon />} 
            title="Dashboard" 
            isActive={activePage === 'Dashboard Overview'} 
            onClick={() => handleNavClick('Dashboard Overview')} 
          />
          <NavItem 
            icon={<ZapIcon />} 
            title="Lead Feed" 
            isActive={activePage === 'Lead Feed'} 
            onClick={() => handleNavClick('Lead Feed')} 
            badgeCount={newLeadsCount} 
          />
          <NavItem 
            icon={<GavelIcon />} 
            title="Active Bids" 
            isActive={activePage === 'Active Bids'} 
            onClick={() => handleNavClick('Active Bids')} 
          />
          <NavItem 
            icon={<MessageSquareIcon />} 
            title="Messages" 
            isActive={activePage === 'Messages'} 
            onClick={() => handleNavClick('Messages')} 
            badgeCount={unreadMessagesCount} 
          />
          {/* Company Profile removed - legacy incomplete feature */}
        </nav>
        
        <div className="mt-6 pt-6 border-t border-border">
          <button 
            onClick={handleLogoutClick} 
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl transition-colors text-body bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            <LogOutIcon />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallerMobileSidebarMenu;