import React from 'react';

const SkeletonDetail: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="h-4 w-32 bg-slate-200 rounded mb-8" />

      <div className="max-w-3xl mx-auto">
        {/* Header Skeleton */}
        <div className="h-6 w-24 bg-slate-200 rounded-full mb-6" />
        <div className="h-10 w-3/4 bg-slate-200 rounded mb-4" />
        <div className="h-10 w-1/2 bg-slate-200 rounded mb-8" />

        {/* Meta Skeleton */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
          <div className="w-12 h-12 bg-slate-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-48 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Hero Image Skeleton */}
        <div className="w-full h-64 md:h-96 bg-slate-200 rounded-2xl mb-10" />

        {/* Body Skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-32 bg-slate-200 rounded w-full my-8" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-4/5" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonDetail;