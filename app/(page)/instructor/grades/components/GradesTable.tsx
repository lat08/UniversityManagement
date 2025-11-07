'use client';

import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Table, type TableColumn } from '@/app/components/ui/table';
import type { InstructorGradeDto } from '../lib/types';
import { GRADE_WEIGHTS, GRADE_RANGE } from '../lib/constants';

interface GradesTableProps {
  students: InstructorGradeDto[];
  canEdit: boolean;
  onGradeChange: (enrollmentId: string, field: keyof InstructorGradeDto, value: number | null) => void;
}

export const GradesTable = ({ students, canEdit, onGradeChange }: GradesTableProps) => {
  const [editingCell, setEditingCell] = useState<{ enrollmentId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleEdit = (enrollmentId: string, field: string, currentValue: number | null) => {
    if (!canEdit) return;
    setEditingCell({ enrollmentId, field });
    setEditValue(currentValue?.toString() ?? '');
  };

  const handleSave = (enrollmentId: string, field: keyof InstructorGradeDto) => {
    const numValue = editValue === '' ? null : parseFloat(editValue);
    if (numValue !== null && (numValue < GRADE_RANGE.MIN || numValue > GRADE_RANGE.MAX)) {
      alert(`Điểm phải nằm trong khoảng ${GRADE_RANGE.MIN}-${GRADE_RANGE.MAX}`);
      return;
    }
    onGradeChange(enrollmentId, field, numValue);
    setEditingCell(null);
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const calculateAverage = (student: InstructorGradeDto): number | null => {
    const { attendanceGrade, midtermGrade, finalGrade } = student;
    if (attendanceGrade === null || midtermGrade === null || finalGrade === null) {
      return null;
    }
    return parseFloat(
      (
        attendanceGrade * GRADE_WEIGHTS.ATTENDANCE +
        midtermGrade * GRADE_WEIGHTS.MIDTERM +
        finalGrade * GRADE_WEIGHTS.FINAL
      ).toFixed(1)
    );
  };

  const renderEditableCell = (
    student: InstructorGradeDto,
    field: 'attendanceGrade' | 'midtermGrade' | 'finalGrade',
    value: number | null,
    previousValue: number | null
  ) => {
    const isEditing = editingCell?.enrollmentId === student.enrollmentId && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.1"
            min={GRADE_RANGE.MIN}
            max={GRADE_RANGE.MAX}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave(student.enrollmentId, field);
              if (e.key === 'Escape') handleCancel();
            }}
            className="w-16 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={() => handleSave(student.enrollmentId, field)}
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

    const hasChanged = previousValue !== null && value !== previousValue;

    return (
      <div className="flex items-center justify-center gap-2 group">
        <div className="flex flex-col items-center">
          <span className={value === null ? 'text-gray-400' : hasChanged ? 'text-blue-600 font-medium' : ''}>
            {value !== null ? value.toFixed(1) : '-'}
          </span>
          {hasChanged && previousValue !== null && (
            <span className="text-xs text-gray-400 line-through">
              {previousValue.toFixed(1)}
            </span>
          )}
        </div>
        {canEdit && (
          <button
            onClick={() => handleEdit(student.enrollmentId, field, value)}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
            title="Chỉnh sửa"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  const columns: TableColumn<InstructorGradeDto>[] = [
    { key: 'mssv', label: 'MSSV', align: 'left' },
    { key: 'fullName', label: 'Họ và tên', align: 'left' },
    { key: 'attendanceGrade', label: `Chuyên cần (${GRADE_WEIGHTS.ATTENDANCE * 100}%)`, align: 'center' },
    { key: 'midtermGrade', label: `Giữa kỳ (${GRADE_WEIGHTS.MIDTERM * 100}%)`, align: 'center' },
    { key: 'finalGrade', label: `Cuối kỳ (${GRADE_WEIGHTS.FINAL * 100}%)`, align: 'center' },
    { key: 'average', label: 'Trung bình', align: 'center' },
    { key: 'note', label: 'Ghi chú', align: 'left' },
  ];

  const renderRow = (student: InstructorGradeDto) => {
    const average = calculateAverage(student);
    return (
      <>
        <td className="px-6 py-4 text-sm text-gray-900">{student.mssv}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{student.fullName}</td>
        <td className="px-6 py-4 text-sm text-center text-gray-900">
          {renderEditableCell(
            student,
            'attendanceGrade',
            student.attendanceGrade,
            student.previousAttendanceGrade
          )}
        </td>
        <td className="px-6 py-4 text-sm text-center text-gray-900">
          {renderEditableCell(student, 'midtermGrade', student.midtermGrade, student.previousMidtermGrade)}
        </td>
        <td className="px-6 py-4 text-sm text-center text-gray-900">
          {renderEditableCell(student, 'finalGrade', student.finalGrade, student.previousFinalGrade)}
        </td>
        <td className="px-6 py-4 text-sm text-center">
          <span
            className={`font-medium ${
              average !== null && average >= 5
                ? 'text-green-600'
                : average !== null
                  ? 'text-red-600'
                  : 'text-gray-400'
            }`}
          >
            {average !== null ? average.toFixed(1) : '-'}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">{student.note || '-'}</td>
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <Table columns={columns} data={students} renderRow={renderRow} emptyMessage="Không có sinh viên nào" />
    </div>
  );
};






