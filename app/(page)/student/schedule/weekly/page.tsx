"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { DAYS_OF_WEEK, PERIODS, PERIOD_TIMES } from "../lib/constants/index"
import { useScheduleData } from "../lib/hooks/useScheduleData"

export default function WeeklySchedulePage() {
  usePageTitle('TKB theo tuần');
  const [isViewTypeOpen, setIsViewTypeOpen] = useState(false)
  const [isSubjectOpen, setIsSubjectOpen] = useState(false)
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("")
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)
  const [isWeekOpen, setIsWeekOpen] = useState(false)
  const [isTooltipPinned, setIsTooltipPinned] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)

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

  // Close dropdowns and tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Check if clicking on any dropdown container
      const semesterDropdown = target.closest('[data-dropdown="semester"]')
      const weekDropdown = target.closest('[data-dropdown="week"]')
      const viewDropdown = target.closest('[data-dropdown="view"]')
      const subjectDropdown = target.closest('[data-dropdown="subject"]')
      
      // Close dropdowns if clicking outside all dropdowns
      if (!semesterDropdown && !weekDropdown && !viewDropdown && !subjectDropdown) {
        setIsSemesterOpen(false)
        setIsWeekOpen(false)
        setIsViewTypeOpen(false)
        setIsSubjectOpen(false)
        setSubjectSearchTerm("")
      }
      
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

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject => 
    subject.subjectName.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
    subject.subjectCode.toLowerCase().includes(subjectSearchTerm.toLowerCase())
  )

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

  // Format semester and week for display
  const formatWeekDisplay = (week: { weekNumber: number; startDate: string; endDate: string } | null) => {
    if (!week) return "Chọn tuần";
    const start = new Date(week.startDate).toLocaleDateString('vi-VN');
    const end = new Date(week.endDate).toLocaleDateString('vi-VN');
    return `Tuần ${week.weekNumber} [từ ngày ${start} đến ngày ${end}]`;
  };

  // Calculate dates for the current week
  const weekDates = useMemo(() => {
    if (!selectedWeek) return [];
    
    const startDate = new Date(selectedWeek.startDate);
    const dates = [];
    
    // Generate dates for Monday to Sunday (7 days)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }, [selectedWeek]);

  // Transform API data to match component structure
  const transformedSchedule = useMemo(() => {
    return scheduleData.map((item) => {
      // Map courseType to color: Lý thuyết = blue, Thực hành = red
      const getColorByCourseType = (courseType?: string): string => {
        if (!courseType) return 'blue';
        const lowerType = courseType.toLowerCase();
        if (lowerType.includes('lý thuyết') || lowerType.includes('ly thuyet')) {
          return 'blue';
        }
        if (lowerType.includes('thực hành') || lowerType.includes('thuc hanh')) {
          return 'red';
        }
        return 'blue'; // default
      };
      
      return {
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
      };
    });
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
                  teacher: course.teacher,
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
                  teacher: course2.teacher,
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
              <div className="relative flex-1 dropdown-container" data-dropdown="semester">
                <button 
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setIsSemesterOpen(!isSemesterOpen)
                    setIsWeekOpen(false)
                    setIsViewTypeOpen(false)
                    setIsSubjectOpen(false)
                    setSubjectSearchTerm("")
                  }}
                  disabled={isLoading}
                >
                  <span className="text-sm text-gray-900">
                    {selectedSemester?.semesterName || "Đang tải..."}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                </button>
                {isSemesterOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {semesters.map((semester) => (
                      <button
                        key={semester.semesterId}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => {
                          handleSemesterChange(semester.semesterId)
                          setIsSemesterOpen(false)
                        }}
                      >
                        {semester.semesterName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Week Dropdown */}
              <div className="relative flex-1 dropdown-container" data-dropdown="week">
                <button 
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setIsWeekOpen(!isWeekOpen)
                    setIsSemesterOpen(false)
                    setIsViewTypeOpen(false)
                    setIsSubjectOpen(false)
                    setSubjectSearchTerm("")
                  }}
                  disabled={isLoading || weeks.length === 0}
                >
                  <span className="text-sm text-gray-900">
                    {formatWeekDisplay(selectedWeek)}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                </button>
                {isWeekOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {weeks.map((week) => (
                      <button
                        key={week.weekNumber}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => {
                          handleWeekChange(week.weekNumber)
                          setIsWeekOpen(false)
                        }}
                      >
                        {formatWeekDisplay(week)}
                      </button>
                    ))}
                  </div>
                )}
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
              <div className="relative flex-1 dropdown-container" data-dropdown="view">
                <button 
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setIsViewTypeOpen(!isViewTypeOpen)
                    setIsSemesterOpen(false)
                    setIsWeekOpen(false)
                    setIsSubjectOpen(false)
                    setSubjectSearchTerm("")
                  }}
                  disabled={isLoading}
                >
                  <span className="text-sm text-gray-900">
                    {viewType === 'week' ? 'Thời khóa biểu cá nhân' : 'Thời khóa biểu theo môn học'}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                </button>
                {isViewTypeOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
                      onClick={() => {
                        handleViewTypeChange('week')
                        setIsViewTypeOpen(false)
                      }}
                    >
                      Thời khóa biểu cá nhân
                    </button>
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                      onClick={() => {
                        handleViewTypeChange('subject')
                        setIsViewTypeOpen(false)
                      }}
                    >
                      Thời khóa biểu theo môn học
                    </button>
                  </div>
                )}
              </div>

              {/* Subject Dropdown - Only show when viewType is 'subject' */}
              {viewType === 'subject' ? (
                <div className="relative flex-1 dropdown-container" data-dropdown="subject">
                  <button 
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      setIsSubjectOpen(!isSubjectOpen)
                      setIsSemesterOpen(false)
                      setIsWeekOpen(false)
                      setIsViewTypeOpen(false)
                    }}
                    disabled={isLoading || subjects.length === 0}
                  >
                    <span className="text-sm text-gray-900">
                      {selectedSubject ? `${selectedSubject.subjectCode} - ${selectedSubject.subjectName}` : 'Chọn môn học'}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                  </button>
                  {isSubjectOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                      {/* Search input */}
                      <div className="p-3 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Tìm kiếm môn học..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={subjectSearchTerm}
                          onChange={(e) => setSubjectSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      {/* Subject list */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredSubjects.length > 0 ? (
                          filteredSubjects.map((subject) => (
                            <button
                              key={subject.subjectId}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => {
                                handleSubjectChange(subject.subjectCode)
                                setIsSubjectOpen(false)
                                setSubjectSearchTerm("")
                              }}
                            >
                              {subject.subjectCode} - {subject.subjectName}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Không tìm thấy môn học
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1"></div>
              )}

              {/* Spacer to match Print button width */}
              <div className="w-[100px]"></div>
            </div>

            {/* Schedule Grid */}
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
                        onClick={handlePreviousWeek}
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
                        onClick={handleNextWeek}
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
                          const course = transformedSchedule.find(
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
                                    getColorClasses(course.color, hoveredCourse === course.id)
                                  )}
                                  style={{
                                    height: `${course.periodsCount * 52 + (course.periodsCount - 1) * 8}px`,
                                  }}
                                  onMouseEnter={(e) => handleMouseEnter(course.id, e)}
                                  onMouseLeave={handleMouseLeave}
                                >
                                  <div className="text-xs font-semibold leading-tight mb-1.5 text-gray-900">
                                    {course.name}
                                  </div>
                                  <div className="space-y-0.5 text-[11px] text-gray-900">
                                    <div>
                                      <strong>Mã:</strong> {course.code}
                                    </div>
                                    <div>
                                      <strong>Phòng:</strong> {course.room}
                                    </div>
                                    <div>
                                      <strong>GV:</strong> {course.teacher}
                                    </div>
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

            {/* Interactive Hover Tooltip */}
            {hoveredCourse && (
              <div
                className="fixed z-50 course-tooltip"
                style={{
                  left: `${hoverPosition.x}px`,
                  top: `${hoverPosition.y}px`,
                }}
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}
                onClick={handleTooltipClick}
              >
                {/* Tooltip with arrow */}
                <div className="relative">
                  {/* Triangle pointing left */}
                  <div 
                    className="absolute -left-2 top-4 w-0 h-0"
                    style={{
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderRight: '8px solid #1a1a1a',
                    }}
                  />
                  
                  {/* Tooltip content */}
                  <div className="bg-gray-900 text-white p-3 rounded-md shadow-2xl w-[280px] select-text">
                    {transformedSchedule
                      .filter((c) => c.id === hoveredCourse)
                      .map((course) => {
                          const dayName = DAYS_OF_WEEK.find((d: { value: number; label: string }) => d.value === course.dayOfWeek)?.label || ""
                        const courseDate = new Date(course.date).toLocaleDateString('vi-VN')
                        return (
                          <div key={course.id} className="space-y-1.5">
                            <div className="font-bold text-xs pb-1.5 border-b border-gray-700">
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
                              <div>
                                <span className="font-semibold">Phòng:</span> {course.room}
                              </div>
                              <div>
                                <span className="font-semibold">{dayName} - Tiết:</span> {course.startPeriod} - Số tiết: {course.periodsCount}
                              </div>
                              <div>
                                <span className="font-semibold">GV:</span> {course.teacher}
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
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
          )}

            {/* Schedule Conflicts Notification */}
            {scheduleConflicts.length > 0 && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-800">
                    Cảnh báo: Phát hiện trùng lịch học
                  </h3>
                </div>
                <p className="text-sm text-red-700 mb-4">
                  Có {scheduleConflicts.length} tiết học bị trùng lịch. Vui lòng kiểm tra và liên hệ phòng đào tạo để được hỗ trợ.
                </p>
                
                <div className="space-y-3">
                  {scheduleConflicts.map((conflict, index) => {
                    const dayName = DAYS_OF_WEEK.find((d: { value: number; label: string }) => d.value === conflict.dayOfWeek)?.label || "";
                    
                    // Calculate the overlapping period range
                    const startPeriods = conflict.courses.map(c => {
                      const course = transformedSchedule.find(tc => tc.code === c.code && tc.dayOfWeek === conflict.dayOfWeek);
                      return course ? course.startPeriod : 0;
                    });
                    const endPeriods = conflict.courses.map(c => {
                      const course = transformedSchedule.find(tc => tc.code === c.code && tc.dayOfWeek === conflict.dayOfWeek);
                      return course ? course.startPeriod + course.periodsCount - 1 : 0;
                    });
                    
                    const minStart = Math.min(...startPeriods);
                    const maxEnd = Math.max(...endPeriods);
                    
                    return (
                      <div key={index} className="bg-white border border-red-300 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {dayName} - Tiết {minStart}-{maxEnd} (Trùng lịch)
                          </span>
                        </div>
                        
                        <div className="grid gap-2">
                          {conflict.courses.map((course, courseIndex) => (
                            <div key={courseIndex} className="flex items-start space-x-3 p-2 bg-gray-50 rounded border-l-4 border-red-400">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm text-gray-900">
                                    {course.name}
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    ({course.code})
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 space-y-0.5">
                                  <div>
                                    <span className="font-medium">Phòng:</span> {course.room}
                                  </div>
                                  <div>
                                    <span className="font-medium">Giảng viên:</span> {course.teacher}
                                  </div>
                                  <div>
                                    <span className="font-medium">Loại:</span> {course.courseType}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Khuyến nghị:</p>
                      <p>Vui lòng liên hệ phòng đào tạo hoặc giảng viên phụ trách để được hỗ trợ giải quyết vấn đề trùng lịch này.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
    </div>
  )
}



