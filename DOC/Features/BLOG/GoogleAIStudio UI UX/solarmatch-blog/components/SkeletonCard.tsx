import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 w-full bg-slate-200" />
      
      {/* Content Skeleton */}
      <div className="flex flex-col flex-grow p-6">
        <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-slate-200 rounded w-full mb-2" />
        <div className="h-4 bg-slate-200 rounded w-5/6 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-4/6 mb-6" />

        {/* Meta Row Skeleton */}
        <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-slate-200" />
            <div className="h-3 w-20 bg-slate-200 rounded" />
          </div>
          <div className="h-3 w-24 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;