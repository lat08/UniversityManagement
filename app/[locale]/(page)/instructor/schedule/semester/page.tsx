"use client"

import { useState, useTransition, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Dropdown, DropdownSearch } from "@/app/components/ui"
import { SemesterScheduleTable, SemesterScheduleSkeleton } from "@/app/components/schedule"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useInstructorSemesterSchedule } from "../lib/hooks/useInstructorSemesterSchedule"
import { instructorSemesterScheduleApi } from "../lib/api/semesterScheduleApi"
import { downloadFileBlob } from "@/lib/utils/fileDownload"
import toast from "react-hot-toast"
import type { ScheduleTranslationFn, ScheduleTranslationValues } from "@/lib/types"

export default function InstructorSemesterSchedulePage() {
  const t = useTranslations('instructor.schedule.semester');
  const scheduleT = useTranslations('common.schedule');
  usePageTitle(t('title'));

  // Create translate function for schedule components
  const scheduleTranslate: ScheduleTranslationFn = useMemo(() => {
    return (key: string, values?: ScheduleTranslationValues) => {
      try {
        return scheduleT(key, values);
      } catch {
        return key;
      }
    };
  }, [scheduleT]);
  const [isExporting, setIsExporting] = useState(false)
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
    error,
    handleSemesterChange,
    handleViewTypeChange,
    handleSubjectChange,
  } = useInstructorSemesterSchedule({ 
    initialSemesterId: semesterIdFromUrl || undefined 
  })

  const semesterOptions = semesters.map(s => ({
    value: s.semesterId,
    label: s.semesterName,
  }))

  const viewTypeOptions = [
    { value: 'personal', label: t('viewType.personal') },
    { value: 'subject', label: t('viewType.subject') },
  ]

  const subjectOptions = subjects.map(s => ({
    value: s.subjectId,
    label: `${s.subjectCode} - ${s.subjectName}`,
  }))

  const handleExportPdf = async () => {
    if (!selectedSemester) {
      toast.error(t('errors.selectSemester'))
      return
    }

    setIsExporting(true)
    try {
      const blob = await instructorSemesterScheduleApi.exportSemesterPdf(
        selectedSemester.semesterId,
        viewType === 'subject' ? selectedSubject?.subjectId : undefined
      )
      
      const now = new Date()
      const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_')
      const filename = `ThoiKhoaBieu_HocKy_GiangVien_${timestamp}.pdf`
      
      downloadFileBlob(blob, filename)
      toast.success(t('export.success'))
    } catch (error) {
      console.error('Export error:', error)
      toast.error(t('export.error'))
    } finally {
      setIsExporting(false)
    }
  }

  // Smart skeleton: only show on first load or semester change, not on view type/subject changes
  const showSkeleton = isLoading && (!selectedSemester || scheduleData.length === 0)

  if (showSkeleton) {
    return (
      <div key="instructor-semester-schedule-loading" className="animate-in fade-in duration-100" style={{ minWidth: '1000px' }}>
        <div className="mb-6">
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
        <SemesterScheduleSkeleton />
      </div>
    );
  }

  return (
    <div key="instructor-semester-schedule-content" className="animate-in fade-in duration-200" style={{ minWidth: '1000px' }}>
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
            placeholder={t('loading')}
            onChange={(value) => {
              startTransition(() => {
                handleSemesterChange(value);
              });
            }}
            disabled={isPending}
          />
        </div>

        <button 
          onClick={handleExportPdf}
          className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[var(--button-primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--button-primary-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isExporting || !selectedSemester}
        >
          {isExporting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">{t('export.exporting')}</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="text-sm font-medium">{t('export.button')}</span>
            </>
          )}
        </button>
      </div>

      <div className="mb-6 flex gap-4 items-stretch w-full mt-2">
        <div className="flex-1">
          <Dropdown
            options={viewTypeOptions}
            value={viewType || 'personal'}
            placeholder={t('selectViewType')}
            onChange={(value) => {
              startTransition(() => {
                handleViewTypeChange(value as 'personal' | 'subject');
              });
            }}
            disabled={isPending}
          />
        </div>

        {viewType === 'subject' ? (
          <div className="flex-1">
            <DropdownSearch
              options={subjectOptions}
              value={selectedSubject?.subjectId || ''}
              placeholder={t('selectSubject')}
              searchPlaceholder={t('searchSubject')}
              onChange={(value) => {
                startTransition(() => {
                  handleSubjectChange(value);
                });
              }}
              disabled={isPending || subjects.length === 0}
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
          isLoading={false}
          showCredits={false}
          showClass={false}
          showInstructor={false}
          highlightSubjectCode={highlightSubjectFromUrl || undefined}
          translate={scheduleTranslate}
        />
      )}
    </div>
  )
}
