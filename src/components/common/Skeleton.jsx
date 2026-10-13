import React from 'react';

export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const variantStyles = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    card: 'rounded-card',
    control: 'rounded-control',
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${variantStyles[variant] || variantStyles.rect} ${className}`}
      aria-hidden="true"
    />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Hero card skeleton */}
      <div className="bg-white rounded-card p-6 border border-brand-border space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-72" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-12 w-36 rounded-control" />
          <Skeleton className="h-12 w-36 rounded-control" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-card p-5 border border-brand-border space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="bg-white rounded-card p-5 border border-brand-border space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="bg-white rounded-card p-5 border border-brand-border space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </div>
  );
};
