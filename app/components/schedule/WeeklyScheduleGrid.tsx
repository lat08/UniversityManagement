"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { DAYS_OF_WEEK, PERIODS, PERIOD_TIMES } from "@/lib/constants/schedule"

export interface CourseItem {
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

interface WeeklyScheduleGridProps {
  scheduleData: CourseItem[]
  weekDates: Date[]
  onCourseHover?: (courseId: string, event: React.MouseEvent) => void
  onCourseLeave?: () => void
  hoveredCourseId?: string | null
  onPreviousWeek?: () => void
  onNextWeek?: () => void
  canGoPrevious?: boolean
  canGoNext?: boolean
  showClass?: boolean
  showTeacher?: boolean
  showCode?: boolean
}

export function WeeklyScheduleGrid({
  scheduleData,
  weekDates,
  onCourseHover,
  onCourseLeave,
  hoveredCourseId,
  onPreviousWeek,
  onNextWeek,
  canGoPrevious = false,
  canGoNext = false,
  showClass = false,
  showTeacher = true,
  showCode = false,
}: WeeklyScheduleGridProps) {
  const getColorClasses = (color: string, isHovered: boolean) => {
    const colors: Record<string, { bg: string; hover: string; border: string }> = {
      blue: {
        bg: "bg-[var(--schedule-theory-bg)]",
        hover: "bg-[var(--schedule-theory-bg-hover)]",
        border: "border-[var(--schedule-theory-border)]",
      },
      red: {
        bg: "bg-[var(--schedule-practice-bg)]",
        hover: "bg-[var(--schedule-practice-bg-hover)]",
        border: "border-[var(--schedule-practice-border)]",
      },
      green: {
        bg: "bg-[var(--chart-2)]",
        hover: "bg-[var(--success)]",
        border: "border-[var(--success)]",
      },
      yellow: {
        bg: "bg-[var(--chart-3)]",
        hover: "bg-[var(--warning)]",
        border: "border-[var(--warning)]",
      },
    }

    const colorClass = colors[color] || colors.blue
    return `${isHovered ? colorClass.hover : colorClass.bg} ${colorClass.border} border-2 text-[var(--schedule-cell-text)]`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3">
      <div>
        <div className="inline-block min-w-full align-middle">
          {/* Header Row */}
          <div className="flex gap-2 mb-2">
            {/* Top left corner button - Previous Week */}
            <div className="w-[90px] flex-shrink-0">
              <button 
                className={cn(
                  "w-full h-[60px] text-[var(--schedule-header-text)] rounded-lg flex items-center justify-center transition-colors bg-[var(--schedule-header-bg)]",
                  canGoPrevious 
                    ? "cursor-pointer hover:opacity-90" 
                    : "cursor-not-allowed opacity-50"
                )}
                onClick={onPreviousWeek}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Days of week */}
            {DAYS_OF_WEEK.map((day: { value: number; label: string; subLabel: string }, index: number) => {
              const dayDate = weekDates[index];
              const formattedDate = dayDate ? 
                `${dayDate.getDate().toString().padStart(2, '0')}/${(dayDate.getMonth() + 1).toString().padStart(2, '0')}` : '';
              
              return (
                <div
                  key={day.value}
                  className="flex-1 min-w-[120px] text-[var(--schedule-header-text)] rounded-lg flex flex-col items-center justify-center h-[60px] bg-[var(--schedule-header-bg)]"
                >
                  <div className="font-semibold text-sm">{day.label}</div>
                  <div className="text-xs mt-1">{formattedDate || day.subLabel}</div>
                </div>
              );
            })}

            {/* Top right corner button - Next Week */}
            <div className="w-[90px] flex-shrink-0">
              <button 
                className={cn(
                  "w-full h-[60px] text-[var(--schedule-header-text)] rounded-lg flex items-center justify-center transition-colors bg-[var(--schedule-header-bg)]",
                  canGoNext 
                    ? "cursor-pointer hover:opacity-90" 
                    : "cursor-not-allowed opacity-50"
                )}
                onClick={onNextWeek}
                disabled={!canGoNext}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="relative">
            {PERIODS.map((period: number) => (
              <div key={period} className="flex gap-2 mb-2">
                {/* Period Label */}
                <div className="w-[90px] flex-shrink-0 text-[var(--schedule-header-text)] rounded-lg flex items-center justify-center font-semibold text-sm h-[52px] bg-[var(--schedule-header-bg)]">
                  Tiết {period}
                </div>

                {/* Day Cells */}
                {DAYS_OF_WEEK.map((day: { value: number; label: string }) => {
                  const course = scheduleData.find(
                    (c) => c.dayOfWeek === day.value && c.startPeriod === period
                  )

                  return (
                    <div
                      key={`${day.value}-${period}`}
                      className="flex-1 min-w-[100px] bg-[var(--schedule-empty-bg)] border border-[var(--schedule-empty-border)] rounded-lg relative h-[52px]"
                    >
                      {course && (
                        <div
                          className={cn(
                            "absolute inset-0 rounded-lg p-2.5 cursor-pointer transition-all duration-200 z-10 course-cell",
                            getColorClasses(course.color, hoveredCourseId === course.id)
                          )}
                          style={{
                            height: `${course.periodsCount * 52 + (course.periodsCount - 1) * 8}px`,
                          }}
                          onMouseEnter={(e) => onCourseHover?.(course.id, e)}
                          onMouseLeave={onCourseLeave}
                        >
                          <div className="text-xs font-semibold leading-tight mb-1.5 text-gray-900">
                            {course.name}
                          </div>
                          <div className="space-y-0.5 text-[11px] text-gray-900">
                            {showCode && (
                              <div>
                                <strong>Mã:</strong> {course.code}
                              </div>
                            )}
                            {showClass && course.class && (
                              <div>
                                <strong>Lớp:</strong> {course.class}
                              </div>
                            )}
                            <div>
                              <strong>Phòng:</strong> {course.room}
                            </div>
                            {showTeacher && course.teacher && (
                              <div>
                                <strong>GV:</strong> {course.teacher}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Time Column */}
                <div className="w-[90px] flex-shrink-0 text-[var(--schedule-header-text)] rounded-lg flex items-center justify-center font-semibold text-sm h-[52px] bg-[var(--schedule-header-bg)]">
                  {PERIOD_TIMES.find((p: { period: number; time: string }) => p.period === period)?.time || ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

