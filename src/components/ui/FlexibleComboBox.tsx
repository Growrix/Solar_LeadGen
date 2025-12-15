'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FlexibleComboBoxOption {
  value: string;
  label: string;
}

interface FlexibleComboBoxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FlexibleComboBoxOption[];
  placeholder?: string;
  allowCustom?: boolean;
  prefilledCaption?: string;
  className?: string;
  required?: boolean;
}

const FlexibleComboBox: React.FC<FlexibleComboBoxProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select or type...',
  allowCustom = true,
  prefilledCaption,
  className = '',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on current input
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(filter.toLowerCase()) ||
    opt.value.toLowerCase().includes(filter.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFilter('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setFilter('');
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setFilter(newValue);
    setIsOpen(true);
  };

  // Handle option selection
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setFilter('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle input focus
  const handleFocus = () => {
    setFilter(value);
    setIsOpen(true);
  };

  // Handle input blur
  const handleBlur = () => {
    // Small delay to allow option click to register
    setTimeout(() => {
      setFilter('');
    }, 200);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label className="text-label text-foreground block mb-2">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen && filter ? filter : value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="form-input w-full px-4 py-3 pr-10"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        />
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onMouseDown={(e) => e.preventDefault()} // Prevent input blur
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle dropdown"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-neu-outset-lg max-h-60 overflow-auto">
            {filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleOptionClick(opt.value)}
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                className="w-full px-4 py-2.5 text-left hover:bg-surface-hover text-foreground transition-colors flex items-center gap-2"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {prefilledCaption && (
        <p className="text-caption text-muted-foreground mt-2 flex items-center gap-1">
          <span className="text-accent">💡</span> {prefilledCaption}
        </p>
      )}
      
      {allowCustom && !prefilledCaption && (
        <p className="text-caption text-muted-foreground mt-1">
          Select from list or type custom value
        </p>
      )}
    </div>
  );
};

export default FlexibleComboBox;
