import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, variant = 'underline' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className="w-full">
      <div className={`flex ${variant === 'underline' ? 'border-b border-slate-700' : 'gap-2'} mb-6`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium transition-colors relative
              ${variant === 'underline' 
                ? `${activeTab === tab.id ? 'text-brand-500' : 'text-slate-400 hover:text-white'} -mb-px` 
                : `${activeTab === tab.id ? 'bg-brand-500 text-brand-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} rounded-lg`
              }
            `}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
            {variant === 'underline' && activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500" />
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tabs.find(t => t.id === activeTab)?.content}
      </div>
    </div>
  );
};