"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui"
import { CourseDto } from "../../lib/type/courseType"
import { X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface CourseDetailModalProps {
  isOpen: boolean
  onClose: () => void
  course: CourseDto | null
}

export function CourseDetailModal({ isOpen, onClose, course }: CourseDetailModalProps) {
  if (!course) return null

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch {
      return dateString
    }
  }

  const formatSchedule = () => {
    if (!course.weeklySchedules || course.weeklySchedules.length === 0) {
      return "Chưa có thời khóa biểu"
    }

    return course.weeklySchedules
      .map(schedule => 
        `${schedule.dayOfWeekName}, tiết ${schedule.startPeriod} - ${schedule.endPeriod}, phòng ${schedule.roomCode}`
      )
      .join(", ")
  }

  const getStatusColor = () => {
    if (course.courseStatus === 'Đã đăng kí' || course.courseStatus === 'Registered') {
      return 'text-green-600 bg-green-50'
    }
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Chi tiết môn học
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Hiển thị thông tin chi tiết môn học
          </p>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã môn
              </label>
              <input
                type="text"
                value={course.subjectCode}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên môn
              </label>
              <input
                type="text"
                value={course.subjectName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tín chỉ
              </label>
              <input
                type="text"
                value={course.credits}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lớp
              </label>
              <input
                type="text"
                value={course.subjectCode.slice(-5) || 'N/A'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giảng viên
            </label>
            <input
              type="text"
              value={course.instructorName}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời khóa biểu
            </label>
            <input
              type="text"
              value={formatSchedule()}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <div className={`w-full px-3 py-2 border border-gray-300 rounded-lg font-medium ${getStatusColor()}`}>
                {course.courseStatus}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày đăng ký
              </label>
              <input
                type="text"
                value={formatDate(course.startDate)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
