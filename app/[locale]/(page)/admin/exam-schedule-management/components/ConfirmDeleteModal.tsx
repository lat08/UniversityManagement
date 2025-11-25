'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/app/components/ui';
import { X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  subjectName?: string;
  className?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ConfirmDeleteModal = ({
  isOpen,
  subjectName,
  className,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      handleClose();
    } catch {
      // Error handling is done in parent
    } finally {
      setIsDeleting(false);
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
            <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa lịch thi</h2>
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
            Bạn có chắc chắn muốn xóa lịch thi môn{' '}
            {subjectName && (
              <>
                <span className="font-semibold text-gray-900">{subjectName}</span>
                {className && (
                  <>
                    {' '}(Lớp: <span className="font-semibold text-gray-900">{className}</span>)
                  </>
                )}
              </>
            )}
            ?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-sm font-semibold text-red-700 mb-1">Cảnh báo:</p>
            <p className="text-sm text-red-600">
              Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa.
            </p>
          </div>
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
            onClick={handleConfirm}
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

