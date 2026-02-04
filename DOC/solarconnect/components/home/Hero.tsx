import React, { useState, useEffect } from 'react';
import { QuoteOptionCard } from './QuoteOptionCard';
import { Phone, FileText, Gavel, CheckCircle2 } from 'lucide-react';
import { QUOTE_OPTS_LABELS, TRUST_INDICATORS, HERO_SLIDES, HERO_CONTENT } from '../../constants/labels';
import { Badge } from '../ui/Badge';
import { Heading, Text } from '../ui/Typography';

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
    <section className="relative h-screen w-full flex flex-col overflow-hidden bg-slate-900" aria-label="Hero Section">
      
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`relative w-full h-full ${index === currentSlide ? 'animate-ken-burns' : ''}`}>
               <img 
                src={slide.image} 
                alt="Solar background" 
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900" />
            </div>
          </div>
        ))}
        <style>{`
          @keyframes ken-burns {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
          }
          .animate-ken-burns {
            animation: ken-burns 15s ease-out forwards;
          }
        `}</style>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        
        {/* Text Area - Centered in available space */}
        <div className="flex-grow flex flex-col justify-center items-center w-full">
            <div className="text-center w-full max-w-5xl mx-auto">
              <div className="flex justify-center mb-6">
                <Badge 
                  variant="glass" 
                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                  className="animate-fade-in-up"
                >
                  {HERO_CONTENT.badge}
                </Badge>
              </div>
              
              <div className="relative h-[200px] md:h-[240px] w-full flex items-center justify-center">
                 {HERO_SLIDES.map((slide, index) => (
                    <div 
                      key={slide.id}
                      className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center transition-all duration-700 transform ${
                        index === currentSlide 
                          ? 'opacity-100 translate-y-0 scale-100' 
                          : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                      }`}
                    >
                      <Heading level={1} className="mb-6 leading-none drop-shadow-2xl">
                        {slide.headline}
                      </Heading>
                      <Text size="xl" variant="white" className="max-w-3xl mx-auto font-medium drop-shadow-lg px-4">
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
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentSlide ? 'w-8 bg-brand-500' : 'w-2 bg-slate-600 hover:bg-slate-500'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
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
            </div>
        </div>

        {/* Bottom Trust Indicators (Footer of Hero) */}
        <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 pointer-events-none">
           <div className="flex gap-4 md:gap-8 text-[10px] md:text-xs font-medium uppercase tracking-widest text-slate-300 bg-slate-900/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/5 shadow-lg">
             {TRUST_INDICATORS.map((indicator, index) => (
               <span key={index} className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-sm shadow-brand-500/50"></span>
                 {indicator}
               </span>
             ))}
           </div>
        </div>

      </div>
    </section>
  );
};