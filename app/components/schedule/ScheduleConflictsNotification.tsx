"use client"

import { AlertTriangle } from "lucide-react"
import { DAYS_OF_WEEK, type DayOfWeekConfig } from "@/lib/constants/schedule"
import type { ScheduleTranslationFn } from "@/lib/types"

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
  readonly conflicts: Conflict[]
  readonly translate?: ScheduleTranslationFn
}

export function ScheduleConflictsNotification({ conflicts, translate }: ScheduleConflictsNotificationProps) {
  if (conflicts.length === 0) return null

  const title = translate ? translate('conflicts.title') : 'Cảnh báo xung đột lịch học'

  const getDayLabel = (dayOfWeek: number) => {
    const dayConfig = DAYS_OF_WEEK.find((day: DayOfWeekConfig) => day.value === dayOfWeek)
    if (!dayConfig) {
      if (translate) {
        return translate('common.schedule.days.unknown', { day: dayOfWeek }) || `Thứ ${dayOfWeek}`
      }
      return `Thứ ${dayOfWeek}`
    }
    if (translate) {
      return translate(`days.${dayConfig.key}.full`)
    }
    return dayConfig.label
  }

  return (
    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-2">{title}</h3>
          <div className="space-y-3">
            {conflicts.map((conflict) => (
              <div key={`${conflict.dayOfWeek}-${conflict.period}`} className="text-sm text-red-800">
                <div className="font-medium mb-1">
                  {translate
                    ? translate('conflicts.item', {
                        day: getDayLabel(conflict.dayOfWeek),
                        period: conflict.period,
                      })
                    : `${getDayLabel(conflict.dayOfWeek)} - Tiết ${conflict.period}:`}
                </div>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {conflict.courses.map((course) => (
                    <li key={`${course.code}-${course.room}`}>
                      {translate
                        ? translate('conflicts.courseDetail', {
                            name: course.name,
                            code: course.code,
                            room: course.room,
                            teacher: course.teacher,
                          })
                        : `${course.name} (${course.code}) - ${course.room} - GV: ${course.teacher}`}
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

