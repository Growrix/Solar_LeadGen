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
      return <span className="text-foreground-muted">{placeholder}</span>;
    }

    if (multiple && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((val) => {
            const option = options.find((o) => o.value === val);
            return (
              <span key={val} className="inline-flex items-center px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30 text-caption">
                {option?.label || val}
                <button
                  type="button"
                  onClick={(e) => removeValue(e, val)}
                  className="ml-1 hover:text-foreground-secondary focus:outline-none"
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
    return <span className="text-foreground-secondary">{option?.label || value}</span>;
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'w-64'}`} ref={containerRef}>
      {label && (
        <label className="block text-icon mb-1.5 text-body-small">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`relative w-full min-h-control px-4 py-2.5 text-left cursor-pointer bg-background/40 border rounded-lg transition focus:outline-none${error ? 'border-error' : isOpen ? 'border-accent ring-1 ring-accent' : 'border-border/10 hover:border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-grow">{getDisplay()}</div>
          <ChevronDown className={`w-4 h-4 text-foreground transition-transform${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <ul 
          className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-xl max-h-60 overflow-auto list-none p-0 m-0"
          role="listbox"
        >
          {options.length === 0 ? (
            <li className="px-4 py-3 text-foreground text-body-small" role="option" aria-selected="false">
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
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors text-body-small${selected ? 'bg-accent/10 text-accent' : 'text-icon hover:bg-surface hover:text-foreground-secondary'}
                  `}
                >
                  <span>{option.label}</span>
                  {selected && <Check className="w-4 h-4 text-accent" />}
                </li>
              );
            })
          )}
        </ul>
      )}
      
      {error && <p className="mt-1.5 text-error text-caption">{error}</p>}
    </div>
  );
};