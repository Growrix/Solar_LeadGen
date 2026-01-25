'use client';

import React from 'react';

export function SkeletonMediaGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-card overflow-hidden aspect-square flex flex-col">
          <div className="flex-grow bg-muted w-full" />
          <div className="p-3 border-t border-border/50 bg-surface">
             <div className="h-3 bg-muted rounded w-3/4 mb-2" />
             <div className="h-2 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
