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
          className="peer h-5 w-5 appearance-none rounded border border-slate-600 bg-slate-900/50 checked:bg-brand-500 checked:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-950 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
      </div>
      
      {label && (
        <label htmlFor={id} className={`text-sm select-none cursor-pointer mt-0.5 ${props.disabled ? 'text-slate-500' : 'text-slate-300'}`}>
          {label}
        </label>
      )}
    </div>
  );
};