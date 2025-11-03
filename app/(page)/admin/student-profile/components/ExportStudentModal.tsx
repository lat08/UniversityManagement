'use client';

import { useState, type FormEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button } from '@/app/components/ui';
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isExporting && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Xuất danh sách sinh viên</DialogTitle>
          <DialogDescription>Chọn các tùy chọn xuất dữ liệu</DialogDescription>
        </DialogHeader>

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
              <Button
                type="button"
                disabled
                variant="outline"
                className="w-full justify-between cursor-not-allowed bg-gray-50"
              >
                <span className="text-base text-gray-900">Excel (.xlsx)</span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isExporting}
              className="bg-[#0053AD] hover:bg-[#003d82] text-white"
            >
              {isExporting ? 'Đang xuất...' : 'Xuất file'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

