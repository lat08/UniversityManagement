'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { studentsApi } from '../lib/api/studentsApi';
import { ExportStudentsParams } from '../lib/types/types';

interface ExportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters?: ExportStudentsParams;
}

export default function ExportStudentModal({ isOpen, onClose, filters }: ExportStudentModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (e: FormEvent) => {
    e.preventDefault();
    
    setIsExporting(true);
    try {
      // Call API using studentsApi
      const blob = await studentsApi.exportStudents(filters || {});

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Xuất file thành công');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Xuất file thất bại');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExporting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, isExporting, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Xuất danh sách sinh viên</h2>
            <p className="text-sm text-gray-600 mt-1">Chọn các tùy chọn xuất dữ liệu</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleExport} className="p-6 flex-1 overflow-y-auto">
          {/* Export Info */}
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-900 mb-4">
              Thông tin xuất
            </label>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Sẽ xuất tất cả sinh viên theo bộ lọc hiện tại</li>
              <li>Bao gồm tất cả thông tin chi tiết của sinh viên</li>
              <li>File sẽ được tải xuống ngay sau khi xác nhận</li>
            </ul>
          </div>

          {/* File Format */}
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-900 mb-3">
              Định dạng file
            </label>
            <div className="relative">
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg cursor-not-allowed text-left"
              >
                <span className="text-base text-gray-900">Excel (.xlsx)</span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-8 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="px-8 py-3 text-base text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Đang xuất...' : 'Xuất file'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

