import React from 'react';

export function Skeleton({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200/70 rounded-lg ${className}`}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs animate-pulse space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-3 bg-slate-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-4/5" />
    </div>
  );
}
