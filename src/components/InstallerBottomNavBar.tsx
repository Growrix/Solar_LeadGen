'use client';

import React from 'react';

const LayoutDashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <rect width="7" height="9" x="3" y="3" rx="1"/>
    <rect width="7" height="5" x="14" y="3" rx="1"/>
    <rect width="7" height="9" x="14" y="12" rx="1"/>
    <rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
);

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MessageSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

interface InstallerBottomNavBarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onNewBidClick: () => void;
  onMenuClick: () => void;
  currentPage: 'home' | 'installerDashboard';
  onHomeClick: () => void;
  onDashboardClick: () => void;
  unreadMessagesCount?: number;
  newLeadsCount?: number;
}

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
  badgeCount?: number; 
}> = ({ icon, label, isActive, onClick, badgeCount }) => (
  <button 
    onClick={onClick} 
    className={`relative flex flex-col items-center justify-center space-y-1 w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-primary' : 'text-muted hover:text-primary/80'
    }`}
  >
    {icon}
    <span className="text-caption">{label}</span>
    {badgeCount && badgeCount > 0 && (
      <span className="absolute top-1 right-[calc(50%-22px)] bg-destructive text-foreground-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
        {badgeCount}
      </span>
    )}
  </button>
);

const InstallerBottomNavBar: React.FC<InstallerBottomNavBarProps> = ({ 
  activePage, 
  setActivePage, 
  onNewBidClick, 
  onMenuClick, 
  currentPage, 
  onHomeClick, 
  onDashboardClick, 
  unreadMessagesCount, 
  newLeadsCount
}) => {
  const navigateToDashboardPage = (page: string) => {
    setActivePage(page);
    if (currentPage === 'home') {
      onDashboardClick();
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        {currentPage === 'installerDashboard' ? (
          <NavItem icon={<HomeIcon />} label="Home" isActive={false} onClick={onHomeClick} />
        ) : (
          <NavItem icon={<LayoutDashboardIcon />} label="Dashboard" isActive={false} onClick={onDashboardClick} />
        )}
        <NavItem 
          icon={<ZapIcon />} 
          label="Leads" 
          isActive={activePage === 'Lead Feed'} 
          onClick={() => navigateToDashboardPage('Lead Feed')} 
          badgeCount={newLeadsCount} 
        />
        
        <div className="w-16 h-16 flex items-center justify-center">
          <button 
            onClick={onNewBidClick} 
            className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-foreground-secondary shadow-lg transform -translate-y-4 hover:bg-primary/90 active:scale-95 transition-colors" 
            aria-label="Create New Bid"
          >
            <PlusIcon />
          </button>
        </div>

        <NavItem 
          icon={<MessageSquareIcon />} 
          label="Messages" 
          isActive={activePage === 'Messages'} 
          onClick={() => navigateToDashboardPage('Messages')} 
          badgeCount={unreadMessagesCount} 
        />
        <NavItem icon={<MenuIcon />} label="Menu" isActive={false} onClick={onMenuClick} />
      </div>
    </div>
  );
};

export default InstallerBottomNavBar;