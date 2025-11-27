'use client';

const SKELETON_CARD_COUNT = 3;

export const RegulationsSkeleton = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      <header className="space-y-2">
        <div className="h-7 w-64 rounded bg-gray-200 animate-pulse lg:h-8" />
        <div className="h-4 w-96 rounded bg-gray-200 animate-pulse" />
      </header>

      <div className="relative">
        <div className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-11 w-full rounded-lg bg-gray-200 animate-pulse" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/5 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-2/5 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


