"use client"

import { AlertTriangle } from "lucide-react"

interface ConflictCourse {
  name: string
  code: string
  room: string
  teacher: string
  courseType: string
}

interface Conflict {
  dayOfWeek: number
  period: number
  courses: ConflictCourse[]
}

interface ScheduleConflictsNotificationProps {
  conflicts: Conflict[]
}

const DAY_LABELS: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "Chủ nhật",
}

export function ScheduleConflictsNotification({ conflicts }: ScheduleConflictsNotificationProps) {
  if (conflicts.length === 0) return null

  return (
    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-2">Cảnh báo xung đột lịch học</h3>
          <div className="space-y-3">
            {conflicts.map((conflict, index) => (
              <div key={index} className="text-sm text-red-800">
                <div className="font-medium mb-1">
                  {DAY_LABELS[conflict.dayOfWeek] || `Thứ ${conflict.dayOfWeek}`} - Tiết {conflict.period}:
                </div>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {conflict.courses.map((course, courseIndex) => (
                    <li key={courseIndex}>
                      {course.name} ({course.code}) - {course.room} - GV: {course.teacher}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

