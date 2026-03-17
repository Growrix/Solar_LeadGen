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
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {startIcon}
          </div>
        )}
        
        <input
          id={id}
          type={inputType}
          className={`
            w-full bg-slate-900/40 border border-white/10 
            text-white placeholder-slate-400 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50
            transition-all disabled:opacity-50 disabled:cursor-not-allowed
            py-2.5
            ${startIcon ? 'pl-10' : 'pl-4'}
            ${endIcon || isPassword ? 'pr-10' : 'pr-4'}
            ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors focus:outline-none"
            aria-label={ARIA_LABELS.togglePassword}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {/* End Icon (if not password) */}
        {!isPassword && endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            {endIcon}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1 mt-1.5 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};