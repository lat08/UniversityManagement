"use client"

export const MaterialsSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center justify-between animate-pulse"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg" />
            
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 bg-gray-200 rounded w-48" />
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-64" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
