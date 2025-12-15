'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HomeownerBottomNavBar from '@/components/HomeownerBottomNavBar';
import HomeownerMobileSidebarMenu from '@/components/HomeownerMobileSidebarMenu';
import Button from '@/components/ui/button';

// Icon Components
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/></svg>;

const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>;

export default function HomeownerHomePage() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard Overview');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    console.log('Logout clicked');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-teal-50/30 to-white">
      {/* Hero Section */}
      <section className="hero-section relative flex items-center justify-center min-h-[70vh] sm:min-h-[calc(100vh-80px)] overflow-hidden pt-8 sm:pt-24 pb-12 sm:pb-0">
        {/* Gradient Overlay */}
        <div className="gradient-overlay absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 hidden md:block">
          {/* Floating Geometric Shapes */}
          <div className="absolute top-20 left-10 w-16 h-16 border border-primary/20" style={{ animation: 'float-slow 8s ease-in-out infinite' }}></div>
          <div className="absolute top-40 right-20 w-8 h-8 bg-primary/10 rounded-full" style={{ animation: 'float-medium 6s ease-in-out infinite' }}></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 border-2 border-slate-500/20 rounded-full" style={{ animation: 'float-fast 4s ease-in-out infinite' }}></div>
          
          {/* Pulsating Sun Element */}
          <div className="absolute top-32 right-32">
            <div className="w-24 h-24 bg-primary rounded-full relative" style={{ animation: 'pulse-sun 3s ease-in-out infinite' }}>
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="ray" style={{ transform: `rotate(${i * 45}deg)` }}>
                    <div style={{ animation: `ray-glow 2s ease-in-out infinite ${i * 0.25}s` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <SunIcon />
            </div>
            
            <h1 className="text-heading-1 sm:text-heading-1 md:text-heading-1 text-foreground mb-4 tracking-tight" style={{ animation: 'fade-in-up 0.8s ease-out' }}>
              Welcome to Your
              <br />
              <span className="text-primary">Solar Journey</span>
            </h1>
            
            <p className="text-heading-4 sm:text-heading-3 text-muted mb-8 leading-relaxed max-w-3xl mx-auto" style={{ animation: 'fade-in-up 0.8s ease-out 0.2s both' }}>
              You&apos;re one step closer to clean, affordable energy. Let&apos;s find the perfect solar solution for your home.
            </p>

            <div className="flex justify-center mb-12" style={{ animation: 'fade-in-up 0.8s ease-out 0.4s both' }}>
              <Button 
                onClick={() => router.push('/homeowner/dashboard')}
                variant="secondary"
                className="px-8 py-4 rounded-xl text-heading-4 w-full flex items-center justify-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface/70 backdrop-blur-sm rounded-2xl p-6 border border-border hover:shadow-lg transition-colors">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
              <CheckCircleIcon />
            </div>
            <h3 className="text-heading-4 text-foreground mb-2 text-center">Track Your Quotes</h3>
            <p className="text-body-small text-muted text-center">
              Monitor all your quote requests and compare installer offers in one place.
            </p>
          </div>

          <div className="bg-surface/70 backdrop-blur-sm rounded-2xl p-6 border border-border hover:shadow-lg transition-colors">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
              <ZapIcon />
            </div>
            <h3 className="text-heading-4 text-foreground mb-2 text-center">Bidding Room</h3>
            <p className="text-body-small text-muted text-center">
              Watch installers compete for your business with transparent pricing.
            </p>
          </div>

          <div className="bg-surface/70 backdrop-blur-sm rounded-2xl p-6 border border-border hover:shadow-lg transition-colors">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
              <MessageSquareIcon />
            </div>
            <h3 className="text-heading-4 text-foreground mb-2 text-center">Direct Messaging</h3>
            <p className="text-body-small text-muted text-center">
              Chat directly with CEC-accredited installers about your solar needs.
            </p>
          </div>

          <div className="bg-surface/70 backdrop-blur-sm rounded-2xl p-6 border border-border hover:shadow-lg transition-colors">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
              <ShieldCheckIcon />
            </div>
            <h3 className="text-heading-4 text-foreground mb-2 text-center">Verified Installers</h3>
            <p className="text-body-small text-muted text-center">
              All installers are pre-vetted and CEC-accredited for your peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile Navigation */}
      <HomeownerBottomNavBar 
        activePage={activePage}
        setActivePage={setActivePage}
        onNewQuoteClick={() => router.push('/homeowner/dashboard')}
        currentPage="home"
        onHomeClick={() => {}}
        onDashboardClick={() => router.push('/homeowner/dashboard')}
        onMenuClick={() => setIsMobileMenuOpen(true)}
        onMessagesClick={() => router.push('/homeowner/dashboard')}
        unreadMessagesCount={3}
      />
      <HomeownerMobileSidebarMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogoutClick={handleLogout}
      />
    </div>
  );
}
