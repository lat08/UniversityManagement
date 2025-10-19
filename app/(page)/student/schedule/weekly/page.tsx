"use client"

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { sampleSchedule } from "../lib/data/weeklyData"
import { SEMESTERS, WEEKS, DAYS_OF_WEEK, PERIODS } from "../lib/constants/weeklyConstants"
import { useWeeklySchedule } from "../lib/hooks/useWeeklySchedule"

export default function WeeklySchedulePage() {
  const {
    selectedSemester,
    setSelectedSemester,
    selectedWeek,
    setSelectedWeek,
    hoveredCourse,
    hoverPosition,
    isSemesterOpen,
    setIsSemesterOpen,
    isWeekOpen,
    setIsWeekOpen,
    isTooltipPinned,
    getColorClasses,
    handleMouseEnter,
    handleMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
    handleTooltipClick,
  } = useWeeklySchedule()

  return (
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
                    {SEMESTERS.map((semester, index) => (
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
                    {WEEKS.map((week, index) => (
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
                    {DAYS_OF_WEEK.map((day) => (
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
                    {PERIODS.map((period) => (
                      <div key={period} className="flex gap-2 mb-2">
                        {/* Period Label */}
                        <div className="w-[90px] flex-shrink-0 text-white rounded-lg flex items-center justify-center font-semibold text-sm h-[52px]" style={{ backgroundColor: '#4E8EE1' }}>
                          Tiết {period}
                        </div>

                        {/* Day Cells */}
                        {DAYS_OF_WEEK.map((day) => {
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

            {/* Interactive Hover Tooltip */}
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
                  <div className="bg-gray-900 text-white p-3 rounded-md shadow-2xl w-[280px] select-text">
                    {sampleSchedule
                      .filter((c) => c.id === hoveredCourse)
                      .map((course) => {
                        const dayName = DAYS_OF_WEEK.find((d) => d.value === course.dayOfWeek)?.label || ""
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
  )
}
