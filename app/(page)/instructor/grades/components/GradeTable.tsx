'use client';

import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { StudentGrade } from '../lib/types/types';
import { Table, type TableColumn } from '@/app/components/ui/table';

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

  const columns: TableColumn<StudentGrade>[] = [
    { key: 'studentCode', label: 'MSSV', align: 'left' },
    { key: 'fullName', label: 'Họ và tên', align: 'left' },
    { key: 'className', label: 'Khóa', align: 'center' },
    { key: 'classCode', label: 'Lớp', align: 'center' },
    { key: 'attendanceScore', label: 'Chuyên cần (20%)', align: 'center' },
    { key: 'midtermScore', label: 'Giữa kỳ (30%)', align: 'center' },
    { key: 'finalScore', label: 'Cuối kỳ (50%)', align: 'center' },
    { key: 'average', label: 'Trung bình', align: 'center' },
  ];

  const renderStudentRow = (student: StudentGrade) => {
    const average = calculateAverage(student);
    return (
      <>
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
      </>
    );
  };

  return (
    <Table
      columns={columns}
      data={students}
      renderRow={renderStudentRow}
      emptyMessage="Không có sinh viên nào"
    />
  );
};

export default GradeTable;

