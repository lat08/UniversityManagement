'use client'

import { Search, X } from 'lucide-react'
import { Dropdown, DropdownSearch } from '@/app/components/ui'

interface MaterialsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedSemester: string
  onSemesterChange: (value: string) => void
  selectedSubject: string
  onSubjectChange: (value: string) => void
  selectedType: string
  onTypeChange: (value: string) => void
  semesters: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
  types: { id: string; name: string }[]
  semestersLoading: boolean
  subjectsLoading: boolean
  typesLoading: boolean
}

export function MaterialsFilters({
  searchQuery,
  onSearchChange,
  selectedSemester,
  onSemesterChange,
  selectedSubject,
  onSubjectChange,
  selectedType,
  onTypeChange,
  semesters,
  subjects,
  types,
  semestersLoading,
  subjectsLoading,
  typesLoading,
}: MaterialsFiltersProps) {
  const semesterOptions = semesters.map(s => ({ value: s.id, label: s.name }))
  const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }))
  const typeOptions = types.map(t => ({ value: t.id, label: t.name }))

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch w-full">
      <div className="relative w-full lg:flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          aria-label="Tìm kiếm theo tên bài giảng, tài liệu"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm theo tên bài giảng, tài liệu"
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none focus:border-gray-600 bg-white text-gray-900 text-sm transition-colors h-full"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex gap-2 sm:gap-3 lg:gap-4 w-full lg:flex-[2]">
        <div className="w-full">
          <Dropdown
            options={semesterOptions}
            value={selectedSemester || ''}
            placeholder="Tất cả học kỳ"
            onChange={(value) => onSemesterChange(value)}
            disabled={semestersLoading}
            buttonClassName="w-full text-xs sm:text-sm"
          />
        </div>

        <div className="w-full">
          <DropdownSearch
            options={subjectOptions}
            value={selectedSubject || undefined}
            placeholder="Tất cả môn học"
            onChange={(value) => onSubjectChange(value || '')}
            disabled={subjectsLoading}
            showEmptyOption
            emptyOptionLabel="Tất cả môn học"
            buttonClassName="w-full text-xs sm:text-sm"
          />
        </div>

        <div className="w-full col-span-2 sm:col-span-1">
          <Dropdown
            options={typeOptions}
            value={selectedType || ''}
            placeholder="Tất cả loại tài liệu"
            onChange={(value) => onTypeChange(value)}
            disabled={typesLoading}
            buttonClassName="w-full text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>
  )
}

