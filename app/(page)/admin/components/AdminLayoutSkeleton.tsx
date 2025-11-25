import { Skeleton } from "@/app/components/ui/skeleton"

export const AdminLayoutSkeleton = () => {
  return (
    <div className="flex h-screen bg-[var(--bg-secondary)]">
      <div className="hidden lg:flex lg:w-64 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] p-4 space-y-4">
        <Skeleton className="h-10 w-full bg-white/10" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full bg-white/10" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="h-16 border-b border-gray-200 bg-white px-4 flex items-center">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

