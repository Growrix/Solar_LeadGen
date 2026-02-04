import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Heading, Text } from '../ui/Typography';
import { Badge } from '../ui/Badge';
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
  // Staggered animation delay based on index
  const animationDelay = `${index * 150}ms`;

  return (
    <Card 
      variant={recommended ? 'highlight' : 'glass'}
      className={`
        flex flex-col p-5 md:p-6 h-full group
        ${recommended ? 'scale-[1.02] z-10 text-brand-950' : 'hover:border-brand-500/50 hover:bg-slate-800'}
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

      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="surface" className="shadow-lg whitespace-nowrap text-[10px]">
            {UI_LABELS.mostPopular}
          </Badge>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={`
          p-2.5 rounded-lg w-12 h-12 flex items-center justify-center transition-colors
          ${recommended ? 'bg-brand-400/50 text-brand-900' : 'bg-slate-900 text-brand-500 group-hover:bg-brand-500/10'}
        `}>
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>

      {/* Manual override for Heading color in recommended state since Typography defaults to white */}
      <Heading level={3} className={`mb-2 leading-tight text-lg ${recommended ? 'text-brand-950' : ''}`}>
        {title}
      </Heading>
      
      <Text 
        size="sm" 
        className={`mb-5 line-clamp-3 flex-grow ${recommended ? 'text-brand-900/90' : 'group-hover:text-slate-300'}`}
      >
        {description}
      </Text>

      <div className="mt-auto">
        <Button 
          variant={recommended ? 'secondary' : 'primary'} 
          size="sm"
          fullWidth
          onClick={onClick}
          className="group/btn py-2 text-sm"
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
};