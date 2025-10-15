"use client"

import { Calendar, Clock, MapPin, User } from "lucide-react"
import { Card } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"

interface CourseCardProps {
  id: string
  name: string
  code: string
  credits: number
  instructor: string
  room: string
  startDate: string
  endDate: string
  schedule: string
  studentCount?: string
  onAction: (courseId: string, courseName: string) => void
  actionType: "register" | "cancel"
}

export function CourseCard({
  id,
  name,
  code,
  credits,
  instructor,
  room,
  startDate,
  endDate,
  schedule,
  studentCount,
  onAction,
  actionType,
}: CourseCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Course title and code */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base">{name}</h3>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              {code}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
              {credits} tín chỉ
            </span>
          </div>

          {/* Course details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">GV {instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{room}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                Từ {startDate} đến {endDate}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{schedule}</span>
            </div>
            {studentCount && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{studentCount} sinh viên</span>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <Button
          onClick={() => onAction(id, name)}
          variant={actionType === "cancel" ? "destructive" : "default"}
          className={
            actionType === "cancel"
              ? "bg-red-500 hover:bg-red-600 text-white shrink-0"
              : "bg-blue-500 hover:bg-blue-600 text-white shrink-0"
          }
        >
          {actionType === "cancel" ? "Hủy đăng ký" : "Đăng ký"}
        </Button>
      </div>
    </Card>
  )
}
