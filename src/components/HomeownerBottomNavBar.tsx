'use client';

import React from 'react';

// Icon Components
const LayoutDashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;

interface HomeownerBottomNavBarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onNewQuoteClick: () => void;
  currentPage: 'home' | 'dashboard';
  onHomeClick: () => void;
  onDashboardClick: () => void;
  onMenuClick: () => void;
  onMessagesClick: () => void;
  unreadMessagesCount?: number;
  onLogoutClick?: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; badgeCount?: number; }> = ({ icon, label, isActive, onClick, badgeCount }) => (
  <button onClick={onClick} className={`relative flex flex-col items-center justify-center space-y-1 w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted hover:text-primary/80'}`}>
    {icon}
    <span className="text-caption">{label}</span>
    {badgeCount && badgeCount > 0 && (
      <span className="absolute top-1 right-[calc(50%-22px)] bg-destructive text-foreground-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
        {badgeCount}
      </span>
    )}
  </button>
);

const HomeownerBottomNavBar: React.FC<HomeownerBottomNavBarProps> = ({ activePage, setActivePage, onNewQuoteClick, currentPage, onHomeClick, onDashboardClick, onMenuClick, onMessagesClick, unreadMessagesCount, onLogoutClick }) => {
  
  const navigateToDashboardPage = (page: string) => {
    setActivePage(page);
    if (currentPage === 'home') {
      onDashboardClick();
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        {currentPage === 'dashboard' ? (
          <NavItem icon={<HomeIcon />} label="Home" isActive={false} onClick={onHomeClick} />
        ) : (
          <NavItem icon={<LayoutDashboardIcon />} label="Dashboard" isActive={false} onClick={onDashboardClick} />
        )}
        <NavItem icon={<FileTextIcon />} label="Quotes" isActive={activePage === 'Call/Visit Quotes' || activePage === 'Written Quotes'} onClick={() => navigateToDashboardPage('Call/Visit Quotes')} />
        
        <div className="w-16 h-16 flex items-center justify-center">
            <button onClick={onNewQuoteClick} className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-foreground-secondary shadow-lg transform -translate-y-4 hover:bg-primary/90 active:scale-95 transition-colors" aria-label="Request New Quote">
                <PlusIcon />
            </button>
        </div>

        <NavItem icon={<MessageSquareIcon />} label="Messages" isActive={false} onClick={onMessagesClick} badgeCount={unreadMessagesCount} />
        {currentPage === 'home' && onLogoutClick ? (
          <NavItem icon={<LogoutIcon />} label="Logout" isActive={false} onClick={onLogoutClick} />
        ) : (
          <NavItem icon={<MenuIcon />} label="Menu" isActive={false} onClick={onMenuClick} />
        )}
      </div>
    </div>
  );
};

export default HomeownerBottomNavBar;