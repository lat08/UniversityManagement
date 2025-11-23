'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Download, X, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { toast } from 'react-hot-toast';
import { instructorsApi } from '../lib/api/instructorsApi';

interface ExportInstructorFilters {
  facultyId?: string;
  degree?: string;
  employmentStatus?: string;
}

interface ExportInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters?: ExportInstructorFilters;
}

export default function ExportInstructorModal({
  isOpen,
  onClose,
  filters,
}: ExportInstructorModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleClose = useCallback(() => {
    if (!isExporting) onClose();
  }, [isExporting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isExporting) {
        handleClose();
      }
    };

    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isExporting, handleClose]);

  const handleExport = async (e: FormEvent) => {
    e.preventDefault();
    setIsExporting(true);
    try {
      const blob = await instructorsApi.exportInstructors(filters || {});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instructors_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Xuất danh sách giảng viên thành công');
      handleClose();
    } catch (error) {
      console.error('Export instructors error:', error);
      toast.error('Xuất file thất bại');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

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
              <h2 className="text-2xl font-bold text-gray-900">Xuất danh sách giảng viên</h2>
              <p className="text-sm text-gray-600 mt-1">Xuất dữ liệu giảng viên ra file Excel</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isExporting}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleExport} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Thông tin xuất</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Sẽ xuất tất cả giảng viên theo bộ lọc hiện tại của bạn
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Chi tiết xuất file</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Tất cả giảng viên theo bộ lọc
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Bao gồm tất cả giảng viên phù hợp với điều kiện lọc hiện tại
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Thông tin chi tiết đầy đủ</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Bao gồm thông tin cá nhân và công tác của giảng viên
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Định dạng Excel (.xlsx)</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        File sẽ được tải xuống ngay sau khi xác nhận
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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
                      <p className="text-xs text-gray-600 mt-0.5">
                        Tương thích với Microsoft Excel và Google Sheets
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Lưu ý</p>
                  <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside">
                    <li>File sẽ được tải xuống tự động sau khi xuất thành công</li>
                    <li>Quá trình xuất có thể mất vài giây tùy vào số lượng giảng viên</li>
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
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
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