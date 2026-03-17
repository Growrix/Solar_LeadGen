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
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide relative";
  
  const variants = {
    primary: "bg-brand-500 hover:bg-brand-400 text-brand-950 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 focus:ring-brand-500 border border-transparent",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 focus:ring-slate-500 shadow-sm",
    outline: "bg-transparent border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white hover:bg-slate-800/50 focus:ring-slate-500",
    ghost: "bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white focus:ring-slate-500 border border-transparent",
    white: "bg-white hover:bg-slate-100 text-brand-950 font-bold shadow-xl shadow-black/10 hover:shadow-2xl focus:ring-white border border-transparent transform active:scale-95",
    link: "bg-transparent text-brand-400 hover:text-brand-300 p-0 h-auto hover:underline underline-offset-4 shadow-none focus:ring-0 focus:ring-offset-0 border-none",
    danger: "bg-red-500 hover:bg-red-600 text-white border border-transparent focus:ring-red-500 shadow-lg shadow-red-500/20",
    success: "bg-green-500 hover:bg-green-600 text-white border border-transparent focus:ring-green-500 shadow-lg shadow-green-500/20",
  };

  const sizes = {
    sm: "text-sm px-3.5 py-1.5 rounded-lg",
    md: "text-sm md:text-base px-5 py-2.5 rounded-lg",
    lg: "text-base md:text-lg px-7 py-3.5 rounded-lg",
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