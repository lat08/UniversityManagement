'use client';

import { ReactElement } from 'react';

const SkeletonItem = ({ className }: { className: string }): ReactElement => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export const InsuranceSkeleton = (): ReactElement => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonItem className="h-5 w-56 sm:h-6" />
        <SkeletonItem className="h-3 w-72 sm:h-4" />
      </div>
    </div>

    {/* Export Button */}
    <div className="flex justify-end">
      <SkeletonItem className="h-10 w-32 rounded-lg" />
    </div>

    {/* Table Skeleton */}
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">
                <SkeletonItem className="h-3 w-24 sm:h-4" />
              </th>
              <th className="px-4 py-3 text-center">
                <SkeletonItem className="h-3 w-16 sm:h-4" />
              </th>
              <th className="px-4 py-3 text-right">
                <SkeletonItem className="h-3 w-20 sm:h-4" />
              </th>
              <th className="px-4 py-3 text-center">
                <SkeletonItem className="h-3 w-24 sm:h-4" />
              </th>
              <th className="px-4 py-3 text-center">
                <SkeletonItem className="h-3 w-12 sm:h-4" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {[0, 1, 2, 3].map((row) => (
              <tr key={row} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-left">
                  <SkeletonItem className="h-3 w-28 sm:h-4" />
                </td>
                <td className="px-4 py-3 text-center">
                  <SkeletonItem className="h-3 w-16 sm:h-4" />
                </td>
                <td className="px-4 py-3 text-right">
                  <SkeletonItem className="h-3 w-24 sm:h-4" />
                </td>
                <td className="px-4 py-3 text-center">
                  <SkeletonItem className="h-3 w-20 sm:h-4" />
                </td>
                <td className="px-4 py-3 text-center">
                  <SkeletonItem className="h-3 w-12 sm:h-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Summary Skeleton */}
    <div className="space-y-4 rounded-lg bg-gray-50 p-4 sm:p-6">
      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonItem className="h-4 w-24 sm:h-5" />
            <SkeletonItem className="h-5 w-28 sm:h-6" />
          </div>
        </div>
      </div>
      <SkeletonItem className="h-12 w-full sm:h-14" />
    </div>
  </div>
);
