import * as React from"react";
import { cn } from"@/lib/utils";

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'pressed' | 'floating';
  hover?: boolean;
}

export const NeumorphicCard = React.forwardRef<HTMLDivElement, NeumorphicCardProps>(
  ({ variant = 'flat', hover = true, className, children, ...props }, ref) => {
    const variantClasses = {
      flat: '',
      pressed: '',
      floating: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
        " rounded-2xl p-8 transition-colors duration-300",
          variantClasses[variant],
          hover && variant !== 'pressed' &&"hover: hover:-translate-y-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeumorphicCard.displayName ="NeumorphicCard";

// Icon Container for neumorphic design
interface NeumorphicIconContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const NeumorphicIconContainer = React.forwardRef<HTMLDivElement, NeumorphicIconContainerProps>(
  ({ size = 'md', className, children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-12 h-12',
      md: 'w-20 h-20',
      lg: 'w-24 h-24',
    };

    return (
      <div
        ref={ref}
        className={cn(
        "rounded-full flex items-center justify-center",
        "transition-colors duration-300",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeumorphicIconContainer.displayName ="NeumorphicIconContainer";
