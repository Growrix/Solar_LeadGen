import React, { useState, useEffect } from 'react';
import { Sun, Menu, X, Layout } from 'lucide-react';
import { Button } from '../ui/Button';
import { APP_NAME, NAV_ITEMS, UI_LABELS, ARIA_LABELS } from '../../constants/labels';
import { Container, GlassSurface } from '@/ds';

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
    <GlassSurface
      as="header"
      enabled={isScrolled || activePage !== 'home'}
      className={`fixed top-0 left-0 w-full z-50 transition duration-300${
        isScrolled || activePage !== 'home'
          ? ' bg-background/90 border-b shadow-lg'
          : ' bg-transparent border-b border-transparent'
      }`}
    >
      <Container>
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer group bg-transparent border-none p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
            aria-label={ARIA_LABELS.logo}
          >
            <div className="bg-accent p-1.5 rounded-full transition-transform group-hover:rotate-12">
              <Sun className="h-6 w-6 text-accent" />
            </div>
            <span className="text-foreground-secondary tracking-tight text-heading-4">
              {APP_NAME}
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="text-icon hover:text-accent transition-colors uppercase tracking-wide bg-transparent border-none cursor-pointer focus:outline-none focus:text-foreground-secondary text-body-small"
              >
                {item.label}
              </button>
            ))}
            
            {/* Component Library Link */}
            <button
                onClick={() => onNavigate('components')}
              className={`flex items-center gap-1.5 uppercase tracking-wide transition-colors border-none bg-transparent cursor-pointer focus-visible:outline-none text-body-small${activePage === 'components' ? ' text-accent' : ' text-icon hover:text-accent'}`}
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
              className="text-icon hover:text-foreground-secondary p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
              aria-label={ARIA_LABELS.toggleMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="block w-full text-left px-3 py-2 rounded-md text-icon hover:text-foreground-secondary hover:bg-surface focus:outline-none focus:bg-surface text-body"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate('components');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-icon hover:text-foreground-secondary hover:bg-surface focus:outline-none focus:bg-surface text-body"
            >
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                {UI_LABELS.components}
              </div>
            </button>
            <div className="mt-4 px-3">
              <Button fullWidth variant="primary">
                {UI_LABELS.signIn}
              </Button>
            </div>
          </div>
        </div>
      )}
    </GlassSurface>
  );
};