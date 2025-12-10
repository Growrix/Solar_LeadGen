'use client';

import React from 'react';
import Button from '@/components/ui/button';
import { Clock, CheckCircle2, Star, Calculator } from 'lucide-react';

const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 ml-1"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

interface HeroProps {
  onInstantQuoteClick: () => void;
  onRebateCalculatorClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onInstantQuoteClick, onRebateCalculatorClick }) => {
  return (
    <section id="hero" className="hero-section bg-background relative overflow-hidden sm:min-h-[calc(100vh-80px)] flex items-center pt-8 sm:pt-24 pb-12 sm:pb-0">
      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-[34px] leading-tight sm:text-heading-1 md:text-heading-1 lg:text-heading-1 text-foreground mb-4 tracking-tight" style={{ animation: 'fade-in-up 0.8s ease-out' }}>
            Smarter Solar
            <br className="sm:hidden" />
            <span className="text-foreground whitespace-nowrap"> Starts Here</span>
          </h1>
          
          <p className="text-body sm:text-heading-3 text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto" style={{ animation: 'fade-in-up 0.8s ease-out 0.2s both' }}>
            No jargon, no sales — just real numbers, real rebates, and real local installers.
          </p>

          <div className="flex space-x-4 mb-12 max-w-sm mx-auto" style={{ animation: 'fade-in-up 0.8s ease-out 0.4s both' }}>
            <Button onClick={onInstantQuoteClick} variant="primary" className="w-full">
              <span>Instant Quote</span>
            </Button>
            <Button onClick={onRebateCalculatorClick} variant="secondary" className="w-full">
              <Calculator className="h-4 w-4" />
              <span>Rebates</span>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {/* Icon Card: Quick Assessment */}
            <div className="bg-background p-4 sm:p-6 rounded-2xl shadow-neu-outset text-center transition-colors duration-300 hover:shadow-neu-outset-lg" style={{ animation: 'fade-in-up 0.8s ease-out 0.6s both' }}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-background shadow-neu-inset flex items-center justify-center mx-auto mb-3 sm:mb-4 text-icon">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-heading-3 sm:text-heading-2 text-foreground mb-1">2 min</div>
              <div className="text-caption sm:text-body-small text-muted-foreground">Quick Assessment</div>
            </div>
            {/* Icon Card: Free Service */}
            <div className="bg-background p-4 sm:p-6 rounded-2xl shadow-neu-outset text-center transition-colors duration-300 hover:shadow-neu-outset-lg" style={{ animation: 'fade-in-up 0.8s ease-out 0.8s both' }}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-background shadow-neu-inset flex items-center justify-center mx-auto mb-3 sm:mb-4 text-icon">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-heading-3 sm:text-heading-2 text-foreground mb-1">100%</div>
              <div className="text-caption sm:text-body-small text-muted-foreground">Free Service</div>
            </div>
            {/* Icon Card: Rated Installers */}
            <div className="bg-background p-4 sm:p-6 rounded-2xl shadow-neu-outset text-center transition-colors duration-300 hover:shadow-neu-outset-lg" style={{ animation: 'fade-in-up 0.8s ease-out 1s both' }}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-background shadow-neu-inset flex items-center justify-center mx-auto mb-3 sm:mb-4 text-icon">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
              </div>
              <div className="text-heading-3 sm:text-heading-2 text-foreground mb-1">5★</div>
              <div className="text-caption sm:text-body-small text-muted-foreground">Rated Installers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
