'use client';

import React from 'react';

import { Badge } from '../../components/shared/Badge';
import { Building } from '../../index';
import { Button } from '../../primitives/Button';
import { Container } from '../../primitives/Container';

const LogInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>;

export interface TopBarProps {
  onBecomePartnerClick: () => void;
  onPartnerSignInClick: () => void;
}

export function TopBar({ onBecomePartnerClick, onPartnerSignInClick }: TopBarProps) {
  return (
    <div id="top-bar" className="ui-topbar-band">
      <Container>
        <div className="ui-topbar">
          <Badge tone="neutral" className="ui-topbar__badge">
            <Building className="ui-topbar__icon" />
            <span className="ui-topbar__label">For Solar Installers:</span>
          </Badge>

          <div className="ui-topbar__actions">
            <Button onClick={onBecomePartnerClick} variant="secondary" size="sm" className="ui-topbar__action ui-topbar__action--subtle">
              <Building className="ui-topbar__icon" />
              <span className="ui-topbar__action-label">Become a Partner</span>
            </Button>

            <Button onClick={onPartnerSignInClick} variant="secondary" size="sm" className="ui-topbar__action ui-topbar__action--accent">
              <LogInIcon />
              <span className="ui-topbar__action-label">Partner Sign In</span>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}