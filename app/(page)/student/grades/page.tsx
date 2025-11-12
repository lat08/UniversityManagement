"use client"

import { BookOpen, XCircle } from "lucide-react"
import { useState, useEffect, useMemo } from "react"

import { usePageTitle } from "@/lib/hooks/usePageTitle"

import { GradesSkeleton } from "./components/grades-skeleton"
import { GradeStatsCards } from "./components/GradeStatsCards"
import { GradeHeader } from "./components/GradeHeader"
import { GradeFilters } from "./components/GradeFilters"
import { GradeSemesterTable } from "./components/GradeSemesterTable"
import { GradeDetailModal } from "./components/GradeDetailModal"
import { useGrades } from "./lib/hooks/useGrades"
import { transformSemestersToUI } from "./lib/utils/transformers"

export default function ScoresPage() {
  usePageTitle('Điểm số')
  const { cumulativeData, commonSemesters, isLoading, error, exportPdf, isExporting } = useGrades()

  if (isLoading) {
    return (
      <div key="grades-loading-skeleton" className="animate-in fade-in duration-100">
        <GradesSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="h-12 w-12 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!cumulativeData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <BookOpen className="h-12 w-12 text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có dữ liệu điểm</h3>
            <p className="text-gray-600">Hiện tại chưa có dữ liệu điểm số nào</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div key="grades-content" className="animate-in fade-in duration-200">
      <ScoresPageContent 
        cumulativeData={cumulativeData} 
        commonSemesters={commonSemesters}
        exportPdf={exportPdf}
        isExporting={isExporting}
      />
    </div>
  )
}

interface ScoresPageContentProps {
  cumulativeData: NonNullable<ReturnType<typeof useGrades>['cumulativeData']>
  commonSemesters: ReturnType<typeof useGrades>['commonSemesters']
  exportPdf: ReturnType<typeof useGrades>['exportPdf']
  isExporting: boolean
}

function ScoresPageContent({ cumulativeData, commonSemesters, exportPdf, isExporting }: ScoresPageContentProps) {
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const semesterData = useMemo(() => {
    return transformSemestersToUI(cumulativeData.semesters, commonSemesters)
  }, [cumulativeData, commonSemesters])

  useEffect(() => {
    if (commonSemesters.length > 0 && !isInitialized) {
      setSelectedSemesters(commonSemesters.map(s => s.semesterId))
      setIsInitialized(true)
    }
  }, [commonSemesters, isInitialized])

  const scoreOverview = useMemo(() => {
    const gpa4 = Number.isFinite(cumulativeData.cumulativeGPA4)
      ? cumulativeData.cumulativeGPA4
      : Number.parseFloat(`${cumulativeData.cumulativeGPA4 ?? 0}`)

    return {
      gpa4,
      totalCredits: cumulativeData.totalCompletedCredits,
      completedCourses: cumulativeData.totalSubjects,
    }
  }, [cumulativeData])

  const handleShowDetail = (courseCode: string, semesterId: string) => {
    setSelectedCourse(courseCode)
    setSelectedSemesterId(semesterId)
    setShowDetailModal(true)
  }

  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedCourse(null)
    setSelectedSemesterId(null)
  }

  const filteredSemesters = semesterData.filter((s) => selectedSemesters.includes(s.id))

  return (
    <div className="space-y-4 lg:space-y-6">
      <GradeHeader />

      <GradeStatsCards
        gpa4={scoreOverview.gpa4}
        totalCredits={scoreOverview.totalCredits}
        completedCourses={scoreOverview.completedCourses}
        totalRequiredCredits={cumulativeData.totalRequiredCredits}
      />

      <GradeFilters
        commonSemesters={commonSemesters}
        selectedSemesters={selectedSemesters}
        setSelectedSemesters={setSelectedSemesters}
        isSemesterOpen={isSemesterOpen}
        setIsSemesterOpen={setIsSemesterOpen}
        exportPdf={exportPdf}
        isExporting={isExporting}
      />

      <div className="space-y-4 sm:space-y-6">
        {filteredSemesters.map((semester) => (
          <GradeSemesterTable
            key={semester.id}
            semester={semester}
            cumulativeData={cumulativeData}
            onShowDetail={handleShowDetail}
          />
        ))}
      </div>

      <GradeDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetail}
        courseCode={selectedCourse}
        semesterId={selectedSemesterId}
        cumulativeData={cumulativeData}
      />
    </div>
  )
}
