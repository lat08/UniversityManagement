"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useInstructorSemesterSchedule } from "../lib/hooks/useInstructorSemesterSchedule"


export default function InstructorSemesterSchedulePage() {
  usePageTitle('TKB theo học kỳ');
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isSubjectOpen, setIsSubjectOpen] = useState(false)
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("")

  const {
    semesters,
    selectedSemester,
    subjects,
    selectedSubject,
    scheduleData,
    viewType,
    isLoading,
    error,
    handleSemesterChange,
    handleViewTypeChange,
    handleSubjectChange,
  } = useInstructorSemesterSchedule()

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject => 
    subject.subjectName.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
    subject.subjectCode.toLowerCase().includes(subjectSearchTerm.toLowerCase())
  )

  // Close dropdowns when clicking outside or on other dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Check if clicking on any dropdown container
      const semesterDropdown = target.closest('[data-dropdown="semester"]')
      const viewDropdown = target.closest('[data-dropdown="view"]')
      const subjectDropdown = target.closest('[data-dropdown="subject"]')
      
      // If clicking outside all dropdowns, close all
      if (!semesterDropdown && !viewDropdown && !subjectDropdown) {
        setIsSemesterOpen(false)
        setIsViewOpen(false)
        setIsSubjectOpen(false)
        setSubjectSearchTerm("")
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="mx-auto max-w-[1600px]">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Khung chương trình theo học kỳ</h1>
              <p className="text-sm text-gray-600 mt-1">
                Hiển thị chương trình giảng dạy theo từng học kỳ
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
                    setIsViewOpen(false)
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

              {/* Print Button */}
              <button className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[var(--button-primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--button-primary-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap">
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
                    setIsViewOpen(!isViewOpen)
                    setIsSemesterOpen(false)
                    setIsSubjectOpen(false)
                    setSubjectSearchTerm("")
                  }}
                  disabled={isLoading}
                >
                  <span className="text-sm text-gray-900">
                    {viewType === "personal" ? "Thời khóa biểu cá nhân" : "Thời khóa biểu theo môn học"}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                </button>
                {isViewOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
                      onClick={() => {
                        handleViewTypeChange("personal")
                        setIsViewOpen(false)
                      }}
                    >
                      Thời khóa biểu cá nhân
                    </button>
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                      onClick={() => {
                        handleViewTypeChange("subject")
                        setIsViewOpen(false)
                      }}
                    >
                      Thời khóa biểu theo môn học
                    </button>
                  </div>
                )}
              </div>

              {/* Subject Dropdown or Spacer */}
              {viewType === "subject" ? (
                <div className="relative flex-1 dropdown-container" data-dropdown="subject">
                  <button 
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      setIsSubjectOpen(!isSubjectOpen)
                      setIsSemesterOpen(false)
                      setIsViewOpen(false)
                    }}
                    disabled={isLoading || subjects.length === 0}
                  >
                    <span className="text-sm text-gray-900">
                      {selectedSubject 
                        ? `${selectedSubject.subjectCode} - ${selectedSubject.subjectName}`
                        : "Chọn môn học"}
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
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead className="bg-[var(--primary)]">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Mã môn
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Tên môn học
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Nhóm tổ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Thứ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Tiết
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white">
                        Phòng
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider">
                        Thời gian học
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          Đang tải dữ liệu...
                        </td>
                      </tr>
                    ) : scheduleData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          Không có dữ liệu thời khóa biểu
                        </td>
                      </tr>
                    ) : (
                      scheduleData.map((course, index) => {
                        // Calculate end period for display: startPeriod + numberOfPeriods - 1
                        const endPeriod = course.startPeriod + (course.numberOfPeriods || 1) - 1
                        const periodDisplay = course.numberOfPeriods > 1 
                          ? `${course.startPeriod}-${endPeriod}` 
                          : `${course.startPeriod}`
                        
                        // Format dates
                        const startDate = course.scheduleStartDate 
                          ? new Date(course.scheduleStartDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : ''
                        const endDate = course.scheduleEndDate 
                          ? new Date(course.scheduleEndDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : ''
                        const timeDisplay = startDate && endDate 
                          ? `${startDate} đến ${endDate}` 
                          : (startDate || endDate || '-')
                        
                        return (
                          <tr 
                            key={`${course.subjectId || course.subjectCode}-${course.startPeriod}-${course.dayOfWeek}-${index}`}
                            className={cn(
                              "hover:bg-[var(--primary-light)] transition-colors border-b border-gray-200",
                              index % 2 === 0 ? "bg-white" : "bg-[var(--bg-secondary)]"
                            )}
                          >
                            <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                              {course.subjectCode}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                              {course.subjectName}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                              {course.courseGroup || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                              {course.dayOfWeek}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                              {periodDisplay}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                              {course.roomCode || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900">
                              {timeDisplay}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
          </div>
    </div>
  )
}
