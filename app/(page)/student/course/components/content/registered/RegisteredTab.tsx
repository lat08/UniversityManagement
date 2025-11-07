// Path: components/content/registered/RegisteredTab.tsx

"use client"

import { Card } from "@/app/components/ui/card"
import { CourseCard } from "../../card/CourseCard"
import { RegisteredCoursesProps } from "../../../lib/type/courseType"
import { Button } from "@/app/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"



interface RegisteredCoursesWithPaginationProps extends RegisteredCoursesProps {
  paginatedCourses?: RegisteredCoursesProps["courses"]; // optional for backward compatibility
  pagination?: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  goToPage?: (page: number) => void;
  changePageSize?: (size: number) => void;
}

export function RegisteredCourses({ 
  courses, 
  loading, 
  onCancelClick,
  paginatedCourses,
  pagination,
  goToPage,
  // changePageSize, // (reserved for page size selector feature)
}: RegisteredCoursesWithPaginationProps) {

  if (loading) {
    return <div className="text-center py-8">Đang tải danh sách môn học đã đăng ký...</div>
  }

  const displayCourses = paginatedCourses ?? courses;

  const totalCredits = (courses ?? []).reduce((sum, course) => sum + course.credits, 0)

  return (
    <Card className="text-white pb-4" style={{backgroundColor: '#DBEDFF'}}>
      <div className="text-white px-6 mb-4 py-4 rounded-xl" style={{backgroundColor: '#0053AD'}}>
        <h2 className="font-semibold text-lg mb-2">Học kỳ 1 - Năm học 2025 - 2026</h2>
        <div className="flex flex-wrap gap-8 text-sm mb-6">
          <span>Tổng số tín chỉ: {totalCredits} tín chỉ</span>
          <span>Số môn học: {courses.length} môn học</span>
          {pagination && (
            <span>Trang {pagination.pageNumber}/{pagination.totalPages}</span>
          )}
        </div>
      </div>

      <div className="mx-6 space-y-4">
        {displayCourses.length === 0 && <p className="text-gray-600">Chưa có môn học nào được đăng ký.</p>}
        {displayCourses.map((course) => (
          <CourseCard
            key={course.courseId}
            {...course}
            onAction={(courseId) => onCancelClick(courseId, course.subjectName)}
            actionType="cancel"
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && goToPage && (
        <div className="mx-6 mt-6 flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-700">
            Hiển thị {((pagination.pageNumber - 1) * pagination.pageSize) + 1} - {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)} trong tổng số {pagination.totalCount} môn học
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.pageNumber - 1)}
              disabled={!pagination.hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Trước
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.pageNumber <= 3) {
                  pageNum = i + 1;
                } else if (pagination.pageNumber >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.pageNumber - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className={pageNum === pagination.pageNumber ? "bg-[var(--primary)] text-white" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.pageNumber + 1)}
              disabled={!pagination.hasNext}
            >
              Sau <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}