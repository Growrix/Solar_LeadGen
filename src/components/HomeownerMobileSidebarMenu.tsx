'use client';

import React, { useEffect } from 'react';

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

const PhoneCallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const FileSignatureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <path d="M12 18h.01"/>
    <path d="M16 12.5a2.5 2.5 0 0 0-5 0"/>
    <path d="m15 18-2-2-2 2"/>
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

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M12 3L9.5 9.5L3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

interface HomeownerMobileSidebarMenuProps {
    isOpen: boolean;
    onClose: () => void;
    activePage: string;
    setActivePage: (page: string) => void;
    onLogoutClick: () => void;
    onMessagesClick?: () => void;
    unreadMessagesCount?: number;
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
        className={'w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-xl transition-colors text-body ' + (isActive ? 'bg-primary text-primary-foreground' : 'bg-surface text-foreground hover:bg-surface-hover')}
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

const HomeownerMobileSidebarMenu: React.FC<HomeownerMobileSidebarMenuProps> = ({ 
    isOpen, 
    onClose, 
    activePage, 
    setActivePage, 
    onLogoutClick, 
    onMessagesClick, 
    unreadMessagesCount 
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

    const handleMessagesClick = () => {
        onClose();
        if (onMessagesClick) {
            onMessagesClick();
        }
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
                    <h2 className="text-heading-3 text-foreground">Menu</h2>
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
                        icon={<PhoneCallIcon />} 
                        title="Call/Visit Quotes" 
                        isActive={activePage === 'Call/Visit Quotes'} 
                        onClick={() => handleNavClick('Call/Visit Quotes')} 
                    />
                    <NavItem 
                        icon={<FileSignatureIcon />} 
                        title="Written Quotes" 
                        isActive={activePage === 'Written Quotes'} 
                        onClick={() => handleNavClick('Call/Visit Quotes')} 
                    />
                    <NavItem 
                        icon={<GavelIcon />} 
                        title="Bidding Room" 
                        isActive={activePage === 'Bidding Room'} 
                        onClick={() => handleNavClick('Bidding Room')} 
                    />
                    <NavItem 
                        icon={<SparklesIcon />} 
                        title="AI Insights" 
                        isActive={activePage === 'AI Insights'} 
                        onClick={() => handleNavClick('AI Insights')} 
                    />
                    <NavItem 
                        icon={<MessageSquareIcon />} 
                        title="Messages" 
                        isActive={activePage === 'Messages'} 
                        onClick={handleMessagesClick} 
                        badgeCount={unreadMessagesCount} 
                    />
                    <NavItem 
                        icon={<UserIcon />} 
                        title="My Profile" 
                        isActive={activePage === 'My Profile'} 
                        onClick={() => handleNavClick('My Profile')} 
                    />
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

export default HomeownerMobileSidebarMenu;