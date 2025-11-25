'use client';

import { ReactElement } from 'react';

const SkeletonItem = ({ className }: { className: string }): ReactElement => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export const PaymentHistorySkeleton = (): ReactElement => (
  <div className="space-y-4">
    {/* Header */}
    <div>
      <SkeletonItem className="h-5 w-48 sm:h-6" />
    </div>

    {/* Search and Export */}
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <SkeletonItem className="h-10 w-full" />
      </div>
      <SkeletonItem className="h-10 w-32" />
    </div>

    {/* Table Skeleton */}
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">
                <SkeletonItem className="h-3 w-20 sm:h-4" />
              </th>
              <th className="px-4 py-3 text-left">
                <SkeletonItem className="h-3 w-32 sm:h-4" />
              </th>
              <th className="px-4 py-3 text-right">
                <SkeletonItem className="h-3 w-24 sm:h-4" />
              </th>
              <th className="px-4 py-3 text-center">
                <SkeletonItem className="h-3 w-20 sm:h-4" />
              </th>
              <th className="px-4 py-3 text-center">
                <SkeletonItem className="h-3 w-28 sm:h-4" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <tr key={row} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-left">
                  <SkeletonItem className="h-3 w-24 sm:h-4" />
                </td>
                <td className="px-4 py-3 text-left">
                  <SkeletonItem className="h-3 w-40 sm:h-4" />
                </td>
                <td className="px-4 py-3 text-right">
                  <SkeletonItem className="h-3 w-28 sm:h-4" />
                </td>
                <td className="px-4 py-3 text-center">
                  <SkeletonItem className="h-3 w-20 sm:h-4" />
                </td>
                <td className="px-4 py-3 text-center">
                  <SkeletonItem className="h-3 w-32 sm:h-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
