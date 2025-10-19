"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, FileText, Calendar } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { sampleSchedule } from "../lib/data/weeklyData"
import { SEMESTERS, WEEKS, DAYS_OF_WEEK, PERIODS } from "../lib/constants/scheduleConstants"
import { getColorClasses, getPeriodTime, getDayName } from "../lib/utils/scheduleUtils"


export default function InstructorWeeklySchedulePage() {
  const [selectedSemester, setSelectedSemester] = useState("Học kỳ 1 - Năm học 2025-2026")
  const [selectedWeek, setSelectedWeek] = useState("Tuần 4 [từ ngày 29/9/2025 đến ngày 5/10/2025]")
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)
  const [isWeekOpen, setIsWeekOpen] = useState(false)
  const [isTooltipPinned, setIsTooltipPinned] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isScheduleChangeModalOpen, setIsScheduleChangeModalOpen] = useState(false)
  const [selectedCourseForChange, setSelectedCourseForChange] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [isTimeOpen, setIsTimeOpen] = useState(false)

  const semesters = [
    "Học kỳ 1 - Năm học 2025-2026",
    "Học kỳ 2 - Năm học 2024-2025",
    "Học kỳ 3 - Năm học 2024-2025",
  ]

  const weeks = [
    "Tuần 1 [từ ngày 1/9/2025 đến ngày 7/9/2025]",
    "Tuần 2 [từ ngày 8/9/2025 đến ngày 14/9/2025]",
    "Tuần 3 [từ ngày 15/9/2025 đến ngày 21/9/2025]",
    "Tuần 4 [từ ngày 29/9/2025 đến ngày 5/10/2025]",
    "Tuần 5 [từ ngày 6/10/2025 đến ngày 12/10/2025]",
  ]

  const periods = Array.from({ length: 13 }, (_, i) => i + 1)
  const daysOfWeek = [
    { label: "Thứ hai", subLabel: "29/9", value: 2 },
    { label: "Thứ ba", subLabel: "30/9", value: 3 },
    { label: "Thứ tư", subLabel: "1/10", value: 4 },
    { label: "Thứ năm", subLabel: "2/10", value: 5 },
    { label: "Thứ sáu", subLabel: "3/10", value: 6 },
    { label: "Thứ bảy", subLabel: "4/10", value: 7 },
    { label: "Chủ nhật", subLabel: "5/10", value: 8 },
  ]

  const getColorClasses = (color: string, isHovered: boolean) => {
    const colors: Record<string, { bg: string; hover: string; border: string }> = {
      blue: {
        bg: "bg-blue-200",
        hover: "bg-blue-300",
        border: "border-blue-400",
      },
      red: {
        bg: "bg-red-200",
        hover: "bg-red-300",
        border: "border-red-400",
      },
      green: {
        bg: "bg-green-200",
        hover: "bg-green-300",
        border: "border-green-400",
      },
      yellow: {
        bg: "bg-yellow-200",
        hover: "bg-yellow-300",
        border: "border-yellow-400",
      },
    }

    const colorClass = colors[color] || colors.blue
    return `${isHovered ? colorClass.hover : colorClass.bg} ${colorClass.border} border-2 text-gray-900`
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
    const container = element.closest('.mx-auto')
    const containerRect = container?.getBoundingClientRect()
    
    if (containerRect) {
      setHoverPosition({
        x: rect.right - containerRect.left + 10, // Position to the right of the cell, relative to container
        y: rect.top - containerRect.top,
      })
    }
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

  // Close dropdowns and tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Close dropdowns
      if (!target.closest('.dropdown-container')) {
        setIsSemesterOpen(false)
        setIsWeekOpen(false)
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
    <div className="mx-auto max-w-[1600px] relative">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Thời khóa biểu giảng dạy theo tuần</h1>
              <p className="text-sm text-gray-600 mt-1">
                Hiển thị lịch giảng dạy theo từng tuần trong học kỳ
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4 items-stretch w-full">
              {/* Semester Dropdown */}
              <div className="relative flex-1 dropdown-container">
                <button 
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full"
                  onClick={() => {
                    setIsSemesterOpen(!isSemesterOpen)
                    setIsWeekOpen(false)
                  }}
                >
                  <span className="text-sm text-gray-900">{selectedSemester}</span>
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                </button>
                {isSemesterOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {semesters.map((semester, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => {
                          setSelectedSemester(semester)
                          setIsSemesterOpen(false)
                        }}
                      >
                        {semester}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Week Dropdown */}
              <div className="relative flex-1 dropdown-container">
                <button 
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full"
                  onClick={() => {
                    setIsWeekOpen(!isWeekOpen)
                    setIsSemesterOpen(false)
                  }}
                >
                  <span className="text-sm text-gray-900">{selectedWeek}</span>
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                </button>
                {isWeekOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {weeks.map((week, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => {
                          setSelectedWeek(week)
                          setIsWeekOpen(false)
                        }}
                      >
                        {week}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Print Button */}
              <button className="flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none cursor-pointer transition-colors whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="text-sm font-medium">In</span>
              </button>
            </div>

            {/* Schedule Grid */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  {/* Header Row */}
                  <div className="flex gap-2 mb-2">
                    {/* Top left corner button */}
                    <div className="w-[90px] flex-shrink-0">
                      <button className="w-full h-[60px] text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:opacity-90" style={{ backgroundColor: '#4E8EE1' }}>
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Days of week */}
                    {daysOfWeek.map((day) => (
                      <div
                        key={day.value}
                        className="flex-1 min-w-[120px] text-white rounded-lg flex flex-col items-center justify-center h-[60px]"
                        style={{ backgroundColor: '#4E8EE1' }}
                      >
                        <div className="font-semibold text-sm">{day.label}</div>
                        <div className="text-xs mt-1">{day.subLabel}</div>
                      </div>
                    ))}

                    {/* Top right corner button */}
                    <div className="w-[90px] flex-shrink-0">
                      <button className="w-full h-[60px] text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:opacity-90" style={{ backgroundColor: '#4E8EE1' }}>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Schedule Grid */}
                  <div className="relative">
                    {periods.map((period) => (
                      <div key={period} className="flex gap-2 mb-2">
                        {/* Period Label */}
                        <div className="w-[90px] flex-shrink-0 text-white rounded-lg flex items-center justify-center font-semibold text-sm h-[52px]" style={{ backgroundColor: '#4E8EE1' }}>
                          Tiết {period}
                        </div>

                        {/* Day Cells */}
                        {daysOfWeek.map((day) => {
                          const course = sampleSchedule.find(
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
                        <div className="w-[90px] flex-shrink-0 text-white rounded-lg flex items-center justify-center text-[10px] leading-tight text-center px-1 h-[52px]" style={{ backgroundColor: '#4E8EE1' }}>
                          7:15 - 8:05
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
                className="absolute z-50 course-tooltip"
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
                    {sampleSchedule
                      .filter((c) => c.id === hoveredCourse)
                      .map((course) => {
                        const dayName = daysOfWeek.find((d) => d.value === course.dayOfWeek)?.label || ""
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
                                <span className="font-semibold">Ngày:</span> {course.dayOfWeek === 5 ? "15/09/2025" : course.dayOfWeek === 4 ? "01/10/2025" : "30/09/2025"}
                              </div>
                            </div>

                            {/* Documents Section */}
                            {course.documents && course.documents.length > 0 && (
                              <div className="pt-2 border-t border-gray-700">
                                <div className="flex items-center gap-1 mb-2">
                                  <FileText className="w-3 h-3" />
                                  <span className="font-semibold text-xs">Tài liệu đã gắn:</span>
                                </div>
                                <div className="space-y-1">
                                  {course.documents.map((doc, index) => (
                                    <div key={index} className="text-[10px] text-blue-300 hover:text-blue-200 cursor-pointer flex items-center gap-1">
                                      <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                                      {doc}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Schedule Change Request Button */}
                            <div className="pt-2 border-t border-gray-700">
                              <button
                                onClick={() => handleScheduleChangeRequest(course.id)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                                style={{ backgroundColor: '#4E8EE1' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#3A7BC8'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#4E8EE1'
                                }}
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
            <div className="fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-[2px]" style={{ backgroundColor: 'rgba(148, 163, 184, 0.25)' }}>
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
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: selectedTimeSlot ? '#4E8EE1' : '#9CA3AF'
                    }}
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
