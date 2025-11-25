"use client"

import { XCircle } from "lucide-react"
import { useEffect } from "react"
import { GradeItem } from "../lib/types/types"

interface AdminGradeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  grade: GradeItem | null
}

export const AdminGradeDetailModal = ({
  isOpen,
  onClose,
  grade,
}: AdminGradeDetailModalProps) => {
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isOpen, onClose])

  if (!isOpen || !grade) return null

  const components = [
    {
      stt: 1,
      name: 'Chuyên cần và Thái độ HT',
      weight: 20,
      score: grade.attendanceGrade,
    },
    {
      stt: 2,
      name: 'Kiểm tra',
      weight: 30,
      score: grade.midtermGrade,
    },
    {
      stt: 3,
      name: 'Điểm thi',
      weight: 50,
      score: grade.finalGrade,
    },
  ]

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#0053AD] to-[#003d82]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{grade.subjectName}</h2>
              <p className="text-sm text-blue-100 mt-1">Mã môn: {grade.subjectCode} • Số tín chỉ: {grade.credits}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 hover:bg-white/10 p-2 rounded transition-colors cursor-pointer"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0053AD]">
                  <th className="text-center py-3.5 px-4 font-semibold text-white whitespace-nowrap relative">
                    STT
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white/30"></div>
                  </th>
                  <th className="text-left py-3.5 px-6 font-semibold text-white relative">
                    Tên thành phần
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white/30"></div>
                  </th>
                  <th className="text-center py-3.5 px-4 font-semibold text-white whitespace-nowrap relative">
                    Trọng số (%)
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white/30"></div>
                  </th>
                  <th className="text-center py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                    Điểm
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {components.map((component) => (
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
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#0053AD] hover:bg-[#003d82] text-white rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
