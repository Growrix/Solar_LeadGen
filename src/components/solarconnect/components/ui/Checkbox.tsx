import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  error, 
  id, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          className="peer h-5 w-5 appearance-none rounded border border-border bg-background/50 checked:bg-accent checked:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
      </div>
      
      {label && (
        <label htmlFor={id} className={`select-none cursor-pointer mt-0.5 text-body-small${props.disabled ? ' text-foreground-muted' : ' text-foreground-secondary'}`}>
          {label}
        </label>
      )}
    </div>
  );
};