'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Badge,
  Button,
  Card,
  CheckCircle2,
  Container,
  FileText,
  Gavel,
  Heading,
  Phone,
  Text,
} from '@/ds';

interface HeroProps {
  onInstantQuoteClick: () => void;
  onRebateCalculatorClick: () => void;
}

const HERO_SLIDE_INTERVAL_MS = 6000;

type HeroAction = 'quote' | 'rebate';

type HeroSlide = {
  id: string;
  image: string;
  headline: string;
  support: string;
};

type HeroOption = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  icon: LucideIcon;
  action: HeroAction;
  emphasized?: boolean;
};

const HERO_SLIDES: ReadonlyArray<HeroSlide> = [
  {
    id: 'future',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop',
    headline: 'Power Your Future with Solar Energy',
    support: 'Join thousands of homeowners saving money and the planet. Switch to clean energy today.',
  },
  {
    id: 'savings',
    image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2058&auto=format&fit=crop',
    headline: 'Maximize Your Savings',
    support: 'Take advantage of the 30% Federal Tax Credit and eliminate your electricity bill.',
  },
  {
    id: 'compare',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=2000&auto=format&fit=crop',
    headline: 'Compare & Save Instantly',
    support: 'Get competing quotes from top-rated local installers in minutes, not days.',
  },
];

const HERO_OPTIONS: ReadonlyArray<HeroOption> = [
  {
    id: 'consultation',
    title: 'Book Consultation',
    description: 'Schedule a direct call or home visit with a certified expert.',
    ctaLabel: 'Schedule',
    icon: Phone,
    action: 'quote',
  },
  {
    id: 'bidding',
    title: 'Start Live Bidding',
    description: 'Launch a reverse auction for the lowest price.',
    ctaLabel: 'Start Auction',
    icon: Gavel,
    action: 'quote',
    emphasized: true,
  },
  {
    id: 'written',
    title: 'Get Written Quotes',
    description: 'Receive detailed, fixed-price proposals to compare.',
    ctaLabel: 'Request',
    icon: FileText,
    action: 'quote',
  },
];

const HERO_BADGE_LABEL = 'Start Saving Today';

const TRUST_INDICATORS = ['Trusted by 50,000+ Homeowners', 'Verified Local Installers', 'Zero Obligation'] as const;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

const Hero: React.FC<HeroProps> = ({ onInstantQuoteClick, onRebateCalculatorClick }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isInteractionPaused, setIsInteractionPaused] = React.useState(false);

  React.useEffect(() => {
    if (isInteractionPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isInteractionPaused]);

  const handleAction = (action: HeroAction) => {
    switch (action) {
      case 'rebate':
        onRebateCalculatorClick();
        return;
      default:
        onInstantQuoteClick();
    }
  };

  const handleBlurCapture = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsInteractionPaused(false);
    }
  };

  return (
    <section
      id="hero"
      className="ui-hero ui-hero--landing"
      onFocusCapture={() => setIsInteractionPaused(true)}
      onBlurCapture={handleBlurCapture}
    >
      <div className="ui-hero__backdrop" aria-hidden="true">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={cx('ui-hero__background', index === currentSlide && 'is-active')}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
        <div className="ui-hero__overlay" />
      </div>

      <Container width="wide">
        <div
          className="ui-hero__layout"
          onMouseEnter={() => setIsInteractionPaused(true)}
          onMouseLeave={() => setIsInteractionPaused(false)}
        >
          <div
            className="ui-hero__masthead"
          >
            <div className="ui-hero__slides" aria-live="polite">
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={cx('ui-hero__slide', index === currentSlide && 'is-active')}
                  aria-hidden={index !== currentSlide}
                >
                  <div className="ui-hero__badge-wrap">
                    <button
                      type="button"
                      className="ui-hero__badge-button ui-focus-ring"
                      onClick={() => handleAction('rebate')}
                      aria-label="Check battery rebates"
                    >
                      <Badge tone="neutral" className="ui-kicker ui-hero__kicker">
                        <CheckCircle2 className="ui-hero__kicker-icon" />
                        <span>{HERO_BADGE_LABEL}</span>
                      </Badge>
                    </button>
                  </div>
                  <Heading variant={1} className="ui-hero__headline">
                    {slide.headline}
                  </Heading>
                  <Text className="ui-hero__subcopy">
                    {slide.support}
                  </Text>
                </div>
              ))}
            </div>

            <div className="ui-hero__indicators" role="tablist" aria-label="Hero slides">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={index === currentSlide}
                  aria-label={`Go to slide ${index + 1}: ${slide.headline}`}
                  className={cx('ui-hero__indicator', index === currentSlide && 'is-active')}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>

          <div className="ui-hero__options" aria-label="Quote options">
            {HERO_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <Card
                  key={option.id}
                  className={cx('ui-hero-option', option.emphasized && 'is-emphasized')}
                >
                  {option.emphasized ? <div className="ui-hero-option__ribbon">Most Popular</div> : null}
                  <div className="ui-hero-option__icon-wrap" aria-hidden="true">
                    <Icon className="ui-hero-option__icon" />
                  </div>
                  <div className="ui-hero-option__body">
                    <Heading variant={4} className="ui-hero-option__title">
                      {option.title}
                    </Heading>
                    <Text className="ui-hero-option__description">
                      {option.description}
                    </Text>
                  </div>
                  <Button
                    variant={option.emphasized ? 'secondary' : 'ghost'}
                    size="md"
                    className="ui-hero-option__cta"
                    onClick={() => handleAction(option.action)}
                  >
                    <span>{option.ctaLabel}</span>
                    <ArrowRight className="ui-hero-option__cta-icon" />
                  </Button>
                </Card>
              );
            })}
          </div>

          <div className="ui-hero__trust" aria-label="Trust indicators">
            {TRUST_INDICATORS.map((indicator) => (
              <span key={indicator} className="ui-hero__trust-item">
                <span className="ui-hero__trust-dot" aria-hidden="true" />
                <span>{indicator}</span>
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
