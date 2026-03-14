'use client';

import React from 'react';
import { Button, Calculator, CheckCircle2, Clock, Container, Star } from '@/ds';

interface HeroProps {
  onInstantQuoteClick: () => void;
  onRebateCalculatorClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onInstantQuoteClick, onRebateCalculatorClick }) => {
  return (
    <section id="hero" className="ui-hero ui-hero--landing">
      <Container>
        <div className="ui-center ui-hero__shell ui-stack">
          <h1 className="ui-hero-title text-foreground">
            Smarter Solar
            <br className="ui-hero__break" />
            <span className="text-foreground whitespace-nowrap"> Starts Here</span>
          </h1>

          <p className="ui-hero-subtitle text-body-large">
            No jargon, no sales — just real numbers, real rebates, and real local installers.
          </p>

          <div className="ui-row ui-row--center ui-hero__actions">
            <Button onClick={onInstantQuoteClick} variant="primary" className="ui-w-full">
              <span>Instant Quote</span>
            </Button>
            <Button onClick={onRebateCalculatorClick} variant="secondary" className="ui-w-full">
              <Calculator className="ui-hero__action-icon" />
              <span>Rebates</span>
            </Button>
          </div>

          <div className="ui-hero-stats">
            <div className="ui-hero-stat">
              <div className="ui-hero-stat__icon">
                <Clock className="ui-hero-stat__icon-svg" />
              </div>
              <div className="ui-hero-stat-value text-foreground">2 min</div>
              <div className="ui-hero-stat-label text-muted-foreground">Quick Assessment</div>
            </div>

            <div className="ui-hero-stat">
              <div className="ui-hero-stat__icon">
                <CheckCircle2 className="ui-hero-stat__icon-svg" />
              </div>
              <div className="ui-hero-stat-value text-foreground">100%</div>
              <div className="ui-hero-stat-label text-muted-foreground">Free Service</div>
            </div>

            <div className="ui-hero-stat">
              <div className="ui-hero-stat__icon">
                <Star className="ui-hero-stat__icon-svg ui-hero-stat__icon-svg--filled" />
              </div>
              <div className="ui-hero-stat-value text-foreground">5★</div>
              <div className="ui-hero-stat-label text-muted-foreground">Rated Installers</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
