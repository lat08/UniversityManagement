'use client';

import { ReactElement } from 'react';

const SkeletonItem = ({ className }: { className: string }): ReactElement => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

const TABLE_COLUMNS = [
  { align: 'text-left', width: 'w-20 sm:w-24' },
  { align: 'text-left', width: 'w-28 sm:w-40' },
  { align: 'text-center', width: 'w-14 sm:w-16' },
  { align: 'text-right', width: 'w-20 sm:w-24' },
  { align: 'text-right', width: 'w-20 sm:w-24' },
  { align: 'text-center', width: 'w-20 sm:w-28' },
  { align: 'text-center', width: 'w-12 sm:w-14' },
] as const;

const renderTableHeader = (): ReactElement => (
  <tr>
    {TABLE_COLUMNS.map((column, index) => (
      <th key={index} className={`px-4 py-3 ${column.align}`}>
        <SkeletonItem className={`h-3 ${column.width} sm:h-4`} />
      </th>
    ))}
  </tr>
);

const renderTableRow = (index: number): ReactElement => (
  <tr key={index} className="border-b border-gray-100 last:border-0">
    {TABLE_COLUMNS.map((column, colIndex) => (
      <td key={colIndex} className={`px-4 py-3 ${column.align}`}>
        <SkeletonItem className={`h-3 ${column.width} sm:h-4`} />
      </td>
    ))}
  </tr>
);

export const TuitionSkeleton = (): ReactElement => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonItem className="h-5 w-44 sm:h-6" />
        <SkeletonItem className="h-3 w-64 sm:h-4 sm:w-80" />
      </div>
      <SkeletonItem className="h-9 w-24 rounded-lg" />
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="sm:flex-[1]">
        <SkeletonItem className="h-10 w-full" />
      </div>
      <div className="flex gap-3 sm:flex-initial">
        <SkeletonItem className="h-10 w-32" />
      </div>
    </div>

    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-100">
            {renderTableHeader()}
          </thead>
          <tbody className="bg-white">
            {[0, 1, 2, 3, 4].map((row) => renderTableRow(row))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="space-y-4 rounded-lg bg-gray-50 p-4 sm:p-6">
      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-3">
          <SkeletonItem className="h-3 w-32 sm:h-4" />
          <div className="border-t border-gray-200" />
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

