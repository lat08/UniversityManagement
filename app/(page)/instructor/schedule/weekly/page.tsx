"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, FileText, Calendar } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { DAYS_OF_WEEK, PERIODS, PERIOD_TIMES } from "../lib/constants/index"
import { useInstructorWeeklySchedule } from "../lib/hooks/useInstructorWeeklySchedule"


export default function InstructorWeeklySchedulePage() {
  usePageTitle('TKB theo tuần');
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)
  const [isWeekOpen, setIsWeekOpen] = useState(false)
  const [isViewTypeOpen, setIsViewTypeOpen] = useState(false)
  const [isSubjectOpen, setIsSubjectOpen] = useState(false)
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("")
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isTooltipPinned, setIsTooltipPinned] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isScheduleChangeModalOpen, setIsScheduleChangeModalOpen] = useState(false)
  const [selectedCourseForChange, setSelectedCourseForChange] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [isTimeOpen, setIsTimeOpen] = useState(false)

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

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject => 
    subject.subjectName.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
    subject.subjectCode.toLowerCase().includes(subjectSearchTerm.toLowerCase())
  )

  const getColorClasses = (color: string, isHovered: boolean) => {
    const colors: Record<string, { bg: string; hover: string; border: string }> = {
      blue: {
        bg: "bg-[var(--chart-1)]",
        hover: "bg-[var(--primary-hover)]",
        border: "border-[var(--primary)]",
      },
      red: {
        bg: "bg-[var(--chart-4)]",
        hover: "bg-[var(--error)]",
        border: "border-[var(--error)]",
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
    return `${isHovered ? colorClass.hover : colorClass.bg} ${colorClass.border} border-2 text-[var(--text-primary)]`
  }

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

  const handleScheduleChangeRequest = (courseId: string) => {
    setSelectedCourseForChange(courseId)
    setIsScheduleChangeModalOpen(true)
    setHoveredCourse(null) // Đóng tooltip
    setIsTooltipPinned(false)
  }

  const handleCloseModal = () => {
    setIsScheduleChangeModalOpen(false)
    setSelectedCourseForChange(null)
    setSelectedTimeSlot("")
  }

  const handleSubmitScheduleChange = () => {
    // Logic xử lý gửi đề xuất đổi lịch
    console.log("Gửi đề xuất đổi lịch:", {
      courseId: selectedCourseForChange,
      newTimeSlot: selectedTimeSlot
    })
    handleCloseModal()
  }

  // Dữ liệu demo cho dropdown thời gian
  const availableTimeSlots = [
    "Thứ 3, tiết 1 - tiết 5, phòng FLE123",
    "Thứ 3, tiết 1 - tiết 5, phòng LEW123", 
    "Thứ 4, tiết 1 - tiết 5, phòng LEW123",
    "Thứ 6, tiết 1 - tiết 5, phòng DQA123"
  ]

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
      };
    });
  }, [scheduleData]);

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
        setIsTimeOpen(false)
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
              <button className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[var(--button-primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--button-primary-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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
                                handleSubjectChange(subject.subjectId)
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
                          "w-full h-[60px] text-[var(--primary-foreground)] rounded-lg flex items-center justify-center transition-colors bg-[var(--primary)]",
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
                          className="flex-1 min-w-[120px] text-[var(--primary-foreground)] rounded-lg flex flex-col items-center justify-center h-[60px] bg-[var(--primary)]"
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
                          "w-full h-[60px] text-[var(--primary-foreground)] rounded-lg flex items-center justify-center transition-colors bg-[var(--primary)]",
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
                        <div className="w-[90px] flex-shrink-0 text-[var(--primary-foreground)] rounded-lg flex items-center justify-center font-semibold text-sm h-[52px] bg-[var(--primary)]">
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
                              className="flex-1 min-w-[100px] bg-gray-50 border border-gray-200 rounded-lg relative h-[52px]"
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
                                      <strong>Lớp:</strong> {course.class}
                                    </div>
                                    <div>
                                      <strong>Phòng:</strong> {course.room}
                                    </div>
                                    <div>
                                      <strong>Mã MH:</strong> {course.code}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Time Column */}
                        <div className="w-[90px] flex-shrink-0 text-[var(--primary-foreground)] rounded-lg flex items-center justify-center font-semibold text-sm h-[52px] bg-[var(--primary)]">
                          {PERIOD_TIMES.find((p: { period: number; time: string }) => p.period === period)?.time || ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Hover Tooltip with Documents and Schedule Change Button */}
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
                  <div className="bg-gray-900 text-white p-4 rounded-md shadow-2xl w-[320px] select-text">
                    {transformedSchedule
                      .filter((c) => c.id === hoveredCourse)
                      .map((course) => {
                        const dayName = DAYS_OF_WEEK.find((d: { value: number; label: string }) => d.value === course.dayOfWeek)?.label || ""
                        const courseDate = new Date(course.date).toLocaleDateString('vi-VN')
                        return (
                          <div key={course.id} className="space-y-3">
                            {/* Course Info */}
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
                              <div>
                                <span className="font-semibold">Lớp:</span> {course.class}
                              </div>
                              <div>
                                <span className="font-semibold">Phòng:</span> {course.room}
                              </div>
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

                            {/* Schedule Change Request Button */}
                            <div className="pt-2 border-t border-gray-700">
                              <button
                                onClick={() => handleScheduleChangeRequest(course.id)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[var(--primary-foreground)] rounded text-xs font-medium transition-colors cursor-pointer bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
                              >
                                <Calendar className="w-3 h-3" />
                                Đề xuất đổi lịch
                              </button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
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
                    <div className="relative dropdown-container">
                      <button 
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
                        onClick={() => setIsTimeOpen(!isTimeOpen)}
                      >
                        <span className="text-sm text-gray-900">
                          {selectedTimeSlot || "Chọn thời gian mong muốn"}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                      </button>
                      {isTimeOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {availableTimeSlots.map((slot, index) => (
                            <button
                              key={index}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                              onClick={() => {
                                setSelectedTimeSlot(slot)
                                setIsTimeOpen(false)
                              }}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
