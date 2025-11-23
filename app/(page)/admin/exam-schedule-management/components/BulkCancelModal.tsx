'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';

interface BulkCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  selectedCount: number;
  isCancelling?: boolean;
}

export const BulkCancelModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isCancelling = false
}: BulkCancelModalProps) => {
  const [reason, setReason] = useState('');

  const handleClose = useCallback(() => {
    if (!isCancelling) {
      setReason('');
      onClose();
    }
  }, [isCancelling, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isCancelling) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isCancelling, handleClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isCancelling) {
      handleClose();
    }
  };

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Xác nhận hủy lịch thi</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isCancelling}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn hủy <span className="font-semibold">{selectedCount}</span> lịch thi đã chọn?
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Lý do hủy <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập lý do hủy lịch thi"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isCancelling}
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-700 mb-1">Cảnh báo:</p>
            <p className="text-sm text-red-600">Hành động này không thể hoàn tác.</p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCancelling}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isCancelling || !reason.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isCancelling ? 'Đang hủy...' : 'Xác nhận'}
          </Button>
        </div>
      </div>
    </div>
  );
};

