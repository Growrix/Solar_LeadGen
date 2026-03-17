'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { DropdownMenu, DropdownMenuButton } from '../../components/shared/DropdownMenu';
import { Button } from '../../primitives/Button';
import { Container } from '../../primitives/Container';

export const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="ui-public-header__brand-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export interface HeaderMenuProps {
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onLogoutClick?: () => void;
  onDashboardClick?: () => void;
  onHomeownerDashboardClick?: () => void;
  onInstallerDashboardClick?: () => void;
  onInstallerHomeClick?: () => void;
  onAdminDashboardClick?: () => void;
}

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ui-public-header__menu-icon">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ui-public-header__menu-icon">
    <path d="M3 6h18" />
    <path d="M3 12h18" />
    <path d="M3 18h18" />
  </svg>
);

export function HeaderMenu({
  isLoggedIn = false,
  onLoginClick = () => console.log('Login clicked'),
  onSignupClick = () => console.log('Signup clicked'),
  onLogoutClick = () => console.log('Logout clicked'),
  onDashboardClick = () => console.log('Dashboard clicked'),
}: HeaderMenuProps) {
  const router = useRouter();

  return (
    <header className="ui-public-header ui-header-pad">
      <Container width="wide">
        <div className="ui-public-header__bar">
          <div className="ui-public-header__inner">
            <div className="ui-public-header__brand-group">
              <Link href="/" className="ui-public-header__brand">
                <SunIcon />
                <span className="ui-public-header__brand-wordmark">SolarMatch</span>
              </Link>
            </div>

            <nav className="ui-public-header__nav" aria-label="Primary">
              <Link href="/" className="ui-public-header__navlink">Home</Link>
              <Link href="/blog" className="ui-public-header__navlink">Blog</Link>
              <Link href="/#news-section" className="ui-public-header__navlink">News</Link>
              <DropdownMenu
                className="ui-public-header__menu"
                trigger={(
                  <button type="button" className="ui-public-header__menu-trigger" aria-label="Open calculators menu">
                    <span>Calculators</span>
                    <ChevronDownIcon />
                  </button>
                )}
              >
                <DropdownMenuButton onClick={() => router.push('/#instant-quote-calculator')}>
                  Instant Quote Calculator
                </DropdownMenuButton>
                <DropdownMenuButton onClick={() => router.push('/#battery-rebate-calculator')}>
                  Battery Rebate Calculator
                </DropdownMenuButton>
              </DropdownMenu>
              <Link href="/#contact-section" className="ui-public-header__navlink">Contact</Link>
            </nav>

            <div className="ui-public-header__controls">
              <div className="ui-public-header__actions">
                {isLoggedIn ? (
                  <>
                    <Button onClick={onDashboardClick} variant="ghost" size="sm" className="ui-public-header__action ui-public-header__action--login">
                      Dashboard
                    </Button>
                    <Button onClick={onLogoutClick} variant="secondary" size="sm" className="ui-public-header__action ui-public-header__action--signup">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={onLoginClick} variant="ghost" size="sm" className="ui-public-header__action ui-public-header__action--login">
                      Login
                    </Button>
                    <Button onClick={onSignupClick} variant="primary" size="sm" className="ui-public-header__action ui-public-header__action--signup">
                      Sign Up
                    </Button>
                  </>
                )}
              </div>

              <DropdownMenu
                className="ui-public-header__mobile-menu"
                panelClassName="ui-public-header__mobile-panel"
                trigger={(
                  <button type="button" className="ui-public-header__mobile-trigger" aria-label="Open site menu">
                    <MenuIcon />
                  </button>
                )}
              >
                <DropdownMenuButton className="ui-public-header__mobile-item" onClick={() => router.push('/')}>
                  Home
                </DropdownMenuButton>
                <DropdownMenuButton className="ui-public-header__mobile-item" onClick={() => router.push('/blog')}>
                  Blog
                </DropdownMenuButton>
                <DropdownMenuButton className="ui-public-header__mobile-item" onClick={() => router.push('/#news-section')}>
                  News
                </DropdownMenuButton>
                <DropdownMenuButton className="ui-public-header__mobile-item" onClick={() => router.push('/#instant-quote-calculator')}>
                  Instant Quote Calculator
                </DropdownMenuButton>
                <DropdownMenuButton className="ui-public-header__mobile-item" onClick={() => router.push('/#battery-rebate-calculator')}>
                  Battery Rebate Calculator
                </DropdownMenuButton>
                <DropdownMenuButton className="ui-public-header__mobile-item" onClick={() => router.push('/#contact-section')}>
                  Contact
                </DropdownMenuButton>
                {isLoggedIn ? (
                  <>
                    <DropdownMenuButton className="ui-public-header__mobile-item" onClick={onDashboardClick}>
                      Dashboard
                    </DropdownMenuButton>
                    <DropdownMenuButton className="ui-public-header__mobile-item" onClick={onLogoutClick}>
                      Logout
                    </DropdownMenuButton>
                  </>
                ) : (
                  <>
                    <DropdownMenuButton className="ui-public-header__mobile-item" onClick={onLoginClick}>
                      Login
                    </DropdownMenuButton>
                    <DropdownMenuButton className="ui-public-header__mobile-item" onClick={onSignupClick}>
                      Sign Up
                    </DropdownMenuButton>
                  </>
                )}
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}