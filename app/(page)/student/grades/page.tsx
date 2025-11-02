"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Printer, TrendingUp, BookOpen, Award, CheckCircle, XCircle, ChevronUp, ChevronDown, List, Loader2 } from "lucide-react"
import { useState, useEffect, useMemo, useRef } from "react"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useGrades } from "./lib/hooks/useGrades"
import { transformSemestersToUI, createCourseDetailsLookup } from "./lib/utils/transformers"
import { calculateGPA, getLetterGrade } from "./lib/utils/gradeUtils"
import type { CourseDetail } from "./lib/types/types"

export default function ScoresPage() {
  usePageTitle('Điểm số');
  const { cumulativeData, statsData, commonSemesters, isLoading, error, exportPdf } = useGrades()
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)
  const semesterRef = useRef<HTMLDivElement>(null)

  // Transform API data to UI format
  const semesterData = useMemo(() => {
    if (!cumulativeData) return []
    return transformSemestersToUI(cumulativeData.semesters)
  }, [cumulativeData])

  // Create course details lookup from API data
  const courseDetails = useMemo<Record<string, CourseDetail>>(() => {
    if (!cumulativeData) return {}
    const details: Record<string, CourseDetail> = {}
    cumulativeData.semesters.forEach(semester => {
      semester.grades.forEach(grade => {
        details[grade.subjectCode] = createCourseDetailsLookup(grade)
      })
    })
    return details
  }, [cumulativeData])

  const scoreOverview = useMemo(() => {
    // Use statsData (from /v1/students/me/grades/stats) for the 3 cards
    if (!statsData) {
      return {
        gpa4: "0.00",
        totalCredits: 0,
        completedCourses: 0,
        classification: "",
      }
    }

    // Get classification based on GPA4 from stats
    let classification = ""
    if (statsData.averageGPA >= 3.8) classification = "Xuất sắc"
    else if (statsData.averageGPA >= 3.2) classification = "Giỏi"
    else if (statsData.averageGPA >= 2.5) classification = "Khá"
    else if (statsData.averageGPA >= 2.0) classification = "Trung bình"
    else if (statsData.averageGPA > 0) classification = "Yếu"

    return {
      gpa4: statsData.averageGPA.toFixed(2),
      totalCredits: statsData.totalCredits,
      completedCourses: statsData.totalSubjects,
      classification,
    }
  }, [statsData])

  const handleShowDetail = (courseCode: string) => {
    if (courseDetails[courseCode]) {
      setSelectedCourse(courseCode)
      setShowDetailModal(true)
    }
  }

  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedCourse(null)
  }

  // Close dropdown when clicking outside
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

  const getStatusIcon = (status: string) => {
    if (status === "Đạt") return <CheckCircle className="h-4 w-4 text-green-600" />
    if (status === "Không đạt") return <XCircle className="h-4 w-4 text-red-600" />
    return <span className="text-xs text-gray-500">-</span>
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Xuất sắc":
        return "bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white hover:from-[#FF512F] hover:to-[#DD2476]"
      case "Giỏi":
        return "bg-gradient-to-r from-[#1FA2FF] to-[#12D8FA] text-white hover:from-[#1FA2FF] hover:to-[#12D8FA]"
      case "Khá":
        return "bg-gradient-to-r from-[#56ab2f] to-[#a8e063] text-white hover:from-[#56ab2f] hover:to-[#a8e063]"
      case "Trung bình":
        return "bg-gradient-to-r from-[#F7971E] to-[#FFD200] text-white hover:from-[#F7971E] hover:to-[#FFD200]"
      case "Yếu":
        return "bg-gradient-to-r from-[#ED213A] to-[#93291E] text-white hover:from-[#ED213A] hover:to-[#93291E]"
      default:
        return "bg-gray-100 text-gray-500 hover:bg-gray-100"
    }
  }

  const filteredSemesters =
    selectedSemesters.length === 0 
      ? semesterData 
      : semesterData.filter((s) => selectedSemesters.includes(s.id))

  // Calculate semester stats from API data
  const calculateSemesterStats = (semesterId: string) => {
    if (!cumulativeData) return null
    const semester = cumulativeData.semesters.find(s => s.semesterId === semesterId)
    if (!semester) return null

    const completedCourses = semester.grades.filter(g => g.status === "Đạt")
    const totalCredits = completedCourses.reduce((sum, g) => sum + g.credits, 0)

    return {
      semesterGPA10: semester.semesterGPA10.toFixed(2),
      semesterGPA4: semester.semesterGPA4.toFixed(2),
      totalCredits,
      classification: semester.semesterClassification,
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

      {/* Tổng quan điểm số - Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Điểm trung bình */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <p className="text-xs sm:text-sm text-gray-700 mb-2 font-medium">Điểm trung bình</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-bold text-gray-900">{scoreOverview.gpa4}</p>
            <span className="text-xs sm:text-sm text-gray-600">GPA 4.0</span>
          </div>
        </div>

        {/* Card 2: Tổng tín chỉ hoàn thành */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <p className="text-xs sm:text-sm text-gray-700 mb-2 font-medium">Tổng tín chỉ hoàn thành</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-bold text-gray-900">{scoreOverview.totalCredits}</p>
            <span className="text-xs sm:text-sm text-gray-600">tín chỉ</span>
          </div>
        </div>

        {/* Card 3: Môn đã hoàn thành */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <p className="text-xs sm:text-sm text-gray-700 mb-2 font-medium">Môn đã hoàn thành</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-bold text-gray-900">{scoreOverview.completedCourses}</p>
            <span className="text-xs sm:text-sm text-gray-600">môn học</span>
          </div>
        </div>
      </div>

      {/* Filter & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto" ref={semesterRef}>
          <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
            Lọc theo học kỳ (Multi-select)
          </label>
          <button
            type="button"
            className="w-full sm:w-80 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
            onClick={() => setIsSemesterOpen(!isSemesterOpen)}
          >
            <span className="text-xs sm:text-sm text-gray-900 truncate">
              {selectedSemesters.length === 0 
                ? "Tất cả học kỳ" 
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
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-[#0053AD] rounded hover:bg-[#003d82] cursor-pointer transition-colors"
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
              
              {/* Semester List - Dùng commonSemesters từ /v1/common/semesters để giữ đúng thứ tự API */}
              <div className="max-h-52 overflow-y-auto">
                {commonSemesters.map((semester, index) => {
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
                          ? 'bg-[#0053AD] border-[#0053AD]' 
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
            className="bg-[#0053AD] hover:bg-[#003d82] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg w-full sm:w-auto flex items-center justify-center transition-colors cursor-pointer text-xs sm:text-sm"
          >
            <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            In bảng điểm
          </Button>
        </div>
      </div>

      {/* Bảng điểm chi tiết cho từng học kỳ */}
      <div className="space-y-4 sm:space-y-6">
        {filteredSemesters.map((semester, index) => {
          const stats = calculateSemesterStats(semester.id)
          if (!stats) return null

          return (
            <div key={semester.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Semester Header */}
              <div className="px-3 sm:px-6 py-3 sm:py-4 bg-[#ADD8E6]">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{semester.semester}</h3>
              </div>

              {/* Table Section */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#0053AD]">
                      <th className="text-left py-2 px-2 sm:py-3.5 sm:px-4 font-semibold text-white whitespace-nowrap">Mã MH</th>
                      <th className="text-left py-2 px-2 sm:py-3.5 sm:px-4 font-semibold text-white min-w-[120px] sm:min-w-0">Tên môn học</th>
                      <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-white">TC</th>
                      <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-white whitespace-nowrap">Điểm thi</th>
                      <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-white whitespace-nowrap">TK (10)</th>
                      <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-white whitespace-nowrap">TK (4)</th>
                      <th className="text-center py-2 px-1 sm:py-3.5 sm:px-3 font-semibold text-white whitespace-nowrap">TK (C)</th>
                      <th className="text-center py-2 px-2 sm:py-3.5 sm:px-3 font-semibold text-white whitespace-nowrap">Kết quả</th>
                      <th className="text-center py-2 px-2 sm:py-3.5 sm:px-3 font-semibold text-white whitespace-nowrap">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {semester.courses.map((course, idx) => {
                      const gpa = course.score10 !== null ? calculateGPA(course.score10) : null
                      const letterGrade = course.score10 !== null ? getLetterGrade(course.score10) : null

                      return (
                        <tr
                          key={idx}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-gray-900 whitespace-nowrap">{course.code}</td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-gray-900">{course.name}</td>
                          <td className="py-2 px-1 sm:py-3.5 sm:px-3 text-center text-gray-900">{course.credits}</td>
                          <td className="py-2 px-1 sm:py-3.5 sm:px-3 text-center text-gray-900">
                            {course.score10 !== null ? course.score10.toFixed(1) : "-"}
                          </td>
                          <td className="py-2 px-1 sm:py-3.5 sm:px-3 text-center text-gray-900 font-medium">
                            {course.score10 !== null ? course.score10.toFixed(1) : "-"}
                          </td>
                          <td className="py-2 px-1 sm:py-3.5 sm:px-3 text-center text-gray-900 font-medium">
                            {gpa !== null ? gpa.toFixed(1) : "-"}
                          </td>
                          <td className="py-2 px-1 sm:py-3.5 sm:px-3 text-center text-gray-900 font-medium">
                            {letterGrade || "-"}
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-3 text-center">
                            <span className={`font-medium ${course.status === "Đạt" ? "text-green-600" : "text-red-600"}`}>
                              {course.status}
                            </span>
                          </td>
                          <td className="py-2 px-2 sm:py-3.5 sm:px-3 text-center">
                            <button
                              onClick={() => handleShowDetail(course.code)}
                              disabled={!courseDetails[course.code]}
                              className="p-1 sm:p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              title="Xem chi tiết"
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

              {/* Summary Section - Separated Block */}
              <div className="bg-[#E8E8E8] px-3 sm:px-6 py-3 sm:py-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      Điểm trung bình tích lũy hệ 4: <span className="text-[#4196F0]">{stats.semesterGPA4}</span>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      Điểm trung bình tích lũy hệ 10: <span className="text-[#4196F0]">{stats.semesterGPA10}</span>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      Số tín chỉ tích lũy: <span className="text-[#4196F0]">{stats.totalCredits}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">Phân loại học lực học kỳ:</span>
                    {stats.classification && (
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                        stats.classification === "Xuất sắc" ? "bg-yellow-400 text-gray-900" :
                        stats.classification === "Giỏi" ? "bg-green-500 text-white" :
                        stats.classification === "Khá" ? "bg-blue-500 text-white" :
                        stats.classification === "Trung bình" ? "bg-orange-500 text-white" :
                        stats.classification === "Yếu" ? "bg-red-500 text-white" :
                        "bg-gray-400 text-white"
                      }`}>
                        {stats.classification}
                      </span>
                    )}
                    {!stats.classification && <span className="text-xs sm:text-sm text-gray-500">-</span>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Course Detail Modal */}
      {showDetailModal && selectedCourse && courseDetails[selectedCourse] && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={handleCloseDetail}
        >
          <div 
            className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#0053AD] to-[#003d82] border-b border-gray-200">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-base sm:text-xl font-semibold text-white mb-1">{courseDetails[selectedCourse].name}</h3>
                  <p className="text-xs sm:text-sm text-blue-100">Mã môn: {selectedCourse}</p>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
                  title="Đóng"
                >
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-center py-2 px-2 sm:py-3.5 sm:px-4 font-semibold text-gray-900 whitespace-nowrap">STT</th>
                      <th className="text-left py-2 px-2 sm:py-3.5 sm:px-6 font-semibold text-gray-900 min-w-[120px] sm:min-w-0">Tên thành phần</th>
                      <th className="text-center py-2 px-2 sm:py-3.5 sm:px-4 font-semibold text-gray-900 whitespace-nowrap">Trọng số %</th>
                      <th className="text-center py-2 px-2 sm:py-3.5 sm:px-4 font-semibold text-gray-900 whitespace-nowrap">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseDetails[selectedCourse].components.map((component) => (
                      <tr key={component.stt} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center text-gray-900">{component.stt}</td>
                        <td className="py-2 px-2 sm:py-3.5 sm:px-6 text-gray-900">{component.name}</td>
                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center text-gray-900">{component.weight}%</td>
                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center font-semibold text-gray-900">
                          {component.score > 0 ? component.score.toFixed(1) : "0.0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex justify-end rounded-b-lg">
              <button
                onClick={handleCloseDetail}
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
  )
}