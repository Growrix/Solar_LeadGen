import React from 'react';

const SkeletonEditor: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse flex flex-col">
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200" />
      
      <div className="flex-grow max-w-5xl mx-auto w-full px-6 py-8">
        {/* Top Fields */}
        <div className="space-y-6 mb-8">
          <div className="h-10 bg-slate-200 rounded w-1/3" />
          <div className="h-12 bg-slate-200 rounded w-full" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-6">
          <div className="h-8 w-24 bg-slate-200 rounded-t" />
          <div className="h-8 w-24 bg-slate-200 rounded-t" />
          <div className="h-8 w-24 bg-slate-200 rounded-t" />
        </div>

        {/* Editor Area */}
        <div className="h-96 bg-white border border-slate-200 rounded-lg" />
      </div>

      {/* Footer */}
      <div className="h-20 bg-white border-t border-slate-200 mt-auto" />
    </div>
  );
};

export default SkeletonEditor;