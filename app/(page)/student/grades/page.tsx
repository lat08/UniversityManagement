"use client"

import { Button } from "@/app/components/ui/button"
import { Printer, BookOpen, XCircle, List, Loader2, ChevronDown, Award, Book, CheckCircle } from "lucide-react"
import { useState, useEffect, useMemo, useRef } from "react"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useGrades } from "./lib/hooks/useGrades"
import { transformSemestersToUI, createCourseDetailsLookup } from "./lib/utils/transformers"

export default function ScoresPage() {
  usePageTitle('Điểm số');
  const { cumulativeData, commonSemesters, isLoading, error, exportPdf } = useGrades()
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const semesterRef = useRef<HTMLDivElement>(null)

  const semesterData = useMemo(() => {
    if (!cumulativeData) return []
    return transformSemestersToUI(cumulativeData.semesters, commonSemesters)
  }, [cumulativeData, commonSemesters])

  // Mặc định chọn tất cả học kỳ khi có dữ liệu lần đầu
  useEffect(() => {
    if (commonSemesters.length > 0 && !isInitialized) {
      setSelectedSemesters(commonSemesters.map(s => s.semesterId))
      setIsInitialized(true)
    }
  }, [commonSemesters, isInitialized])


  const scoreOverview = useMemo(() => {
    if (!cumulativeData) {
      return {
        gpa4: "0.00",
        totalCredits: 0,
        completedCourses: 0,
      }
    }

    return {
      gpa4: cumulativeData.cumulativeGPA4.toFixed(2),
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isSemesterOpen && !semesterRef.current?.contains(target)) {
        setIsSemesterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSemesterOpen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showDetailModal) {
        handleCloseDetail()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [showDetailModal])

  const filteredSemesters = semesterData.filter((s) => selectedSemesters.includes(s.id))

  const calculateSemesterStats = (semesterId: string) => {
    if (!cumulativeData) return null
    const semester = cumulativeData.semesters.find(s => s.semesterId === semesterId)
    if (!semester) return null

    const completedCourses = semester.grades.filter(g => g.status === "Đạt")
    const totalCredits = completedCourses.reduce((sum, g) => sum + g.credits, 0)

    return {
      // Điểm học kỳ
      semesterGPA10: semester.semesterGPA10.toFixed(2),
      semesterGPA4: semester.semesterGPA4.toFixed(2),
      semesterCredits: semester.semesterCredits,
      // Điểm tích lũy đến học kỳ này
      cumulativeGPA10: semester.cumulativeGPA10.toFixed(2),
      cumulativeGPA4: semester.cumulativeGPA4.toFixed(2),
      cumulativeCredits: semester.cumulativeCredits,
      cumulativeClassification: semester.cumulativeClassification,
      totalCredits,
    }
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
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

  if (!cumulativeData || semesterData.length === 0) {
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
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Điểm số</h1>
          <p className="text-sm text-gray-600">Xem kết quả học tập các môn học</p>
        </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Điểm trung bình */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
          {/* Quarter-circle decorative element with icon - Orange/Peach */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFDDAA] rounded-bl-[100%]">
            <div className="absolute top-5 right-5">
              <Award className="w-6 h-6 text-[#CC8800] flex-shrink-0" strokeWidth={2} />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">Điểm trung bình</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{scoreOverview.gpa4}</p>
          <p className="text-xs sm:text-sm text-gray-600 relative z-10">GPA 4.0</p>
        </div>

        {/* Tổng tín chỉ hoàn thành */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
          {/* Quarter-circle decorative element with icon - Red/Coral */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFBBAA] rounded-bl-[100%]">
            <div className="absolute top-5 right-5">
              <Book className="w-6 h-6 text-[#CC4444] flex-shrink-0" strokeWidth={2} />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">Tổng tín chỉ hoàn thành</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{scoreOverview.totalCredits}</p>
          <p className="text-xs sm:text-sm text-gray-600 relative z-10">/120 tín chỉ</p>
        </div>

        {/* Môn đã hoàn thành */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
          {/* Quarter-circle decorative element with icon - Green/Mint */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#CCEECC] rounded-bl-[100%]">
            <div className="absolute top-5 right-5">
              <CheckCircle className="w-6 h-6 text-[#44AA44] flex-shrink-0" strokeWidth={2} />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">Môn đã hoàn thành</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{scoreOverview.completedCourses}</p>
          <p className="text-xs sm:text-sm text-gray-600 relative z-10">môn học</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto" ref={semesterRef}>
          <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
            Lọc theo học kỳ
          </label>
          <button
            type="button"
            className="w-full sm:w-80 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
            onClick={() => setIsSemesterOpen(!isSemesterOpen)}
          >
            <span className="text-xs sm:text-sm text-gray-900 truncate">
              {selectedSemesters.length === 0 
                ? "Chưa chọn học kỳ" 
                : selectedSemesters.length === 1
                  ? commonSemesters.find(s => s.semesterId === selectedSemesters[0])?.semesterName
                  : `${selectedSemesters.length} học kỳ đã chọn`
              }
            </span>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 flex-shrink-0 ml-2" />
          </button>
          {isSemesterOpen && (
            <div className="absolute z-50 mt-2 w-full sm:w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-hidden">
              {/* Select All / Clear All */}
              <div className="flex gap-2 p-2 border-b border-gray-200">
                <button
                  type="button"
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white rounded cursor-pointer transition-colors bg-[var(--grade-filter-select-bg)] hover:bg-[var(--grade-filter-select-hover)]"
                  onClick={() => {
                    setSelectedSemesters(commonSemesters.map(s => s.semesterId));
                  }}
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer transition-colors"
                  onClick={() => setSelectedSemesters([])}
                >
                  Bỏ chọn
                </button>
              </div>
              
              <div className="max-h-52 overflow-y-auto">
                {commonSemesters.map((semester) => {
                  const isSelected = selectedSemesters.includes(semester.semesterId);
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
                        e.stopPropagation();
                        setSelectedSemesters(prev => {
                          if (prev.includes(semester.semesterId)) {
                            return prev.filter(id => id !== semester.semesterId);
                          } else {
                            return [...prev, semester.semesterId];
                          }
                        });
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
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2 invisible">
            Export
          </label>
          <Button 
            onClick={exportPdf}
            className="text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg w-full sm:w-auto flex items-center justify-center transition-colors cursor-pointer text-xs sm:text-sm bg-[var(--grade-export-bg)] hover:bg-[var(--grade-export-hover)]"
          >
            <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            In bảng điểm
          </Button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {filteredSemesters.map((semester) => {
          const stats = calculateSemesterStats(semester.id)
          if (!stats) return null

          return (
            <div key={semester.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-3 sm:px-6 py-3 sm:py-4 bg-[var(--grade-semester-header-bg)]">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{semester.semester}</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[var(--grade-table-header-bg)]">
                      <th className="text-left py-2 px-2 sm:py-3.5 sm:px-4 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                        Mã MH
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                      </th>
                      <th className="text-left py-2 px-2 sm:py-3.5 sm:px-4 font-semibold text-[var(--grade-table-header-text)] min-w-[120px] sm:min-w-0 relative">
                        Tên môn học
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                      </th>
                      <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] relative">
                        TC
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                      </th>
                      <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                        Điểm thi
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                      </th>
                      <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                        TK (10)
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                      </th>
                      <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                        TK (4)
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                      </th>
                      <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                        TK (C)
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                      </th>
                      <th className="text-center py-2 px-2 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                        Kết quả
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                      </th>
                      <th className="text-center py-2 px-2 sm:py-3.5 sm:px-3 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap">
                        Chi tiết
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {semester.courses.map((course, idx) => (
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
                          <span className={`font-medium ${course.status === "Đạt" ? "text-[var(--grade-pass-text)]" : "text-[var(--grade-fail-text)]"}`}>
                            {course.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 sm:py-3.5 sm:px-3 text-center">
                          <button
                            onClick={() => handleShowDetail(course.code, semester.id)}
                            className="p-1 sm:p-1.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <List className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-[var(--grade-summary-bg)] px-3 sm:px-6 py-3 sm:py-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                  {/* Cột trái - Điểm học kỳ */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        - Điểm trung bình học kỳ hệ 4:
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[var(--grade-summary-highlight)] ml-2">
                        {stats.semesterGPA4}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        - Điểm trung bình học kỳ hệ 10:
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[var(--grade-summary-highlight)] ml-2">
                        {stats.semesterGPA10}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        - Số tín chỉ đạt học kỳ:
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[var(--grade-summary-highlight)] ml-2">
                        {stats.semesterCredits}
                      </span>
                    </div>
                  </div>

                  {/* Cột phải - Điểm tích lũy */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-gray-900">
                        - Điểm trung bình tích lũy hệ 4:
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[var(--grade-summary-highlight)] ml-2">
                        {stats.cumulativeGPA4}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-gray-900">
                        - Điểm trung bình tích lũy hệ 10:
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[var(--grade-summary-highlight)] ml-2">
                        {stats.cumulativeGPA10}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-gray-900">
                        - Số tín chỉ tích lũy:
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[var(--grade-summary-highlight)] ml-2">
                        {stats.cumulativeCredits}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Xếp loại - full width ở dưới */}
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">Xếp loại học lực tích lũy:</span>
                    {stats.cumulativeClassification ? (
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-white`} style={{
                        backgroundColor: (() => {
                          if (stats.cumulativeClassification === "Xuất sắc") return "var(--grade-class-excellent-bg)";
                          if (stats.cumulativeClassification === "Giỏi") return "var(--grade-class-good-bg)";
                          if (stats.cumulativeClassification === "Khá") return "var(--grade-class-fair-bg)";
                          if (stats.cumulativeClassification === "Trung bình") return "var(--grade-class-average-bg)";
                          if (stats.cumulativeClassification === "Yếu") return "var(--grade-class-weak-bg)";
                          return "#9ca3af";
                        })()
                      }}>
                        {stats.cumulativeClassification}
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm text-gray-500">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showDetailModal && selectedCourse && selectedSemesterId && cumulativeData && (() => {
        const rawGrade = cumulativeData.semesters
          .find(s => s.semesterId === selectedSemesterId)
          ?.grades.find(g => g.subjectCode === selectedCourse)
        
        if (!rawGrade) return null
        
        const detail = createCourseDetailsLookup(rawGrade)
        
        return (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseDetail}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200" style={{ background: 'var(--grade-modal-header-bg)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{rawGrade.subjectName}</h2>
                    <p className="text-sm text-blue-100 mt-1">Mã môn: {selectedCourse} • Số tín chỉ: {rawGrade.credits}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseDetail}
                    className="text-white hover:text-blue-100 hover:bg-white/10"
                  >
                    <XCircle className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[var(--grade-table-header-bg)]">
                        <th className="text-center py-3.5 px-4 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                          STT
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                        </th>
                        <th className="text-left py-3.5 px-6 font-semibold text-[var(--grade-table-header-text)] relative">
                          Tên thành phần
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                        </th>
                        <th className="text-center py-3.5 px-4 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap relative">
                          Trọng số (%)
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                        </th>
                        <th className="text-center py-3.5 px-4 font-semibold text-[var(--grade-table-header-text)] whitespace-nowrap">
                          Điểm
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
              
              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <Button
                    onClick={handleCloseDetail}
                    className="px-6 py-2.5 bg-[var(--grade-modal-close-btn)] hover:bg-[var(--grade-modal-close-btn-hover)] text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
      </div>
  )
}