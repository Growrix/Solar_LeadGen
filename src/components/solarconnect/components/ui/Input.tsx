import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { ARIA_LABELS } from '../../constants/labels';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
  label?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  className = '', 
  fullWidth = false,
  label,
  error,
  startIcon,
  endIcon,
  type = 'text',
  id,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={id} className="block text-icon mb-1.5 text-body-small">
          {label}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground">
            {startIcon}
          </div>
        )}
        
        <input
          id={id}
          type={inputType}
          className={`w-full bg-background/40 border border-border/10 text-foreground-secondary placeholder:text-foreground-tertiary rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent/50 transition disabled:opacity-50 disabled:cursor-not-allowed py-2.5 ${startIcon ? 'pl-10' : 'pl-4'}
            ${endIcon || isPassword ? ' pr-10' : ' pr-4'}
            ${error ? ' border-error focus-visible:ring-error/50 focus-visible:border-error' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground hover:text-foreground-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
            aria-label={ARIA_LABELS.togglePassword}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {/* End Icon (if not password) */}
        {!isPassword && endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-foreground">
            {endIcon}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1 mt-1.5 text-error text-caption">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};