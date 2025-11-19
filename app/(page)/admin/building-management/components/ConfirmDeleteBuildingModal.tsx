'use client';

import { Button } from '@/app/components/ui';
import { X } from 'lucide-react';

interface ConfirmDeleteBuildingModalProps {
  isOpen: boolean;
  buildingName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ConfirmDeleteBuildingModal = ({
  isOpen,
  buildingName,
  onClose,
  onConfirm,
}: ConfirmDeleteBuildingModalProps) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa tòa nhà</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa tòa nhà{' '}
            <span className="font-semibold text-gray-900">{buildingName}</span>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Lưu ý: Hành động này không thể hoàn tác.
          </p>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Xóa
          </Button>
        </div>
      </div>
    </div>
  );
};

