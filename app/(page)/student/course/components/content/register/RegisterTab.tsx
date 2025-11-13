"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Plus, X } from "lucide-react"
import { Pagination } from "@/app/components/ui/pagination"
import { Button } from "@/app/components/ui"
import { AvailableCoursesProps, CourseDto } from "../../../lib/type/courseType"
import { useAvailableCourses } from "../../../lib/hooks/useAvailableCourses"
import { useCourseFiltersStore } from "../../../lib/stores/courseFiltersStore"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import CourseFilters from "./CourseFilters"

export function AvailableCourses({ onRegisterClick }: AvailableCoursesProps) {
  const { courses, loading, error, pagination, goToPage } = useAvailableCourses()
  const selectedCourseIds = useCourseFiltersStore((state) => state.selectedCourseIds)
  const selectedCoursesCache = useCourseFiltersStore((state) => state.selectedCoursesCache)
  const setSelectedCourseIds = useCourseFiltersStore((state) => state.setSelectedCourseIds)
  const addSelectedCourse = useCourseFiltersStore((state) => state.addSelectedCourse)
  const removeSelectedCourseId = useCourseFiltersStore((state) => state.removeSelectedCourseId)
  const clearSelectedCourseIds = useCourseFiltersStore((state) => state.clearSelectedCourseIds)
  const [isBulkRegistering, setIsBulkRegistering] = useState(false)

  console.log('📊 RegisterTab render:', {
    coursesType: typeof courses,
    coursesIsArray: Array.isArray(courses),
    coursesLength: Array.isArray(courses) ? courses.length : 'N/A',
    loading,
    error,
    pagination,
  });

  // Clear selections that are no longer valid when switching pages/filters
  useEffect(() => {
    // Không clear gì cả, giữ nguyên selections across pages
    // Chỉ validate khi user thực sự đăng ký
  }, [courses])

  // Kiểm tra xem 2 môn học có trùng lịch không
  const hasScheduleConflict = useCallback((course1: CourseDto, course2: CourseDto) => {
    if (!course1.weeklySchedules || !course2.weeklySchedules) return false
    
    for (const schedule1 of course1.weeklySchedules) {
      for (const schedule2 of course2.weeklySchedules) {
        // Kiểm tra cùng ngày trong tuần
        if (schedule1.dayOfWeek === schedule2.dayOfWeek) {
          // Kiểm tra trùng khung giờ
          const start1 = schedule1.startPeriod
          const end1 = schedule1.endPeriod
          const start2 = schedule2.startPeriod
          const end2 = schedule2.endPeriod
          
          // Có overlap nếu: start1 < end2 AND start2 < end1
          if (start1 < end2 && start2 < end1) {
            return true
          }
        }
      }
    }
    return false
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      // Chọn tuần tự từng môn, bỏ qua môn bị conflict và môn không cho phép đăng ký
      const newSelected = new Set<string>()
      const newCache = new Map(selectedCoursesCache)
      
      for (const course of courses) {
        // Bỏ qua môn không cho phép đăng ký
        if (!course.isAvailableForThisStudent) continue
        
        // Kiểm tra xem môn này có conflict với các môn đã chọn không
        const selectedCoursesTemp = Array.from(newCache.values())
        const hasConflict = selectedCoursesTemp.some(selectedCourse => 
          hasScheduleConflict(course, selectedCourse)
        )
        
        if (!hasConflict) {
          newSelected.add(course.courseId)
          newCache.set(course.courseId, course)
        }
      }
      
      setSelectedCourseIds(newSelected)
      useCourseFiltersStore.setState({ selectedCoursesCache: newCache })
    } else {
      // Chỉ bỏ chọn các môn ở trang hiện tại
      const newSelected = new Set(selectedCourseIds)
      const newCache = new Map(selectedCoursesCache)
      
      courses.forEach(course => {
        newSelected.delete(course.courseId)
        newCache.delete(course.courseId)
      })
      
      setSelectedCourseIds(newSelected)
      useCourseFiltersStore.setState({ selectedCoursesCache: newCache })
    }
  }, [courses, hasScheduleConflict, selectedCourseIds, selectedCoursesCache, setSelectedCourseIds])

  const handleSelectCourse = useCallback((course: CourseDto, checked: boolean) => {
    // Chặn chọn môn không cho phép đăng ký
    if (checked && !course.isAvailableForThisStudent) {
      return
    }
    
    if (checked) {
      addSelectedCourse(course)
    } else {
      removeSelectedCourseId(course.courseId)
    }
  }, [addSelectedCourse, removeSelectedCourseId])

  const handleDeselectAll = useCallback(() => {
    clearSelectedCourseIds()
  }, [clearSelectedCourseIds])

  const handleBulkRegister = useCallback(async () => {
    if (selectedCourseIds.size === 0) return
    
    setIsBulkRegistering(true)
    try {
      await Promise.all(Array.from(selectedCourseIds).map(id => onRegisterClick(id)))
      clearSelectedCourseIds()
    } finally {
      setIsBulkRegistering(false)
    }
  }, [selectedCourseIds, onRegisterClick, clearSelectedCourseIds])

  const formatSchedule = useCallback((course: CourseDto) => {
    if (!course.weeklySchedules || course.weeklySchedules.length === 0) {
      return 'Chưa có lịch'
    }
    const schedule = course.weeklySchedules[0]
    const startDate = format(new Date(course.startDate), 'dd/MM/yyyy', { locale: vi })
    const endDate = format(new Date(course.endDate), 'dd/MM/yyyy', { locale: vi })
    return `${schedule.dayOfWeekName}, tiết ${schedule.startPeriod} - ${schedule.endPeriod}, phòng ${schedule.roomCode} ${startDate} - ${endDate}`
  }, [])

  const getRemainingSlots = useCallback((course: CourseDto) => {
    return Math.max(0, course.maxStudents - course.registeredStudents)
  }, [])

  // Lấy danh sách các môn đã chọn từ cache (bao gồm cả môn ở trang khác)
  const selectedCourses = useMemo(() => {
    return Array.from(selectedCoursesCache.values())
  }, [selectedCoursesCache])

  // Kiểm tra xem 1 môn có bị conflict với bất kỳ môn đã chọn nào không
  const isConflictWithSelected = useCallback((course: CourseDto) => {
    if (selectedCourseIds.has(course.courseId)) return false // Môn đang được chọn thì không conflict
    
    return selectedCourses.some(selectedCourse => 
      hasScheduleConflict(course, selectedCourse)
    )
  }, [selectedCourses, selectedCourseIds, hasScheduleConflict])

  // Kiểm tra xem môn có thể chọn được không (không conflict và cho phép đăng ký)
  const isSelectable = useCallback((course: CourseDto) => {
    return course.isAvailableForThisStudent && !isConflictWithSelected(course)
  }, [isConflictWithSelected])

  const isAllSelected = useMemo(() => {
    if (courses.length === 0) return false
    // Chỉ check các môn ở trang hiện tại (có thể chọn được - không conflict và cho phép đăng ký)
    const selectableCoursesOnPage = courses.filter(course => isSelectable(course))
    if (selectableCoursesOnPage.length === 0) return false
    return selectableCoursesOnPage.every(c => selectedCourseIds.has(c.courseId))
  }, [courses, selectedCourseIds, isSelectable])
  
  const isIndeterminate = useMemo(() => {
    const selectedOnPage = courses.filter(c => selectedCourseIds.has(c.courseId))
    return selectedOnPage.length > 0 && !isAllSelected
  }, [courses, selectedCourseIds, isAllSelected])

  const tableColumns = [
    { key: 'checkbox', label: '', align: 'center' as const },
    { key: 'code', label: 'Mã', align: 'left' as const },
    { key: 'name', label: 'Tên môn học', align: 'left' as const },
    { key: 'instructor', label: 'Giảng viên', align: 'left' as const },
    { key: 'credits', label: 'Số TC', align: 'center' as const },
    { key: 'quantity', label: 'SL', align: 'center' as const },
    { key: 'remaining', label: 'Còn lại', align: 'center' as const },
    { key: 'schedule', label: 'Thời khóa biểu', align: 'left' as const },
  ]

  const renderCourseRow = useCallback((course: CourseDto) => {
    const isSelected = selectedCourseIds.has(course.courseId)
    const remaining = getRemainingSlots(course)
    const isConflict = isConflictWithSelected(course)
    const isNotAvailable = !course.isAvailableForThisStudent
    const isDisabled = isConflict || isNotAvailable

    return (
      <>
        <td className="px-6 py-4">
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleSelectCourse(course, e.target.checked)}
              disabled={isDisabled}
              className={`w-4 h-4 text-[#0053AD] border-gray-300 rounded focus:ring-[#0053AD] ${
                isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              title={
                isNotAvailable 
                  ? course.unavailabilityReason || 'Môn học này không cho phép đăng ký'
                  : isConflict 
                    ? 'Môn học này bị trùng lịch với môn đã chọn' 
                    : ''
              }
            />
          </div>
        </td>
        <td className={`px-6 py-4 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {course.subjectCode}
        </td>
        <td className={`px-6 py-4 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {course.subjectName}
        </td>
        <td className={`px-6 py-4 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {course.instructorName}
        </td>
        <td className={`px-6 py-4 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'} text-center`}>
          {course.credits}
        </td>
        <td className={`px-6 py-4 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'} text-center`}>
          {course.maxStudents}
        </td>
        <td className={`px-6 py-4 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'} text-center`}>
          {remaining}
        </td>
        <td className={`px-6 py-4 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {formatSchedule(course)}
          {isConflict && (
            <span className="block text-xs text-red-500 mt-1">⚠️ Trùng lịch</span>
          )}
        </td>
      </>
    )
  }, [selectedCourseIds, handleSelectCourse, formatSchedule, getRemainingSlots, isConflictWithSelected])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        {/* Filters Component */}
        <CourseFilters />

        {selectedCourseIds.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Đã chọn <span className="font-bold text-[#0053AD]">{selectedCourseIds.size}</span> môn học
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleBulkRegister}
                disabled={isBulkRegistering}
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Đăng ký
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
                Bỏ chọn
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden relative">
            {/* Subtle loading indicator */}
            {loading && courses.length > 0 && (
              <div className="absolute top-2 right-2 z-10">
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-md shadow-sm border border-blue-200">
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs font-medium">Đang tải...</span>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0053AD] text-white text-sm">
                    {tableColumns.map((column, index) => {
                      const alignClass = {
                        left: "text-left",
                        center: "text-center",
                        right: "text-right",
                      }[column.align || "left"]

                      return (
                        <th
                          key={column.key}
                          className={`px-6 py-4 font-semibold relative ${alignClass}`}
                        >
                          {column.key === 'checkbox' ? (
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                ref={(input) => {
                                  if (input) input.indeterminate = isIndeterminate
                                }}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="w-4 h-4 text-[#0053AD] border-gray-300 rounded focus:ring-[#0053AD] cursor-pointer"
                              />
                            </div>
                          ) : (
                            column.label
                          )}
                          {index < tableColumns.length - 1 && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                          )}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {error ? (
                    <tr>
                      <td colSpan={tableColumns.length} className="px-6 py-8 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : loading ? (
                    // Skeleton loading rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`skeleton-${index}`}>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-8 mx-auto animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-12 mx-auto animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-12 mx-auto animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                  ) : courses.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns.length} className="px-6 py-8 text-center text-gray-500">
                        Không tìm thấy môn học nào
                      </td>
                    </tr>
                  ) : (
                    courses.map((course, index) => {
                      const itemKey = course.courseId || `row-${index}`
                      const isConflict = isConflictWithSelected(course)
                      const isNotAvailable = !course.isAvailableForThisStudent
                      const isDisabled = isConflict || isNotAvailable
                      return (
                        <tr 
                          key={itemKey} 
                          className={`${
                            isDisabled 
                              ? 'bg-gray-50 opacity-60 cursor-not-allowed' 
                              : 'hover:bg-gray-50 cursor-pointer'
                          } transition-colors duration-150 animate-fade-in`}
                          style={{ 
                            animationDelay: `${index * 30}ms`,
                            animationFillMode: 'both'
                          }}
                          onClick={(e) => {
                            // Chặn click vào row nếu môn không cho phép đăng ký
                            if (isNotAvailable) {
                              e.preventDefault()
                              e.stopPropagation()
                            }
                          }}
                        >
                          {renderCourseRow(course)}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {pagination && pagination.totalPages > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 transition-opacity duration-200" style={{ opacity: loading ? 0.6 : 1 }}>
          <Pagination
            currentPage={pagination.pageNumber}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            onPageChange={(page) => goToPage(page)}
          />
        </div>
      )}
    </div>
  )
}