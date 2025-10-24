"use client"

import { Card } from "@/app/components/ui/card"
import { CourseCard } from "../../card/page"

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

interface RegisteredCoursesProps {
  courses: Course[]
  onCancelClick: (courseId: string, courseName: string) => void
}

export function RegisteredCourses({ courses, onCancelClick }: RegisteredCoursesProps) {
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)

  return (
    <Card className="text-white pb-4" style={{backgroundColor: '#DBEDFF'}}>
      <div className="text-white px-6 mb-4 py-4 rounded-xl" style={{backgroundColor: '#0053AD'}}>
        <h2 className="font-semibold text-lg mb-2">Học kỳ 1 - Năm học 2025 - 2026</h2>
        <div className="flex gap-8 text-sm mb-6">
          <span>Tổng số tín chỉ: {totalCredits} tín chỉ</span>
          <span>Số môn học: {courses.length} môn học</span>
        </div>
      </div>
      {/* Course cards nested inside semester card */}
      <div className="mx-6 space-y-4">
        {courses.map((course) => (
          <CourseCard key={course.id} {...course} onAction={onCancelClick} actionType="cancel" />
        ))}
      </div>
    </Card>
  )
}