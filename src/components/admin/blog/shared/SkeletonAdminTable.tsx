'use client';

import React from 'react';

export function SkeletonAdminTable() {
  return (
    <div className="w-full bg-surface rounded-card border border-border overflow-hidden animate-pulse">
      <div className="h-12 bg-background-alt border-b border-border flex items-center px-6 gap-4">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-16 bg-muted rounded ml-auto" />
      </div>
      
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center px-6 py-4 border-b border-border/50 last:border-0 gap-4">
          <div className="w-1/3">
             <div className="h-5 bg-muted rounded w-3/4 mb-2" />
             <div className="h-3 bg-muted rounded w-1/4" />
          </div>
          <div className="w-20">
             <div className="h-6 w-16 bg-muted rounded-full" />
          </div>
          <div className="w-24">
             <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="flex gap-2 ml-auto">
             <div className="h-8 w-8 bg-muted rounded" />
             <div className="h-8 w-8 bg-muted rounded" />
             <div className="h-8 w-8 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
