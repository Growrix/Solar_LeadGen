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
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center">
        <input
          type="radio"
          id={id}
          className="peer h-5 w-5 appearance-none rounded-full border border-slate-600 bg-slate-900/50 checked:border-brand-500 checked:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-950 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
      </div>
      
      {label && (
        <label htmlFor={id} className={`text-sm select-none cursor-pointer ${props.disabled ? 'text-slate-500' : 'text-slate-300'}`}>
          {label}
        </label>
      )}
    </div>
  );
};