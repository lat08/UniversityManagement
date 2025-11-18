'use client';

import { useCallback, useEffect } from 'react';
import { Button } from '@/app/components/ui';
import { X } from 'lucide-react';

interface BulkDeleteDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  isDeleting?: boolean;
}

export const BulkDeleteDivisionModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isDeleting = false
}: BulkDeleteDivisionModalProps) => {
  const handleClose = useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [isDeleting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isDeleting, handleClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Xóa Khoa</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isDeleting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa toàn bộ <span className="font-semibold">{selectedCount}</span> khoa đã chọn?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Cảnh báo: Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa.
          </p>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </div>
    </div>
  );
};

