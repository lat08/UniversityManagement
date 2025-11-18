"use client"

import { Card } from "@/app/components/ui/card"
import { LucideIcon } from "lucide-react"

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

const colorClasses = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
}

export function FacultyStatCard({ title, value, icon: Icon, trend, color = "blue" }: FacultyStatCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </Card>
  )
}
