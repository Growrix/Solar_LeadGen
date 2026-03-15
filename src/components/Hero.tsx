'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Badge,
  Button,
  CheckCircle2,
  Container,
  Heading,
  Text,
} from '@/ds';

interface HeroProps {
  onInstantQuoteClick: () => void;
  onRebateCalculatorClick: () => void;
}

const HERO_SLIDE_INTERVAL_MS = 6000;

type HeroAction = 'quote' | 'rebate' | 'guides';

type HeroSlide = {
  id: string;
  badge: string;
  headline: string;
  support: string;
  primaryCta: {
    label: string;
    action: HeroAction;
    variant: 'primary' | 'secondary' | 'ghost';
  };
  secondaryCta?: {
    label: string;
    action: HeroAction;
    variant: 'primary' | 'secondary' | 'ghost';
  };
};

const HERO_SLIDES: ReadonlyArray<HeroSlide> = [
  {
    id: 'assessment',
    badge: 'Free quote planning',
    headline: 'See the numbers before you talk to anyone.',
    support: 'Get an instant solar estimate, check likely rebates, and explore your next step without pressure or obligation.',
    primaryCta: {
      label: 'Start Instant Quote',
      action: 'quote',
      variant: 'primary',
    },
    secondaryCta: {
      label: 'Check Battery Rebates',
      action: 'rebate',
      variant: 'secondary',
    },
  },
  {
    id: 'quote-paths',
    badge: 'Choose your quote path',
    headline: 'Request quotes your way, not the installer’s way.',
    support: 'Choose a call or site visit, ask for written quotes, or open a bidding flow depending on how hands-on or private you want the process to be.',
    primaryCta: {
      label: 'Request Quotes',
      action: 'quote',
      variant: 'primary',
    },
    secondaryCta: {
      label: 'Compare Quote Types',
      action: 'quote',
      variant: 'ghost',
    },
  },
  {
    id: 'compare',
    badge: 'Verified installer matching',
    headline: 'Compare offers with more leverage and less guesswork.',
    support: 'Match with verified installers, review written offers, and use negotiation or bidding tools to make the strongest decision for your home.',
    primaryCta: {
      label: 'Explore Quote Options',
      action: 'quote',
      variant: 'primary',
    },
    secondaryCta: {
      label: 'Read Homeowner Guides',
      action: 'guides',
      variant: 'ghost',
    },
  },
];

const TRUST_INDICATORS = ['Verified installers', 'Free starting quote flow', 'Rebate-aware planning'] as const;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

const Hero: React.FC<HeroProps> = ({ onInstantQuoteClick, onRebateCalculatorClick }) => {
  const router = useRouter();
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
      case 'guides':
        router.push('/blog');
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
            className={cx(
              'ui-hero__background',
              `ui-hero__background--${slide.id}`,
              index === currentSlide && 'is-active'
            )}
          />
        ))}
        <div className="ui-hero__overlay" />
      </div>

      <Container>
        <div className="ui-hero__layout">
          <div
            className="ui-hero__copy"
            onMouseEnter={() => setIsInteractionPaused(true)}
            onMouseLeave={() => setIsInteractionPaused(false)}
          >
            <div className="ui-hero__slides" aria-live="polite">
              {HERO_SLIDES.map((slide, index) => (
                (() => {
                  const secondaryCta = slide.secondaryCta;

                  return (
                    <div
                      key={slide.id}
                      className={cx('ui-hero__slide', index === currentSlide && 'is-active')}
                      aria-hidden={index !== currentSlide}
                    >
                      <div className="ui-hero__badge-wrap">
                        <Badge tone="neutral" className="ui-kicker ui-hero__kicker">
                          <CheckCircle2 className="ui-hero__kicker-icon" />
                          <span>{slide.badge}</span>
                        </Badge>
                      </div>
                      <Heading variant={1} className="ui-hero-title ui-hero__headline text-foreground">
                        {slide.headline}
                      </Heading>
                      <Text tone="muted" className="ui-hero-subtitle ui-hero__subcopy">
                        {slide.support}
                      </Text>
                      <div className="ui-hero__actions">
                        <Button
                          variant={slide.primaryCta.variant}
                          size="lg"
                          className="ui-hero__action"
                          onClick={() => handleAction(slide.primaryCta.action)}
                        >
                          <span>{slide.primaryCta.label}</span>
                          <ArrowRight className="ui-hero__action-icon" />
                        </Button>
                        {secondaryCta ? (
                          <Button
                            variant={secondaryCta.variant}
                            size="lg"
                            className="ui-hero__action ui-hero__action--secondary"
                            onClick={() => handleAction(secondaryCta.action)}
                          >
                            <span>{secondaryCta.label}</span>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })()
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
