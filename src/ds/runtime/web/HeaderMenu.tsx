'use client';

import Link from 'next/link';

import { Badge } from '../../components/shared/Badge';
import { ThemeSwitcher } from '../../components/shared/ThemeSwitcher';
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

export function HeaderMenu({
  isLoggedIn = false,
  onLoginClick = () => console.log('Login clicked'),
  onSignupClick = () => console.log('Signup clicked'),
  onLogoutClick = () => console.log('Logout clicked'),
  onDashboardClick = () => console.log('Dashboard clicked'),
}: HeaderMenuProps) {
  return (
    <header className="ui-public-header ui-header-pad">
      <Container>
        <div className="ui-public-header__bar">
          <div className="ui-public-header__inner">
            <div className="ui-public-header__brand-group">
              <Link href="/" className="ui-public-header__brand">
                <SunIcon />
                <span className="text-heading-2 ui-public-header__brand-wordmark">SolarMatch</span>
              </Link>
              <Link href="/component-library" className="ui-public-header__devlink text-caption">
                <span>Component Library</span>
                <Badge tone="warning" className="ui-public-header__devbadge">DEV</Badge>
              </Link>
            </div>

            <div className="ui-public-header__controls">
              <ThemeSwitcher />

              <div className="ui-public-header__actions">
                {isLoggedIn ? (
                  <>
                    <Button onClick={onDashboardClick} variant="ghost" size="sm">
                      Dashboard
                    </Button>
                    <Button onClick={onLogoutClick} variant="secondary" size="sm">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={onLoginClick} variant="ghost" size="sm">
                      Login
                    </Button>
                    <Button onClick={onSignupClick} variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}