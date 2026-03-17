import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { UI_LABELS, ARIA_LABELS } from '../../constants/labels';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label={ARIA_LABELS.pagination}>
      <ul className="flex items-center -space-x-px h-10 text-base">
        <li>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-r-none border-r-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="sr-only">{UI_LABELS.previous}</span>
          </Button>
        </li>
        {pages.map(page => (
            <li key={page}>
                <button
                    onClick={() => onPageChange(page)}
                    className={`
                        flex items-center justify-center px-4 h-9 leading-tight border transition-colors
                        ${currentPage === page 
                            ? 'z-10 text-brand-950 bg-brand-500 border-brand-500 font-bold' 
                            : 'text-slate-400 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white'}
                    `}
                    aria-current={currentPage === page ? 'page' : undefined}
                >
                    {page}
                </button>
            </li>
        ))}
        <li>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-l-none"
          >
             <span className="sr-only">{UI_LABELS.next}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
};