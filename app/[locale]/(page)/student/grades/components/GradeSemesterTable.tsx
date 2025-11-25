"use client"

import { List } from "lucide-react"
import { useTranslations } from "next-intl"

import { SemesterData, CumulativeGradesData } from "../lib/types/types"

interface GradeSemesterTableProps {
  semester: SemesterData
  cumulativeData: CumulativeGradesData
  onShowDetail: (courseCode: string, semesterId: string) => void
}

type ClassificationKey = "excellent" | "good" | "fair" | "average" | "weak"

const normalizeText = (value?: string | null) =>
  value ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : ""

const getStatusKey = (status?: string | null): "passed" | "failed" | undefined => {
  const normalized = normalizeText(status)
  if (!normalized) return undefined
  if (normalized === "dat" || normalized === "passed") return "passed"
  if (normalized === "khong dat" || normalized === "failed") return "failed"
  return undefined
}

const getClassificationKey = (value?: string | null): ClassificationKey | undefined => {
  const normalized = normalizeText(value)
  switch (normalized) {
    case "xuat sac":
    case "excellent":
      return "excellent"
    case "gioi":
    case "good":
      return "good"
    case "kha":
    case "fair":
      return "fair"
    case "trung binh":
    case "average":
      return "average"
    case "yeu":
    case "weak":
      return "weak"
    default:
      return undefined
  }
}

const CLASSIFICATION_COLORS: Record<ClassificationKey, string> = {
  excellent: "var(--grade-class-excellent-bg)",
  good: "var(--grade-class-good-bg)",
  fair: "var(--grade-class-fair-bg)",
  average: "var(--grade-class-average-bg)",
  weak: "var(--grade-class-weak-bg)",
}

export const GradeSemesterTable = ({
  semester,
  cumulativeData,
  onShowDetail,
}: GradeSemesterTableProps) => {
  const t = useTranslations("student.grades")
  const semesterInfo = cumulativeData.semesters.find(s => s.semesterId === semester.id)
  if (!semesterInfo) return null

  const completedCourses = semesterInfo.grades.filter(g => getStatusKey(g.status) === "passed")
  const totalCredits = completedCourses.reduce((sum, g) => sum + g.credits, 0)

  const stats = {
    semesterGPA10: semesterInfo.semesterGPA10.toFixed(2),
    semesterGPA4: semesterInfo.semesterGPA4.toFixed(2),
    semesterCredits: semesterInfo.semesterCredits,
    cumulativeGPA10: semesterInfo.cumulativeGPA10.toFixed(2),
    cumulativeGPA4: semesterInfo.cumulativeGPA4.toFixed(2),
    cumulativeCredits: semesterInfo.cumulativeCredits,
    cumulativeClassification: semesterInfo.cumulativeClassification,
    totalCredits,
  }

  const classificationKey = getClassificationKey(stats.cumulativeClassification)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-3 sm:px-6 py-3 sm:py-4 bg-[var(--grade-semester-header-bg)]">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{semester.semester}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-[var(--grade-table-header-bg)]">
              <th className="text-left py-2 px-2 sm:py-3.5 sm:px-4 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                {t("columns.courseCode")}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
              </th>
              <th className="text-left py-2 px-2 sm:py-3.5 sm:px-4 font-semibold text-[var(--grade-table-header-text)] min-w-[120px] sm:min-w-0 relative">
                {t("columns.courseName")}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
              </th>
              <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] relative">
                {t("columns.credits")}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
              </th>
              <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                {t("table.headers.finalExam")}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
              </th>
              <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                {t("table.headers.finalGpa10")}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
              </th>
              <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                {t("table.headers.finalGpa4")}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
              </th>
              <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                {t("table.headers.letter")}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
              </th>
              <th className="text-center py-2 px-2 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                {t("table.headers.result")}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
              </th>
              <th className="text-center py-2 px-2 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap">
                {t("table.headers.detail")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {semester.courses.map((course, idx) => {
              const statusKey = getStatusKey(course.status)
              const isPassed = statusKey === "passed"
              const statusLabel = statusKey ? t(`status.${statusKey}`) : (course.status ?? "-")

              return (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-gray-900 whitespace-nowrap">{course.code}</td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-gray-900">{course.name}</td>
                  <td className="py-2 px-1 sm:py-3.5 sm:px-3 text-center text-gray-900">{course.credits}</td>
                  <td className="py-2 px-1 sm:py-3.5 sm:px-3 text-center text-gray-900">
                    {course.finalGrade !== null ? course.finalGrade.toFixed(2) : "-"}
                  </td>
                  <td className="py-2 px-1 sm:py-3.5 sm:px-3 text-center text-gray-900 font-medium">
                    {course.finalGrade10 !== null ? course.finalGrade10.toFixed(2) : "-"}
                  </td>
                  <td className="py-2 px-1 sm:py-3.5 sm:px-3 text-center text-gray-900 font-medium">
                    {course.finalGrade4 !== null ? course.finalGrade4.toFixed(1) : "-"}
                  </td>
                  <td className="py-2 px-1 sm:py-3.5 sm:px-3 text-center text-gray-900 font-medium">
                    {course.gradeLetter || "-"}
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-3 text-center">
                    <span className={`font-medium ${isPassed ? "text-[var(--grade-pass-text)]" : "text-[var(--grade-fail-text)]"}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-3 text-center">
                    <button
                      onClick={() => onShowDetail(course.code, semester.id)}
                      className="p-1 sm:p-1.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                      title={t("table.viewDetail")}
                    >
                      <List className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-[var(--grade-summary-bg)] px-3 sm:px-6 py-3 sm:py-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                {t("summary.semesterGpa4")}:
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[var(--grade-summary-highlight)] ml-2">
                {stats.semesterGPA4}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                {t("summary.semesterGpa10")}:
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[var(--grade-summary-highlight)] ml-2">
                {stats.semesterGPA10}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                {t("summary.semesterCredits")}:
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[var(--grade-summary-highlight)] ml-2">
                {stats.semesterCredits}
              </span>
            </div>
            {(semesterInfo.semesterCreditsInCurriculum !== undefined || semesterInfo.semesterCreditsOutOfCurriculum !== undefined) && (
              <div className="ml-4 space-y-1 mt-1">
                {semesterInfo.semesterCreditsInCurriculum !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-600 flex-shrink-0" />
                      {t("summary.semesterCreditsInCurriculum")}:
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-700 ml-2">
                      {semesterInfo.semesterCreditsInCurriculum}
                    </span>
                  </div>
                )}
                {semesterInfo.semesterCreditsOutOfCurriculum !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-600 flex-shrink-0" />
                      {t("summary.semesterCreditsOutCurriculum")}:
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-700 ml-2">
                      {semesterInfo.semesterCreditsOutOfCurriculum}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                {t("summary.cumulativeGpa4")}:
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--grade-summary-highlight)] ml-2">
                {stats.cumulativeGPA4}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                {t("summary.cumulativeGpa10")}:
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--grade-summary-highlight)] ml-2">
                {stats.cumulativeGPA10}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                {t("summary.cumulativeCredits")}:
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--grade-summary-highlight)] ml-2">
                {stats.cumulativeCredits}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-gray-900">{t("summary.classificationLabel")}:</span>
            {stats.cumulativeClassification ? (
              <span
                className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-white"
                style={{
                  backgroundColor: classificationKey ? CLASSIFICATION_COLORS[classificationKey] : "#9ca3af"
                }}
              >
                {classificationKey ? t(`summary.classification.${classificationKey}`) : stats.cumulativeClassification}
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-gray-500">-</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
