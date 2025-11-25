'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Download, X, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { toast } from 'react-hot-toast';
import { gradeApprovalsApi } from '../lib/api/gradeApprovalsApi';
import { ExportGradeApprovalsParams, GradeApprovalDropdownContext } from '../lib/types/types';
import { APPROVAL_STATUS_OPTIONS } from '../lib/types/types';

interface ExportGradeApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ExportGradeApprovalsParams;
  dropdowns: GradeApprovalDropdownContext;
}

export default function ExportGradeApprovalModal({
  isOpen,
  onClose,
  filters,
  dropdowns,
}: ExportGradeApprovalModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleClose = useCallback(() => {
    if (!isExporting) {
      onClose();
    }
  }, [isExporting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isExporting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isExporting, handleClose]);

  const handleExport = async (e: FormEvent) => {
    e.preventDefault();
    
    setIsExporting(true);
    try {
      const blob = await gradeApprovalsApi.exportGradeApprovals(filters);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grade_approvals_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Xuất file thành công');
      handleClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Xuất file thất bại');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const matchedStatus = APPROVAL_STATUS_OPTIONS.find(
    (option) => option.value === (filters.versionStatus || ''),
  );
  const semesterLabel = dropdowns.semesters.find(
    (semester) => semester.semesterId === filters.semesterId,
  )?.semesterName;
  const subjectLabel = dropdowns.subjects.find(
    (subject) => subject.subjectId === filters.subjectId,
  )?.subjectName;
  const courseClassLabel = dropdowns.courseClasses.find(
    (courseClass) => courseClass.courseClassId === filters.courseClassId,
  )?.courseClassCode;
  const facultyLabel = dropdowns.faculties.find(
    (faculty) => faculty.facultyId === filters.facultyId,
  )?.facultyName;
  const departmentLabel = dropdowns.departments.find(
    (department) => department.departmentId === filters.departmentId,
  )?.departmentName;
  const instructorLabel = dropdowns.instructors.find(
    (instructor) => instructor.instructorId === filters.instructorId,
  )?.fullName;

  const summaryRows = [
    {
      label: 'Trạng thái',
      value: matchedStatus?.label,
    },
    { label: 'Học kỳ', value: semesterLabel },
    { label: 'Môn học', value: subjectLabel },
    { label: 'Lớp học phần', value: courseClassLabel },
    { label: 'Khoa', value: facultyLabel },
    { label: 'Bộ môn', value: departmentLabel },
    { label: 'Giảng viên', value: instructorLabel },
    {
      label: 'Từ khóa',
      value: filters.searchKey,
    },
  ].filter((row) => row.value);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isExporting) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Xuất danh sách duyệt bảng điểm</h2>
              <p className="text-sm text-gray-600 mt-1">Xuất dữ liệu duyệt bảng điểm ra file Excel</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isExporting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleExport} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {/* Export Info Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Thông tin xuất</h3>
                  <p className="text-xs text-gray-600 mb-3">Dữ liệu sẽ được xuất theo bộ lọc hiện tại của bạn</p>
                </div>
              </div>
            </div>

            {/* Export Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Chi tiết xuất file</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Tất cả bảng điểm theo bộ lọc</p>
                      <p className="text-xs text-gray-600 mt-0.5">Bao gồm tất cả bảng điểm phù hợp với điều kiện lọc hiện tại</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Thông tin chi tiết đầy đủ</p>
                      <p className="text-xs text-gray-600 mt-0.5">Bao gồm thông tin sinh viên, môn học, giảng viên và điểm số</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Định dạng Excel (.xlsx)</p>
                      <p className="text-xs text-gray-600 mt-0.5">File sẽ được tải xuống ngay sau khi xác nhận</p>
                    </div>
                  </div>
                </div>
              </div>

              {summaryRows.length > 0 && (
                <div className="border border-gray-200 rounded-lg">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Bộ lọc đang áp dụng
                    </p>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {summaryRows.map((row) => (
                      <li key={row.label} className="px-4 py-2 text-sm text-gray-700 flex justify-between gap-4">
                        <span className="text-gray-500">{row.label}</span>
                        <span className="font-medium text-gray-900 text-right">{row.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* File Format */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Định dạng file
                </label>
                <div className="relative">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Excel (.xlsx)</p>
                      <p className="text-xs text-gray-600 mt-0.5">Định dạng file Excel chuẩn, tương thích với Microsoft Excel và Google Sheets</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Lưu ý</p>
                  <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside">
                    <li>File sẽ được tải xuống tự động sau khi xuất thành công</li>
                    <li>Quá trình xuất có thể mất vài giây tùy thuộc vào số lượng bảng điểm</li>
                    <li>Đảm bảo bạn đã áp dụng bộ lọc phù hợp trước khi xuất</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isExporting}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isExporting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Xuất file
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
