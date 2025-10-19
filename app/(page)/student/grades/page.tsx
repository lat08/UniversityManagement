"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Printer, TrendingUp, BookOpen, Award, CheckCircle, XCircle, ChevronUp, List } from "lucide-react"
import { useState, useEffect } from "react"
import { semesterData } from "./lib/data/semesterData"
import { courseDetails } from "./lib/data/courseDetails"
import { calculateGPA, getLetterGrade, getClassification, calculateSemesterStats, calculateCumulativeGPA } from "./lib/utils/gradeUtils"

export default function ScoresPage() {
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)



  const scoreOverview = calculateCumulativeGPA(semesterData)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Điểm số</h1>
        <p className="text-sm text-gray-600">Theo dõi kết quả học tập và tiến độ học tập</p>
      </div>

      {/* Tổng quan điểm số */}
      <div className="mb-8">
        {/* Section title typography */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Tổng quan điểm số</h2>
          <div className="relative">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors"
            >
              <option value="all">Tất cả học kỳ</option>
              <option value="hk1-2023-2024">HK1 2023 - 2024</option>
              <option value="hk2-2023-2024">HK2 2023 - 2024</option>
              <option value="hk3-2023-2024">HK3 2023 - 2024</option>
              <option value="hk1-2025-2026">HK1 2025 - 2026</option>
            </select>
            <ChevronUp className="h-4 w-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 rotate-180 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Điểm trung bình */}
          <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Điểm TB tích lũy</p>
                  <p className="text-xs text-gray-500">GPA 4.0</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900">{scoreOverview.gpa4}</p>
                <span className="text-sm text-gray-500">/ 4.0</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Thang 10: {scoreOverview.gpa10}</p>
            </CardContent>
          </Card>

          {/* Card 2: Tổng tín chỉ hoàn thành */}
          <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tín chỉ hoàn thành</p>
                  <p className="text-xs text-gray-500">/ {scoreOverview.maxCredits} tín chỉ</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-4xl font-bold text-gray-900">{scoreOverview.totalCredits}</p>
                <span className="text-sm text-gray-500">/ {scoreOverview.maxCredits}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(scoreOverview.totalCredits / scoreOverview.maxCredits) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Xếp loại & Môn đã hoàn thành */}
          <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Xếp loại học lực</p>
                  <p className="text-xs text-gray-500">Tích lũy</p>
                </div>
              </div>
              <Badge
                className={`${getClassificationColor(scoreOverview.classification)} text-base font-bold px-4 py-2 mb-3`}
              >
                {scoreOverview.classification}
              </Badge>
              <p className="text-sm text-gray-600 mt-3">
                Số môn hoàn thành: <span className="font-bold text-gray-900">{scoreOverview.completedCourses}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bảng điểm chi tiết cho từng học kỳ */}
      <div className="space-y-6">
        {/* Section title typography */}
        <h2 className="text-xl font-bold text-gray-900">Bảng điểm chi tiết</h2>

        {filteredSemesters.map((semester) => {
          const stats = calculateSemesterStats(semester.courses, semester.semester)
          const hasAllScores = semester.courses.every(
            (c) => (c.status === "Đạt" && c.score10 !== null) || c.status === "Không đạt",
          )

          // tính xếp loại học kỳ dựa trên điểm và điều kiện hasAllScores
          const semClassification = getClassification(
            Number.parseFloat(stats.semesterGPA4 || "0"),
            hasAllScores,
            semester.semester,
          )

          return (
            <Card key={semester.id} className="shadow-sm border border-gray-200">
              <CardHeader className="pb-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg font-bold text-gray-900">{semester.semester}</CardTitle>
                  </div>

                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 w-full sm:w-auto">
                    <Printer className="h-4 w-4 mr-2" />
                    In bảng điểm
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="text-center py-3 px-3 font-bold text-sm whitespace-nowrap">STT</th>
                        <th className="text-left py-3 px-3 font-bold text-sm whitespace-nowrap">Mã MH</th>
                        <th className="text-left py-3 px-3 font-bold text-sm whitespace-nowrap">Tên môn học</th>
                        <th className="text-center py-3 px-3 font-bold text-sm whitespace-nowrap">Số TC</th>
                        <th className="text-center py-3 px-3 font-bold text-sm whitespace-nowrap">Điểm (10)</th>
                        <th className="text-center py-3 px-3 font-bold text-sm whitespace-nowrap">GPA (4.0)</th>
                        <th className="text-center py-3 px-3 font-bold text-sm whitespace-nowrap">Điểm chữ</th>
                        <th className="text-center py-3 px-3 font-bold text-sm whitespace-nowrap">Trạng thái</th>
                        <th className="text-center py-3 px-3 font-bold text-sm whitespace-nowrap">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semester.courses.map((course, idx) => {
                        const gpa = course.score10 !== null ? calculateGPA(course.score10) : null
                        const letterGrade = course.score10 !== null ? getLetterGrade(course.score10) : null

                        return (
                          <tr
                            key={idx}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="py-3 px-3 text-center text-gray-900 font-medium">{idx + 1}</td>
                            <td className="py-3 px-3 text-gray-900 font-medium whitespace-nowrap">{course.code}</td>
                            <td className="py-3 px-3 text-gray-900">{course.name}</td>
                            <td className="py-3 px-3 text-center text-gray-900">{course.credits}</td>
                            <td className="py-3 px-3 text-center text-gray-900 font-medium">
                              {course.score10 !== null ? course.score10.toFixed(1) : "-"}
                            </td>
                            <td className="py-3 px-3 text-center text-gray-900 font-medium">
                              {gpa !== null ? gpa.toFixed(1) : "-"}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {letterGrade ? (
                                <Badge className={`${getClassificationColor(letterGrade)} font-bold`}>
                                  {letterGrade}
                                </Badge>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {getStatusIcon(course.status)}
                                <span className="text-sm text-gray-700">{course.status}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShowDetail(course.code)}
                                className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                                disabled={course.status === "Đang học" || !courseDetails[course.code]}
                              >
                                <List
                                  className={`h-4 w-4 ${course.status === "Đang học" || !courseDetails[course.code] ? "text-gray-300" : "text-blue-600"}`}
                                />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-0 p-6 bg-gray-50 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-base">Trung bình học kỳ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-600 mb-1">GPA học kỳ (4.0)</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.semesterGPA4}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-600 mb-1">Điểm TB (10)</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.semesterGPA10}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-600 mb-1">Tín chỉ đạt</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalCredits}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-600 mb-1">Xếp loại HK</p>
                      <Badge className={`${getClassificationColor(semClassification)} text-base font-bold mt-1`}>
                        {semClassification || "Chưa đủ điểm"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
