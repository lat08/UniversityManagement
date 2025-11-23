'use client';

import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Dropdown, Button } from '@/app/components/ui';
import { subjectsApi } from '../lib/api/subjectsApi';

interface BulkEditModalProps {
  isOpen: boolean;
  selectedSubjectIds: string[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BulkEditModal({
  isOpen,
  selectedSubjectIds,
  onClose,
  onSuccess,
}: BulkEditModalProps) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setSelectedStatus('');
    onClose();
  }, [isSubmitting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, handleClose]);

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.error('Vui lòng chọn trạng thái');
      return;
    }

    setIsSubmitting(true);
    try {
      const promises = selectedSubjectIds.map(async (id) => {
        const subjectRes = await subjectsApi.getSubjectById(id);
        if (subjectRes.success) {
          const subject = subjectRes.data;
          return subjectsApi.updateSubject(id, {
            ...subject,
            subjectStatus: selectedStatus as 'active' | 'inactive' | 'archived',
          });
        }
        return null;
      });

      await Promise.all(promises);
      toast.success('Cập nhật trạng thái thành công!');
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi cập nhật';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Tạm ngưng' },
    { value: 'archived', label: 'Lưu trữ' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa môn học</h2>
              <p className="text-sm text-gray-600 mt-1">
                Chỉnh sửa thông tin các môn học được chọn
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Kỳ học</label>
            <Input
              value="Học kỳ 1 (2023 - 2024)"
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Trạng thái</label>
            <Dropdown
              options={statusOptions}
              value={selectedStatus}
              placeholder="Chọn trạng thái"
              onChange={setSelectedStatus}
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
          >
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent ${className}`}
      {...props}
    />
  );
}
