import React from 'react';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio: React.FC<RadioProps> = ({ 
  label, 
  id, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex items-center gap-3${className}`}>
      <div className="relative flex items-center">
        <input
          type="radio"
          id={id}
          className="peer h-5 w-5 appearance-none rounded-full border border-border bg-background/50 checked:border-accent checked:bg-accent focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
      </div>
      
      {label && (
        <label htmlFor={id} className={`select-none cursor-pointer text-body-small${props.disabled ? ' text-foreground-muted' : ' text-foreground-secondary'}`}>
          {label}
        </label>
      )}
    </div>
  );
};