import React from 'react';

const SkeletonAdminTable: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center px-6 gap-4">
        <div className="h-4 w-1/3 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-4 w-16 bg-slate-200 rounded ml-auto" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center px-6 py-4 border-b border-slate-100 last:border-0 gap-4">
          <div className="w-1/3">
             <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
             <div className="h-3 bg-slate-200 rounded w-1/4" />
          </div>
          <div className="w-20">
             <div className="h-6 w-16 bg-slate-200 rounded-full" />
          </div>
          <div className="w-24">
             <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
          <div className="flex gap-2 ml-auto">
             <div className="h-8 w-8 bg-slate-200 rounded" />
             <div className="h-8 w-8 bg-slate-200 rounded" />
             <div className="h-8 w-8 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonAdminTable;