"use client"

import { Dropdown, DropdownSearch } from "@/app/components/ui"
import { SemesterScheduleTable } from "@/app/components/schedule"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useSemesterSchedule } from "../lib/hooks/useSemesterSchedule"

export default function SemesterSchedulePage() {
  usePageTitle('TKB theo học kỳ');

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
    handleExportPDF,
  } = useSemesterSchedule()

  const semesterOptions = semesters.map(s => ({
    value: s.semesterId,
    label: s.semesterName,
  }))

  const viewTypeOptions = [
    { value: 'personal', label: 'Cá nhân' },
    { value: 'subject', label: 'Theo môn học' },
  ]

  const subjectOptions = subjects.map(s => ({
    value: s.subjectCode,
    label: `${s.subjectCode} - ${s.subjectName}`,
  }))

  return (
    <div style={{ minWidth: '1200px' }}>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Thời khóa biểu theo học kỳ</h1>
              <p className="text-sm text-gray-600 mt-1">
                Hiển thị thời khóa biểu theo từng học kỳ
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

              {/* Print Button */}
              <button 
                className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[var(--button-primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--button-primary-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleExportPDF}
                disabled={isLoading || !selectedSemester}
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
                  value={viewType || 'personal'}
                  placeholder="Chọn loại xem"
                  onChange={(value) => handleViewTypeChange(value as 'personal' | 'subject')}
                  disabled={isLoading}
                />
              </div>

              {/* Subject Dropdown or Spacer */}
              {viewType === "subject" ? (
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
            </div>

            {/* Schedule Table */}
            <SemesterScheduleTable
              scheduleData={scheduleData}
              isLoading={isLoading}
              showCredits={true}
              showClass={true}
              showInstructor={true}
            />
    </div>
  )
}
