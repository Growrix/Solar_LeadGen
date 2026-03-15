'use client';

import React from 'react';
import {
  ArrowRight,
  Badge,
  Battery,
  Calculator,
  CheckCircle2,
  Container,
  FileText,
  Gavel,
  Heading,
  Phone,
  Pressable,
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
  badge: string;
  eyebrow: string;
  headline: string;
  subheadline?: string;
};

type HeroOption = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  action: HeroAction;
  featured?: boolean;
};

const HERO_SLIDES: ReadonlyArray<HeroSlide> = [
  {
    id: 'assessment',
    badge: 'Live rebate-aware planning',
    eyebrow: 'Smarter solar starts here',
    headline: 'See solar savings before you commit.',
    //subheadline: 'Get a fast estimate, clearer rebate context, and a local next step without the sales-pressure fog.',
  },
  {
    id: 'battery',
    badge: 'Battery-ready comparisons',
    eyebrow: 'Model the upgrade path',
    headline: 'Check rebates and battery potential.',
   // subheadline: 'Understand how battery incentives and storage-ready savings change the shape of your system decision.',
  },
  {
    id: 'compare',
    badge: 'Local installer matching',
    eyebrow: 'Move with more confidence',
    headline: 'Compare your options with clearer next steps.',
   // subheadline: 'Instant quote guidance, practical rebate insight, and verified local installer pathways in one streamlined flow.',
  },
];

const HERO_OPTIONS: ReadonlyArray<HeroOption> = [
  {
    id: 'instant-quote',
    title: 'Instant Quote',
    description: 'Start with a fast solar estimate tailored to your home, usage, and location.',
    ctaLabel: 'Get estimate',
    icon: Calculator,
    featured: true,
    action: 'quote',
  },
  {
    id: 'battery-rebate',
    title: 'Battery Rebate',
    description: 'See which battery incentives and energy savings could apply before you upgrade.',
    ctaLabel: 'Check rebates',
    icon: Battery,
    action: 'rebate',
  },
  {
    id: 'compare-paths',
    title: 'Compare Paths',
    description: 'Explore the consultation, written-quote, and bidding-style journey in one guided flow.',
    ctaLabel: 'Explore options',
    icon: Gavel,
    action: 'quote',
  },
] as const;

const TRUST_INDICATORS = ['Verified local installers', 'Battery-ready rebate guidance', 'Instant estimate in minutes'] as const;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

const Hero: React.FC<HeroProps> = ({ onInstantQuoteClick, onRebateCalculatorClick }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  const handleAction = (action: HeroAction) => {
    if (action === 'rebate') {
      onRebateCalculatorClick();
      return;
    }
    onInstantQuoteClick();
  };

  return (
    <section id="hero" className="ui-hero ui-hero--landing">
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
          <div className="ui-hero__copy">
            <div className="ui-hero__badge-wrap">
              <Badge tone="neutral" className="ui-kicker ui-hero__kicker">
                <CheckCircle2 className="ui-hero__kicker-icon" />
                <span>{HERO_SLIDES[currentSlide].badge}</span>
              </Badge>
            </div>

            <div className="ui-hero__slides" aria-live="polite">
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={cx('ui-hero__slide', index === currentSlide && 'is-active')}
                  aria-hidden={index !== currentSlide}
                >
                  <Text tone="muted" className="ui-hero__eyebrow">
                    {slide.eyebrow}
                  </Text>
                  <Heading variant={1} className="ui-hero-title ui-hero__headline text-foreground">
                    {slide.headline}
                  </Heading>
                  {slide.subheadline ? (
                    <Text tone="muted" className="ui-hero-subtitle ui-hero__subcopy">
                      {slide.subheadline}
                    </Text>
                  ) : null}
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
                  aria-label={`Go to ${slide.eyebrow}`}
                  className={cx('ui-hero__indicator', index === currentSlide && 'is-active')}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>

          <div className="ui-hero__options" aria-label="Primary hero actions">
            {HERO_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <Pressable
                  key={option.id}
                  onClick={() => handleAction(option.action)}
                  className={cx('ui-card ui-card--compact ui-hero-option', option.featured && 'ui-hero-option--featured')}
                >
                  <div className="ui-hero-option__top">
                    <span className="ui-hero-option__icon-wrap" aria-hidden="true">
                      <Icon className="ui-hero-option__icon" />
                    </span>
                    {option.featured ? <Badge tone="accent" className="ui-hero-option__badge">Recommended</Badge> : null}
                  </div>

                  <div className="ui-hero-option__body">
                    <span className="ui-hero-option__title">{option.title}</span>
                    <span className="ui-hero-option__description">{option.description}</span>
                  </div>

                  <span className="ui-hero-option__cta">
                    <span>{option.ctaLabel}</span>
                    <ArrowRight className="ui-hero-option__cta-icon" />
                  </span>
                </Pressable>
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
