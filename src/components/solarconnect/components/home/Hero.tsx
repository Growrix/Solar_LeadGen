import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { QuoteOptionCard } from './QuoteOptionCard';
import { Phone, FileText, Gavel, CheckCircle2 } from 'lucide-react';
import { QUOTE_OPTS_LABELS, TRUST_INDICATORS, HERO_SLIDES, HERO_CONTENT } from '../../constants/labels';
import { Badge } from '../ui/Badge';
import { Heading, Text } from '../ui/Typography';
import { Container, GlassSurface, Grid } from '@/ds';

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(timer);
  }, []);

  const handleAction = (type: string) => {
    console.log(`User selected: ${type}`);
  };

  return (
    <section className="relative h-screen w-full flex flex-col overflow-hidden bg-background" aria-label="Hero Section">
      
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`relative w-full h-full${index === currentSlide ? ' animate-ken-burns' : ''}`}>
              <Image
                src={slide.image}
                alt="Solar background"
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
              />
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-background/40 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <Container className="relative z-10 flex flex-col h-full w-full pt-20">
        
        {/* Text Area - Centered in available space */}
        <div className="flex-grow flex flex-col justify-center items-center w-full">
            <div className="text-center w-full max-w-5xl mx-auto">
              <div className="flex justify-center mb-6">
                <Badge 
                  variant="glass" 
                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-accent" />}
                  className="animate-fade-in-up"
                >
                  {HERO_CONTENT.badge}
                </Badge>
              </div>
              
                <div className="relative h-hero-headline md:h-hero-headline-md w-full flex items-center justify-center">
                 {HERO_SLIDES.map((slide, index) => (
                    <div 
                      key={slide.id}
                      className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center transition duration-700 transform${index === currentSlide 
                                                ? ' opacity-100 translate-y-0 scale-100' 
                                                : ' opacity-0 translate-y-8 scale-95 pointer-events-none'}`}
                    >
                      <Heading level={1} className="mb-6 leading-none drop-shadow-2xl">
                        {slide.headline}
                      </Heading>
                      <Text size="xl" variant="white" className="max-w-3xl mx-auto drop-shadow-lg px-4">
                        {slide.subheadline}
                      </Text>
                    </div>
                 ))}
              </div>
            </div>
        </div>

        {/* Compact Cards Container - Fixed at bottom area */}
        <div className="flex-shrink-0 w-full max-w-5xl mx-auto pb-16 lg:pb-20">
           {/* Slide Indicators */}
           <div className="flex justify-center gap-2 mb-6">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition duration-500${idx === currentSlide ? ' w-8 bg-accent' : ' w-2 bg-surface hover:bg-surface'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Cards Grid */}
            <Grid cols={1} colsMd={3} gap="md" className="lg:gap-6">
              <QuoteOptionCard
                index={0}
                title={QUOTE_OPTS_LABELS.consultation.title}
                description={QUOTE_OPTS_LABELS.consultation.description}
                ctaLabel={QUOTE_OPTS_LABELS.consultation.cta}
                icon={Phone}
                onClick={() => handleAction('consultation')}
              />

              <QuoteOptionCard
                index={1}
                title={QUOTE_OPTS_LABELS.bidding.title}
                description={QUOTE_OPTS_LABELS.bidding.description}
                ctaLabel={QUOTE_OPTS_LABELS.bidding.cta}
                icon={Gavel}
                recommended={true}
                onClick={() => handleAction('bidding')}
              />

              <QuoteOptionCard
                index={2}
                title={QUOTE_OPTS_LABELS.written.title}
                description={QUOTE_OPTS_LABELS.written.description}
                ctaLabel={QUOTE_OPTS_LABELS.written.cta}
                icon={FileText}
                onClick={() => handleAction('written')}
              />
            </Grid>
        </div>

        {/* Bottom Trust Indicators (Footer of Hero) */}
        <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 pointer-events-none">
           <GlassSurface className="flex gap-4 md:gap-8 uppercase tracking-widest text-icon bg-background/40 px-6 py-2 rounded-full border shadow-lg text-caption">
             {TRUST_INDICATORS.map((indicator, index) => (
               <span key={index} className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-brand-glow-md"></span>
                 {indicator}
               </span>
             ))}
           </GlassSurface>
        </div>

      </Container>
    </section>
  );
};