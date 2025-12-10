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

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M3 9.5L12 4l9 5.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
    <path d="M9 22V12h6v10" />
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

const ClipboardListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 14h6" />
    <path d="M9 18h6" />
    <path d="M9 10h6" />
  </svg>
);

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" x2="8" y1="13" y2="13"/>
    <line x1="16" x2="8" y1="17" y2="17"/>
  </svg>
);

const PaintbrushIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M17 3a2.85 2.85 0 0 0-4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    <path d="m15 5 4 4"/>
    <path d="M22 11.5c0 2-1.5 3.5-3.5 3.5S15 13.5 15 11.5 16.5 8 18.5 8s3.5 1.5 3.5 3.5z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
);

interface AdminMobileSidebarMenuProps {
    isOpen: boolean;
    onClose: () => void;
    activePage: string;
    setActivePage: (page: string) => void;
    onLogoutClick: () => void;
}

const NavItem: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    isActive: boolean; 
    onClick: () => void; 
}> = ({ icon, title, isActive, onClick }) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl transition-colors text-body ${
            isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-surface text-foreground hover:bg-surface-hover'
        }`}
    >
        {icon}
        <span>{title}</span>
    </button>
);


import { useRouter } from 'next/navigation';

const AdminMobileSidebarMenu: React.FC<AdminMobileSidebarMenuProps> = ({ 
    isOpen, 
    onClose, 
    activePage, 
    setActivePage, 
    onLogoutClick 
}) => {
    const router = useRouter();
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
        // Route to correct page
        if (page === 'Dashboard') router.push('/admin/dashboard');
        else if (page === 'Leads') router.push('/admin/leads');
        else if (page === 'Homeowners') router.push('/admin/homeowners');
        else if (page === 'Installers') router.push('/admin/installers');
        else if (page === 'Newsletter') router.push('/admin/newsletter');
        else if (page === 'Instant Quotes') router.push('/admin/instant-quotes');
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
                className="theme-card relative w-full max-w-xs flex flex-col p-6 animate-slide-in-up"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-heading-3 text-foreground">Admin Menu</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 -mr-2 rounded-md text-muted-foreground hover:bg-surface-hover"
                    >
                        <XIcon />
                    </button>
                </div>

                <nav className="flex-grow flex flex-col items-center space-y-3">
                    <NavItem 
                        icon={<LayoutDashboardIcon />} 
                        title="Dashboard" 
                        isActive={activePage === 'Dashboard'} 
                        onClick={() => handleNavClick('Dashboard')} 
                    />
                    <NavItem 
                        icon={<ClipboardListIcon />} 
                        title="Leads" 
                        isActive={activePage === 'Leads'} 
                        onClick={() => handleNavClick('Leads')} 
                    />
                    <NavItem 
                        icon={<HomeIcon />} 
                        title="Homeowners" 
                        isActive={activePage === 'Homeowners'} 
                        onClick={() => handleNavClick('Homeowners')} 
                    />
                    <NavItem 
                        icon={<WrenchIcon />} 
                        title="Installers" 
                        isActive={activePage === 'Installers'} 
                        onClick={() => handleNavClick('Installers')} 
                    />
                    <NavItem 
                        icon={<MailIcon />} 
                        title="Newsletter" 
                        isActive={activePage === 'Newsletter'} 
                        onClick={() => handleNavClick('Newsletter')} 
                    />
                    <NavItem 
                        icon={<CalculatorIcon />} 
                        title="Instant Quotes" 
                        isActive={activePage === 'Instant Quotes'} 
                        onClick={() => handleNavClick('Instant Quotes')} 
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

export default AdminMobileSidebarMenu;