'use client';

import { memo, type ReactElement } from 'react';

const SkeletonBlock = ({ className }: { className: string }): ReactElement => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

const CardSkeleton = (): ReactElement => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
    <SkeletonBlock className="h-4 w-36 lg:h-5" />
    <SkeletonBlock className="mt-3 h-3 w-28 lg:h-4" />
    <SkeletonBlock className="mt-2 h-3 w-24 lg:h-4" />
    <div className="mt-4 flex justify-end">
      <SkeletonBlock className="h-9 w-24 rounded-full lg:h-10" />
    </div>
  </div>
);

const DocumentsLoadingComponent = (): ReactElement => {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="space-y-4 lg:space-y-5">
        {Array.from({ length: 4 }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 pt-2 lg:flex-row lg:justify-between">
        <SkeletonBlock className="h-4 w-40 lg:h-5" />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-9 w-9 rounded-full" />
          <SkeletonBlock className="h-9 w-9 rounded-full" />
          <SkeletonBlock className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const DocumentsLoading = memo(DocumentsLoadingComponent);

