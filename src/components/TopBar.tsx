'use client';

import React from 'react';

const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="9" x2="9" y1="22" y2="4"/><line x1="15" x2="15" y1="22" y2="4"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const LogInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>;

interface TopBarProps {
  onBecomePartnerClick: () => void;
  onPartnerSignInClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onBecomePartnerClick, onPartnerSignInClick }) => {

  return (
    <div id="top-bar" className="py-2 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between text-caption">
          {/* Left Side - Neumorphic Label Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background shadow-neu-inset text-muted-foreground">
            <BuildingIcon />
            <span className="hidden sm:inline">For Solar Installers:</span>
          </div>
          
          {/* Right Side - Neumorphic Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onBecomePartnerClick}
              className="px-3 py-1.5 rounded-full bg-background shadow-neu-outset hover:shadow-neu-outset-lg active:shadow-neu-inset transition-colors duration-200 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <BuildingIcon />
              <span className="hidden md:inline">Become a Partner</span>
            </button>
            
            <button
              onClick={onPartnerSignInClick}
              className="px-3 py-1.5 rounded-full bg-background shadow-neu-outset hover:shadow-neu-outset-lg active:shadow-neu-inset transition-colors duration-200 flex items-center gap-1.5 text-primary hover:text-primary/90"
            >
              <LogInIcon />
              <span className="hidden md:inline">Partner Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
