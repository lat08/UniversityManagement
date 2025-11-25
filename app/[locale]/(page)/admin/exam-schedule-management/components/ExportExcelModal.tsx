'use client';

import { useState, useCallback, useEffect } from 'react';
import { Dropdown, Button } from '@/app/components/ui';
import { X } from 'lucide-react';
import { commonApi } from '@/lib/api/common';
import { toast } from 'react-hot-toast';
import type { Semester } from '@/lib/types/common';

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportExcelModal = ({ isOpen, onClose }: ExportExcelModalProps) => {
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSemesters();
    }
  }, [isOpen]);

  const loadSemesters = async () => {
    setLoading(true);
    try {
      const response = await commonApi.getSemesters();
      if (response.success) {
        setSemesters(response.data || []);
        // Set default to current semester if available
        const currentSemester = response.data?.find((s) => s.status === 'active');
        if (currentSemester) {
          setSelectedSemesterId(currentSemester.semesterId);
        }
      }
    } catch {
      toast.error('Không thể tải danh sách học kỳ');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!isExporting) {
      setSelectedSemesterId('');
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

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isExporting) {
      handleClose();
    }
  };

  const handleExport = async () => {
    if (!selectedSemesterId) {
      toast.error('Vui lòng chọn học kỳ cần xuất');
      return;
    }

    setIsExporting(true);
    try {
      // TODO: Implement actual export API call
      // For now, just show a success message
      toast.success('Xuất file Excel thành công!');
      handleClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Xuất file thất bại';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const semesterOptions = semesters.map((s) => ({
    value: s.semesterId,
    label: s.semesterName,
  }));

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Xuất file Excel</h2>
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

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Học kỳ <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={semesterOptions}
              value={selectedSemesterId}
              placeholder="Chọn học kỳ"
              onChange={setSelectedSemesterId}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isExporting}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !selectedSemesterId || loading}
            className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
          >
            {isExporting ? 'Đang xuất...' : 'Xuất'}
          </Button>
        </div>
      </div>
    </div>
  );
};

