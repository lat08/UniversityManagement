"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils/utils"
 import { sampleInstructorCourses } from "../lib/data/semesterData"
import { SEMESTERS } from "../lib/constants/scheduleConstants"


export default function InstructorSemesterSchedulePage() {
  const [selectedSemester, setSelectedSemester] = useState("Học kỳ 1 - Năm học 2025-2026")
  const [selectedView, setSelectedView] = useState("Thời khóa biểu cá nhân")
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)

  const views = [
    "Thời khóa biểu cá nhân",
    "Thời khóa biểu lớp",
  ]

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.dropdown-container')) {
        setIsSemesterOpen(false)
        setIsViewOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="mx-auto max-w-[1600px]">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Thời khóa biểu theo học kỳ</h1>
              <p className="text-sm text-gray-600 mt-1">
                Hiển thị lịch giảng dạy theo từng học kỳ
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
                    setIsViewOpen(false)
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

              {/* View Dropdown */}
              <div className="relative flex-1 dropdown-container">
                <button 
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full"
                  onClick={() => {
                    setIsViewOpen(!isViewOpen)
                    setIsSemesterOpen(false)
                  }}
                >
                  <span className="text-sm text-gray-900">{selectedView}</span>
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                </button>
                {isViewOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {views.map((view, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => {
                          setSelectedView(view)
                          setIsViewOpen(false)
                        }}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Print Button */}
              <button className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[var(--button-primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--button-primary-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="text-sm font-medium">In</span>
              </button>
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead className="bg-[var(--primary)]">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Mã MH
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Tên môn học
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Nhóm tổ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Số tín chỉ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Lớp
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Thứ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Tiết bắt đầu
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Số tiết
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Phòng
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider">
                        Thời gian dạy
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sampleInstructorCourses.map((course, index) => (
                      <tr 
                        key={course.id}
                        className={cn(
                          "hover:bg-[var(--primary-light)] transition-colors border-b border-gray-200",
                          index % 2 === 0 ? "bg-white" : "bg-[var(--bg-secondary)]"
                        )}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                          {course.courseCode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                          {course.courseName}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.classGroup}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.credits}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.classCode}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.dayOfWeek}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.startPeriod}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.periodCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.room}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900">
                          {course.timeSlot}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
    </div>
  )
}
