"use client"

import { ReactNode } from "react"
import { DAYS_OF_WEEK } from "@/lib/constants/schedule"

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
  readonly onClick?: (e: React.MouseEvent) => void
  readonly showClass?: boolean
  readonly showTeacher?: boolean
  readonly actionButton?: ReactNode
}

export function ScheduleTooltip({
  course,
  position,
  onMouseEnter,
  onMouseLeave,
  showClass = true,
  showTeacher = true,
  actionButton,
}: ScheduleTooltipProps) {
  const dayName = DAYS_OF_WEEK.find((d: { value: number; label: string }) => d.value === course.dayOfWeek)?.label || ""
  const courseDate = new Date(course.date).toLocaleDateString('vi-VN')

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
              Mã MH: {course.code}
            </div>
            <div className="text-[11px] space-y-1 leading-relaxed">
              <div>
                <span className="font-semibold">Môn:</span> {course.name}
              </div>
              {course.courseType && (
                <div>
                  <span className="font-semibold">Loại:</span> {course.courseType}
                </div>
              )}
              {showClass && course.class && (
                <div>
                  <span className="font-semibold">Lớp:</span> {course.class}
                </div>
              )}
              <div>
                <span className="font-semibold">Phòng:</span> {course.room}
              </div>
              {showTeacher && course.teacher && (
                <div>
                  <span className="font-semibold">GV:</span> {course.teacher}
                </div>
              )}
              <div>
                <span className="font-semibold">{dayName} - Tiết:</span> {course.startPeriod} - Số tiết: {course.periodsCount}
              </div>
              <div>
                <span className="font-semibold">Ngày:</span> {courseDate}
              </div>
              {course.note && (
                <div>
                  <span className="font-semibold">Ghi chú:</span> {course.note}
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
}

