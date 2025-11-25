"use client"

import { List } from "lucide-react"
import { SemesterResult } from "../lib/types/types"

interface AdminGradeSemesterTableProps {
  semester: SemesterResult
  onShowDetail: (courseCode: string, semesterId: string) => void
}

export const AdminGradeSemesterTable = ({
  semester,
  onShowDetail,
}: AdminGradeSemesterTableProps) => {
  const completedCourses = semester.grades.filter(g => g.status === "Đạt")
  const totalCredits = completedCourses.reduce((sum, g) => sum + g.credits, 0)

  const stats = {
    semesterGPA10: semester.semesterGPA10.toFixed(2),
    semesterGPA4: semester.semesterGPA4.toFixed(2),
    semesterCredits: semester.semesterCredits,
    cumulativeGPA10: semester.cumulativeGPA10.toFixed(2),
    cumulativeGPA4: semester.cumulativeGPA4.toFixed(2),
    cumulativeCredits: semester.cumulativeCredits,
    cumulativeClassification: semester.cumulativeClassification,
    totalCredits,
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100">
        <h3 className="text-lg font-semibold text-gray-900">{semester.semesterName}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0053AD]">
              <th className="text-left py-3.5 px-4 font-semibold text-white whitespace-nowrap relative">
                Mã MH
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white/30"></div>
              </th>
              <th className="text-left py-3.5 px-4 font-semibold text-white min-w-[200px] relative">
                Tên môn học
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white/30"></div>
              </th>
              <th className="text-center py-3.5 px-3 font-semibold text-white relative">
                TC
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white/30"></div>
              </th>
              <th className="text-center py-3.5 px-3 font-semibold text-white whitespace-nowrap relative">
                Điểm thi
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white/30"></div>
              </th>
              <th className="text-center py-3.5 px-3 font-semibold text-white whitespace-nowrap relative">
                TK (10)
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white/30"></div>
              </th>
              <th className="text-center py-3.5 px-3 font-semibold text-white whitespace-nowrap relative">
                TK (4)
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white/30"></div>
              </th>
              <th className="text-center py-3.5 px-3 font-semibold text-white whitespace-nowrap relative">
                TK (C)
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white/30"></div>
              </th>
              <th className="text-center py-3.5 px-3 font-semibold text-white whitespace-nowrap relative">
                Kết quả
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white/30"></div>
              </th>
              <th className="text-center py-3.5 px-3 font-semibold text-white whitespace-nowrap">
                Chi tiết
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {semester.grades.map((grade, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3.5 px-4 text-gray-900 whitespace-nowrap">{grade.subjectCode}</td>
                <td className="py-3.5 px-4 text-gray-900">{grade.subjectName}</td>
                <td className="py-3.5 px-3 text-center text-gray-900">{grade.credits}</td>
                <td className="py-3.5 px-3 text-center text-gray-900">
                  {grade.finalGrade !== null ? grade.finalGrade.toFixed(2) : "-"}
                </td>
                <td className="py-3.5 px-3 text-center text-gray-900 font-medium">
                  {grade.finalGrade10 !== null ? grade.finalGrade10.toFixed(2) : "-"}
                </td>
                <td className="py-3.5 px-3 text-center text-gray-900 font-medium">
                  {grade.finalGrade4 !== null ? grade.finalGrade4.toFixed(1) : "-"}
                </td>
                <td className="py-3.5 px-3 text-center text-gray-900 font-medium">
                  {grade.gradeLetter || "-"}
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span className={`font-medium ${
                    grade.status === "Đạt" 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {grade.status}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-center">
                  <button
                    onClick={() => onShowDetail(grade.subjectCode, semester.semesterId)}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                    title="Xem chi tiết"
                  >
                    <List className="w-4 h-4 text-gray-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                - Điểm TB học kỳ hệ 4:
              </span>
              <span className="text-sm font-semibold text-[#0053AD] ml-2">
                {stats.semesterGPA4}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                - Điểm TB học kỳ hệ 10:
              </span>
              <span className="text-sm font-semibold text-[#0053AD] ml-2">
                {stats.semesterGPA10}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                - Số tín chỉ đạt học kỳ:
              </span>
              <span className="text-sm font-semibold text-[#0053AD] ml-2">
                {stats.semesterCredits}
              </span>
            </div>
            {(semester.semesterCreditsInCurriculum !== undefined || semester.semesterCreditsOutOfCurriculum !== undefined) && (
              <div className="ml-4 space-y-1 mt-1">
                {semester.semesterCreditsInCurriculum !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-600 flex-shrink-0" />
                      Trong CTDT:
                    </span>
                    <span className="text-xs font-medium text-gray-700 ml-2">
                      {semester.semesterCreditsInCurriculum}
                    </span>
                  </div>
                )}
                {semester.semesterCreditsOutOfCurriculum !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-600 flex-shrink-0" />
                      Ngoài CTDT:
                    </span>
                    <span className="text-xs font-medium text-gray-700 ml-2">
                      {semester.semesterCreditsOutOfCurriculum}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">
                - Điểm TB tích lũy hệ 4:
              </span>
              <span className="text-sm font-bold text-[#0053AD] ml-2">
                {stats.cumulativeGPA4}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">
                - Điểm TB tích lũy hệ 10:
              </span>
              <span className="text-sm font-bold text-[#0053AD] ml-2">
                {stats.cumulativeGPA10}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">
                - Số tín chỉ tích lũy:
              </span>
              <span className="text-sm font-bold text-[#0053AD] ml-2">
                {stats.cumulativeCredits}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">Xếp loại học lực tích lũy:</span>
            {stats.cumulativeClassification ? (
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white`} style={{
                backgroundColor: (() => {
                  if (stats.cumulativeClassification === "Xuất sắc") return "#FF512F"
                  if (stats.cumulativeClassification === "Giỏi") return "#1FA2FF"
                  if (stats.cumulativeClassification === "Khá") return "#56ab2f"
                  if (stats.cumulativeClassification === "Trung bình") return "#F7971E"
                  return "#9ca3af"
                })()
              }}>
                {stats.cumulativeClassification}
              </span>
            ) : (
              <span className="text-sm text-gray-500">-</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
