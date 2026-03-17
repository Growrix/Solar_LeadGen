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
    <section className="relative min-h-screen w-full flex flex-col bg-slate-900" aria-label="Hero Section">
      
      {/* Background Slider */}
      <div className="absolute inset-0 z-0 overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/20 to-slate-900" />
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
      <div className="relative z-10 flex flex-col flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        
        {/* Text Area - Flex grow to push cards down, but center vertically if space permits */}
        <div className="flex-grow flex flex-col justify-center items-center w-full mb-12 lg:mb-16">
            <div className="text-center w-full max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <Badge 
                  variant="glass" 
                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                  className="animate-fade-in-up backdrop-blur-md bg-slate-900/50 border-white/10 px-4 py-1.5"
                >
                  {HERO_CONTENT.badge}
                </Badge>
              </div>
              
              <div className="relative h-[180px] sm:h-[200px] md:h-[240px] w-full flex items-center justify-center">
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
                      <Text size="xl" variant="white" className="max-w-2xl mx-auto font-medium drop-shadow-lg px-4 opacity-90">
                        {slide.subheadline}
                      </Text>
                    </div>
                 ))}
              </div>
            </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 mb-8">
            {HERO_SLIDES.map((_, idx) => (
            <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1 rounded-full transition-all duration-500 shadow-sm ${
                idx === currentSlide ? 'w-8 bg-brand-500' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
            />
            ))}
        </div>

        {/* Cards Grid */}
        <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8 items-stretch md:items-end">
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

        {/* Bottom Trust Indicators */}
        <div className="mt-12 flex justify-center w-full pointer-events-none">
           <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-slate-300 bg-slate-950/60 backdrop-blur-xl px-8 py-3 rounded-full border border-white/5 shadow-2xl">
             {TRUST_INDICATORS.map((indicator, index) => (
               <span key={index} className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(109,59,226,0.8)]"></span>
                 {indicator}
               </span>
             ))}
           </div>
        </div>

      </div>
    </section>
  );
};