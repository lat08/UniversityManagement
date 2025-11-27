"use client"

import { type ReactElement } from "react";

const SkeletonItem = ({ className }: { className: string }): ReactElement => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export const ExamsSkeleton = (): ReactElement => {
  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <SkeletonItem className="h-8 w-40 lg:h-9" />
          <SkeletonItem className="h-4 w-64" />
        </div>
        <SkeletonItem className="h-10 w-40 rounded-lg" />
      </header>

      <div className="flex gap-4 items-stretch w-full">
        <SkeletonItem className="flex-1 h-11 rounded-lg" />
        <SkeletonItem className="flex-1 h-11 rounded-lg" />
        <SkeletonItem className="flex-1 h-11 rounded-lg" />
        <SkeletonItem className="flex-1 h-11 rounded-lg" />
        <SkeletonItem className="flex-1 h-11 rounded-lg" />
      </div>

      <div className="space-y-4">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
          >
            <div className="flex items-start gap-4">
              <SkeletonItem className="flex-shrink-0 w-12 h-12 rounded-lg" />
              
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <SkeletonItem className="h-6 w-48" />
                  <SkeletonItem className="h-6 w-20 rounded" />
                  <SkeletonItem className="h-6 w-20 rounded" />
                </div>
                <div className="space-y-2">
                  <SkeletonItem className="h-4 w-64" />
                  <SkeletonItem className="h-4 w-40" />
                  <SkeletonItem className="h-4 w-48" />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <SkeletonItem className="h-9 w-24 rounded-md" />
                <SkeletonItem className="h-9 w-24 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
