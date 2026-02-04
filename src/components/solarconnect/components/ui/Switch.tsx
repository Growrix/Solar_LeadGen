import React from 'react';

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onCheckedChange, 
  label, 
  disabled, 
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex items-center gap-3${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onCheckedChange(!checked)}
        disabled={disabled}
        className={`relative h-7 w-12 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-slate-900${checked ? ' bg-accent' : ' bg-surface'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        {...props}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-surface shadow-lg ring-0 transition-transform duration-200 ease-in-out${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      
      {label && (
        <span 
            className={`select-none cursor-pointer text-body-small${disabled ? ' text-foreground-muted' : ' text-foreground-secondary'}`}
            onClick={() => !disabled && onCheckedChange(!checked)}
        >
          {label}
        </span>
      )}
    </div>
  );
};