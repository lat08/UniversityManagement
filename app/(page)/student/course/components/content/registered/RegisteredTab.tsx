// Path: components/content/registered/RegisteredTab.tsx

"use client"

import { Card } from "@/app/components/ui/card"
import { CourseCard } from "../../card/CourseCard"
import { RegisteredCoursesProps } from "../../../lib/type/courseType"



export function RegisteredCourses({ courses,loading, onCancelClick }: RegisteredCoursesProps) {
  
  if (loading) {
      return <div className="text-center py-8">Đang tải danh sách môn học đã đăng ký...</div>
  }
  
  // Dùng toán tử Nullish ?? [] để đảm bảo courses là mảng trước khi dùng reduce
  const totalCredits = (courses ?? []).reduce((sum, course) => sum + course.credits, 0)

  return (
    <Card className="text-white pb-4" style={{backgroundColor: '#DBEDFF'}}>
      <div className="text-white px-6 mb-4 py-4 rounded-xl" style={{backgroundColor: '#0053AD'}}>
        <h2 className="font-semibold text-lg mb-2">Học kỳ 1 - Năm học 2025 - 2026</h2>
        <div className="flex gap-8 text-sm mb-6">
          <span>Tổng số tín chỉ: {totalCredits} tín chỉ</span>
          <span>Số môn học: {courses.length} môn học</span>
        </div>
      </div>
      
      <div className="mx-6 space-y-4">
        {courses.length === 0 && <p className="text-gray-600">Chưa có môn học nào được đăng ký.</p>}
        {courses.map((course) => (
          <CourseCard 
            key={course.courseId} 
            {...course} 
            // Truyền ID và Tên môn qua onAction, CourseCard sẽ gọi onCancelClick
            onAction={(courseId, courseName) => onCancelClick(courseId, course.subjectName)} 
            actionType="cancel" 
          />
        ))}
      </div>
    </Card>
  )
}