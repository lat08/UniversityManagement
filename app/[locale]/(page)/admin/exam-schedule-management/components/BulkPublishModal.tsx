'use client';

import { useCallback, useEffect } from 'react';
import { Button } from '@/app/components/ui';
import { X } from 'lucide-react';

interface BulkPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  isPublishing?: boolean;
}

export const BulkPublishModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isPublishing = false
}: BulkPublishModalProps) => {
  const handleClose = useCallback(() => {
    if (!isPublishing) {
      onClose();
    }
  }, [isPublishing, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isPublishing) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isPublishing, handleClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isPublishing) {
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
            <h2 className="text-xl font-bold text-gray-900">Xác nhận công bố lịch thi</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isPublishing}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn công bố <span className="font-semibold">{selectedCount}</span> lịch thi đã chọn?
          </p>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPublishing}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPublishing}
            className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
          >
            {isPublishing ? 'Đang công bố...' : 'Xác nhận'}
          </Button>
        </div>
      </div>
    </div>
  );
};

