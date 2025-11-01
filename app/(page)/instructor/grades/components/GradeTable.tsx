'use client';

import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { StudentGrade } from '../lib/types/types';

interface GradeTableProps {
  students: StudentGrade[];
  isLocked: boolean;
  onGradeChange: (studentId: string, field: keyof StudentGrade, value: number | null) => void;
}

const GradeTable: React.FC<GradeTableProps> = ({ students, isLocked, onGradeChange }) => {
  const [editingCell, setEditingCell] = useState<{ studentId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleEdit = (studentId: string, field: string, currentValue: number | null) => {
    if (isLocked) return;
    setEditingCell({ studentId, field });
    setEditValue(currentValue?.toString() ?? '');
  };

  const handleSave = (studentId: string, field: keyof StudentGrade) => {
    const numValue = editValue === '' ? null : parseFloat(editValue);
    if (numValue !== null && (numValue < 0 || numValue > 10)) {
      alert('Điểm phải nằm trong khoảng 0-10');
      return;
    }
    onGradeChange(studentId, field, numValue);
    setEditingCell(null);
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const calculateAverage = (student: StudentGrade): number | null => {
    const { attendanceScore, midtermScore, finalScore } = student;
    if (attendanceScore === null || midtermScore === null || finalScore === null) {
      return null;
    }
    return parseFloat((attendanceScore * 0.2 + midtermScore * 0.3 + finalScore * 0.5).toFixed(1));
  };

  const renderEditableCell = (
    student: StudentGrade,
    field: 'attendanceScore' | 'midtermScore' | 'finalScore',
    value: number | null
  ) => {
    const isEditing = editingCell?.studentId === student.studentId && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave(student.studentId, field);
              if (e.key === 'Escape') handleCancel();
            }}
            className="w-16 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={() => handleSave(student.studentId, field)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Lưu"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Hủy"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 group">
        <span className={value === null ? 'text-gray-400' : ''}>
          {value !== null ? value.toFixed(1) : '-'}
        </span>
        {!isLocked && (
          <button
            onClick={() => handleEdit(student.studentId, field, value)}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
            title="Chỉnh sửa"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              MSSV
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Họ và tên
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
              Khóa
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
              Lớp
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
              Chuyên cần<br />(20%)
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
              Giữa kỳ<br />(30%)
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
              Cuối kỳ<br />(50%)
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
              Trung bình
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => {
            const average = calculateAverage(student);
            return (
              <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {student.studentCode}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {student.fullName}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-600">
                  {student.className}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-600">
                  {student.classCode}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-900">
                  {renderEditableCell(student, 'attendanceScore', student.attendanceScore)}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-900">
                  {renderEditableCell(student, 'midtermScore', student.midtermScore)}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-900">
                  {renderEditableCell(student, 'finalScore', student.finalScore)}
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <span className={`font-medium ${average !== null && average >= 5 ? 'text-green-600' : average !== null ? 'text-red-600' : 'text-gray-400'}`}>
                    {average !== null ? average.toFixed(1) : '-'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GradeTable;

