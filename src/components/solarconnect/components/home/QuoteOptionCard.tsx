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
      className={`flex flex-col p-5 md:p-6 h-full group animate-fade-in-up-stagger${recommended ? ' scale-102 z-10 text-accent' : ' hover:border-accent/50 hover:bg-surface'}
      `}
      style={{ 
        ['--stagger-delay' as any]: animationDelay,
      }}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="surface" className="shadow-lg whitespace-nowrap text-micro">
            {UI_LABELS.mostPopular}
          </Badge>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg w-12 h-12 flex items-center justify-center transition-colors${recommended ? ' bg-accent/50 text-accent' : ' bg-background text-accent group-hover:bg-accent/10'}
        `}>
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>

      {/* Manual override for Heading color in recommended state since Typography defaults to white */}
      <Heading level={3} className={`mb-2 leading-tight text-body-large${recommended ? ' text-accent' : ''}`}>
        {title}
      </Heading>
      
      <Text 
        size="sm" 
        className={`mb-5 line-clamp-3 flex-grow${recommended ? ' text-accent/90' : ' group-hover:text-foreground-secondary'}`}
      >
        {description}
      </Text>

      <div className="mt-auto">
        <Button 
          variant={recommended ? 'secondary' : 'primary'} 
          size="sm"
          fullWidth
          onClick={onClick}
          className="group/btn py-2 text-body-small"
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
};