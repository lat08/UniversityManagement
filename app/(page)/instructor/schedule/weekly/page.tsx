"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar } from "lucide-react"
import { Dropdown, DropdownSearch } from "@/app/components/ui"
import { WeeklyScheduleGrid, ScheduleTooltip, type CourseItem } from "@/app/components/schedule"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useInstructorWeeklySchedule } from "../lib/hooks/useInstructorWeeklySchedule"
import { formatWeekDisplay, getColorByCourseType, generateWeekDates } from "@/lib/utils/scheduleHelpers"
import { ScheduleChangeModal } from "./components/ScheduleChangeModal"
import { instructorWeeklyScheduleApi } from "../lib/api/weeklyScheduleApi"
import { downloadFileBlob } from "@/lib/utils/fileDownload"
import toast from "react-hot-toast"


export default function InstructorWeeklySchedulePage() {
  usePageTitle('TKB theo tuần');
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isTooltipPinned, setIsTooltipPinned] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isScheduleChangeModalOpen, setIsScheduleChangeModalOpen] = useState(false)
  const [selectedCourseForChange, setSelectedCourseForChange] = useState<{
    courseClassId: string;
    subjectName: string;
    subjectCode: string;
  } | null>(null)
  const [isExporting, setIsExporting] = useState(false)

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
    const course = transformedSchedule.find(c => c.id === hoveredCourse);
    if (course) {
      const scheduleItem = scheduleData.find(item => 
        `${item.subjectCode}-${item.startPeriod}-${item.dayOfWeek}-${item.date}-${item.roomCode}` === course.id
      );
      
      if (scheduleItem?.courseClassId) {
        setSelectedCourseForChange({
          courseClassId: scheduleItem.courseClassId,
          subjectName: course.name,
          subjectCode: course.code,
        });
        setIsScheduleChangeModalOpen(true);
      } else {
        toast.error('Không tìm thấy thông tin lớp học');
      }
    }
    setHoveredCourse(null);
    setIsTooltipPinned(false);
  }

  const handleCloseModal = () => {
    setIsScheduleChangeModalOpen(false)
    setSelectedCourseForChange(null)
  }

  const handleExportPdf = async () => {
    if (!selectedSemester || !selectedWeek) {
      toast.error('Vui lòng chọn học kỳ và tuần')
      return
    }

    setIsExporting(true)
    try {
      const blob = await instructorWeeklyScheduleApi.exportWeeklyPdf(
        selectedSemester.semesterId,
        selectedWeek.weekNumber
      )
      
      const now = new Date()
      const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_')
      const filename = `ThoiKhoaBieu_GiangVien_Tuan${selectedWeek.weekNumber}_${timestamp}.pdf`
      
      downloadFileBlob(blob, filename)
      toast.success('Xuất PDF thành công')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Xuất PDF thất bại')
    } finally {
      setIsExporting(false)
    }
  }

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
              <button 
                onClick={handleExportPdf}
                className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[var(--schedule-print-bg)] text-[var(--schedule-print-text)] rounded-lg hover:bg-[var(--schedule-print-bg-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isExporting || !selectedSemester || !selectedWeek}
              >
                {isExporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium">Đang xuất...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span className="text-sm font-medium">In</span>
                  </>
                )}
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
          {isScheduleChangeModalOpen && selectedCourseForChange && selectedWeek && (
            <ScheduleChangeModal
              isOpen={isScheduleChangeModalOpen}
              onClose={handleCloseModal}
              courseClassId={selectedCourseForChange.courseClassId}
              currentWeek={selectedWeek.weekNumber}
              subjectName={selectedCourseForChange.subjectName}
              subjectCode={selectedCourseForChange.subjectCode}
              weeks={weeks}
            />
          )}
    </div>
  )
}
