'use client';

import React, { useState, ChangeEvent, HTMLInputTypeAttribute } from 'react';
import { EyeIcon, EyeOffIcon } from '@/components/icons/auth';

export interface AuthInputProps {
  type?: HTMLInputTypeAttribute;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
}

/**
 * AuthInput - Neumorphic input field for authentication forms
 * Uses design system tokens and neumorphic shadows
 * No hardcoded colors or typography
 */
export const AuthInput: React.FC<AuthInputProps> = ({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error,
  icon,
  showPasswordToggle = false,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const actualType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  // Base classes using design system tokens only
  const baseClasses = [
    'neu-input',
    'w-full',
    icon ? 'neu-input-with-icon' : 'pl-4',
    showPasswordToggle ? 'pr-12' : 'pr-4',
    error ? 'border-destructive' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="relative w-full">
      {/* Input field */}
      <input
        type={actualType}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={baseClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
      />

      {/* Icon inside input, left-aligned */}
      {icon && (
        <div className="neu-input-icon">
          {icon}
        </div>
      )}

      {/* Password toggle button */}
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}

      {/* Error message */}
      {error && (
        <p
          id={`${name}-error`}
          className="mt-2 text-caption text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
