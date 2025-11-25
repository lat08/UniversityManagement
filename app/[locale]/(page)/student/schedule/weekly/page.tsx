"use client"

import { Suspense, useMemo, useTransition, useCallback } from "react"
import { useTranslations, useFormatter } from "next-intl"
import { Dropdown, DropdownSearch } from "@/app/components/ui"
import { 
  WeeklyScheduleGrid, 
  ScheduleTooltip, 
  ScheduleConflictsNotification, 
  WeeklyScheduleSkeleton,
  type CourseItem 
} from "@/app/components/schedule"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useScheduleData } from "../lib/hooks/useScheduleData"
import { useScheduleTooltip } from "@/lib/hooks/useScheduleTooltip"
import { useScheduleConflicts } from "../lib/hooks/useScheduleConflicts"
import { formatWeekDisplay, getColorByCourseType, generateWeekDates } from "@/lib/utils/scheduleHelpers"

const WeeklyScheduleContent = () => {
  const t = useTranslations('student.schedule.weekly')
  const tSchedule = useTranslations('student.schedule')
  const tCommonSchedule = useTranslations('common.schedule')
  const formatter = useFormatter()
  usePageTitle(t('title'))
  const [isPending, startTransition] = useTransition()
  
  const {
    hoveredCourse,
    hoverPosition,
    handleMouseEnter,
    handleMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
  } = useScheduleTooltip()

  const {
    semesters,
    selectedSemester,
    weeks,
    selectedWeek,
    subjects,
    selectedSubject,
    scheduleData,
    viewType,
    isLoading,
    isExporting,
    error,
    handleSemesterChange,
    handleWeekChange,
    handleViewTypeChange,
    handleSubjectChange,
    handleExportPDF,
  } = useScheduleData()

  const showSkeleton = isLoading && (!selectedSemester || scheduleData.length === 0)

  const semesterOptions = useMemo(() => 
    semesters.map(s => ({ value: s.semesterId, label: s.semesterName })),
    [semesters]
  )

  const formatDateShort = useCallback(
    (date: Date) => formatter.dateTime(date, { day: '2-digit', month: '2-digit', year: 'numeric' }),
    [formatter]
  )

  const weekOptions = useMemo(() => 
    weeks.map(w => ({
      value: w.weekNumber.toString(),
      label: formatWeekDisplay(w, {
        translate: tCommonSchedule,
        formatDate: formatDateShort,
        emptyLabel: t('selectWeek'),
      })
    })),
    [weeks, tCommonSchedule, formatDateShort, t]
  )

  const viewTypeOptions = useMemo(() => [
    { value: 'week', label: t('personalSchedule') },
    { value: 'subject', label: t('subjectSchedule') },
  ], [t])

  const subjectOptions = useMemo(() => 
    subjects.map(s => ({ value: s.subjectCode, label: `${s.subjectCode} - ${s.subjectName}` })),
    [subjects]
  )

  const handlePreviousWeek = () => {
    if (!selectedWeek || weeks.length === 0) return
    const currentIndex = weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber)
    if (currentIndex > 0) {
      startTransition(() => {
        handleWeekChange(weeks[currentIndex - 1].weekNumber)
      })
    }
  }

  const handleNextWeek = () => {
    if (!selectedWeek || weeks.length === 0) return
    const currentIndex = weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber)
    if (currentIndex < weeks.length - 1) {
      startTransition(() => {
        handleWeekChange(weeks[currentIndex + 1].weekNumber)
      })
    }
  }

  const canGoPrevious = !!(selectedWeek && weeks.length > 0 && 
    weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber) > 0)
  
  const canGoNext = !!(selectedWeek && weeks.length > 0 && 
    weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber) < weeks.length - 1)

  const weekDates = useMemo(() => {
    if (!selectedWeek) return []
    return generateWeekDates(selectedWeek.startDate)
  }, [selectedWeek])

  const transformedSchedule: CourseItem[] = useMemo(() => {
    return scheduleData.map((item) => ({
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
      color: getColorByCourseType(item.courseType || ''),
      courseType: item.courseType || '',
      note: item.note,
      date: item.date,
    }))
  }, [scheduleData])

  const scheduleConflicts = useScheduleConflicts(transformedSchedule)

  if (showSkeleton) {
    return (
      <div key="weekly-schedule-loading" className="animate-in fade-in duration-100 relative" style={{ minWidth: '1200px' }}>
        <div className="mb-6">
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
        <WeeklyScheduleSkeleton translate={tCommonSchedule} />
      </div>
    );
  }

  return (
    <div key="weekly-schedule-content" className="animate-in fade-in duration-200 relative" style={{ minWidth: '1200px' }}>
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
            placeholder={tSchedule('loading')}
            onChange={(value) => startTransition(() => handleSemesterChange(value))}
            disabled={isLoading || isPending}
          />
        </div>

        <div className="flex-1">
          <Dropdown
            options={weekOptions}
            value={selectedWeek?.weekNumber.toString() || ''}
            placeholder={t('selectWeek')}
            onChange={(value) => startTransition(() => handleWeekChange(Number.parseInt(value)))}
            disabled={isLoading || weeks.length === 0 || isPending}
          />
        </div>

        <button 
          className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[var(--schedule-print-bg)] text-[var(--schedule-print-text)] rounded-lg hover:bg-[var(--schedule-print-bg-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExportPDF}
          disabled={isExporting || !selectedSemester || !selectedWeek || (viewType === 'subject' && !selectedSubject) || isPending}
        >
          {isExporting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">{t('exporting')}</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="text-sm font-medium">{t('export')}</span>
            </>
          )}
        </button>
      </div>

      <div className="mb-6 flex gap-4 items-stretch w-full mt-2">
        <div className="flex-1">
          <Dropdown
            options={viewTypeOptions}
            value={viewType || 'week'}
            placeholder={t('selectViewType')}
            onChange={(value) => startTransition(() => handleViewTypeChange(value as 'week' | 'subject'))}
            disabled={isLoading || isPending}
          />
        </div>

        {viewType === 'subject' ? (
          <div className="flex-1">
            <DropdownSearch
              options={subjectOptions}
              value={selectedSubject?.subjectCode || ''}
              placeholder={t('selectSubject')}
              searchPlaceholder={t('searchSubject')}
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
        <>
          <WeeklyScheduleGrid
            scheduleData={transformedSchedule}
            weekDates={weekDates}
            onCourseHover={handleMouseEnter}
            onCourseLeave={handleMouseLeave}
            hoveredCourseId={hoveredCourse}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            showCode={true}
            showTeacher={true}
            showClass={false}
            translate={tCommonSchedule}
          />

          {hoveredCourse && transformedSchedule.find(c => c.id === hoveredCourse) && (
            <ScheduleTooltip
              course={transformedSchedule.find(c => c.id === hoveredCourse)!}
              position={hoverPosition}
              onMouseEnter={handleTooltipMouseEnter}
              onMouseLeave={handleTooltipMouseLeave}
              showClass={false}
              showTeacher={true}
              translate={tCommonSchedule}
              formatDate={formatDateShort}
            />
          )}

          <ScheduleConflictsNotification conflicts={scheduleConflicts} translate={tCommonSchedule} />
        </>
      )}
    </div>
  )
}

const WeeklyScheduleFallback = () => {
  const tCommonSchedule = useTranslations('common.schedule')
  return <WeeklyScheduleSkeleton translate={tCommonSchedule} />
}

export default function WeeklySchedulePage() {
  return (
    <Suspense fallback={<WeeklyScheduleFallback />}>
      <WeeklyScheduleContent />
    </Suspense>
  )
}
