import React, { useState, useEffect } from 'react';
import { Sun, Menu, X, Layout } from 'lucide-react';
import { Button } from '../ui/Button';
import { APP_NAME, NAV_ITEMS, UI_LABELS, ARIA_LABELS } from '../../constants/labels';

interface HeaderProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activePage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('#')) {
      // If we are not on home, switch to home first
      if (activePage !== 'home') {
        onNavigate('home');
        // Small delay to allow render before scrolling
        setTimeout(() => {
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        // Just scroll
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
        // Handle explicit page navigations if any future ones are added
    }
  };

  const handleLogoClick = () => {
      onNavigate('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled || activePage !== 'home'
          ? 'bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-lg' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer group bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg"
            aria-label={ARIA_LABELS.logo}
          >
            <div className="bg-brand-500 p-1.5 rounded-full transition-transform group-hover:rotate-12">
              <Sun className="h-6 w-6 text-brand-900" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              {APP_NAME}
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="text-slate-300 hover:text-brand-400 font-medium transition-colors text-sm uppercase tracking-wide bg-transparent border-none cursor-pointer focus:outline-none focus:text-white"
              >
                {item.label}
              </button>
            ))}
            
            {/* Component Library Link */}
            <button
                onClick={() => onNavigate('components')}
                className={`flex items-center gap-1.5 text-sm uppercase tracking-wide font-medium transition-colors border-none bg-transparent cursor-pointer focus:outline-none ${
                    activePage === 'components' ? 'text-brand-500' : 'text-slate-300 hover:text-brand-400'
                }`}
            >
                <Layout className="w-4 h-4" />
                {UI_LABELS.components}
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <Button variant="primary" size="sm">
              {UI_LABELS.signIn}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-md"
              aria-label={ARIA_LABELS.toggleMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:bg-slate-800"
              >
                {item.label}
              </button>
            ))}
            <button
                onClick={() => {
                    onNavigate('components');
                    setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:bg-slate-800"
            >
                <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    {UI_LABELS.components}
                </div>
            </button>
            <div className="mt-4 px-3">
              <Button fullWidth variant="primary">{UI_LABELS.signIn}</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};