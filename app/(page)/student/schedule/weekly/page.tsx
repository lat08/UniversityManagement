"use client"

import { useState, useMemo, useEffect } from "react"
import { Dropdown, DropdownSearch } from "@/app/components/ui"
import { WeeklyScheduleGrid, ScheduleTooltip, ScheduleConflictsNotification, type CourseItem } from "@/app/components/schedule"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useScheduleData } from "../lib/hooks/useScheduleData"
import { formatWeekDisplay, getColorByCourseType, generateWeekDates } from "@/lib/utils/scheduleHelpers"

export default function WeeklySchedulePage() {
  usePageTitle('TKB theo tuần');
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isTooltipPinned, setIsTooltipPinned] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)


  const handleMouseEnter = (courseId: string, event: React.MouseEvent) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    
    setHoveredCourse(courseId)
    setIsTooltipPinned(false)
    
    const element = event.currentTarget as HTMLElement
    const rect = element.getBoundingClientRect()
    
    // Use fixed positioning based on viewport
    setHoverPosition({
      x: rect.right + 10,
      y: rect.top,
    })
  }

  const handleMouseLeave = () => {
    if (!isTooltipPinned) {
      const timeout = setTimeout(() => {
        setHoveredCourse(null)
        setIsTooltipPinned(false)
      }, 200)
      setHideTimeout(timeout)
    }
  }

  const handleTooltipMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    setIsTooltipPinned(true)
  }

  const handleTooltipMouseLeave = () => {
    setIsTooltipPinned(false)
    setHoveredCourse(null)
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
  }

  const handleTooltipClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

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
    handleExportPDF,
  } = useScheduleData()


  const semesterOptions = semesters.map(s => ({
    value: s.semesterId,
    label: s.semesterName,
  }))

  const weekOptions = weeks.map(w => ({
    value: w.weekNumber.toString(),
    label: formatWeekDisplay(w),
  }))

  const viewTypeOptions = [
    { value: 'week', label: 'Thời khóa biểu cá nhân' },
    { value: 'subject', label: 'Thời khóa biểu theo môn học' },
  ]

  const subjectOptions = subjects.map(s => ({
    value: s.subjectCode,
    label: `${s.subjectCode} - ${s.subjectName}`,
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
  const canGoPrevious = !!(selectedWeek && weeks.length > 0 && 
    weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber) > 0);
  
  const canGoNext = !!(selectedWeek && weeks.length > 0 && 
    weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber) < weeks.length - 1);


  const weekDates = useMemo(() => {
    if (!selectedWeek) return []
    return generateWeekDates(selectedWeek.startDate)
  }, [selectedWeek])
      
  const transformedSchedule: CourseItem[] = useMemo(() => {
    return scheduleData.map((item) => ({
        id: `${item.subjectCode}-${item.startPeriod}-${item.dayOfWeek}-${item.date}-${item.roomCode}-${item.instructorName}`,
        name: item.subjectName,
        code: item.subjectCode,
        room: item.roomName && item.roomCode 
          ? `${item.roomName} (${item.roomCode})` 
          : item.roomCode || '-',
        teacher: item.instructorName,
        dayOfWeek: item.dayOfWeek,
        startPeriod: item.startPeriod,
        periodsCount: item.numberOfPeriods,
        color: getColorByCourseType(item.courseType),
        courseType: item.courseType || '',
        note: item.note,
        date: item.date,
    }));
  }, [scheduleData]);

  // Detect schedule conflicts
  const scheduleConflicts = useMemo(() => {
    const conflicts: Array<{
      dayOfWeek: number;
      period: number;
      courses: Array<{
        name: string;
        code: string;
        room: string;
        teacher: string;
        courseType: string;
      }>;
    }> = [];


    // Group courses by day to check for overlapping periods
    const dayGroups = new Map<number, typeof transformedSchedule>();
    
    transformedSchedule.forEach(course => {
      if (!dayGroups.has(course.dayOfWeek)) {
        dayGroups.set(course.dayOfWeek, []);
      }
      dayGroups.get(course.dayOfWeek)!.push(course);
    });

    // Check for overlapping periods within each day
    dayGroups.forEach((courses, dayOfWeek) => {
      // Sort courses by start period
      const sortedCourses = courses.sort((a, b) => a.startPeriod - b.startPeriod);
      
      // Check each course against all others for overlaps
      for (let i = 0; i < sortedCourses.length; i++) {
        for (let j = i + 1; j < sortedCourses.length; j++) {
          const course1 = sortedCourses[i];
          const course2 = sortedCourses[j];
          
          // Calculate end periods
          const course1EndPeriod = course1.startPeriod + course1.periodsCount - 1;
          const course2EndPeriod = course2.startPeriod + course2.periodsCount - 1;
          
          // Check for overlap: course1 overlaps with course2 if:
          // course1 starts before course2 ends AND course1 ends after course2 starts
          const hasOverlap = course1.startPeriod <= course2EndPeriod && course1EndPeriod >= course2.startPeriod;
          
          if (hasOverlap) {
            // Find existing conflict or create new one
            let existingConflict = conflicts.find(c => c.dayOfWeek === dayOfWeek && c.period === course1.startPeriod);
            
            if (!existingConflict) {
              existingConflict = {
                dayOfWeek,
                period: course1.startPeriod,
                courses: [course1, course2].map(course => ({
                  name: course.name,
                  code: course.code,
                  room: course.room,
                  teacher: course.teacher || '',
                  courseType: course.courseType || '',
                }))
              };
              conflicts.push(existingConflict);
            } else {
              // Add course2 to existing conflict if not already present
              const course2Exists = existingConflict.courses.some(c => c.code === course2.code);
              if (!course2Exists) {
                existingConflict.courses.push({
                  name: course2.name,
                  code: course2.code,
                  room: course2.room,
                  teacher: course2.teacher || '',
                  courseType: course2.courseType || '',
                });
              }
            }
          }
        }
      }
    });
    return conflicts;
  }, [transformedSchedule]);

  return (
    <div className="relative" style={{ minWidth: '1200px' }}>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Thời khóa biểu theo tuần</h1>
              <p className="text-sm text-gray-600 mt-1">
                Hiển thị thời khóa biểu theo từng tuần trong học kỳ
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
                className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[var(--schedule-print-bg)] text-[var(--schedule-print-text)] rounded-lg hover:bg-[var(--schedule-print-bg-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleExportPDF}
                disabled={isLoading || !selectedSemester || !selectedWeek || (viewType === 'subject' && !selectedSubject)}
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
                    value={selectedSubject?.subjectCode || ''}
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
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              showCode={true}
              showTeacher={true}
              showClass={false}
            />

            {/* Interactive Hover Tooltip */}
            {hoveredCourse && transformedSchedule.find(c => c.id === hoveredCourse) && (
              <ScheduleTooltip
                course={transformedSchedule.find(c => c.id === hoveredCourse)!}
                position={hoverPosition}
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}
                onClick={handleTooltipClick}
                showClass={false}
                showTeacher={true}
              />
          )}

            {/* Schedule Conflicts Notification */}
            <ScheduleConflictsNotification conflicts={scheduleConflicts} />
    </div>
  )
}



