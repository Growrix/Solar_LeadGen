"use client";

import React, { useState } from"react";
import Image from"next/image";
import { ThemeSwitcher } from"@/components/ThemeSwitcher";
import { NotificationDropdown } from"@/components/NotificationDropdown";
import { Search as SearchIcon, HelpCircle as HelpCircleIcon } from"lucide-react";

interface HomeownerDashboardHeaderProps {
  pageTitle: string;
}

export const HomeownerDashboardHeader: React.FC<HomeownerDashboardHeaderProps> = ({ pageTitle }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="dashboard-header dashboard-header--blur">
      <div className="dashboard-header__left">
        <h1 className="dashboard-header__title">{pageTitle}</h1>
      </div>
      <div className="dashboard-header__right">
        {/* Search Input */}
        <div className={`dashboard-header__search ${isSearchOpen ?"dashboard-header__search--active" :""}`}>
          <input 
            type="text" 
            placeholder="Search..." 
            className={`dashboard-header__search-input ${isSearchOpen ?"dashboard-header__search-input--expanded" :"dashboard-header__search-input--collapsed"}`}
          />
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
            className="dashboard-header__action-btn" 
            aria-label="Toggle search"
          >
            <SearchIcon />
          </button>
        </div>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Help Button (Hidden on mobile) */}
        <button 
          className="dashboard-header__action-btn dashboard-header__action-btn--hidden-sm"
          aria-label="Help"
        >
          <HelpCircleIcon />
        </button>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* User Avatar */}
        <button 
          className="dashboard-header__avatar"
          aria-label="User profile"
        >
          <Image 
            src="https://picsum.photos/seed/user/40/40" 
            alt="User Avatar" 
            width={40} 
            height={40} 
            className="dashboard-header__avatar-img" 
          />
        </button>
      </div>
    </header>
  );
};
