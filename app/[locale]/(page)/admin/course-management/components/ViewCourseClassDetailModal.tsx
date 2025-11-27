'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import { coursesApi } from '../lib/api/coursesApi';
import { getStatusDisplay } from '../lib/types/types';
import { useTranslations } from 'next-intl';

interface ViewCourseClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseClassId: string | null;
}

interface CourseClassDetail {
  courseClassId: string;
  courseClassCode: string;
  subjectName: string;
  instructorName?: string;
  instructorId?: string;
  studentsEnrolled: number;
  maxStudents: number;
  semesterName: string;
  courseClassStatus: string;
  roomId?: string;
  startDate: string;
}

export const ViewCourseClassDetailModal = ({ isOpen, onClose, courseClassId }: ViewCourseClassDetailModalProps) => {
  const [courseClassDetail, setCourseClassDetail] = useState<CourseClassDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('admin.courseManagement');

  useEffect(() => {
    if (isOpen && courseClassId) {
      setLoading(true);
      coursesApi.getCourseClassDetail(courseClassId)
        .then((response) => {
          if (response.success && response.data) {
            setCourseClassDetail(response.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching course class detail:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCourseClassDetail(null);
    }
  }, [isOpen, courseClassId]);

  if (!isOpen || !courseClassId) return null;

  const statusDisplay = courseClassDetail ? getStatusDisplay(courseClassDetail.courseClassStatus as 'active' | 'inactive') : null;

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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : courseClassDetail ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Mã lớp học phần */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mã lớp học phần
                </label>
                <Input
                  value={courseClassDetail.courseClassCode}
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
                  value={courseClassDetail.subjectName}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Giảng viên */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Giảng viên
                </label>
                <Input
                  value={courseClassDetail.instructorName || 'Chưa phân công'}
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
                  value={courseClassDetail.semesterName}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Ngày bắt đầu */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Ngày bắt đầu
                </label>
                <Input
                  value={courseClassDetail.startDate}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Số lượng sinh viên */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Số lượng sinh viên
                </label>
                <Input
                  value={`${courseClassDetail.studentsEnrolled ?? 0}/${courseClassDetail.maxStudents ?? 0}`}
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
                  value={statusDisplay?.label || courseClassDetail.courseClassStatus || 'N/A'}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Không tìm thấy thông tin lớp học phần</div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

