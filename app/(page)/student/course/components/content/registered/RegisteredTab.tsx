"use client"

import { useState, useMemo, useCallback } from "react"
import { Eye, Trash2, X } from "lucide-react"
import { Pagination } from "@/app/components/ui/pagination"
import { Button } from "@/app/components/ui"
import { RegisteredCoursesProps, CourseDto } from "../../../lib/type/courseType"
import { CourseDetailModal } from "../../modal/CourseDetailModal"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useRegisteredFiltersStore } from "../../../lib/stores/registeredFiltersStore"
import RegisteredFilters from "./RegisteredFilters"

interface RegisteredCoursesWithPaginationProps extends RegisteredCoursesProps {
  paginatedCourses?: RegisteredCoursesProps["courses"]
  pagination?: {
    totalCount: number
    pageNumber: number
    pageSize: number
    totalPages: number
    hasPrevious: boolean
    hasNext: boolean
  }
  goToPage?: (page: number) => void
  onBulkCancel?: (courseIds: string[]) => Promise<void>
  onRegisterButtonClick?: () => void
}

export function RegisteredCourses({ 
  courses, 
  loading, 
  paginatedCourses,
  pagination,
  goToPage,
  onBulkCancel,
  onRegisterButtonClick,
}: RegisteredCoursesWithPaginationProps) {
  const filters = useRegisteredFiltersStore((state) => state.filters)
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set())
  const [isBulkCancelling, setIsBulkCancelling] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const displayCourses = paginatedCourses ?? courses

  console.log('📊 RegisteredTab render:', {
    coursesType: typeof courses,
    coursesIsArray: Array.isArray(courses),
    coursesLength: Array.isArray(courses) ? courses.length : 'N/A',
    paginatedCoursesLength: Array.isArray(paginatedCourses) ? paginatedCourses.length : 'N/A',
    displayCoursesLength: Array.isArray(displayCourses) ? displayCourses.length : 'N/A',
    loading,
    pagination,
  });

  const totalCredits = useMemo(() => 
    courses.reduce((sum, course) => sum + course.credits, 0), 
    [courses]
  )

  const totalCourses = courses.length

  const filteredCourses = useMemo(() => {
    let filtered = displayCourses

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(course => 
        course.subjectCode.toLowerCase().includes(query) ||
        course.subjectName.toLowerCase().includes(query)
      )
    }

    if (filters.selectedStatus) {
      filtered = filtered.filter(course => {
        if (filters.selectedStatus === 'registered') {
          return !course.isLocked
        }
        if (filters.selectedStatus === 'locked') {
          return course.isLocked
        }
        return true
      })
    }

    return filtered
  }, [displayCourses, filters])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      // Chỉ chọn các môn chưa bị khóa
      const selectableCourses = filteredCourses.filter(c => !c.isLocked)
      setSelectedCourseIds(new Set(selectableCourses.map(c => c.courseId)))
    } else {
      setSelectedCourseIds(new Set())
    }
  }, [filteredCourses])

  const handleSelectCourse = useCallback((courseId: string, checked: boolean) => {
    setSelectedCourseIds(prev => {
      const next = new Set(prev)
      if (checked) {
        next.add(courseId)
      } else {
        next.delete(courseId)
      }
      return next
    })
  }, [])

  const handleDeselectAll = useCallback(() => {
    setSelectedCourseIds(new Set())
  }, [])

  const handleBulkCancel = useCallback(async () => {
    if (selectedCourseIds.size === 0 || !onBulkCancel) return
    
    setIsBulkCancelling(true)
    try {
      await onBulkCancel(Array.from(selectedCourseIds))
      setSelectedCourseIds(new Set())
    } finally {
      setIsBulkCancelling(false)
    }
  }, [selectedCourseIds, onBulkCancel])

  const isAllSelected = filteredCourses.length > 0 && 
    filteredCourses.filter(c => !c.isLocked).length > 0 &&
    filteredCourses.filter(c => !c.isLocked).every(c => selectedCourseIds.has(c.courseId))
  const isIndeterminate = selectedCourseIds.size > 0 && !isAllSelected

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch {
      return dateString
    }
  }, [])

  const tableColumns = [
    { key: 'checkbox', label: '', align: 'center' as const },
    { key: 'code', label: 'Mã', align: 'left' as const },
    { key: 'name', label: 'Tên môn học', align: 'left' as const },
    { key: 'instructor', label: 'Giảng viên', align: 'left' as const },
    { key: 'credits', label: 'Số TC', align: 'center' as const },
    { key: 'date', label: 'Ngày đăng kí', align: 'center' as const },
    { key: 'status', label: 'Trạng thái', align: 'center' as const },
    { key: 'action', label: 'HD', align: 'center' as const },
  ]

  const getStatusDisplay = useCallback((isLocked?: boolean) => {
    if (isLocked) {
      return {
        label: 'Đã khóa',
        color: 'bg-gray-100 text-gray-600'
      }
    }
    return {
      label: 'Đã đăng ký',
      color: 'bg-green-50 text-green-700'
    }
  }, [])

  const renderCourseRow = useCallback((course: CourseDto) => {
    const isSelected = selectedCourseIds.has(course.courseId)
    const statusDisplay = getStatusDisplay(course.isLocked)
    const isLocked = course.isLocked || false

    const handleViewDetail = () => {
      setSelectedCourse(course)
      setIsDetailModalOpen(true)
    }

    return (
      <>
        <td className="px-6 py-4">
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleSelectCourse(course.courseId, e.target.checked)}
              disabled={isLocked}
              className={`w-4 h-4 text-[#0053AD] border-gray-300 rounded focus:ring-[#0053AD] ${
                isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              title={isLocked ? 'Môn học đã bị khóa, không thể chọn' : ''}
            />
          </div>
        </td>
        <td className={`px-6 py-4 text-sm ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
          {course.subjectCode}
        </td>
        <td className={`px-6 py-4 text-sm ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
          {course.subjectName}
        </td>
        <td className={`px-6 py-4 text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
          {course.instructorName}
        </td>
        <td className={`px-6 py-4 text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'} text-center`}>
          {course.credits}
        </td>
        <td className={`px-6 py-4 text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'} text-center`}>
          {formatDate(course.startDate)}
        </td>
        <td className="px-6 py-4">
          <div className="flex justify-center">
            <span className={`text-xs font-medium rounded px-2 py-1 ${statusDisplay.color}`}>
              {statusDisplay.label}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleViewDetail}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              title="Xem chi tiết"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </>
    )
  }, [selectedCourseIds, handleSelectCourse, formatDate, getStatusDisplay])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        {/* Filters Component */}
        <RegisteredFilters 
          totalCourses={totalCourses}
          totalCredits={totalCredits}
          onRegisterButtonClick={onRegisterButtonClick}
        />

        {selectedCourseIds.size > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Đã chọn <span className="font-bold text-[#0053AD]">{selectedCourseIds.size}</span> môn học
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkCancel}
                disabled={isBulkCancelling}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
                Hủy đăng ký
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
          <div className="border border-gray-200 rounded-lg overflow-hidden">
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
                  {loading ? (
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
                          <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 bg-gray-200 rounded w-8 mx-auto animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns.length} className="px-6 py-8 text-center text-gray-500">
                        Không có môn học nào được đăng ký
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course, index) => {
                      const itemKey = course.courseId || `row-${index}`
                      const isLocked = course.isLocked || false
                      return (
                        <tr 
                          key={itemKey} 
                          className={`${
                            isLocked 
                              ? 'bg-gray-50 opacity-60' 
                              : 'hover:bg-gray-50'
                          } transition-colors duration-150 animate-fade-in`}
                          style={{ 
                            animationDelay: `${index * 30}ms`,
                            animationFillMode: 'both'
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

      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.pageNumber}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            onPageChange={(page) => goToPage?.(page)}
          />
        </div>
      )}

      <CourseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        course={selectedCourse}
      />
    </div>
  )
}