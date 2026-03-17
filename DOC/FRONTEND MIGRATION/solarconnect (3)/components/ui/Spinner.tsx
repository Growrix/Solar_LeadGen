import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'brand' | 'white' | 'muted';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  variant = 'brand', 
  className = '' 
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const variants = {
    brand: "text-brand-500",
    white: "text-white",
    muted: "text-slate-500",
  };

  return (
    <Loader2 
        className={`animate-spin ${sizes[size]} ${variants[variant]} ${className}`} 
    />
  );
};