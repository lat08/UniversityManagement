// Path: components/content/register/RegisterTab.tsx

"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Card } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { CourseCard } from "../../card/CourseCard"
import { AvailableCoursesProps } from "../../../lib/type/courseType"
import { useAvailableCourses } from "../../../lib/hooks/useAvailableCourses"; // <-- Hook đã sửa



export function AvailableCourses({ onRegisterClick }: AvailableCoursesProps) {
  // Tự fetch data bên trong
  const { courses, loading, error } = useAvailableCourses(); 
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"all" | "subject" | "course">("all")

  // Xử lý Loading State
  if (loading) {
      return <div className="text-center py-8">Đang tải danh sách môn học...</div>
  }
  
  // Xử lý Error State
  if (error) {
       return <div className="text-red-500 text-center py-8">{error}</div>
  }
  
  // Dùng courses (đã đảm bảo là Array hoặc [] sau khi fetch)
  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    
    if (searchType === "all") {
      return (
        course.subjectName.toLowerCase().includes(query) ||
        course.subjectCode.toLowerCase().includes(query) ||
        course.instructorName.toLowerCase().includes(query)
      )
    } else if (searchType === "subject") {
      return (
        course.subjectName.toLowerCase().includes(query) ||
        course.subjectCode.toLowerCase().includes(query)
      )
    } else if (searchType === "course") {
      return course.instructorName.toLowerCase().includes(query)
    }
    
    return true
  })

  const totalCredits = filteredCourses.reduce((sum, course) => sum + course.credits, 0) // Dùng filteredCourses

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={
              searchType === "all" 
                ? "Tìm kiếm theo tên môn, mã môn, hoặc giảng viên..." 
                : searchType === "subject"
                ? "Tìm kiếm theo tên môn hoặc mã môn..."
                : "Tìm kiếm theo tên giảng viên..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 cursor-text"
          />
        </div>
        <Select value={searchType} onValueChange={(value: "all" | "subject" | "course") => setSearchType(value)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Lọc theo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="subject">Môn học</SelectItem>
            <SelectItem value="course">Khóa học (Giảng viên)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Semester card with nested course cards */}
      <Card className="text-white pb-4 bg-[var(--primary-light)]">
        <div className="text-white px-6 mb-4 py-4 rounded-xl bg-[var(--primary)]">
          <h2 className="font-semibold text-lg mb-2">Học kỳ 1 - Năm học 2025 - 2026</h2>
          <div className="flex gap-8 text-sm mb-6">
            <span>Tổng số tín chỉ: {totalCredits} tín chỉ</span>
            <span>Số môn học: {filteredCourses.length} môn học</span>
          </div>
        </div>

        {/* Course cards nested inside semester card */}
        <div className="mx-6 space-y-4">
          {filteredCourses.length === 0 && <p className="text-gray-600">Không tìm thấy môn học nào.</p>}
          {filteredCourses.map((course) => (
            <CourseCard 
                key={course.courseId} 
                {...course} 
                // Truyền onAction: gọi onRegisterClick với courseId
                onAction={(courseId) => onRegisterClick(courseId)} 
                actionType="register" // Mặc định là register
            />
          ))}
        </div>
      </Card>
    </div>
  )
}