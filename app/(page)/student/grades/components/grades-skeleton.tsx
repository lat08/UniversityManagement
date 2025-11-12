"use client"

import { ReactElement } from 'react'

const SkeletonItem = ({ className }: { className: string }): ReactElement => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
)

const CARD_DECORATIONS = [
  'bg-[#FFDDAA]',
  'bg-[#FFBBAA]',
  'bg-[#CCEECC]',
]

export const GradesSkeleton = (): ReactElement => {
  const renderTableRow = (key: number): ReactElement => (
    <tr key={key} className="border-b border-gray-200 last:border-0">
      <td className="px-2 py-3 sm:px-4 sm:py-4">
        <SkeletonItem className="h-3 w-16 sm:h-4" />
      </td>
      <td className="px-2 py-3 sm:px-4 sm:py-4">
        <SkeletonItem className="h-3 w-32 sm:h-4 sm:w-48" />
      </td>
      <td className="px-2 py-3 text-center sm:px-3 sm:py-4">
        <SkeletonItem className="mx-auto h-3 w-10 sm:h-4" />
      </td>
      <td className="px-2 py-3 text-center sm:px-3 sm:py-4">
        <SkeletonItem className="mx-auto h-3 w-10 sm:h-4" />
      </td>
      <td className="px-2 py-3 text-center sm:px-3 sm:py-4">
        <SkeletonItem className="mx-auto h-3 w-10 sm:h-4" />
      </td>
      <td className="px-2 py-3 text-center sm:px-3 sm:py-4">
        <SkeletonItem className="mx-auto h-3 w-10 sm:h-4" />
      </td>
      <td className="px-2 py-3 text-center sm:px-3 sm:py-4">
        <SkeletonItem className="mx-auto h-3 w-12 sm:h-4" />
      </td>
      <td className="px-2 py-3 text-center sm:px-3 sm:py-4">
        <SkeletonItem className="mx-auto h-3 w-12 sm:h-4" />
      </td>
      <td className="px-2 py-3 text-center sm:px-3 sm:py-4">
        <SkeletonItem className="mx-auto h-6 w-6 rounded-full" />
      </td>
    </tr>
  )

  return (
    <div className="space-y-4 lg:space-y-6">
      <header className="space-y-2">
        <SkeletonItem className="h-6 w-40 sm:h-8" />
        <SkeletonItem className="h-3 w-64 sm:w-80" />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        {CARD_DECORATIONS.map((decoration, index) => (
          <div
            key={decoration}
            className="relative overflow-hidden rounded-lg bg-white p-4 shadow-sm sm:p-6"
          >
            <div className={`absolute top-0 right-0 h-20 w-20 rounded-bl-[100%] ${decoration}`}>
              <SkeletonItem className="absolute right-5 top-5 h-6 w-6 rounded-full bg-white/50" />
            </div>
            <SkeletonItem className="relative z-10 h-3 w-24 sm:h-4" />
            <SkeletonItem className="relative z-10 mt-3 h-8 w-20 sm:h-10 sm:w-24" />
            <SkeletonItem className="relative z-10 mt-2 h-3 w-16 sm:w-20" />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:w-auto">
          <span className="mb-2 block text-xs font-medium text-gray-900">
            <SkeletonItem className="h-3 w-24" />
          </span>
          <button
            type="button"
            className="w-full sm:w-80 flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left sm:px-4 sm:py-2.5"
          >
            <SkeletonItem className="h-3 w-40" />
            <SkeletonItem className="h-4 w-4 rounded-full" />
          </button>
        </div>
        <div className="w-full sm:w-auto">
          <span className="invisible mb-2 block text-xs font-medium text-gray-900">
            Export
          </span>
          <div className="flex w-full items-center justify-center rounded-lg bg-[var(--grade-export-bg)] px-4 py-2 text-white sm:w-auto sm:px-6 sm:py-2.5">
            <SkeletonItem className="h-4 w-24 bg-white/40" />
          </div>
        </div>
      </div>

      {[0, 1].map((semester) => (
        <div
          key={semester}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <div className="bg-[var(--grade-semester-header-bg)] px-3 py-3 sm:px-6 sm:py-4">
            <SkeletonItem className="h-4 w-48 sm:h-5" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-[var(--grade-table-header-bg)]">
                  {[...Array(9)].map((_, columnIndex) => (
                    <th
                      key={columnIndex}
                      className="px-2 py-3 text-left sm:px-4 sm:py-3.5"
                    >
                      <SkeletonItem className="h-3 w-16 sm:h-4" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {[0, 1, 2].map((row) => renderTableRow(row))}
              </tbody>
            </table>
          </div>
          <div className="bg-[var(--grade-summary-bg)] px-3 py-4 sm:px-6 sm:py-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
              {[0, 1].map((column) => (
                <div key={column} className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between gap-4"
                    >
                      <SkeletonItem className="h-3 w-40 sm:h-4 sm:w-48" />
                      <SkeletonItem className="h-3 w-12 sm:h-4" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <SkeletonItem className="h-3 w-40 sm:h-4 sm:w-56" />
                <SkeletonItem className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

