'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Edit2, Save, X } from 'lucide-react';
import { Table, type TableColumn } from '@/app/components/ui/table';
import { validateGrade, formatGrade } from '@/lib/utils/grade-calculator';
import type { InstructorGradeDto } from '../lib/types';
import { GRADE_WEIGHTS, GRADE_RANGE } from '../lib/constants';

interface PendingChanges {
  [enrollmentId: string]: {
    attendanceGrade?: number | null;
    midtermGrade?: number | null;
    finalGrade?: number | null;
    note?: string | null;
  };
}

interface GradesTableProps {
  students: InstructorGradeDto[];
  canEdit: boolean;
  onNoteChange?: (enrollmentId: string, note: string | null) => void;
  onBulkSave?: (changes: PendingChanges) => void;
  onBulkSaveSuccess?: () => void;
  isPending?: boolean;
  isLoading?: boolean;
}

export const GradesTable = ({ students, canEdit, onNoteChange, onBulkSave, onBulkSaveSuccess, isPending = false, isLoading = false }: GradesTableProps) => {
  const t = useTranslations('instructor.grades.table');
  const [editingCell, setEditingCell] = useState<{ enrollmentId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editingNote, setEditingNote] = useState<{ enrollmentId: string } | null>(null);
  const [editNoteValue, setEditNoteValue] = useState<string>('');
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});

  const handleEdit = useCallback((enrollmentId: string, field: string, currentValue: number | null) => {
    if (!canEdit) return;
    setEditingCell({ enrollmentId, field });
    setEditValue(currentValue?.toString() ?? '');
  }, [canEdit]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Cho phép xóa hết
    if (value === '') {
      setEditValue('');
      return;
    }
    
    // Loại bỏ các ký tự không hợp lệ, chỉ giữ số và dấu chấm
    const cleanedValue = value.replace(/[^0-9.]/g, '');
    
    // Chỉ cho phép một dấu chấm
    const parts = cleanedValue.split('.');
    const sanitizedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : cleanedValue;
    
    // Kiểm tra format: chỉ số và một dấu chấm
    const regex = /^\d*\.?\d*$/;
    if (regex.test(sanitizedValue)) {
      setEditValue(sanitizedValue);
    }
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Chặn các ký tự không phải số, dấu chấm và các phím điều khiển
    const char = e.key;
    const isNumber = /[0-9]/.test(char);
    const isDot = char === '.';
    const isControlKey = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(char);
    
    // Cho phép Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    const isPaste = (e.ctrlKey || e.metaKey) && (char === 'v' || char === 'V');
    const isCopy = (e.ctrlKey || e.metaKey) && (char === 'c' || char === 'C');
    const isCut = (e.ctrlKey || e.metaKey) && (char === 'x' || char === 'X');
    const isSelectAll = (e.ctrlKey || e.metaKey) && (char === 'a' || char === 'A');
    
    if (!isNumber && !isDot && !isControlKey && !isPaste && !isCopy && !isCut && !isSelectAll) {
      e.preventDefault();
    }
    
    // Chỉ cho phép một dấu chấm
    if (isDot && editValue.includes('.')) {
      e.preventDefault();
    }
  }, [editValue]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    // Chỉ lấy số và dấu chấm từ text paste
    const cleanedText = pastedText.replace(/[^0-9.]/g, '');
    const parts = cleanedText.split('.');
    const sanitizedText = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : cleanedText;
    
    if (/^\d*\.?\d*$/.test(sanitizedText)) {
      setEditValue(sanitizedText);
    }
  }, []);

  const handleSave = useCallback((enrollmentId: string, field: keyof InstructorGradeDto) => {
    const numValue = editValue === '' ? null : parseFloat(editValue);
    if (editValue !== '' && !validateGrade(numValue)) {
      alert(t('gradeRangeError', { min: GRADE_RANGE.MIN, max: GRADE_RANGE.MAX }));
      return;
    }
    
    // Lưu vào pending changes thay vì gọi API ngay
    setPendingChanges(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: numValue,
      }
    }));
    
    setEditingCell(null);
  }, [editValue, t]);

  const handleCancel = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const handleEditNote = useCallback((enrollmentId: string, currentNote: string | null) => {
    if (!canEdit || !onNoteChange) return;
    setEditingNote({ enrollmentId });
    setEditNoteValue(currentNote || '');
  }, [canEdit, onNoteChange]);

  const handleSaveNote = useCallback((enrollmentId: string) => {
    const noteValue = editNoteValue.trim() || null;
    
    // Lưu vào pending changes thay vì gọi API ngay
    setPendingChanges(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        note: noteValue,
      }
    }));
    
    setEditingNote(null);
    setEditNoteValue('');
  }, [editNoteValue]);

  const handleCancelNote = useCallback(() => {
    setEditingNote(null);
    setEditNoteValue('');
  }, []);

  const handleBulkSave = useCallback(() => {
    if (onBulkSave && Object.keys(pendingChanges).length > 0) {
      onBulkSave(pendingChanges);
      // Không clear pendingChanges ở đây, sẽ clear sau khi API thành công
    }
  }, [pendingChanges, onBulkSave]);

  // Track previous isPending state để detect khi save thành công
  const prevIsPendingRef = useRef(isPending);
  
  // Clear pending changes khi save thành công
  useEffect(() => {
    // Nếu isPending chuyển từ true sang false và có pendingChanges, nghĩa là save thành công
    if (prevIsPendingRef.current && !isPending && Object.keys(pendingChanges).length > 0) {
      const timer = setTimeout(() => {
        setPendingChanges({});
        if (onBulkSaveSuccess) {
          onBulkSaveSuccess();
        }
      }, 300); // Đợi một chút để data được refetch
      return () => clearTimeout(timer);
    }
    prevIsPendingRef.current = isPending;
  }, [isPending, pendingChanges, onBulkSaveSuccess]);

  const getDisplayValue = useCallback((student: InstructorGradeDto, field: 'attendanceGrade' | 'midtermGrade' | 'finalGrade' | 'note') => {
    const pending = pendingChanges[student.enrollmentId];
    if (pending && field in pending) {
      return pending[field as keyof typeof pending];
    }
    return student[field];
  }, [pendingChanges]);

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  const calculateAverage = (student: InstructorGradeDto): number | null => {
    const attendanceGrade = getDisplayValue(student, 'attendanceGrade') as number | null;
    const midtermGrade = getDisplayValue(student, 'midtermGrade') as number | null;
    const finalGrade = getDisplayValue(student, 'finalGrade') as number | null;
    
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

  const renderEditableCell = useCallback((
    student: InstructorGradeDto,
    field: 'attendanceGrade' | 'midtermGrade' | 'finalGrade',
    originalValue: number | null,
    previousValue: number | null
  ) => {
    const isEditing = editingCell?.enrollmentId === student.enrollmentId && editingCell?.field === field;
    const displayValue = getDisplayValue(student, field) as number | null;
    const hasPendingChange = pendingChanges[student.enrollmentId]?.[field] !== undefined;
    const hasChanged = previousValue !== null && originalValue !== previousValue;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            value={editValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave(student.enrollmentId, field);
              if (e.key === 'Escape') handleCancel();
            }}
            placeholder={t('placeholder')}
            className="w-16 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            disabled={isPending}
          />
          <button
            onClick={() => handleSave(student.enrollmentId, field)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Lưu vào danh sách thay đổi"
            disabled={isPending}
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Hủy"
            disabled={isPending}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 group">
        <div className="flex flex-col items-center">
          <span className={`${
            displayValue === null 
              ? 'text-gray-400' 
              : hasPendingChange 
                ? 'text-orange-600 font-medium' 
                : hasChanged 
                  ? 'text-blue-600 font-medium' 
                  : ''
          }`}>
            {formatGrade(displayValue)}
          </span>
          {hasChanged && previousValue !== null && !hasPendingChange && (
            <span className="text-xs text-gray-400 line-through">
              {formatGrade(previousValue)}
            </span>
          )}
          {hasPendingChange && originalValue !== null && displayValue !== originalValue && (
            <span className="text-xs text-gray-400 line-through">
              {formatGrade(originalValue)}
            </span>
          )}
        </div>
        {canEdit && !isPending && (
          <button
            onClick={() => handleEdit(student.enrollmentId, field, displayValue)}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
            title={t('edit')}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }, [
    editingCell,
    editValue,
    canEdit,
    isPending,
    handleEdit,
    handleSave,
    handleCancel,
    getDisplayValue,
    pendingChanges,
    handleInputChange,
    handleKeyPress,
    handlePaste,
    t,
  ]);

  const renderNoteCell = useCallback((student: InstructorGradeDto) => {
    const isEditing = editingNote?.enrollmentId === student.enrollmentId;
    const displayNote = getDisplayValue(student, 'note') as string | null;
    const hasPendingChange = pendingChanges[student.enrollmentId]?.note !== undefined;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={editNoteValue}
            onChange={(e) => setEditNoteValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNote(student.enrollmentId);
              if (e.key === 'Escape') handleCancelNote();
            }}
            className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('note') + '...'}
            autoFocus
            disabled={isPending}
          />
          <button
            onClick={() => handleSaveNote(student.enrollmentId)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Lưu vào danh sách thay đổi"
            disabled={isPending}
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancelNote}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Hủy"
            disabled={isPending}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group">
        <span className={`flex-1 ${hasPendingChange ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
          {displayNote || '-'}
        </span>
        {canEdit && !isPending && (
          <button
            onClick={() => handleEditNote(student.enrollmentId, displayNote)}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
            title={t('edit') + ' ' + t('note')}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }, [
    editingNote,
    editNoteValue,
    canEdit,
    isPending,
    handleEditNote,
    handleSaveNote,
    handleCancelNote,
    getDisplayValue,
    pendingChanges,
    t,
  ]);

  const columns: TableColumn[] = [
    { key: 'mssv', label: t('mssv'), align: 'left' },
    { key: 'fullName', label: t('fullName'), align: 'left' },
    { key: 'attendanceGrade', label: `${t('attendanceGrade')} (${GRADE_WEIGHTS.ATTENDANCE * 100}%)`, align: 'center' },
    { key: 'midtermGrade', label: `${t('midtermGrade')} (${GRADE_WEIGHTS.MIDTERM * 100}%)`, align: 'center' },
    { key: 'finalGrade', label: `${t('finalGrade')} (${GRADE_WEIGHTS.FINAL * 100}%)`, align: 'center' },
    { key: 'average', label: t('average'), align: 'center' },
    { key: 'note', label: t('note'), align: 'left' },
  ];

  const renderRow = (student: InstructorGradeDto) => {
    const average = calculateAverage(student);
    const originalAttendanceGrade = student.attendanceGrade;
    const originalMidtermGrade = student.midtermGrade;
    const originalFinalGrade = student.finalGrade;
    
    return (
      <>
        <td className="px-6 py-4 text-sm text-gray-900">{student.mssv}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{student.fullName}</td>
        <td className="px-6 py-4 text-sm text-center text-gray-900">
          {renderEditableCell(
            student,
            'attendanceGrade',
            originalAttendanceGrade,
            student.previousAttendanceGrade
          )}
        </td>
        <td className="px-6 py-4 text-sm text-center text-gray-900">
          {renderEditableCell(student, 'midtermGrade', originalMidtermGrade, student.previousMidtermGrade)}
        </td>
        <td className="px-6 py-4 text-sm text-center text-gray-900">
          {renderEditableCell(student, 'finalGrade', originalFinalGrade, student.previousFinalGrade)}
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
        <td className="px-6 py-4 text-sm">
          {renderNoteCell(student)}
        </td>
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm relative">
      {/* Save button for pending changes */}
      {hasPendingChanges && onBulkSave && (
        <div className="p-4 border-b border-gray-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-orange-700 font-medium">
                {t('unsavedChanges', { count: Object.keys(pendingChanges).length })}
              </span>
            </div>
            <button
              onClick={handleBulkSave}
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {t('saveAll')}
            </button>
          </div>
        </div>
      )}
      
      {/* Show overlay spinner when saving or refetching */}
      {(isPending || (isLoading && students.length > 0)) && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-sm text-gray-600 font-medium">
              {isPending ? t('saving') : t('loading')}
            </p>
          </div>
        </div>
      )}
      <Table 
        columns={columns} 
        data={students} 
        renderRow={renderRow} 
        emptyMessage={t('noStudents')}
        isLoading={isLoading && students.length === 0}
        loadingMessage={t('loadingGrades')}
      />
    </div>
  );
};







