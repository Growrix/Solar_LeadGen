import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { ARIA_LABELS } from '../../constants/labels';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label={ARIA_LABELS.breadcrumb}>
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <a href="#" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <Home className="w-4 h-4 mr-2" />
            Home
          </a>
        </li>
        {items.map((item, index) => {
           const isLast = index === items.length - 1;
           return (
             <li key={item.label}>
               <div className="flex items-center">
                 <ChevronRight className="w-4 h-4 text-slate-600 mx-1" />
                 {isLast ? (
                   <span className="ml-1 text-sm font-medium text-brand-500 md:ml-2" aria-current="page">
                     {item.label}
                   </span>
                 ) : (
                   <a 
                     href={item.href || '#'} 
                     className="ml-1 text-sm font-medium text-slate-400 hover:text-white md:ml-2 transition-colors"
                   >
                     {item.label}
                   </a>
                 )}
               </div>
             </li>
           );
        })}
      </ol>
    </nav>
  );
};