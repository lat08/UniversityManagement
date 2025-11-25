"use client"

import { Suspense, useMemo, useTransition, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations, useFormatter } from "next-intl"
import type { DateTimeFormatOptions } from "use-intl"
import { Dropdown, DropdownSearch } from "@/app/components/ui"
import { SemesterScheduleTable, SemesterScheduleSkeleton } from "@/app/components/schedule"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useSemesterSchedule } from "../lib/hooks/useSemesterSchedule"

const SemesterScheduleContent = () => {
  const t = useTranslations('student.schedule.semester')
  const tWeekly = useTranslations('student.schedule.weekly')
  const tCommonSchedule = useTranslations('common.schedule')
  const formatter = useFormatter()

  usePageTitle(t('title'))
  const [isPending, startTransition] = useTransition()
  
  const searchParams = useSearchParams()
  const semesterIdFromUrl = searchParams.get('semesterId')
  const highlightSubjectFromUrl = searchParams.get('highlightSubject')

  const {
    semesters,
    selectedSemester,
    subjects,
    selectedSubject,
    scheduleData,
    viewType,
    isLoading,
    isExporting,
    error,
    handleSemesterChange,
    handleViewTypeChange,
    handleSubjectChange,
    handleExportPDF,
  } = useSemesterSchedule({ initialSemesterId: semesterIdFromUrl || undefined })

  const showSkeleton = isLoading && (!selectedSemester || scheduleData.length === 0)

  const semesterOptions = useMemo(() => 
    semesters.map(s => ({ value: s.semesterId, label: s.semesterName })),
    [semesters]
  )

  const viewTypeOptions = useMemo(() => [
    { value: 'personal', label: tWeekly('personalSchedule') },
    { value: 'subject', label: tWeekly('subjectSchedule') },
  ], [tWeekly])

  const subjectOptions = useMemo(() => 
    subjects.map(s => ({ value: s.subjectCode, label: `${s.subjectCode} - ${s.subjectName}` })),
    [subjects]
  )

  const formatDateValue = useCallback(
    (date: Date, options?: DateTimeFormatOptions) =>
      formatter.dateTime(date, options ?? { day: '2-digit', month: '2-digit', year: 'numeric' }),
    [formatter]
  )

  if (showSkeleton) {
    return (
      <div key="semester-schedule-loading" className="animate-in fade-in duration-100" style={{ minWidth: '1200px' }}>
        <div className="mb-6">
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
        <SemesterScheduleSkeleton translate={tCommonSchedule} />
      </div>
    );
  }

  return (
    <div key="semester-schedule-content" className="animate-in fade-in duration-200" style={{ minWidth: '1200px' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-600 mt-1">
          {t('description')}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-4 items-stretch w-full">
        <div className="flex-1">
          <Dropdown
            options={semesterOptions}
            value={selectedSemester?.semesterId || ''}
            placeholder={tWeekly('loading')}
            onChange={(value) => startTransition(() => handleSemesterChange(value))}
            disabled={isLoading || isPending}
          />
        </div>

        <button 
          className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[var(--button-primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--button-primary-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExportPDF}
          disabled={isExporting || !selectedSemester || isPending}
        >
          {isExporting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">{tWeekly('exporting')}</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="text-sm font-medium">{tWeekly('export')}</span>
            </>
          )}
        </button>
      </div>

      <div className="mb-6 flex gap-4 items-stretch w-full mt-2">
        <div className="flex-1">
          <Dropdown
            options={viewTypeOptions}
            value={viewType || 'personal'}
            placeholder={tWeekly('selectViewType')}
            onChange={(value) => startTransition(() => handleViewTypeChange(value as 'personal' | 'subject'))}
            disabled={isLoading || isPending}
          />
        </div>

        {viewType === 'subject' ? (
          <div className="flex-1">
            <DropdownSearch
              options={subjectOptions}
              value={selectedSubject?.subjectCode || ''}
              placeholder={tWeekly('selectSubject')}
              searchPlaceholder={tWeekly('searchSubject')}
              onChange={(value) => startTransition(() => handleSubjectChange(value))}
              disabled={isLoading || subjects.length === 0 || isPending}
            />
          </div>
        ) : (
          <div className="flex-1"></div>
        )}

        <div className="w-[100px]"></div>
      </div>

      {(
        <SemesterScheduleTable
          scheduleData={scheduleData}
          isLoading={isLoading || isPending}
          showCredits={true}
          showClass={true}
          showInstructor={true}
          highlightSubjectCode={highlightSubjectFromUrl || undefined}
          translate={tCommonSchedule}
          formatDate={formatDateValue}
        />
      )}
    </div>
  )
}

const SemesterScheduleFallback = () => {
  const tCommonSchedule = useTranslations('common.schedule')
  return <SemesterScheduleSkeleton translate={tCommonSchedule} />
}

export default function SemesterSchedulePage() {
  return (
    <Suspense fallback={<SemesterScheduleFallback />}>
      <SemesterScheduleContent />
    </Suspense>
  )
}
