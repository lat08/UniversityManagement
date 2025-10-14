"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/app/components/ui/sidebar"
import { Header } from "@/app/components/header/header"
import { cn } from "@/lib/utils/utils"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import RequireAuth from "@/app/components/auth/RequireAuth"

// Dữ liệu mẫu cho thời khóa biểu
interface CourseSchedule {
  id: string
  name: string
  code: string
  room: string
  teacher: string
  dayOfWeek: number // 2-8 (Thứ 2 - Chủ nhật)
  startPeriod: number // 1-13
  periodsCount: number // Số tiết
  color: string // blue, red, green, etc.
}

const sampleSchedule: CourseSchedule[] = [
  {
    id: "1",
    name: "QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN (3)",
    code: "TV114",
    room: "D04-06",
    teacher: "Trần Thanh Tuyền",
    dayOfWeek: 4, // Thứ 4
    startPeriod: 1,
    periodsCount: 5,
    color: "blue",
  },
  {
    id: "2",
    name: "QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN (3) (CS3545)",
    code: "TV114",
    room: "D04501-Audi",
    teacher: "Trần Thanh Tuyền",
    dayOfWeek: 5, // Thứ 5
    startPeriod: 6,
    periodsCount: 4,
    color: "red",
  },
]

export default function WeeklySchedulePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState("Học kỳ 1 - Năm học 2025-2026")
  const [selectedWeek, setSelectedWeek] = useState("Tuần 4 [từ ngày 29/9/2025 đến ngày 5/10/2025]")
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)
  const [isWeekOpen, setIsWeekOpen] = useState(false)
  const currentPath = "/student/schedule/weekly"

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
    setHoveredCourse(courseId)
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
    setHoveredCourse(null)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.dropdown-container')) {
        setIsSemesterOpen(false)
        setIsWeekOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <RequireAuth>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        currentPath={currentPath}
      />

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          "ml-0 lg:ml-16",
          !isSidebarCollapsed && "lg:ml-64",
        )}
      >
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-[1600px] relative">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Thời khóa biểu theo tuần</h1>
              <p className="text-sm text-gray-600 mt-1">
                Hiển thị thời khóa biểu theo từng tuần trong học kỳ
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
                                    "absolute inset-0 rounded-lg p-2.5 cursor-pointer transition-all duration-200 z-10",
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
                                      <strong>Nhóm:</strong> {course.code}
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
                        <div className="w-[90px] flex-shrink-0 text-white rounded-lg flex items-center justify-center text-[10px] leading-tight text-center px-1 h-[52px]" style={{ backgroundColor: '#4E8EE1' }}>
                          7:15 - 8:05
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Tooltip */}
            {hoveredCourse && (
              <div
                className="absolute z-50"
                style={{
                  left: `${hoverPosition.x}px`,
                  top: `${hoverPosition.y}px`,
                }}
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
                  <div className="bg-gray-900 text-white p-3 rounded-md shadow-2xl w-[280px]">
                    {sampleSchedule
                      .filter((c) => c.id === hoveredCourse)
                      .map((course) => {
                        const dayName = daysOfWeek.find((d) => d.value === course.dayOfWeek)?.label || ""
                        return (
                          <div key={course.id} className="space-y-1.5">
                            <div className="font-bold text-xs pb-1.5 border-b border-gray-700">
                              Mã MH: CS3545{course.id === "1" ? "" : "4"}
                            </div>
                            <div className="text-[11px] space-y-1 leading-relaxed">
                              <div>
                                <span className="font-semibold">Môn:</span> QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN (3)
                              </div>
                              <div>
                                <span className="font-semibold">Nhóm:</span> TV114 - Tổ TH 01
                              </div>
                              <div>
                                <span className="font-semibold">Phòng:</span> {course.room}
                              </div>
                              <div>
                                <span className="font-semibold">{dayName} - Tiết:</span> {course.startPeriod} - Số tiết: {course.periodsCount}
                              </div>
                              <div>
                                <span className="font-semibold">GV:</span> Trần Thanh Tuyền
                              </div>
                              <div>
                                <span className="font-semibold">Ngày:</span> {course.dayOfWeek === 5 ? "15/09/2025" : "01/10/2025"}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      </div>
    </RequireAuth>
  )
}
