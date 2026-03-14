'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

import { HeaderMenu } from './HeaderMenu';
import { TopBar } from './TopBar';

const InstallerEligibilityModal = dynamic(() => import('@/components/InstallerEligibilityModal'), { ssr: false });
const InstallerSignInModal = dynamic(() => import('@/components/InstallerSignInModal'), { ssr: false });
const InstallerSignupModal = dynamic(() => import('@/components/InstallerSignupModal'), { ssr: false });
const HomeownerSignupModal = dynamic(() => import('@/components/HomeownerSignupModal'), { ssr: false });
const HomeownerSignInModal = dynamic(() => import('@/components/HomeownerSignInModal'), { ssr: false });
const GuestBottomNavBar = dynamic(() => import('@/components/GuestBottomNavBar'), { ssr: false });
const HomeownerBottomNavBar = dynamic(() => import('@/components/HomeownerBottomNavBar'), { ssr: false });
const HomeownerMobileSidebarMenu = dynamic(() => import('@/components/HomeownerMobileSidebarMenu'), { ssr: false });
const NewQuoteRequestModal = dynamic(() => import('@/components/NewQuoteRequestModal'), { ssr: false });
const MessagingModal = dynamic(() => import('@/components/MessagingModal'), { ssr: false });

export function AppChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isInstallerRoute = pathname?.startsWith('/installer');
  const isHomeownerRoute = pathname?.startsWith('/homeowner');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isDashboardRoute = pathname === '/homeowner/dashboard' || pathname === '/installer/leads' || pathname === '/admin/dashboard';
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [isInstallerSignInModalOpen, setIsInstallerSignInModalOpen] = useState(false);
  const [isInstallerSignupModalOpen, setIsInstallerSignupModalOpen] = useState(false);
  const [isHomeownerSignupModalOpen, setIsHomeownerSignupModalOpen] = useState(false);
  const [isHomeownerSignInModalOpen, setIsHomeownerSignInModalOpen] = useState(false);
  const [activeDashboardPage, setActiveDashboardPage] = useState('Dashboard Overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'signin' && status === 'unauthenticated') {
      setIsHomeownerSignInModalOpen(true);
    }
  }, [session, status]);

  useEffect(() => {
    let lastScroll = 0;
    const SCROLL_DELTA = 5;
    const HEADER_HEIGHT = 80;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll <= HEADER_HEIGHT) {
        setIsHeaderVisible(true);
        lastScroll = currentScroll;
        return;
      }

      if (Math.abs(currentScroll - lastScroll) < SCROLL_DELTA) {
        return;
      }

      setIsHeaderVisible(currentScroll <= lastScroll);
      lastScroll = currentScroll <= 0 ? 0 : currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBecomePartner = () => setIsEligibilityModalOpen(true);
  const handlePartnerSignIn = () => setIsInstallerSignInModalOpen(true);
  const handleEligible = () => {
    setIsEligibilityModalOpen(false);
    setIsInstallerSignupModalOpen(true);
  };

  const redirectByRole = async (fallback: string) => {
    try {
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();
      const role = sessionData?.user?.role;

      if (role === 'INSTALLER') {
        router.push('/installer/leads');
      } else if (role === 'HOMEOWNER') {
        router.push('/homeowner/dashboard');
      } else if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push(fallback);
      }
    } catch {
      router.push(fallback);
    }
  };

  const handleInstallerSignupSuccess = async () => {
    setIsInstallerSignupModalOpen(false);
    await redirectByRole('/installer/leads');
  };

  const handleInstallerSignInSuccess = async () => {
    setIsInstallerSignInModalOpen(false);
    await redirectByRole('/installer/leads');
  };

  const handleLoginClick = () => setIsHomeownerSignInModalOpen(true);
  const handleSignupClick = () => setIsHomeownerSignupModalOpen(true);

  const handleHomeownerSignupSuccess = async () => {
    setIsHomeownerSignupModalOpen(false);
    await redirectByRole('/homeowner/dashboard');
  };

  const handleHomeownerSignInSuccess = async () => {
    setIsHomeownerSignInModalOpen(false);
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'signin') {
      window.history.replaceState({}, '', window.location.pathname);
      window.location.reload();
      return;
    }
    await redirectByRole('/homeowner/dashboard');
  };

  const handleLogoutClick = async () => {
    await signOut({ redirect: false });
    setIsLoggedIn(false);
    router.push('/');
  };

  const handleSwitchToSignIn = () => {
    setIsHomeownerSignupModalOpen(false);
    setIsHomeownerSignInModalOpen(true);
  };

  const handleSwitchToSignUp = () => {
    setIsHomeownerSignInModalOpen(false);
    setIsHomeownerSignupModalOpen(true);
  };

  const handleGuestHome = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    router.push('/');
  };

  const handleGuestArticles = () => {
    if (pathname?.startsWith('/blog')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    router.push('/blog');
  };

  const handleScrollToRebate = () => {
    if (pathname === '/') {
      document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    router.push('/#calculator-section');
  };

  const handleHomeownerHomeClick = () => router.push('/');
  const handleHomeownerDashboardClick = () => router.push('/homeowner/dashboard');
  const handleDashboardClick = () => {
    const role = session?.user?.role;
    if (role === 'INSTALLER') {
      router.push('/installer/leads');
    } else if (role === 'HOMEOWNER') {
      router.push('/homeowner/dashboard');
    } else if (role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (pathname?.startsWith('/installer')) {
      router.push('/installer/leads');
    } else if (pathname?.startsWith('/admin')) {
      router.push('/admin/dashboard');
    } else {
      router.push('/homeowner/dashboard');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const isGuestPage = pathname === '/' || pathname?.startsWith('/blog');

  return (
    <div className="ui-page">
      {!isInstallerRoute && !isHomeownerRoute && !isAdminRoute && (
        <div className={`ui-sticky-top transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
          {!isLoggedIn ? <TopBar onBecomePartnerClick={handleBecomePartner} onPartnerSignInClick={handlePartnerSignIn} /> : null}
          <HeaderMenu
            isLoggedIn={isLoggedIn}
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignupClick}
            onLogoutClick={handleLogoutClick}
            onDashboardClick={handleDashboardClick}
            onHomeownerDashboardClick={handleHomeownerDashboardClick}
            onInstallerDashboardClick={() => router.push('/installer/leads')}
            onInstallerHomeClick={() => router.push('/installer')}
            onAdminDashboardClick={() => router.push('/admin/dashboard')}
          />
        </div>
      )}

      <div className="ui-page-main">{children}</div>

      <InstallerEligibilityModal isOpen={isEligibilityModalOpen} onClose={() => setIsEligibilityModalOpen(false)} onEligible={handleEligible} />
      <InstallerSignupModal isOpen={isInstallerSignupModalOpen} onClose={() => setIsInstallerSignupModalOpen(false)} onSuccess={handleInstallerSignupSuccess} onSwitchToSignIn={() => { setIsInstallerSignupModalOpen(false); setIsInstallerSignInModalOpen(true); }} />
      <InstallerSignInModal isOpen={isInstallerSignInModalOpen} onClose={() => setIsInstallerSignInModalOpen(false)} onSuccess={handleInstallerSignInSuccess} onOpenSignup={() => { setIsInstallerSignInModalOpen(false); setIsInstallerSignupModalOpen(true); }} />
      <HomeownerSignupModal isOpen={isHomeownerSignupModalOpen} onClose={() => setIsHomeownerSignupModalOpen(false)} onSuccess={handleHomeownerSignupSuccess} onSwitchToSignIn={handleSwitchToSignIn} />
      <HomeownerSignInModal isOpen={isHomeownerSignInModalOpen} onClose={() => setIsHomeownerSignInModalOpen(false)} onSuccess={handleHomeownerSignInSuccess} onSwitchToSignUp={handleSwitchToSignUp} />
      <NewQuoteRequestModal isOpen={isNewQuoteModalOpen} onClose={() => setIsNewQuoteModalOpen(false)} onQuoteCalculated={() => {}} onProceedToDetailedQuote={() => {}} />
      <MessagingModal isOpen={isMessagingModalOpen} onClose={() => setIsMessagingModalOpen(false)} />

      {isLoggedIn && !isDashboardRoute && !isInstallerRoute && !isHomeownerRoute && !isAdminRoute && session?.user?.role === 'HOMEOWNER' ? (
        <>
          <HomeownerBottomNavBar
            activePage={activeDashboardPage}
            setActivePage={setActiveDashboardPage}
            onNewQuoteClick={() => setIsNewQuoteModalOpen(true)}
            currentPage="home"
            onHomeClick={handleHomeownerHomeClick}
            onDashboardClick={handleHomeownerDashboardClick}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            onMessagesClick={() => setIsMessagingModalOpen(true)}
            unreadMessagesCount={3}
            onLogoutClick={handleLogout}
          />
          <HomeownerMobileSidebarMenu
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            activePage={activeDashboardPage}
            setActivePage={setActiveDashboardPage}
            onLogoutClick={handleLogout}
          />
        </>
      ) : !isLoggedIn && isGuestPage ? (
        <GuestBottomNavBar
          onHomeClick={handleGuestHome}
          onArticlesClick={handleGuestArticles}
          onRebateClick={handleScrollToRebate}
          onLoginClick={() => setIsHomeownerSignInModalOpen(true)}
          onSignupClick={handleSignupClick}
        />
      ) : null}
    </div>
  );
}