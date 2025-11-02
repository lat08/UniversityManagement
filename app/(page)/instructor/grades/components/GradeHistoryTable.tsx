'use client';

import React from 'react';
import { GradeHistory } from '../lib/types/types';
import { Clock } from 'lucide-react';

interface GradeHistoryTableProps {
  history: GradeHistory[];
}

const GradeHistoryTable: React.FC<GradeHistoryTableProps> = ({ history }) => {
  const getFieldName = (field: string) => {
    const fieldMap: Record<string, string> = {
      attendanceScore: 'Điểm chuyên cần',
      midtermScore: 'Điểm giữa kỳ',
      finalScore: 'Điểm cuối kỳ',
      averageScore: 'Điểm trung bình',
    };
    return fieldMap[field] || field;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">Lịch sử thay đổi</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">Theo dõi các thay đổi điểm số</p>
      </div>
      <div className="px-6 py-4">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0053AD] text-white text-sm">
                  <th className="px-6 py-4 text-left font-semibold">Mã SV</th>
                  <th className="px-6 py-4 text-left font-semibold">Tên sinh viên</th>
                  <th className="px-6 py-4 text-left font-semibold">Loại điểm</th>
                  <th className="px-6 py-4 text-center font-semibold">Giá trị cũ</th>
                  <th className="px-6 py-4 text-center font-semibold">Giá trị mới</th>
                  <th className="px-6 py-4 text-left font-semibold">Người sửa</th>
                  <th className="px-6 py-4 text-left font-semibold">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Chưa có lịch sử thay đổi
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.studentCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {getFieldName(item.field)}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-700">
                        {item.oldValue !== null ? item.oldValue.toFixed(1) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-medium text-[#0053AD]">
                        {item.newValue !== null ? item.newValue.toFixed(1) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.changedBy}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(item.changedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeHistoryTable;

