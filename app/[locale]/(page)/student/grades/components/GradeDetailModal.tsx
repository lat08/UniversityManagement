"use client"

import { XCircle } from "lucide-react"
import { useEffect } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/app/components/ui/button"
import { createCourseDetailsLookup } from "../lib/utils/transformers"
import { CumulativeGradesData } from "../lib/types/types"

interface GradeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  courseCode: string | null
  semesterId: string | null
  cumulativeData: CumulativeGradesData
}

export const GradeDetailModal = ({
  isOpen,
  onClose,
  courseCode,
  semesterId,
  cumulativeData,
}: GradeDetailModalProps) => {
  const t = useTranslations('student.grades')
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isOpen, onClose])

  if (!isOpen || !courseCode || !semesterId) return null

  const rawGrade = cumulativeData.semesters
    .find(s => s.semesterId === semesterId)
    ?.grades.find(g => g.subjectCode === courseCode)
  
  if (!rawGrade) return null
  
  const detail = createCourseDetailsLookup(rawGrade)
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200" style={{ background: 'var(--grade-modal-header-bg)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{rawGrade.subjectName}</h2>
              <p className="text-sm text-blue-100 mt-1">{t('detailModal.meta', { code: courseCode, credits: rawGrade.credits })}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:text-blue-100 hover:bg-white/10"
            >
              <XCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--grade-table-header-bg)]">
                  <th className="text-center py-3.5 px-4 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                    {t('detailModal.headers.order')}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                  </th>
                  <th className="text-left py-3.5 px-6 font-semibold text-[var(--grade-table-header-text)] relative">
                    {t('detailModal.headers.component')}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                  </th>
                  <th className="text-center py-3.5 px-4 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                    {t('detailModal.headers.weight')}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                  </th>
                  <th className="text-center py-3.5 px-4 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap">
                    {t('detailModal.headers.score')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {detail.components.map((component) => (
                  <tr key={component.stt} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 text-center text-gray-900">{component.stt}</td>
                    <td className="py-3.5 px-6 text-gray-900">{component.name}</td>
                    <td className="py-3.5 px-4 text-center text-gray-900">{component.weight}%</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-gray-900">
                      {component.score !== null && component.score !== undefined ? component.score.toFixed(2) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="px-6 py-2.5 bg-[var(--grade-modal-close-btn)] hover:bg-[var(--grade-modal-close-btn-hover)] text-white rounded-lg transition-colors cursor-pointer"
            >
              {t('detailModal.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
