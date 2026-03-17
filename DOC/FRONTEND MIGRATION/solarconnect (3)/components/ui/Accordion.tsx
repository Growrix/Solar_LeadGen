import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border border-slate-700 rounded-lg bg-slate-800/50 overflow-hidden mb-2">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none focus:bg-slate-700/50 hover:bg-slate-700/30 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-white">{title}</span>
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div 
        className={`transition-all duration-200 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 py-3 text-slate-300 border-t border-slate-700/50 bg-slate-900/20">
          {children}
        </div>
      </div>
    </div>
  );
};

interface AccordionProps {
  items: { title: string; content: React.ReactNode }[];
  allowMultiple?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ items, allowMultiple = false }) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const handleToggle = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes(prev => 
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes(prev => prev.includes(index) ? [] : [index]);
    }
  };

  return (
    <div className="w-full">
      {items.map((item, index) => (
        <AccordionItem 
          key={index}
          title={item.title}
          isOpen={openIndexes.includes(index)}
          onToggle={() => handleToggle(index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};