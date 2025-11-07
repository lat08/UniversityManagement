'use client';

import { useState } from 'react';
import { X, AlertCircle, CheckCircle, Send } from 'lucide-react';

interface SubmitApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => void;
  totalStudents: number;
  studentsWithGrades: number;
  courseName: string;
}

export const SubmitApprovalDialog = ({
  isOpen,
  onClose,
  onConfirm,
  totalStudents,
  studentsWithGrades,
  courseName,
}: SubmitApprovalDialogProps) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const isComplete = studentsWithGrades === totalStudents;

  const handleConfirm = () => {
    onConfirm(note || undefined);
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Xác nhận gửi duyệt bảng điểm</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-center mb-4">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isComplete ? 'bg-green-100' : 'bg-orange-100'
              }`}
            >
              {isComplete ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <AlertCircle className="w-12 h-12 text-orange-600" />
              )}
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-700 font-medium">
              {isComplete
                ? 'Bảng điểm sẽ được gửi đến quản trị viên để duyệt. Hãy chắc chắn tất cả thông tin đã chính xác.'
                : 'Bảng điểm chưa hoàn tất. Hãy kiểm tra lại trước khi gửi duyệt.'}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Môn học:</span>
              <span className="text-gray-900 font-semibold">{courseName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Tổng sinh viên:</span>
              <span className="text-gray-900 font-semibold">{totalStudents}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Đã nhập điểm:</span>
              <span
                className={`font-semibold ${
                  isComplete ? 'text-green-600' : 'text-orange-600'
                }`}
              >
                {studentsWithGrades}/{totalStudents}
              </span>
            </div>
          </div>

          {!isComplete && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Một số sinh viên chưa có điểm đầy đủ. Vui lòng kiểm tra lại trước khi gửi duyệt.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú cho quản trị viên..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Gửi duyệt
          </button>
        </div>
      </div>
    </div>
  );
};






