'use client';

import React from 'react';

// Icon Components - Matching HomeownerBottomNavBar style
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const ArticlesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" x2="8" y1="13" y2="13"/>
    <line x1="16" x2="8" y1="17" y2="17"/>
    <line x1="10" x2="8" y1="9" y2="9"/>
  </svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
    <path d="M7 7h.01"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

interface GuestBottomNavBarProps {
  onArticlesClick: () => void;
  onRebateClick: () => void;
  onLoginClick: () => void;
  onHomeClick?: () => void;
  onSignupClick?: () => void;
}

// NavItem component matching HomeownerBottomNavBar style
const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void; 
}> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    className="flex flex-col items-center justify-center space-y-1 w-full pt-2 pb-1 transition-colors duration-200 text-muted hover:text-primary/80"
  >
    {icon}
    <span className="text-caption">{label}</span>
  </button>
);

const GuestBottomNavBar: React.FC<GuestBottomNavBarProps> = ({ 
  onArticlesClick, 
  onRebateClick, 
  onLoginClick, 
  onHomeClick,
  onSignupClick
}) => {
  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        <NavItem icon={<HomeIcon />} label="Home" onClick={handleHomeClick} />
        <NavItem icon={<ArticlesIcon />} label="Articles" onClick={onArticlesClick} />
        <NavItem icon={<TagIcon />} label="Rebates" onClick={onRebateClick} />
        {onSignupClick && (
          <NavItem icon={<UserIcon />} label="Sign Up" onClick={onSignupClick} />
        )}
        <NavItem icon={<UserIcon />} label="Login" onClick={onLoginClick} />
      </div>
    </div>
  );
};

export default GuestBottomNavBar;
