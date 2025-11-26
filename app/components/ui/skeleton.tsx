import { cn } from "@/lib/utils/utils"

interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return <div className={cn("animate-pulse rounded-md bg-gray-200/80", className)} />
}










