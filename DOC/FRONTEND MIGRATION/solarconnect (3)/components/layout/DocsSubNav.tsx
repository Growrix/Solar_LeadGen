import React from 'react';
import { UI_LABELS } from '../../constants/labels';

interface DocsSubNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const DocsSubNav: React.FC<DocsSubNavProps> = ({ activePage, onNavigate }) => {
  const tabs = [
    { id: 'components', label: UI_LABELS.designSystem },
    { id: 'layout-structure', label: UI_LABELS.layoutStructure },
  ];

  return (
    <div className="border-b border-slate-800 mb-10">
      <nav className="flex gap-8" aria-label="Documentation Navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`
              pb-4 text-sm font-medium transition-all relative
              ${activePage === tab.id 
                ? 'text-brand-500' 
                : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            {tab.label}
            {activePage === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};