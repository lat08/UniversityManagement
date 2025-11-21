"use client"

import { useMemo } from "react"
import { LucideIcon } from "lucide-react"
import { useCountUp } from "@/lib/hooks/useCountUp"

interface FacultyStatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "blue" | "green" | "orange" | "purple"
}

const colorClasses: Record<
  NonNullable<FacultyStatCardProps["color"]>,
  { bg: string; icon: string }
> = {
  blue: { bg: "bg-[#FFDDAA]", icon: "text-[#CC8800]" },
  green: { bg: "bg-[#CCEECC]", icon: "text-[#44AA44]" },
  orange: { bg: "bg-[#FFBBAA]", icon: "text-[#CC4444]" },
  purple: { bg: "bg-indigo-200", icon: "text-indigo-700" },
}

export function FacultyStatCard({ title, value, icon: Icon, color = "blue" }: FacultyStatCardProps) {
  const colors = colorClasses[color]
  const numericValue = Number(value) || 0

  const count = useCountUp(numericValue, { duration: 1200, start: 0 })
  const displayValue = useMemo(() => Math.round(count), [count])

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 ${colors.bg} rounded-bl-[100%]`}>
        <div className="absolute top-5 right-5">
          <Icon className={`w-6 h-6 ${colors.icon} flex-shrink-0`} strokeWidth={2} />
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">
        {title}
      </p>
      <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">
        {displayValue.toLocaleString("vi-VN")}
      </p>
    </div>
  )
}
