'use client';

import { Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import type { Course } from '../lib/types/types';
import { getStatusDisplay } from '../lib/types/types';

interface ViewCourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export const ViewCourseDetailModal = ({ isOpen, onClose, course }: ViewCourseDetailModalProps) => {
  if (!isOpen || !course) return null;

  const statusDisplay = getStatusDisplay(course.status);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Xem chi tiết lớp học phần</h2>
              <p className="text-sm text-gray-600 mt-1">Xem thông tin chi tiết của lớp học phần</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Mã lớp học phần */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Mã lớp học phần
              </label>
              <Input
                value={course.courseCode}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Tên môn học */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tên môn học
              </label>
              <Input
                value={course.subjectName}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Tên giảng viên */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tên giảng viên
              </label>
              <Input
                value={course.lecturerName}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Sĩ số tối đa */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Sĩ số tối đa
              </label>
              <Input
                value={course.maxEnrollment || course.enrollment}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Học kỳ */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Học kỳ
              </label>
              <Input
                value={course.semester}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Sĩ số hiện tại */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Sĩ số hiện tại
              </label>
              <Input
                value={course.enrollment}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Trạng thái */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Trạng thái
              </label>
              <Input
                value={statusDisplay.label}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
          >
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
};


