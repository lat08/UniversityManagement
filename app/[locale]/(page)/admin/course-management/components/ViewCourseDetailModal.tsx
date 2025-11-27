'use client';

import { Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import type { Course } from '../lib/types/types';
import { getStatusDisplay } from '../lib/types/types';
import { useTranslations } from 'next-intl';

interface ViewCourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export const ViewCourseDetailModal = ({ isOpen, onClose, course }: ViewCourseDetailModalProps) => {
  if (!isOpen || !course) return null;

  const t = useTranslations('admin.courseManagement');
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Xem chi tiết học phần</h2>
              <p className="text-sm text-gray-600 mt-1">Xem thông tin chi tiết của học phần</p>
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
            {/* Mã học phần */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Mã học phần
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

            {/* Học phí/tín chỉ */}
            {typeof course.feePerCredit === 'number' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Học phí/tín chỉ
                </label>
                <Input
                  value={course.feePerCredit.toLocaleString('vi-VN')}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )}

            {/* Tổng học phí */}
            {typeof course.totalFee === 'number' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tổng học phí
                </label>
                <Input
                  value={course.totalFee.toLocaleString('vi-VN')}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )}

            {/* Tổng số lớp học phần */}
            {typeof course.totalClasses === 'number' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tổng số lớp học phần
                </label>
                <Input
                  value={course.totalClasses}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )}

            {/* Tổng số sinh viên */}
            {typeof course.totalStudents === 'number' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tổng số sinh viên
                </label>
                <Input
                  value={course.totalStudents}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )}
          </div>

          {/* Danh sách lớp học phần */}
          {course.courseClasses && course.courseClasses.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('courseClassesTitle')}
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 flex divide-x divide-gray-200">
                  <div className="flex-1 text-center">{t('classColumns.classCode')}</div>
                  <div className="flex-1 text-center">{t('classColumns.instructor')}</div>
                  <div className="flex-1 text-center">{t('classColumns.room')}</div>
                  <div className="flex-[1.5] text-center">{t('classColumns.time')}</div>
                  <div className="flex-1 text-center">{t('classColumns.enrollment')}</div>
                </div>
                <div className="divide-y divide-gray-200">
                  {course.courseClasses.map((cc) => (
                    <div
                      key={cc.courseClassId}
                      className="px-4 py-3 text-sm text-gray-800 flex items-center divide-x divide-gray-100"
                    >
                      <div className="flex-1 font-medium text-center truncate">{cc.courseClassCode}</div>
                      <div className="flex-1 text-center truncate">
                        {cc.instructorName || 'Chưa phân công'}
                      </div>
                      <div className="flex-1 text-center truncate">{cc.room}</div>
                      <div className="flex-[1.5] text-center text-gray-600 leading-snug">
                        <div>
                          {cc.startDate} - {cc.endDate}
                        </div>
                        <div>
                          Thứ {cc.dayOfWeek}, tiết {cc.startPeriod}-{cc.endPeriod}
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        {cc.enrolledStudents}/{cc.maximumStudents} Sinh viên
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
};


