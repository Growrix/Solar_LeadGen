import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white' | 'link' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'fab';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed tracking-wide relative";
  
  const variants = {
    primary: "bg-accent hover:bg-accent text-accent shadow-lg shadow-brand-glow-sm hover:shadow-brand-glow-md focus:ring-accent border border-transparent",
    secondary: "bg-surface hover:bg-surface text-foreground-secondary border border-border hover:border-border focus:ring-accent shadow-sm",
    outline: "bg-transparent border border-border text-icon hover:border-border hover:text-foreground-secondary hover:bg-surface/50 focus:ring-accent",
    ghost: "bg-transparent hover:bg-surface/50 text-foreground hover:text-foreground-secondary focus:ring-accent border border-transparent",
    white: "bg-surface hover:bg-surface text-accent shadow-xl shadow-button hover:shadow-2xl focus:ring-accent border border-transparent transform active:scale-95",
    link: "bg-transparent text-accent hover:text-accent p-0 h-auto hover:underline underline-offset-4 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 border-none",
    danger: "bg-error hover:bg-error text-foreground-secondary border border-transparent focus:ring-error shadow-lg shadow-button",
    success: "bg-success hover:bg-success text-foreground-secondary border border-transparent focus:ring-success shadow-lg shadow-button",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 rounded-lg text-button",
    md: "px-5 py-2.5 rounded-lg text-button",
    lg: "px-7 py-3.5 rounded-lg text-button",
    icon: "p-2.5 rounded-lg aspect-square",
    fab: "p-4 rounded-full aspect-square shadow-xl",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className={children ? "mr-2" : ""}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={children ? "ml-2" : ""}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};