"use client"

import { memo, useEffect, useRef, useMemo } from "react"
import { useTranslations } from "next-intl"
import { SearchInput, Dropdown } from "@/app/components/ui"
import { useCourseFiltersStore } from "../../../lib/stores/courseFiltersStore"

function CourseFilters() {
  const t = useTranslations('student.course.filters')
  const searchQuery = useCourseFiltersStore((state) => state.tempFilters.searchQuery)
  const availableOnly = useCourseFiltersStore((state) => state.tempFilters.availableOnly)
  const isGeneral = useCourseFiltersStore((state) => state.tempFilters.isGeneral)
  const isInStudentCurriculum = useCourseFiltersStore((state) => state.tempFilters.isInStudentCurriculum)
  const setTempFilters = useCourseFiltersStore((state) => state.setTempFilters)
  const applyFilters = useCourseFiltersStore((state) => state.applyFilters)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const availableOnlyOptions = useMemo(() => [
    { value: 'null', label: t('all') },
    { value: 'true', label: t('canRegister') },
    { value: 'false', label: t('cannotRegister') },
  ], [t])

  const isGeneralOptions = useMemo(() => [
    { value: 'null', label: t('all') },
    { value: 'true', label: t('generalOnly') },
    { value: 'false', label: t('majorOnly') },
  ], [t])

  const isInCurriculumOptions = useMemo(() => [
    { value: 'null', label: t('all') },
    { value: 'true', label: t('inCurriculum') },
    { value: 'false', label: t('outOfCurriculum') },
  ], [t])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleFilterChange = (key: string, value: string | boolean | null) => {
    setTempFilters({ [key]: value })
    applyFilters()
  }

  const handleSearchChange = (value: string) => {
    setTempFilters({ searchQuery: value })
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Set new debounce timer (500ms)
    debounceTimerRef.current = setTimeout(() => {
      applyFilters()
    }, 500)
  }

  return (
    <div>
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
          {t('title')}
        </h2>
        <p className="text-xs lg:text-sm text-gray-600 mt-1">
          {t('description')}
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4">
        {/* Search Input */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('search')}
          </label>
          <SearchInput
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Trạng thái Dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('status')}
          </label>
          <Dropdown
            options={availableOnlyOptions}
            value={availableOnly === null ? 'null' : String(availableOnly)}
            placeholder={t('statusPlaceholder')}
            onChange={(value) => {
              handleFilterChange('availableOnly', value === 'null' ? null : value === 'true')
            }}
          />
        </div>

        {/* Lọc theo môn Dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('filterByType')}
          </label>
          <Dropdown
            options={isGeneralOptions}
            value={isGeneral === null ? 'null' : String(isGeneral)}
            placeholder={t('filterByTypePlaceholder')}
            onChange={(value) => {
              handleFilterChange('isGeneral', value === 'null' ? null : value === 'true')
            }}
          />
        </div>

        {/* Lọc theo CTDT Dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('filterByCurriculum')}
          </label>
          <Dropdown
            options={isInCurriculumOptions}
            value={isInStudentCurriculum === null ? 'null' : String(isInStudentCurriculum)}
            placeholder={t('filterByCurriculumPlaceholder')}
            onChange={(value) => {
              handleFilterChange('isInStudentCurriculum', value === 'null' ? null : value === 'true')
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(CourseFilters)
