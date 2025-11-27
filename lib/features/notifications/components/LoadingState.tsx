"use client";

interface LoadingStateProps {
  count?: number;
}

export function LoadingState({ count = 5 }: LoadingStateProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse"
          style={{
            animationDelay: `${index * 75}ms`,
            animationDuration: '1.5s',
          }}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div 
                className="h-4 rounded bg-gray-200" 
                style={{ width: `${160 + (index * 15)}px` }}
              />
              <div 
                className="h-3 rounded bg-gray-200" 
                style={{ width: `${96 + (index * 10)}px` }}
              />
            </div>
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-gray-200" />
            <div 
              className="h-3 rounded bg-gray-200" 
              style={{ width: `${85 + (index * 3)}%` }}
            />
            <div className="h-3 w-3/4 rounded bg-gray-200" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="h-6 w-24 rounded-full bg-gray-200" />
            <div className="h-6 w-20 rounded-full bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
