import React from 'react';
import { type Theme } from './ThemeProvider';
import { ThemeSwitcher } from './ThemeSwitcher';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// Local ThemeSwitcher component removed - now using centralized version from ./ThemeSwitcher
interface HeaderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isLoggedIn: boolean;
    onLoginClick: () => void;
    onSignupClick: () => void;
    onLogoutClick: () => void;
    onHomeClick: () => void;
    onDashboardClick: () => void;
    onHomeownerDashboardClick: () => void;
    onInstallerDashboardClick: () => void;
    onInstallerHomeClick: () => void;
    onAdminDashboardClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, isLoggedIn, onLoginClick, onSignupClick, onLogoutClick, onHomeClick, onDashboardClick, onHomeownerDashboardClick, onInstallerDashboardClick, onInstallerHomeClick, onAdminDashboardClick }) => {

  return (
    <header className="py-4 sm:py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Neumorphic Rounded Bar */}
        <div className="bg-background rounded-full shadow-neu-outset px-6 py-3 transition-colors duration-300 hover:shadow-neu-outset-lg">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button onClick={onHomeClick} className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity">
              <SunIcon />
              <span className="text-heading-3 sm:text-heading-2 text-primary">SolarMatch</span>
            </button>
            
            {/* Right Side: Theme Switcher + Navigation */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Theme Switcher */}
              <ThemeSwitcher />
              
              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center space-x-2">
                {isLoggedIn ? (
                  <>
                    <button 
                      onClick={onDashboardClick}
                      className="px-5 py-2 text-body-small tracking-wider text-foreground hover:text-primary transition-colors rounded-full bg-background shadow-neu-outset-sm hover:shadow-neu-inset-sm active:shadow-neu-inset-sm active:scale-[0.98]"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={onLogoutClick}
                      className="px-5 py-2 text-body-small tracking-wider text-foreground hover:text-primary transition-colors rounded-full bg-background shadow-neu-outset-sm hover:shadow-neu-inset-sm active:shadow-neu-inset-sm active:scale-[0.98]"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={onLoginClick}
                      className="px-5 py-2 text-body-small tracking-wider text-foreground hover:text-primary transition-colors rounded-full bg-background shadow-neu-outset-sm hover:shadow-neu-inset-sm active:shadow-neu-inset-sm active:scale-[0.98]"
                    >
                      Login
                    </button>
                    <button 
                      onClick={onSignupClick}
                      className="px-5 py-2 text-body-small tracking-wider border border-primary text-primary rounded-full bg-transparent shadow-neu-outset-sm hover:shadow-neu-inset-sm active:shadow-neu-inset-sm active:scale-[0.98]"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;