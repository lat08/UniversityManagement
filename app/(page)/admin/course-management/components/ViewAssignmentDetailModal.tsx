'use client';

import { Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import type { FacultyAssignment } from '../lib/types/types';
import { format } from 'date-fns';

interface ViewAssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: FacultyAssignment | null;
}

export const ViewAssignmentDetailModal = ({ isOpen, onClose, assignment }: ViewAssignmentDetailModalProps) => {
  if (!isOpen || !assignment) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formattedDate = assignment.effectiveDate
    ? (() => {
        try {
          return format(new Date(assignment.effectiveDate), 'dd/MM/yyyy');
        } catch {
          return assignment.effectiveDate;
        }
      })()
    : '';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết phân công giảng viên</h2>
              <p className="text-sm text-gray-600 mt-1">Xem thông tin chi tiết về phân công giảng viên</p>
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
          {/* Mã */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
              Mã: {assignment.courseCode}
            </span>
          </div>

          <div className="space-y-6">
            {/* Môn học */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Môn học
              </label>
              <Input
                value={assignment.courseName}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Giảng viên phụ trách */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Giảng viên phụ trách
              </label>
              <Input
                value={assignment.instructorName}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Ngày áp dụng */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngày áp dụng
              </label>
              <Input
                value={formattedDate}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ghi chú
              </label>
              <textarea
                value={assignment.notes}
                disabled
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};


