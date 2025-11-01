"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Printer, TrendingUp, BookOpen, Award, CheckCircle, XCircle, ChevronUp, List, Loader2 } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useGrades } from "./lib/hooks/useGrades"
import { transformSemestersToUI, createCourseDetailsLookup } from "./lib/utils/transformers"
import { calculateGPA, getLetterGrade } from "./lib/utils/gradeUtils"
import type { CourseDetail } from "./lib/types/types"

export default function ScoresPage() {
  usePageTitle('Điểm số');
  const { cumulativeData, statsData, isLoading, error, exportPdf } = useGrades()
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

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
    selectedSemester === "all" ? semesterData : semesterData.filter((s) => s.id === selectedSemester)

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
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Điểm số</h1>
        <p className="text-sm text-gray-500">Xem kết quả học tập các môn học</p>
        </div>

      {/* Tổng quan điểm số */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Card 1: Điểm trung bình - Màu cam góc trên */}
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-200 to-orange-300 rounded-bl-full opacity-60"></div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm text-gray-600 mb-2">Điểm trung bình</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900">{scoreOverview.gpa4}</p>
                <span className="text-sm text-gray-500">GPA 4.0</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Tổng tín chỉ hoàn thành - Màu hồng góc trên */}
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-200 to-pink-300 rounded-bl-full opacity-60"></div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm text-gray-600 mb-2">Tổng tín chỉ hoàn thành</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900">{scoreOverview.totalCredits}</p>
                <span className="text-sm text-gray-500">tín chỉ</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Môn đã hoàn thành - Màu xanh mint góc trên */}
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-200 to-teal-300 rounded-bl-full opacity-60"></div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm text-gray-600 mb-2">Môn đã hoàn thành</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900">{scoreOverview.completedCourses}</p>
                <span className="text-sm text-gray-500">môn học</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Export */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
          <div className="relative">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="appearance-none h-10 px-4 pr-10 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer flex items-center"
            >
              <option value="all">Tất cả học kỳ</option>
              {cumulativeData?.semesters.map((semester) => (
                <option key={semester.semesterId} value={semester.semesterId}>
                  {semester.semesterName}
                </option>
              ))}
            </select>
          </div>
          <Button 
            onClick={exportPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 rounded-lg w-full sm:w-auto flex items-center justify-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            In
          </Button>
        </div>
      </div>

      {/* Bảng điểm chi tiết cho từng học kỳ */}
      <div className="space-y-6">
        {filteredSemesters.map((semester, index) => {
          const stats = calculateSemesterStats(semester.id)
          if (!stats) return null

          return (
            <Card key={semester.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <CardHeader className="px-6 py-4 bg-blue-100 border-b border-blue-200">
                    <CardTitle className="text-lg font-bold text-gray-900">{semester.semester}</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-600">
                        <th className="text-left py-3 px-6 font-semibold text-sm text-white">Mã môn học</th>
                        <th className="text-left py-3 px-6 font-semibold text-sm text-white">Tên môn học</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm text-white">Tín chỉ</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm text-white">Điểm thi</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm text-white">Điểm TK (10)</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm text-white">Điểm TK (4)</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm text-white">Điểm TK (C)</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm text-white">Kết quả</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm text-white">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semester.courses.map((course, idx) => {
                        const gpa = course.score10 !== null ? calculateGPA(course.score10) : null
                        const letterGrade = course.score10 !== null ? getLetterGrade(course.score10) : null

                        return (
                          <tr
                            key={idx}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-6 text-gray-900 font-medium">{course.code}</td>
                            <td className="py-3 px-6 text-gray-900">{course.name}</td>
                            <td className="py-3 px-4 text-center text-gray-900">{course.credits}</td>
                            <td className="py-3 px-4 text-center text-gray-900">
                              {course.score10 !== null ? course.score10.toFixed(1) : "-"}
                            </td>
                            <td className="py-3 px-4 text-center text-gray-900 font-medium">
                              {course.score10 !== null ? course.score10.toFixed(1) : "-"}
                            </td>
                            <td className="py-3 px-4 text-center text-gray-900 font-medium">
                              {gpa !== null ? gpa.toFixed(1) : "-"}
                            </td>
                            <td className="py-3 px-4 text-center text-gray-900 font-semibold">
                              {letterGrade || "-"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-sm font-medium ${course.status === "Đạt" ? "text-green-600" : "text-red-600"}`}>
                                {course.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShowDetail(course.code)}
                                className="p-1 hover:bg-gray-100 rounded"
                                disabled={!courseDetails[course.code]}
                              >
                                <span className="text-lg">≡</span>
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 pb-6 pt-4 space-y-3 bg-gray-100 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Điểm trung bình tích lũy hệ 4:</span>
                    <span className="text-sm font-bold text-gray-900">{stats.semesterGPA4}</span>
                    </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Điểm trung bình tích lũy hệ 10:</span>
                    <span className="text-sm font-bold text-gray-900">{stats.semesterGPA10}</span>
                    </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Số tín chỉ tích lũy:</span>
                    <span className="text-sm font-bold text-gray-900">{stats.totalCredits}</span>
                    </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Phân loại học lực học kỳ:</span>
                    <span className="text-sm font-bold text-gray-900">{stats.classification || "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Course Detail Modal */}
      {showDetailModal && selectedCourse && courseDetails[selectedCourse] && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseDetail}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{courseDetails[selectedCourse].name}</h3>
                  <p className="text-sm text-gray-500">Mã môn: {selectedCourse}</p>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="text-red-500 hover:text-red-700 font-bold text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="text-center py-3 px-4 font-bold text-sm">Số thứ tự</th>
                      <th className="text-left py-3 px-4 font-bold text-sm">Tên thành phần</th>
                      <th className="text-center py-3 px-4 font-bold text-sm">Trọng số %</th>
                      <th className="text-center py-3 px-4 font-bold text-sm">Điểm thành phần</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseDetails[selectedCourse].components.map((component) => (
                      <tr key={component.stt} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-center text-gray-900">{component.stt}</td>
                        <td className="py-3 px-4 text-gray-900">{component.name}</td>
                        <td className="py-3 px-4 text-center text-gray-900">{component.weight}</td>
                        <td className="py-3 px-4 text-center font-medium text-gray-900">
                          {component.score > 0 ? component.score.toFixed(1) : "0.0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-white flex justify-end">
              <Button
                onClick={handleCloseDetail}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                × Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
  )
}