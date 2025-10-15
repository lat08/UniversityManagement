"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Card } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { CourseCard } from "@/app/components/courses/card/page"

interface Course {
  id: string
  name: string
  code: string
  credits: number
  instructor: string
  room: string
  startDate: string
  endDate: string
  schedule: string
  studentCount?: string
}

interface AvailableCoursesProps {
  courses: Course[]
  onRegisterClick: (courseId: string, courseName: string) => void
}

export function AvailableCourses({ courses, onRegisterClick }: AvailableCoursesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterValue, setFilterValue] = useState("all")

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)

  return (
    <div className="space-y-4">
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, mã môn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterValue} onValueChange={setFilterValue}>
          <SelectTrigger className="w-full sm:w-[320px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Môn học trong chương trình đào tạo kế hoạch</SelectItem>
            <SelectItem value="23dpm">Môn học mở trong lớp 23DPM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Semester card with nested course cards */}
      <Card className="bg-blue-100 text-white pb-4">
        <div className="bg-blue-500 text-white px-6 mb-4 py-4 rounded-xl">
          <h2 className="font-semibold text-lg mb-2">Học kỳ 1 - Năm học 2025 - 2026</h2>
          <div className="flex gap-8 text-sm mb-6">
            <span>Tổng số tín chỉ: {totalCredits} tín chỉ</span>
            <span>Số môn học: {filteredCourses.length} môn học</span>
          </div>
        </div>

        {/* Course cards nested inside semester card */}
        <div className="mx-6 space-y-4">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} {...course} onAction={onRegisterClick} actionType="register" />
          ))}
        </div>
      </Card>
    </div>
  )
}
