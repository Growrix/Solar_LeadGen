import React from 'react';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  withArrow?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  children,
  withArrow = false,
  variant = 'secondary',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-3 px-8 py-4 text-body-small tracking-wider rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-background focus:ring-accent';

  const variantClasses = {
    primary: 'bg-accent text-background shadow-neu-outset hover:bg-accent-hover active:scale-[0.98]',
    secondary: 'bg-surface text-foreground shadow-neu-outset hover:shadow-neu-inset active:scale-[0.98]',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
      {withArrow && <ArrowRightIcon className="text-brand-accent"/>}
    </button>
  );
};

export default Button;
