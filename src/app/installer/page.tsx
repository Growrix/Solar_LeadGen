'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme, type Theme } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InstallerBottomNavBar from '@/components/InstallerBottomNavBar';
import InstallerMobileSidebarMenu from '@/components/InstallerMobileSidebarMenu';
import Button from '@/components/ui/button';

const InfoCard: React.FC<{ 
  icon: string; 
  title: string; 
  delay: string; 
  children: React.ReactNode 
}> = ({ icon, title, delay, children }) => (
  <div className="animate-fade-in-up h-full" style={{ animationDelay: delay }}>
    <div className="theme-card h-full p-6 text-left">
      <div className="text-heading-1 mb-4">{icon}</div>
      <h3 className="text-heading-4 text-foreground mb-2">{title}</h3>
      <p className="text-muted text-body-small leading-relaxed">{children}</p>
    </div>
  </div>
);

export default function InstallerHomePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activePage, setActivePage] = useState('Home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Header visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 80) {
        if (Math.abs(currentScrollY - lastScrollY) > 5) {
          setIsHeaderVisible(currentScrollY < lastScrollY);
        }
      } else {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    // Clear authentication state using NextAuth
    await signOut({ redirect: false });
    // Redirect to guest homepage
    router.push('/');
  };

  const handleNewBidClick = () => {
    console.log('New bid clicked');
    // TODO: Open new bid/quote modal
  };

  const handleMenuClick = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleDashboardClick = () => {
    router.push('/installer/dashboard');
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleHomeownerDashboardClick = () => {
    router.push('/homeowner/dashboard');
  };

  const handleInstallerDashboardClick = () => {
    router.push('/installer/dashboard');
  };

  const handleInstallerHomeClick = () => {
    router.push('/installer');
  };

  const handleAdminDashboardClick = () => {
    console.log('Admin dashboard clicked');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-foreground">
      <div className={`sticky top-0 z-30 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <Header
          theme={theme}
          setTheme={setTheme}
          isLoggedIn={true}
          onLoginClick={() => {}}
          onSignupClick={() => {}}
          onLogoutClick={handleLogout}
          onHomeClick={handleHomeClick}
          onDashboardClick={handleDashboardClick}
          onHomeownerDashboardClick={handleHomeownerDashboardClick}
          onInstallerDashboardClick={handleInstallerDashboardClick}
          onInstallerHomeClick={handleInstallerHomeClick}
          onAdminDashboardClick={handleAdminDashboardClick}
        />
      </div>
      <main className="flex-grow">
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
            <div className="absolute top-60 left-1/3 w-6 h-6 bg-primary/15 transform rotate-45" style={{ animation: 'float-slow 8s ease-in-out infinite 1s' }}></div>
            <div className="absolute bottom-60 right-1/3 w-10 h-10 border border-border" style={{ animation: 'float-medium 6s ease-in-out infinite 1s' }}></div>
            
            {/* Pulsating Sun Element */}
            <div className="absolute top-32 right-32">
              <div className="w-24 h-24 bg-primary rounded-full relative" style={{ animation: 'pulse-sun 3s ease-in-out infinite' }}>
                {/* Sun Rays */}
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="ray" style={{ transform: `rotate(${i * 45}deg)` }}>
                      <div style={{ animation: `ray-glow 2s ease-in-out infinite ${i * 0.25}s` }}></div>
                    </div>
                  ))}
                </div>
                
                {/* Energy Particles */}
                <div>
                  <div className="particle" style={{ animation: 'particle-flow-1 4s linear infinite' }}></div>
                  <div className="particle" style={{ animation: 'particle-flow-2 4s linear infinite 0.8s' }}></div>
                  <div className="particle" style={{ animation: 'particle-flow-3 4s linear infinite 1.6s' }}></div>
                  <div className="particle" style={{ animation: 'particle-flow-4 4s linear infinite 2.4s' }}></div>
                  <div className="particle" style={{ animation: 'particle-flow-5 4s linear infinite 3.2s' }}></div>
                </div>
              </div>
            </div>
            
            {/* Solar Panels */}
            <div className="absolute bottom-20 left-20">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="relative w-16 h-10 m-1 inline-block" style={{ animation: `panel-track 6s ease-in-out infinite ${i * 0.5}s` }}>
                  <div className="panel-surface w-full h-full bg-slate-200 border border-primary/20 rounded relative">
                    <div className="panel-glow" style={{ animation: `panel-glow-anim 4s ease-in-out infinite ${i * 0.3}s` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
              <h1 className="text-heading-1 md:text-heading-1 lg:text-heading-1 leading-tight mb-4 text-foreground">
                Grow Smarter.
                <span className="text-primary"> Not Harder.</span>
              </h1>
              <p className="text-heading-4 md:text-heading-3 text-muted mb-10 max-w-2xl mx-auto">
                From lead capture to compliance, future-proof your solar business with tools built for Australian installers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleDashboardClick}
                  variant="secondary"
                  className="px-8 py-3 rounded-xl text-heading-4 w-full flex items-center justify-center"
                >
                  Try It Free
                </Button>
                <button className="bg-transparent border-2 border-slate-800 text-foreground px-8 py-3 rounded-xl text-heading-4 hover:bg-surface hover:text-foreground-secondary transition-colors shadow-lg">
                  Watch Installer Stories
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="installer-how-it-works-section py-16 sm:py-24">
          <div className="animated-grid-background"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-heading-1 md:text-heading-1 text-foreground mb-4">
                How SolarMatch Works for You
              </h2>
              <p className="text-heading-4 text-muted">
                A simple, powerful platform designed to connect you with quality leads and streamline your workflow.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <InfoCard icon="📊" title="Smarter Leads" delay="0.2s">
                Stop chasing cold calls, get verified homeowner leads.
              </InfoCard>
              <InfoCard icon="📑" title="Compliance Made Easy" delay="0.4s">
                Always up to date with rebates & CEC standards.
              </InfoCard>
              <InfoCard icon="🔗" title="Seamless Integration" delay="0.6s">
                CRM, finance, and job management in one place.
              </InfoCard>
            </div>
          </div>
        </section>
      </main>
      
      <Footer 
        onBecomePartnerClick={handleDashboardClick}
        onPartnerSignInClick={handleDashboardClick}
        onScrollToQuote={() => {}}
        onScrollToRebate={() => {}}
        onBlogClick={() => {}}
        onGovernmentNewsClick={() => {}}
      />

      {/* Mobile Bottom Navigation */}
      <InstallerBottomNavBar 
        activePage={activePage}
        setActivePage={setActivePage}
        onNewBidClick={handleNewBidClick}
        onMenuClick={handleMenuClick}
        currentPage="home"
        onHomeClick={() => {}}
        onDashboardClick={handleDashboardClick}
        unreadMessagesCount={3}
        newLeadsCount={5}
      />

      {/* Mobile Sidebar Menu */}
      <InstallerMobileSidebarMenu 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogoutClick={handleLogout}
        unreadMessagesCount={3}
        newLeadsCount={5}
      />
    </div>
  );
}
