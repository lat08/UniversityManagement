import { memo } from 'react'

const SkeletonBlock = memo(({ className }: { className?: string }) => (
  <div className={`rounded-md bg-gray-100 animate-pulse ${className ?? ''}`} />
))
SkeletonBlock.displayName = 'SkeletonBlock'

export const ProfileSkeleton = memo(() => {
  const infoSkeletonItems = Array.from({ length: 8 })

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="mb-4 lg:mb-6">
        <SkeletonBlock className="h-8 w-48" />
      </div>

      <div className="mb-6">
        <div className="flex gap-3">
          <SkeletonBlock className="h-10 w-40" />
          <SkeletonBlock className="h-10 w-44" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="flex-shrink-0 flex justify-center lg:block">
              <div className="flex flex-col items-center space-y-3">
                <SkeletonBlock className="h-32 w-32 rounded-full" />
                <SkeletonBlock className="h-5 w-32" />
                <SkeletonBlock className="h-4 w-24" />
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
              {infoSkeletonItems.map((_, index) => (
                <div key={`profile-skeleton-${index}`} className="space-y-2">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
ProfileSkeleton.displayName = 'ProfileSkeleton'

