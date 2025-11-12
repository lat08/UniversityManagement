"use client";

import { ReactElement } from 'react';

const SkeletonItem = ({ className }: { className: string }): ReactElement => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

const CARD_DECORATIONS: string[] = ['bg-[#CCE5FF]', 'bg-[#FFDDAA]'];
const STAT_CARD_INDEXES: number[] = [0, 1];
const EVENT_ITEM_INDEXES: number[] = [0, 1, 2];
const CLASS_ITEM_INDEXES: number[] = [0, 1, 2, 3];

export const DashboardSkeleton = (): ReactElement => (
  <div className="space-y-4 lg:space-y-6">
    <header className="space-y-2">
      <SkeletonItem className="h-6 w-40 sm:h-8" />
      <SkeletonItem className="h-3 w-64 sm:w-80" />
    </header>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
      {STAT_CARD_INDEXES.map((index) => {
        const decoration = CARD_DECORATIONS[index % CARD_DECORATIONS.length];
        return (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg bg-white p-4 shadow-sm sm:p-6"
          >
            <div className={`absolute top-0 right-0 h-20 w-20 rounded-bl-[100%] ${decoration}`}>
              <SkeletonItem className="absolute right-5 top-5 h-6 w-6 rounded-full bg-white/50" />
            </div>
            <SkeletonItem className="relative z-10 h-3 w-24 sm:h-4" />
            <SkeletonItem className="relative z-10 mt-3 h-10 w-24 sm:h-12 sm:w-28" />
            <SkeletonItem className="relative z-10 mt-2 h-3 w-20 sm:w-24" />
          </div>
        );
      })}
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-8">
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SkeletonItem className="h-4 w-40 sm:h-5" />
              <div className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 sm:w-64 sm:px-4 sm:py-2.5">
                <SkeletonItem className="h-3 w-32" />
                <SkeletonItem className="h-4 w-4 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-5 gap-3 sm:gap-4">
              {[0, 1, 2, 3, 4].map((bar) => (
                <div key={bar} className="flex flex-col justify-end gap-2">
                  <SkeletonItem className="mx-auto h-36 w-full rounded-lg sm:h-44" />
                  <SkeletonItem className="mx-auto h-3 w-12 sm:h-4" />
                </div>
              ))}
            </div>
            <SkeletonItem className="h-4 w-3/5 sm:h-5" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-4">
        <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <SkeletonItem className="h-4 w-36 sm:h-5" />
          </div>
          <div className="space-y-6 px-4 py-5 sm:px-6">
            <div className="space-y-3">
              <SkeletonItem className="mx-auto h-3 w-32 sm:h-4" />
              <div className="flex flex-col items-center gap-3">
                <SkeletonItem className="h-12 w-32 rounded-lg sm:h-14" />
                <SkeletonItem className="h-px w-full" />
              </div>
            </div>
            <div className="space-y-4">
              <SkeletonItem className="mx-auto h-3 w-24 sm:h-4" />
              <div className="relative">
                <div className="relative mx-auto h-32 w-32">
                  <SkeletonItem className="absolute inset-0 rounded-full" />
                  <SkeletonItem className="absolute inset-[24px] rounded-full bg-white" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SkeletonItem className="h-4 w-20" />
                  </div>
                </div>
                <div className="absolute right-6 top-2 space-y-2 sm:right-8">
                  {[0, 1].map((legend) => (
                    <div key={legend} className="flex items-center gap-2">
                      <SkeletonItem className="h-2 w-2 rounded-full" />
                      <SkeletonItem className="h-3 w-20 sm:h-4" />
                    </div>
                  ))}
                </div>
              </div>
              <SkeletonItem className="h-px w-full" />
            </div>
            <div className="space-y-3">
              <SkeletonItem className="mx-auto h-3 w-24 sm:h-4" />
              <SkeletonItem className="mx-auto h-10 w-28 rounded-full sm:h-12" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-8">
        <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SkeletonItem className="h-4 w-40 sm:h-5" />
              <SkeletonItem className="h-3 w-32 sm:h-4" />
            </div>
          </div>
          <div className="space-y-4 px-4 py-5 sm:px-6">
            {EVENT_ITEM_INDEXES.map((event) => (
              <div key={event} className="flex items-start gap-4 rounded-lg border border-dashed border-gray-200 p-4">
                <SkeletonItem className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <SkeletonItem className="h-3 w-40 sm:h-4 sm:w-60" />
                  <SkeletonItem className="h-3 w-32 sm:h-4 sm:w-48" />
                  <div className="flex flex-wrap gap-2">
                    <SkeletonItem className="h-6 w-20 rounded-full" />
                    <SkeletonItem className="h-6 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-4">
        <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <SkeletonItem className="h-4 w-36 sm:h-5" />
          </div>
          <div className="space-y-4 px-4 py-5 sm:px-6">
            {CLASS_ITEM_INDEXES.map((classItem) => (
              <div key={classItem} className="space-y-3 rounded-lg border border-gray-200 p-4">
                <SkeletonItem className="h-3 w-40 sm:h-4 sm:w-52" />
                <SkeletonItem className="h-3 w-32 sm:h-4 sm:w-40" />
                <div className="flex items-center justify-between">
                  <SkeletonItem className="h-3 w-24 sm:h-4" />
                  <SkeletonItem className="h-3 w-16 sm:h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonItem className="h-6 w-6 rounded-full" />
                  <SkeletonItem className="h-3 w-32 sm:h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

