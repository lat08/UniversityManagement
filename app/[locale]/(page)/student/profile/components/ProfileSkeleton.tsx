import { memo } from 'react'
import { Card, CardContent } from '@/app/components/ui/card'

const SkeletonBlock = memo(({ className }: { className?: string }) => (
  <div className={`rounded-md bg-gray-100 animate-pulse ${className ?? ''}`} />
))
SkeletonBlock.displayName = 'SkeletonBlock'

export const ProfileSkeleton = memo(() => {
  const infoSkeletonItems = Array.from({ length: 12 })

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

      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-4 lg:p-6">
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row items-start gap-6">
              <div className="flex-shrink-0 flex flex-col items-center lg:block w-full lg:w-auto">
                <SkeletonBlock className="h-32 w-32 rounded-full border border-gray-200" />
                <div className="mt-4">
                  <SkeletonBlock className="h-4 w-24 mx-auto" />
                </div>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                {infoSkeletonItems.map((_, index) => (
                  <div key={`profile-skeleton-${index}`} className="space-y-2">
                    <SkeletonBlock className="h-4 w-32" />
                    <SkeletonBlock className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-6">
              <div className="flex-shrink-0 hidden lg:block lg:w-32" />
              <div className="flex-1 w-full space-y-2">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-24 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
ProfileSkeleton.displayName = 'ProfileSkeleton'

