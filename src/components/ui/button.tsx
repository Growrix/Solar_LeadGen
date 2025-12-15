import React from 'react';
import ArrowRightIcon from '../icons/ArrowRightIcon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  withArrow?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'minimal' | 'destructive';
}

const Button: React.FC<ButtonProps> = ({
  children,
  withArrow = false,
  variant = 'secondary',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-3 px-8 py-4 text-body-small tracking-wider rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-background focus:ring-accent whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'border border-accent bg-transparent text-accent shadow-neu-outset-sm hover:shadow-neu-inset-sm active:shadow-neu-inset-sm active:scale-[0.98]',
    secondary: 'bg-background text-muted-foreground shadow-neu-outset-sm hover:text-foreground hover:shadow-neu-inset-sm active:shadow-neu-inset-sm active:scale-[0.98]',
  ghost: 'bg-transparent text-foreground hover:bg-background/80 hover:shadow-neu-outset-sm active:shadow-neu-inset-sm active:scale-[0.98] border-none',
    outline: 'border-2 border-border bg-transparent shadow-neu-outset-sm text-foreground hover:text-accent active:shadow-neu-inset-sm active:scale-[0.98]',
    minimal: 'bg-transparent text-foreground hover:text-accent transition-colors shadow-none border-none hover:bg-accent/5 active:scale-[0.98] px-4 py-2',
    destructive: 'bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 active:scale-[0.98]',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      <span className="flex items-center gap-3 whitespace-nowrap w-full justify-center">
        {children}
        {withArrow && <ArrowRightIcon className="text-current"/>}
      </span>
    </button>
  );
};

export default Button;
