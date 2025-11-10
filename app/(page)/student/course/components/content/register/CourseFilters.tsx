"use client"

import { memo, useEffect, useRef } from "react"
import { SearchInput, Dropdown } from "@/app/components/ui"
import { useCourseFiltersStore } from "../../../lib/stores/courseFiltersStore"

const availableOnlyOptions = [
  { value: 'null', label: 'Tất cả' },
  { value: 'true', label: 'Có thể đăng ký' },
  { value: 'false', label: 'Không thể đăng ký' },
]

const isGeneralOptions = [
  { value: 'null', label: 'Tất cả' },
  { value: 'true', label: 'Chỉ môn đại cương' },
  { value: 'false', label: 'Chỉ môn chuyên ngành' },
]

const isInCurriculumOptions = [
  { value: 'null', label: 'Tất cả' },
  { value: 'true', label: 'Chỉ môn trong CTDT' },
  { value: 'false', label: 'Chỉ môn ngoài CTDT' },
]

function CourseFilters() {
  const searchQuery = useCourseFiltersStore((state) => state.tempFilters.searchQuery)
  const availableOnly = useCourseFiltersStore((state) => state.tempFilters.availableOnly)
  const isGeneral = useCourseFiltersStore((state) => state.tempFilters.isGeneral)
  const isInStudentCurriculum = useCourseFiltersStore((state) => state.tempFilters.isInStudentCurriculum)
  const setTempFilters = useCourseFiltersStore((state) => state.setTempFilters)
  const applyFilters = useCourseFiltersStore((state) => state.applyFilters)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

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
          Danh sách các môn học
        </h2>
        <p className="text-xs lg:text-sm text-gray-600 mt-1">
          Tìm kiếm và đăng ký môn học
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4">
        {/* Search Input */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tìm kiếm
          </label>
          <SearchInput
            placeholder="Tìm kiếm theo mã, tên môn học..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Trạng thái Dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <Dropdown
            options={availableOnlyOptions}
            value={availableOnly === null ? 'null' : String(availableOnly)}
            placeholder="Trạng thái"
            onChange={(value) => {
              handleFilterChange('availableOnly', value === 'null' ? null : value === 'true')
            }}
          />
        </div>

        {/* Lọc theo môn Dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Lọc theo môn
          </label>
          <Dropdown
            options={isGeneralOptions}
            value={isGeneral === null ? 'null' : String(isGeneral)}
            placeholder="Lọc theo môn"
            onChange={(value) => {
              handleFilterChange('isGeneral', value === 'null' ? null : value === 'true')
            }}
          />
        </div>

        {/* Lọc theo CTDT Dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Lọc theo CTDT
          </label>
          <Dropdown
            options={isInCurriculumOptions}
            value={isInStudentCurriculum === null ? 'null' : String(isInStudentCurriculum)}
            placeholder="Lọc theo CTDT"
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
