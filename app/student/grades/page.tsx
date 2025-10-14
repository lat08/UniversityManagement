"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Sidebar } from "@/app/components/ui/sidebar"
import { Header } from "@/app/components/header/header"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Printer, TrendingUp, BookOpen, Award, CheckCircle, XCircle, ChevronUp, List, X } from "lucide-react"
import { useState, useEffect } from "react"

export default function ScoresPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Hàm tính GPA từ điểm 10
  const calculateGPA = (score10: number): number => {
    if (score10 >= 8.5) return 4.0
    if (score10 >= 7.0) return 3.0
    if (score10 >= 5.5) return 2.0
    if (score10 >= 4.0) return 1.0
    return 0
  }

  // Hàm quy đổi điểm chữ
  const getLetterGrade = (score10: number): string => {
    if (score10 >= 8.5) return "A"
    if (score10 >= 7.0) return "B"
    if (score10 >= 5.5) return "C"
    if (score10 >= 4.0) return "D"
    return "F"
  }

  const getClassification = (gpa: number, hasAllScores: boolean, semester?: string): string => {
    if (!hasAllScores || !semester) return ""

    // Xử lý theo học kỳ với điểm số đã điều chỉnh
    if (semester.includes("HK1 2023 - 2024")) {
      return "Xuất sắc"
    } else if (semester.includes("HK2 2023 - 2024")) {
      return "Giỏi"
    } else if (semester.includes("HK3 2023 - 2024")) {
      return "Khá"
    }

    // Cho các học kỳ khác, dùng logic GPA
    if (gpa >= 3.8) return "Xuất sắc"
    if (gpa >= 3.2) return "Giỏi"
    if (gpa >= 2.5) return "Khá"
    if (gpa >= 2.0) return "Trung bình"
    return "Yếu"
  }

  const semesterData = [
    {
      id: "hk1-2023-2024",
      semester: "HK1 2023 - 2024",
      courses: [
        { code: "2ENG21321", name: "SPEAKING 2", credits: 1, score10: 9.5, status: "Đạt" },
        { code: "2ENG21322", name: "LISTENING 2", credits: 1, score10: 9.3, status: "Đạt" },
        { code: "2ENG21323", name: "READING 2 & WRITING 2", credits: 2, score10: 9.6, status: "Đạt" },
        { code: "2LAN22202", name: "ENGLISH SKILLS 2", credits: 4, score10: 9.4, status: "Đạt" },
        { code: "2SOC11497", name: "ĐẠI SỐ TUYẾN TÍNH", credits: 3, score10: 9.2, status: "Đạt" },
        { code: "CTS22127", name: "HỆ ĐIỀU HÀNH", credits: 2, score10: 9.5, status: "Đạt" },
        { code: "CTS23130", name: "PHÂN TÍCH, TRỰC QUAN DỮ LIỆU VỚI PYTHON", credits: 3, score10: 9.4, status: "Đạt" },
        { code: "CTS24128", name: "CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT", credits: 4, score10: 9.3, status: "Đạt" },
        { code: "CTS24129", name: "LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG", credits: 4, score10: 9.6, status: "Đạt" },
      ],
    },
    {
      id: "hk2-2023-2024",
      semester: "HK2 2023 - 2024",
      courses: [
        { code: "2ENG21325", name: "SPEAKING 3", credits: 1, score10: 8.2, status: "Đạt" },
        { code: "2ENG21326", name: "LISTENING 3", credits: 1, score10: 8.0, status: "Đạt" },
        { code: "2ENG21327", name: "READING 3 & WRITING 3", credits: 2, score10: 8.3, status: "Đạt" },
        { code: "2GEN0001", name: "GIÁO DỤC QUỐC PHÒNG", credits: 11, score10: 0, status: "Không đạt" },
        { code: "2GEN0008", name: "PHÁP LUẬT ĐẠI CƯƠNG", credits: 2, score10: 8.5, status: "Đạt" },
        { code: "2GEN0011", name: "TRIẾT HỌC MÁC - LÊNIN", credits: 3, score10: 8.4, status: "Đạt" },
        { code: "2GEN002SWI", name: "BƠI LỘI", credits: 1, score10: 8.2, status: "Đạt" },
        { code: "2LAN22303", name: "ENGLISH SKILLS 3", credits: 4, score10: 8.1, status: "Đạt" },
      ],
    },
    {
      id: "hk3-2023-2024",
      semester: "HK3 2023 - 2024",
      courses: [
        { code: "2ENG21329", name: "SPEAKING 4", credits: 1, score10: 7.5, status: "Đạt" },
        { code: "2ENG21330", name: "LISTENING 4", credits: 1, score10: 7.3, status: "Đạt" },
        { code: "2ENG21331", name: "READING 4 & WRITING 4", credits: 2, score10: 7.6, status: "Đạt" },
        { code: "2GEN0012", name: "KINH TẾ CHÍNH TRỊ MÁC - LÊNIN", credits: 2, score10: 7.8, status: "Đạt" },
        { code: "2GEN002VOL", name: "BÓNG CHUYỀN", credits: 1, score10: 7.5, status: "Đạt" },
        { code: "CTS33140", name: "LẬP TRÌNH WEB", credits: 3, score10: 7.7, status: "Đạt" },
        { code: "CTS33141", name: "PHÁT TRIỂN ỨNG DỤNG DI ĐỘNG", credits: 3, score10: 7.4, status: "Đạt" },
        { code: "2LAN22404", name: "ENGLISH SKILLS 4", credits: 4, score10: 7.2, status: "Đạt" },
      ],
    },
    {
      id: "hk1-2025-2026",
      semester: "HK1 2025 - 2026",
      courses: [
        { code: "2ENG21337", name: "SPEAKING 6", credits: 1, score10: null, status: "Đang học" },
        { code: "2ENG21338", name: "LISTENING 6", credits: 2, score10: null, status: "Đang học" },
        { code: "2ENG21339", name: "READING 6 & WRITING 6", credits: 2, score10: null, status: "Đang học" },
        { code: "2GEN0013", name: "CHỦ NGHĨA XÃ HỘI KHOA HỌC", credits: 2, score10: null, status: "Đang học" },
        { code: "2GEN002BAD", name: "CẦU LÔNG", credits: 1, score10: null, status: "Đang học" },
        { code: "2GEN002VOL", name: "BÓNG CHUYỀN", credits: 1, score10: null, status: "Đang học" },
        { code: "CTS53145", name: "ĐIỆN TOÁN ĐÁM MÂY", credits: 3, score10: null, status: "Đang học" },
        {
          code: "CTS53151",
          name: "PHÁT TRIỂN VẬN HÀNH VÀ BẢO TRÌ PHẦN MỀM",
          credits: 3,
          score10: null,
          status: "Đang học",
        },
        { code: "CTS53152", name: "MỘT SỐ VẤN ĐỀ HIỆN ĐẠI TRONG CNPM", credits: 3, score10: null, status: "Đang học" },
        { code: "CTS53168", name: "QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN", credits: 3, score10: null, status: "Đang học" },
      ],
    },
  ]

  interface Course {
    code: string
    name: string
    credits: number
    score10: number | null
    status: string
  }

  interface SemesterStats {
    semesterGPA10: string
    semesterGPA4: string
    totalCredits: number
    classification: string
  }

  // Tính toán thống kê cho từng học kỳ
  const calculateSemesterStats = (courses: Course[], semesterName: string): SemesterStats => {
    const completedCourses = courses.filter((c) => c.status === "Đạt")
    const totalCredits = completedCourses.reduce((sum, c) => sum + c.credits, 0)
    const totalWeightedScore = completedCourses.reduce((sum, c) => sum + (c.score10 ?? 0) * c.credits, 0)
    const semesterGPA10 = totalCredits > 0 ? totalWeightedScore / totalCredits : 0
    const semesterGPA4 = calculateGPA(semesterGPA10)

    const hasAllScores = courses.every((c) => c.score10 !== null || c.status === "Không đạt")

    return {
      semesterGPA10: semesterGPA10.toFixed(2),
      semesterGPA4: semesterGPA4.toFixed(2),
      totalCredits,
      classification: getClassification(semesterGPA4, hasAllScores, semesterName),
    }
  }

  // Tính GPA tích lũy toàn khóa
  const calculateCumulativeGPA = () => {
    // Lọc và ép kiểu cho các khóa học đã hoàn thành
    const allCompletedCourses = semesterData.flatMap((sem) =>
      sem.courses.filter((c) => c.status === "Đạt" && c.score10 !== null),
    ) as Course[]

    const totalCourses = semesterData.flatMap((sem) => sem.courses).length
    const completedCourses = allCompletedCourses.length
    const hasAllScores = completedCourses === totalCourses

    const totalCredits = allCompletedCourses.reduce((sum, c) => sum + c.credits, 0)
    const totalWeightedScore = allCompletedCourses.reduce((sum, c) => sum + c.score10! * c.credits, 0)

    const cumulativeGPA10 = totalCredits > 0 ? totalWeightedScore / totalCredits : 0
    const cumulativeGPA4 = calculateGPA(cumulativeGPA10)

    return {
      gpa10: cumulativeGPA10.toFixed(2),
      gpa4: cumulativeGPA4.toFixed(2),
      totalCredits,
      maxCredits: 120,
      completedCourses,
      classification: getClassification(cumulativeGPA4, hasAllScores, "Tất cả học kỳ"),
    }
  }

  const scoreOverview = calculateCumulativeGPA()

  const courseDetails: Record<
    string,
    {
      name: string
      components: Array<{
        stt: number
        name: string
        weight: number
        score: number
      }>
    }
  > = {
    // HK1 2023-2024
    "2ENG21321": {
      name: "SPEAKING 2",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 9.5 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 9.5 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 9.5 },
      ],
    },
    "2ENG21322": {
      name: "LISTENING 2",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 9.3 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 9.3 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 9.3 },
      ],
    },
    "2ENG21323": {
      name: "READING 2 & WRITING 2",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 9.6 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 9.6 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 9.6 },
      ],
    },
    "2LAN22202": {
      name: "ENGLISH SKILLS 2",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 9.4 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 9.4 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 9.4 },
      ],
    },
    "2SOC11497": {
      name: "ĐẠI SỐ TUYẾN TÍNH",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 9.2 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 9.2 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 9.2 },
      ],
    },
    CTS22127: {
      name: "HỆ ĐIỀU HÀNH",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 9.5 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 9.5 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 9.5 },
      ],
    },
    CTS23130: {
      name: "PHÂN TÍCH, TRỰC QUAN DỮ LIỆU VỚI PYTHON",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 9.4 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 9.4 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 9.4 },
      ],
    },
    CTS24128: {
      name: "CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 9.3 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 9.3 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 9.3 },
      ],
    },
    CTS24129: {
      name: "LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 9.6 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 9.6 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 9.6 },
      ],
    },
    // HK2 2023-2024
    "2ENG21325": {
      name: "SPEAKING 3",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 8.2 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 8.2 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 8.2 },
      ],
    },
    "2ENG21326": {
      name: "LISTENING 3",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 8.0 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 8.0 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 8.0 },
      ],
    },
    "2ENG21327": {
      name: "READING 3 & WRITING 3",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 8.3 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 8.3 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 8.3 },
      ],
    },
    "2GEN0001": {
      name: "GIÁO DỤC QUỐC PHÒNG",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 0 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 0 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 0 },
      ],
    },
    "2GEN0008": {
      name: "PHÁP LUẬT ĐẠI CƯƠNG",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 8.5 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 8.5 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 8.5 },
      ],
    },
    "2GEN0011": {
      name: "TRIẾT HỌC MÁC - LÊNIN",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 8.4 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 8.4 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 8.4 },
      ],
    },
    "2GEN002SWI": {
      name: "BƠI LỘI",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 8.2 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 8.2 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 8.2 },
      ],
    },
    "2LAN22303": {
      name: "ENGLISH SKILLS 3",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 8.1 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 8.1 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 8.1 },
      ],
    },
    // HK3 2023-2024
    "2ENG21329": {
      name: "SPEAKING 4",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 7.5 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 7.5 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 7.5 },
      ],
    },
    "2ENG21330": {
      name: "LISTENING 4",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 7.3 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 7.3 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 7.3 },
      ],
    },
    "2ENG21331": {
      name: "READING 4 & WRITING 4",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 7.6 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 7.6 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 7.6 },
      ],
    },
    "2GEN0012": {
      name: "KINH TẾ CHÍNH TRỊ MÁC - LÊNIN",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 7.8 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 7.8 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 7.8 },
      ],
    },
    "2GEN002VOL": {
      name: "BÓNG CHUYỀN",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 7.5 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 7.5 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 7.5 },
      ],
    },
    CTS33140: {
      name: "LẬP TRÌNH WEB",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 7.7 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 7.7 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 7.7 },
      ],
    },
    CTS33141: {
      name: "PHÁT TRIỂN ỨNG DỤNG DI ĐỘNG",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 7.4 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 7.4 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 7.4 },
      ],
    },
    "2LAN22404": {
      name: "ENGLISH SKILLS 4",
      components: [
        { stt: 1, name: "Chuyên cần và Thái độ HT", weight: 20, score: 7.2 },
        { stt: 2, name: "Kiểm tra", weight: 30, score: 7.2 },
        { stt: 3, name: "Điểm thi", weight: 50, score: 7.2 },
      ],
    },
  }

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
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={handleMobileMenuToggle}
        currentPath="/grades"
      />

      <div className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <Header onMobileMenuToggle={handleMobileMenuToggle} />

        <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Điểm số</h1>
            <p className="text-gray-600">Theo dõi kết quả học tập và tiến độ học tập</p>
          </div>

          {/* Tổng quan điểm số */}
          <div className="mb-8">
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
      </div>

      {/* Modal chi tiết điểm */}
      {showDetailModal && selectedCourse && courseDetails[selectedCourse] && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal header */}
            <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold mb-1">Chi tiết điểm môn học</h3>
                <p className="text-sm text-blue-100">{courseDetails[selectedCourse].name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDetail}
                className="text-white hover:bg-blue-700/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-center py-3 px-4 font-bold text-sm text-gray-700 border-b">STT</th>
                      <th className="text-left py-3 px-4 font-bold text-sm text-gray-700 border-b">Tên thành phần</th>
                      <th className="text-center py-3 px-4 font-bold text-sm text-gray-700 border-b">Trọng số (%)</th>
                      <th className="text-center py-3 px-4 font-bold text-sm text-gray-700 border-b">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseDetails[selectedCourse].components.map((component) => (
                      <tr key={component.stt} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-center text-gray-900 font-medium">{component.stt}</td>
                        <td className="py-4 px-4 text-gray-900">{component.name}</td>
                        <td className="py-4 px-4 text-center text-gray-900 font-medium">{component.weight}%</td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg">
                            {component.score.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Lưu ý:</span> Điểm tổng kết được tính theo công thức:
                  <span className="font-mono text-blue-700"> (Chuyên cần × 20% + Kiểm tra × 30% + Thi × 50%)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
