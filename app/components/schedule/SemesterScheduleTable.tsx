"use client"

import { useEffect, useRef, useState, memo } from "react"
import { cn } from "@/lib/utils/utils"

interface SemesterCourse {
  subjectId?: string
  subjectCode: string
  subjectName: string
  courseGroup?: string | null
  credits?: number
  classCode?: string | null
  dayOfWeek: string | number
  startPeriod: number
  numberOfPeriods?: number
  roomCode?: string | null
  instructorName?: string | null
  scheduleStartDate?: string | null
  scheduleEndDate?: string | null
}

interface SemesterScheduleTableProps {
  readonly scheduleData: SemesterCourse[]
  readonly isLoading: boolean
  readonly showCredits?: boolean
  readonly showClass?: boolean
  readonly showInstructor?: boolean
  readonly highlightSubjectCode?: string
}

export const SemesterScheduleTable = memo<SemesterScheduleTableProps>(({
  scheduleData,
  isLoading,
  showCredits = true,
  showClass = true,
  showInstructor = true,
  highlightSubjectCode,
}) => {
  const highlightedRowRef = useRef<HTMLTableRowElement>(null)
  const [isHighlighting, setIsHighlighting] = useState(false)

  useEffect(() => {
    if (highlightSubjectCode && highlightedRowRef.current && scheduleData.length > 0) {
      setIsHighlighting(true)
      
      setTimeout(() => {
        highlightedRowRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }, 300)

      const timer = setTimeout(() => {
        setIsHighlighting(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [highlightSubjectCode, scheduleData])

  const getColumns = () => {
    const baseColumns = [
      { key: 'subjectCode', label: showInstructor ? 'Mã MH' : 'Mã môn', className: '' },
      { key: 'subjectName', label: 'Tên môn học', className: '' },
      { key: 'courseGroup', label: 'Nhóm tổ', className: 'text-center' },
    ]

    if (showCredits) {
      baseColumns.push({ key: 'credits', label: 'Số tín chỉ', className: 'text-center' })
    }

    if (showClass) {
      baseColumns.push({ key: 'classCode', label: 'Lớp', className: 'text-center' })
    }

    baseColumns.push(
      { key: 'dayOfWeek', label: 'Thứ', className: 'text-center' },
      { key: 'startPeriod', label: showInstructor ? 'Tiết bắt đầu' : 'Tiết', className: 'text-center' },
    )

    if (showInstructor) {
      baseColumns.push({ key: 'numberOfPeriods', label: 'Số tiết', className: 'text-center' })
    }

    baseColumns.push({ key: 'roomCode', label: 'Phòng', className: 'text-center' })

    if (showInstructor) {
      baseColumns.push({ key: 'instructorName', label: 'Giảng viên', className: '' })
    }

    baseColumns.push({ key: 'schedule', label: 'Thời gian học', className: 'text-center' })

    return baseColumns
  }

  const columns = getColumns()

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div>
        <table className="w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-[var(--primary)]">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider",
                    index < columns.length - 1 && "border-r border-white",
                    column.className
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(() => {
              if (isLoading) {
                return (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                );
              }
              if (scheduleData.length === 0) {
                return (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      Không có dữ liệu thời khóa biểu
                    </td>
                  </tr>
                );
              }
              return scheduleData.map((course, index) => {
                const shouldHighlight = highlightSubjectCode === course.subjectCode && isHighlighting
                const periodDisplay = (() => {
                  if (showInstructor) {
                    return String(course.startPeriod || '-');
                  }
                  const endPeriod = course.startPeriod + (course.numberOfPeriods || 1) - 1;
                  if (course.numberOfPeriods && course.numberOfPeriods > 1) {
                    return `${course.startPeriod}-${endPeriod}`;
                  }
                  return String(course.startPeriod);
                })();

                const startDate = course.scheduleStartDate
                  ? new Date(course.scheduleStartDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : ''
                const endDate = course.scheduleEndDate
                  ? new Date(course.scheduleEndDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : ''
                const timeDisplay = (() => {
                  if (startDate && endDate) {
                    return `${startDate} đến ${endDate}`;
                  }
                  return startDate || endDate || '-';
                })();

                return (
                  <tr
                    key={`${course.subjectId || course.subjectCode}-${course.startPeriod}-${course.dayOfWeek}-${index}`}
                    ref={highlightSubjectCode === course.subjectCode ? highlightedRowRef : null}
                    data-highlighted={shouldHighlight || undefined}
                    className={cn(
                      "hover:bg-[var(--primary-light)] transition-all duration-300 border-b border-gray-200",
                      shouldHighlight 
                        ? "bg-blue-50 border-l-4 border-l-blue-400 shadow-md" 
                        : index % 2 === 0 
                          ? "bg-white" 
                          : "bg-[var(--bg-secondary)]"
                    )}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {course.subjectCode}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 max-w-[200px]">
                      <div className="line-clamp-2 overflow-hidden" title={course.subjectName}>
                      {course.subjectName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                      {course.courseGroup || '-'}
                    </td>
                    {showCredits && (
                      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                        {course.credits || '-'}
                      </td>
                    )}
                    {showClass && (
                      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                        {course.classCode || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                      {typeof course.dayOfWeek === 'number' ? String(course.dayOfWeek) : course.dayOfWeek}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                      {periodDisplay}
                    </td>
                    {showInstructor && (
                      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                        {course.numberOfPeriods || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                      {course.roomCode || '-'}
                    </td>
                    {showInstructor && (
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        {course.instructorName || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-center text-gray-900">
                      {(() => {
                        if (showInstructor) {
                          return (
                            <div>
                              <div>
                                {course.scheduleStartDate
                                  ? new Date(course.scheduleStartDate).toLocaleDateString('vi-VN')
                                  : '-'} đến
                              </div>
                              <div>
                                {course.scheduleEndDate
                                  ? new Date(course.scheduleEndDate).toLocaleDateString('vi-VN')
                                  : '-'}
                              </div>
                            </div>
                          );
                        }
                        return timeDisplay;
                      })()}
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  )
})

SemesterScheduleTable.displayName = 'SemesterScheduleTable'

