import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Heading, Text } from '../ui/Typography';
import { UI_LABELS } from '../../constants/labels';

interface QuoteOptionCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  icon: LucideIcon;
  recommended?: boolean;
  onClick: () => void;
  index: number;
}

export const QuoteOptionCard: React.FC<QuoteOptionCardProps> = ({
  title,
  description,
  ctaLabel,
  icon: Icon,
  recommended = false,
  onClick,
  index
}) => {
  const animationDelay = `${index * 150}ms`;

  return (
    <Card 
      variant={recommended ? 'highlight' : 'glass'}
      className={`
        flex flex-col p-6 h-full group transition-all duration-300 relative isolation-auto
        ${recommended 
          ? 'md:-mt-4 md:mb-4 z-10 shadow-2xl shadow-brand-900/50 border-brand-400 ring-1 ring-brand-300/20' 
          : 'hover:border-brand-500/50 hover:bg-slate-800/80 hover:-translate-y-1'
        }
      `}
      style={{ 
        animation: `fadeInUp 0.6s ease-out forwards`,
        animationDelay,
        opacity: 0 
      }}
    >
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      {/* Recommended Badge */}
      {recommended && (
        <div className="absolute top-0 right-0">
             <div className="bg-white text-brand-700 text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shadow-sm uppercase tracking-wider flex items-center gap-1">
                {UI_LABELS.mostPopular}
             </div>
        </div>
      )}

      {/* Icon */}
      <div className="flex items-start justify-between mb-5">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-inner
          ${recommended 
            ? 'bg-white/10 text-white ring-1 ring-white/20' 
            : 'bg-slate-900/60 text-brand-400 ring-1 ring-white/5 group-hover:bg-brand-500/20 group-hover:text-brand-300'}
        `}>
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
      </div>

      {/* Text Content */}
      <Heading level={3} className={`mb-3 text-lg font-bold leading-tight ${recommended ? 'text-white' : 'text-slate-100'}`}>
        {title}
      </Heading>
      
      <Text 
        size="sm" 
        className={`mb-8 flex-grow leading-relaxed ${recommended ? 'text-brand-50' : 'text-slate-400 group-hover:text-slate-300'}`}
      >
        {description}
      </Text>

      {/* Footer Action */}
      <div className="mt-auto pt-2">
        <Button 
          variant={recommended ? 'white' : 'outline'} 
          size="md"
          fullWidth
          onClick={onClick}
          className={`
            w-full justify-between group/btn border-opacity-50
            ${recommended 
                ? 'text-brand-700 hover:bg-brand-50 shadow-lg shadow-black/20' 
                : 'bg-white/5 hover:bg-brand-500 hover:border-brand-500 hover:text-white border-slate-600'}
          `}
        >
          <span className="font-semibold">{ctaLabel}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
};