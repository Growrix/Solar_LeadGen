import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { UI_LABELS } from '../../constants/labels';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  multiple = false,
  disabled = false,
  fullWidth = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValue = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const removeValue = (e: React.MouseEvent, valToRemove: string) => {
    e.stopPropagation();
    if (Array.isArray(value)) {
      onChange(value.filter((v) => v !== valToRemove));
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  // Display value logic
  const getDisplay = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-slate-400">{placeholder}</span>;
    }

    if (multiple && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((val) => {
            const option = options.find((o) => o.value === val);
            return (
              <span key={val} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {option?.label || val}
                <button
                  type="button"
                  onClick={(e) => removeValue(e, val)}
                  className="ml-1 hover:text-white focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      );
    }

    const option = options.find((o) => o.value === value);
    return <span className="text-white">{option?.label || value}</span>;
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'w-64'}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          relative w-full min-h-[42px] px-4 py-2.5 text-left cursor-pointer
          bg-slate-900/40 border rounded-lg transition-all focus:outline-none
          ${error ? 'border-red-500' : isOpen ? 'border-brand-500 ring-1 ring-brand-500' : 'border-white/10 hover:border-slate-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-grow">{getDisplay()}</div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <ul 
          className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto list-none p-0 m-0"
          role="listbox"
        >
          {options.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500" role="option" aria-selected="false">
                {UI_LABELS.noOptions}
            </li>
          ) : (
            options.map((option) => {
              const selected = isSelected(option.value);
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors
                    ${selected ? 'bg-brand-500/10 text-brand-400' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                  `}
                >
                  <span>{option.label}</span>
                  {selected && <Check className="w-4 h-4 text-brand-500" />}
                </li>
              );
            })
          )}
        </ul>
      )}
      
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
};