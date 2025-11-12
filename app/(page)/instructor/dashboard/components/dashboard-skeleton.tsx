"use client";

import { ReactElement } from "react";

const SkeletonItem = ({ className }: { className: string }): ReactElement => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export const DashboardSkeleton = (): ReactElement => (
  <div className="space-y-4 lg:space-y-6">
    <header className="space-y-2">
      <SkeletonItem className="h-6 w-48 lg:h-8" />
      <SkeletonItem className="h-3 w-64 lg:w-80" />
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {[0, 1, 2].map((index) => (
        <div key={index} className="relative rounded-lg bg-white p-4 lg:p-5 shadow-sm">
          <div className="absolute top-4 right-4">
            <SkeletonItem className="h-10 w-10 lg:h-12 lg:w-12 rounded-md" />
          </div>
          <SkeletonItem className="h-3 w-24 lg:h-4 mb-3" />
          <SkeletonItem className="h-10 w-20 lg:h-12 lg:w-24 mb-2" />
          <SkeletonItem className="h-3 w-32" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
      <div className="lg:col-span-8">
        <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <SkeletonItem className="h-5 w-40 lg:h-6" />
            <SkeletonItem className="h-8 w-28 rounded-lg" />
          </div>
          <div className="space-y-3 lg:space-y-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative pl-8 lg:pl-10">
                <SkeletonItem className="absolute left-0 top-3 h-5 w-5 rounded-full" />
                <div className="p-3 lg:p-4 rounded-lg border-2 border-gray-200">
                  <SkeletonItem className="h-3 w-32 lg:h-4 mb-2" />
                  <SkeletonItem className="h-4 w-48 lg:h-5 lg:w-64 mb-2" />
                  <SkeletonItem className="h-3 w-40 lg:w-52" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="bg-[#DBEDFF] rounded-lg p-4 lg:p-6 min-h-[400px] border-2 border-[#4196F0]">
          <div className="flex items-center justify-between mb-4">
            <SkeletonItem className="h-5 w-32 lg:h-6" />
          </div>
          <div className="space-y-2 lg:space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="p-3 rounded-lg bg-white/50">
                <SkeletonItem className="h-4 w-full mb-2" />
                <SkeletonItem className="h-3 w-3/4 mb-2" />
                <SkeletonItem className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
