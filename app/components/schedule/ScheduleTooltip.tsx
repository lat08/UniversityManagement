"use client"

import { ReactNode, memo } from "react"
import { DAYS_OF_WEEK, type DayOfWeekConfig } from "@/lib/constants/schedule"
import type { ScheduleTranslationFn } from "@/lib/types"

interface CourseItem {
  id: string
  name: string
  code: string
  room: string
  class?: string
  teacher?: string
  dayOfWeek: number
  startPeriod: number
  periodsCount: number
  color: string
  courseType?: string
  note?: string
  date: string
}

interface ScheduleTooltipProps {
  readonly course: CourseItem
  readonly position: { x: number; y: number }
  readonly onMouseEnter?: () => void
  readonly onMouseLeave?: () => void
  readonly showClass?: boolean
  readonly showTeacher?: boolean
  readonly actionButton?: ReactNode
  readonly translate?: ScheduleTranslationFn
  readonly formatDate?: (date: Date) => string
}

export const ScheduleTooltip = memo<ScheduleTooltipProps>(({
  course,
  position,
  onMouseEnter,
  onMouseLeave,
  showClass = true,
  showTeacher = true,
  actionButton,
  translate,
  formatDate,
}) => {
  const dayConfig = DAYS_OF_WEEK.find((d: DayOfWeekConfig) => d.value === course.dayOfWeek)
  const dayName = (() => {
    if (!dayConfig) return ''
    if (translate) {
      return translate(`days.${dayConfig.key}.full`)
    }
    return dayConfig.label
  })()

  const dateFormatter = formatDate ?? ((date: Date) =>
    date.toLocaleDateString('vi-VN'))
  const courseDate = dateFormatter(new Date(course.date))

  const periodLabel = translate ? translate('tooltip.period') : 'Tiết';
  const tooltipLabels = {
    code: translate ? translate('tooltip.code') : 'Mã MH',
    course: translate ? translate('tooltip.course') : 'Môn',
    type: translate ? translate('tooltip.type') : 'Loại',
    class: translate ? translate('tooltip.class') : 'Lớp',
    room: translate ? translate('tooltip.room') : 'Phòng',
    teacher: translate ? translate('tooltip.teacher') : 'GV',
    dayPeriod: translate ? translate('tooltip.dayPeriod', { day: dayName }) : dayName ? `${dayName} - ${periodLabel}` : '',
    periodCount: translate ? translate('tooltip.periodCount') : 'Số tiết',
    date: translate ? translate('tooltip.date') : 'Ngày',
    note: translate ? translate('tooltip.note') : 'Ghi chú',
  }

  return (
    <div
      role="tooltip"
      className="fixed z-50 course-tooltip"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative">
        <div 
          className="absolute -left-2 top-4 w-0 h-0"
          style={{
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid #1a1a1a',
          }}
        />
        
        <div className="bg-gray-900 text-white p-4 rounded-md shadow-2xl w-[320px] select-text">
          <div className="space-y-3">
            <div className="font-bold text-xs pb-2 border-b border-gray-700">
                {tooltipLabels.code}: {course.code}
            </div>
            <div className="text-[11px] space-y-1 leading-relaxed">
              <div>
                  <span className="font-semibold">{tooltipLabels.course}:</span> {course.name}
              </div>
              {course.courseType && (
                <div>
                    <span className="font-semibold">{tooltipLabels.type}:</span> {course.courseType}
                </div>
              )}
              {showClass && course.class && (
                <div>
                    <span className="font-semibold">{tooltipLabels.class}:</span> {course.class}
                </div>
              )}
              <div>
                  <span className="font-semibold">{tooltipLabels.room}:</span> {course.room}
              </div>
              {showTeacher && course.teacher && (
                <div>
                    <span className="font-semibold">{tooltipLabels.teacher}:</span> {course.teacher}
                </div>
              )}
              <div>
                  <span className="font-semibold">{tooltipLabels.dayPeriod}:</span> {periodLabel} {course.startPeriod}
              </div>
              <div>
                  <span className="font-semibold">{tooltipLabels.periodCount}:</span> {course.periodsCount}
                </div>
                <div>
                  <span className="font-semibold">{tooltipLabels.date}:</span> {courseDate}
              </div>
              {course.note && (
                <div>
                    <span className="font-semibold">{tooltipLabels.note}:</span> {course.note}
                </div>
              )}
            </div>

            {actionButton && (
              <div className="pt-2 border-t border-gray-700">
                {actionButton}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

ScheduleTooltip.displayName = 'ScheduleTooltip'

