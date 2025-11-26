"use client"

import { ReactElement } from 'react'

const SkeletonRow = ({ index }: { index: number }): ReactElement => (
  <tr key={`skeleton-${index}`} className="border-b border-gray-200 last:border-0">
    <td className="px-6 py-4">
      <div className="flex justify-center">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-8 mx-auto animate-pulse" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-12 mx-auto animate-pulse" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-12 mx-auto animate-pulse" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
    </td>
  </tr>
)

export const CourseTableSkeleton = (): ReactElement => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="h-3 bg-gray-200 rounded w-4 animate-pulse" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="h-3 bg-gray-200 rounded w-48 animate-pulse" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="h-3 bg-gray-200 rounded w-8 mx-auto animate-pulse" />
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="h-3 bg-gray-200 rounded w-12 mx-auto animate-pulse" />
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="h-3 bg-gray-200 rounded w-12 mx-auto animate-pulse" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="h-3 bg-gray-200 rounded w-64 animate-pulse" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonRow key={index} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  )
}








