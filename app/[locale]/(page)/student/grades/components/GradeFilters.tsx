"use client"

import { ChevronDown, Printer } from "lucide-react"
import { useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/app/components/ui/button"
import { Semester } from "@/lib/types/common"

interface GradeFiltersProps {
  commonSemesters: Semester[]
  selectedSemesters: string[]
  setSelectedSemesters: (semesters: string[] | ((prev: string[]) => string[])) => void
  isSemesterOpen: boolean
  setIsSemesterOpen: (open: boolean) => void
  exportPdf: () => void
  isExporting: boolean
}

export const GradeFilters = ({
  commonSemesters,
  selectedSemesters,
  setSelectedSemesters,
  isSemesterOpen,
  setIsSemesterOpen,
  exportPdf,
  isExporting,
}: GradeFiltersProps) => {
  const t = useTranslations('student.grades')
  const semesterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (isSemesterOpen && !semesterRef.current?.contains(target)) {
        setIsSemesterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSemesterOpen, setIsSemesterOpen])

  const semesterSelectionLabel = (() => {
    if (selectedSemesters.length === 0) {
      return t('filters.placeholder')
    }

    if (selectedSemesters.length === 1) {
      return commonSemesters.find(s => s.semesterId === selectedSemesters[0])?.semesterName ?? t('filters.placeholder')
    }

    return t('filters.multipleSelected', { count: selectedSemesters.length })
  })()

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="relative w-full sm:w-auto" ref={semesterRef}>
        <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
          {t('filters.label')}
        </label>
        <button
          type="button"
          className="w-full sm:w-80 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
          onClick={() => setIsSemesterOpen(!isSemesterOpen)}
        >
          <span className="text-xs sm:text-sm text-gray-900 truncate">
            {semesterSelectionLabel}
          </span>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 flex-shrink-0 ml-2" />
        </button>
        {isSemesterOpen && (
          <div className="absolute z-50 mt-2 w-full sm:w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-hidden">
            <div className="flex gap-2 p-2 border-b border-gray-200">
              <button
                type="button"
                className="flex-1 px-3 py-1.5 text-xs font-medium text-white rounded cursor-pointer transition-colors bg-[var(--grade-filter-select-bg)] hover:bg-[var(--grade-filter-select-hover)]"
                onClick={() => {
                  setSelectedSemesters(commonSemesters.map(s => s.semesterId))
                }}
              >
                {t('filters.selectAll')}
              </button>
              <button
                type="button"
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer transition-colors"
                onClick={() => setSelectedSemesters([])}
              >
                {t('filters.clear')}
              </button>
            </div>
            
            <div className="max-h-52 overflow-y-auto">
              {commonSemesters.map((semester) => {
                const isSelected = selectedSemesters.includes(semester.semesterId)
                return (
                  <button
                    key={semester.semesterId}
                    type="button"
                    className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                      isSelected
                        ? 'bg-blue-50 text-[#0053AD] font-medium'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedSemesters(prev => {
                        if (prev.includes(semester.semesterId)) {
                          return prev.filter(id => id !== semester.semesterId)
                        } else {
                          return [...prev, semester.semesterId]
                        }
                      })
                    }}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected 
                        ? 'bg-[var(--grade-filter-checkbox-bg)] border-[var(--grade-filter-checkbox-border)]' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                    <span>{semester.semesterName}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <div className="w-full sm:w-auto">
        <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2 invisible">
          {t('filters.exportLabel')}
        </label>
        <Button 
          onClick={exportPdf}
          disabled={isExporting}
          className="text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg w-full sm:w-auto flex items-center justify-center transition-colors cursor-pointer text-xs sm:text-sm bg-[var(--grade-export-bg)] hover:bg-[var(--grade-export-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          {isExporting ? t('filters.exporting') : t('filters.exportButton')}
        </Button>
      </div>
    </div>
  )
}
