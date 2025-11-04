"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar } from "lucide-react"
import { Dropdown, DropdownSearch } from "@/app/components/ui"
import { WeeklyScheduleGrid, ScheduleTooltip, type CourseItem } from "@/app/components/schedule"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useInstructorWeeklySchedule } from "../lib/hooks/useInstructorWeeklySchedule"
import { formatWeekDisplay, getColorByCourseType, generateWeekDates } from "@/lib/utils/scheduleHelpers"


export default function InstructorWeeklySchedulePage() {
  usePageTitle('TKB theo tuần');
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isTooltipPinned, setIsTooltipPinned] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isScheduleChangeModalOpen, setIsScheduleChangeModalOpen] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")

  const {
    semesters,
    selectedSemester,
    weeks,
    selectedWeek,
    scheduleData,
    subjects,
    selectedSubject,
    viewType,
    isLoading,
    error,
    handleSemesterChange,
    handleWeekChange,
    handleViewTypeChange,
    handleSubjectChange,
  } = useInstructorWeeklySchedule()


  const semesterOptions = semesters.map(s => ({
    value: s.semesterId,
    label: s.semesterName,
  }))

  const weekOptions = weeks.map(w => ({
    value: w.weekNumber.toString(),
    label: formatWeekDisplay(w),
  }))

  const viewTypeOptions = [
    { value: 'week', label: 'Khung chương trình cá nhân' },
    { value: 'subject', label: 'Khung chương trình theo môn học' },
  ]

  const subjectOptions = subjects.map(s => ({
    value: s.subjectId,
    label: `${s.subjectCode} - ${s.subjectName}`,
  }))


  const handleMouseEnter = (courseId: string, event: React.MouseEvent) => {
    // Clear any existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    
    setHoveredCourse(courseId)
    setIsTooltipPinned(false) // Reset pin state
    
    const element = event.currentTarget as HTMLElement
    const rect = element.getBoundingClientRect()
    
    // Use fixed positioning based on viewport
    setHoverPosition({
      x: rect.right + 10,
      y: rect.top,
    })
  }

  const handleMouseLeave = () => {
    // Only hide if tooltip is not pinned
    if (!isTooltipPinned) {
      const timeout = setTimeout(() => {
        setHoveredCourse(null)
        setIsTooltipPinned(false)
      }, 200)
      setHideTimeout(timeout)
    }
  }

  const handleTooltipMouseEnter = () => {
    // Clear any hide timeout and pin the tooltip
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    setIsTooltipPinned(true)
  }

  const handleTooltipMouseLeave = () => {
    // Unpin and hide tooltip when leaving it
    setIsTooltipPinned(false)
    setHoveredCourse(null)
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
  }

  const handleTooltipClick = (e: React.MouseEvent) => {
    // Prevent event bubbling to avoid closing tooltip
    e.stopPropagation()
  }

  const handleScheduleChangeRequest = () => {
    setIsScheduleChangeModalOpen(true)
    setHoveredCourse(null) // Đóng tooltip
    setIsTooltipPinned(false)
  }

  const handleCloseModal = () => {
    setIsScheduleChangeModalOpen(false)
    setSelectedTimeSlot("")
  }

  const handleSubmitScheduleChange = () => {
    handleCloseModal()
  }

  const availableTimeSlots = [
    "Thứ 3, tiết 1 - tiết 5, phòng FLE123",
    "Thứ 3, tiết 1 - tiết 5, phòng LEW123", 
    "Thứ 4, tiết 1 - tiết 5, phòng LEW123",
    "Thứ 6, tiết 1 - tiết 5, phòng DQA123"
  ].map((slot, index) => ({
    value: String(index),
    label: slot,
  }))

  // Navigation functions for week buttons
  const handlePreviousWeek = () => {
    if (!selectedWeek || weeks.length === 0) return;
    
    const currentIndex = weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber);
    if (currentIndex > 0) {
      handleWeekChange(weeks[currentIndex - 1].weekNumber);
    }
  };

  const handleNextWeek = () => {
    if (!selectedWeek || weeks.length === 0) return;
    
    const currentIndex = weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber);
    if (currentIndex < weeks.length - 1) {
      handleWeekChange(weeks[currentIndex + 1].weekNumber);
    }
  };

  // Check if navigation buttons should be disabled
  const canGoPrevious = selectedWeek && weeks.length > 0 && 
    weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber) > 0;
  
  const canGoNext = selectedWeek && weeks.length > 0 && 
    weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber) < weeks.length - 1;

  const weekDates = useMemo(() => {
    if (!selectedWeek) return []
    return generateWeekDates(selectedWeek.startDate)
  }, [selectedWeek])

  const transformedSchedule: CourseItem[] = useMemo(() => {
    return scheduleData.map((item) => ({
      id: `${item.subjectCode}-${item.startPeriod}-${item.dayOfWeek}-${item.date}-${item.roomCode}`,
      name: item.subjectName,
      code: item.subjectCode,
      room: item.roomName && item.roomCode 
        ? `${item.roomName} (${item.roomCode})` 
        : item.roomCode || '-',
      class: item.classCode || '-',
      dayOfWeek: item.dayOfWeek,
      startPeriod: item.startPeriod,
      periodsCount: item.numberOfPeriods,
      color: getColorByCourseType(item.courseType),
      courseType: item.courseType || '',
      note: item.note,
      date: item.date,
    }));
  }, [scheduleData]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Close tooltip if clicking outside
      if (!target.closest('.course-tooltip') && !target.closest('.course-cell')) {
        setHoveredCourse(null)
        setIsTooltipPinned(false)
        if (hideTimeout) {
          clearTimeout(hideTimeout)
          setHideTimeout(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [hideTimeout])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
    }
  }, [hideTimeout])

  return (
    <div className="relative" style={{ minWidth: '1200px' }}>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Thời khóa biểu giảng dạy theo tuần</h1>
              <p className="text-sm text-gray-600 mt-1">
                Hiển thị lịch giảng dạy theo từng tuần trong học kỳ
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Filters */}
            <div className="mb-4 flex gap-4 items-stretch w-full">
              {/* Semester Dropdown */}
              <div className="flex-1">
                <Dropdown
                  options={semesterOptions}
                  value={selectedSemester?.semesterId || ''}
                  placeholder="Đang tải..."
                  onChange={(value) => handleSemesterChange(value)}
                  disabled={isLoading}
                />
              </div>

              {/* Week Dropdown */}
              <div className="flex-1">
                <Dropdown
                  options={weekOptions}
                  value={selectedWeek?.weekNumber.toString() || ''}
                  placeholder="Chọn tuần"
                  onChange={(value) => handleWeekChange(Number.parseInt(value))}
                  disabled={isLoading || weeks.length === 0}
                />
              </div>

              {/* Print Button */}
              <button className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[var(--schedule-print-bg)] text-[var(--schedule-print-text)] rounded-lg hover:bg-[var(--schedule-print-bg-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="text-sm font-medium">In</span>
              </button>
            </div>

            {/* View Type and Subject Filters */}
            <div className="mb-6 flex gap-4 items-stretch w-full mt-2">
              {/* View Type Dropdown */}
              <div className="flex-1">
                <Dropdown
                  options={viewTypeOptions}
                  value={viewType || 'week'}
                  placeholder="Chọn loại xem"
                  onChange={(value) => handleViewTypeChange(value as 'week' | 'subject')}
                  disabled={isLoading}
                />
              </div>

              {/* Subject Dropdown - Only show when viewType is 'subject' */}
              {viewType === 'subject' ? (
                <div className="flex-1">
                  <DropdownSearch
                    options={subjectOptions}
                    value={selectedSubject?.subjectId || ''}
                    placeholder="Chọn môn học"
                    searchPlaceholder="Tìm kiếm môn học..."
                    onChange={(value) => handleSubjectChange(value)}
                    disabled={isLoading || subjects.length === 0}
                  />
                </div>
              ) : (
                <div className="flex-1"></div>
              )}

              {/* Spacer to match Print button width */}
              <div className="w-[100px]"></div>
            </div>

            {/* Schedule Grid */}
            <WeeklyScheduleGrid
              scheduleData={transformedSchedule}
              weekDates={weekDates}
              onCourseHover={handleMouseEnter}
              onCourseLeave={handleMouseLeave}
              hoveredCourseId={hoveredCourse}
              onPreviousWeek={handlePreviousWeek}
              onNextWeek={handleNextWeek}
              canGoPrevious={canGoPrevious ?? false}
              canGoNext={canGoNext ?? false}
              showCode={true}
              showTeacher={false}
              showClass={true}
            />

            {/* Enhanced Hover Tooltip with Schedule Change Button */}
            {hoveredCourse && transformedSchedule.find(c => c.id === hoveredCourse) && (
              <ScheduleTooltip
                course={transformedSchedule.find(c => c.id === hoveredCourse)!}
                position={hoverPosition}
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}
                onClick={handleTooltipClick}
                showClass={true}
                showTeacher={false}
                actionButton={
                  <button
                    onClick={handleScheduleChangeRequest}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[var(--schedule-print-text)] rounded text-xs font-medium transition-colors cursor-pointer bg-[var(--schedule-print-bg)] hover:bg-[var(--schedule-print-bg-hover)]"
                  >
                    <Calendar className="w-3 h-3" />
                    Đề xuất đổi lịch
                  </button>
                }
              />
            )}

          {/* Schedule Change Modal */}
          {isScheduleChangeModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-[2px] bg-[var(--muted-foreground)]/25">
              <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-[90vw] max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Đề xuất đổi lịch dạy</h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-6">
                    Gửi yêu cầu thay đổi lịch dạy đến phòng đào tạo
                  </p>

                  {/* Phương án mong muốn */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phương án mong muốn
                    </label>
                    <Dropdown
                      options={availableTimeSlots}
                      value={selectedTimeSlot}
                      placeholder="Chọn thời gian mong muốn"
                      onChange={(value) => setSelectedTimeSlot(value)}
                    />
                  </div>

                  {/* Lý do (optional) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do đổi lịch (tùy chọn)
                    </label>
                    <textarea
                      placeholder="Nhập lý do muốn đổi lịch..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitScheduleChange}
                    disabled={!selectedTimeSlot}
                    className="px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] disabled:bg-[var(--muted)]"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  )
}
