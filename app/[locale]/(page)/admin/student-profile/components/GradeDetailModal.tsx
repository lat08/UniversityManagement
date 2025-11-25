'use client';

import { X } from 'lucide-react';
import { Grade } from '../lib/types/types';

interface GradeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: Grade | null;
}

export const GradeDetailModal = ({ isOpen, onClose, grade }: GradeDetailModalProps) => {
  if (!isOpen || !grade) return null;

  const formatGrade = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết điểm môn học</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Subject Info */}
          <div className="mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{grade.subjectName}</h3>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Mã môn học:</span> {grade.subjectCode}
                </div>
                <div>
                  <span className="font-medium">Số tín chỉ:</span> {grade.credits}
                </div>
                <div>
                  <span className="font-medium">Học kỳ:</span> {grade.semesterName}
                </div>
              </div>
            </div>
          </div>

          {/* Grades Detail */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-900 mb-3">Chi tiết điểm</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Điểm chuyên cần */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Điểm chuyên cần</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatGrade(grade.attendanceGrade)}
                </p>
              </div>

              {/* Điểm giữa kỳ */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Điểm giữa kỳ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatGrade(grade.midtermGrade)}
                </p>
              </div>

              {/* Điểm cuối kỳ */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Điểm cuối kỳ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatGrade(grade.finalGrade)}
                </p>
              </div>

              {/* Điểm tổng kết (10) */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Điểm tổng kết (10)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatGrade(grade.finalGrade10)}
                </p>
              </div>
            </div>

            {/* Final Results */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Điểm thang 4</p>
                  <p className="text-3xl font-bold text-[#0053AD]">
                    {grade.finalGrade4.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Điểm chữ</p>
                  <p className="text-3xl font-bold text-[#0053AD]">
                    {grade.gradeLetter}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Kết quả</p>
                  <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-lg ${
                    grade.status === 'Đạt' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {grade.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

