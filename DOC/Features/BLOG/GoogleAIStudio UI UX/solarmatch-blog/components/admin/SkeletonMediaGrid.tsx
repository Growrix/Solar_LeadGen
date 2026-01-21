import React from 'react';

const SkeletonMediaGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden aspect-square flex flex-col">
          <div className="flex-grow bg-slate-200 w-full" />
          <div className="p-3 border-t border-slate-100 bg-white">
             <div className="h-3 bg-slate-200 rounded w-3/4 mb-2" />
             <div className="h-2 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonMediaGrid;