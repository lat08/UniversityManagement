'use client';

import { Button } from '@/app/components/ui';
import { X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { notificationsApi } from '../lib/api/notificationsApi';
import type { Notification } from '../lib/types/types';

interface CancelNotificationModalProps {
  isOpen: boolean;
  notification: Notification | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CancelNotificationModal = ({
  isOpen,
  notification,
  onClose,
  onSuccess,
}: CancelNotificationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !notification) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await notificationsApi.cancel(notification.scheduleId);
      
      // Check both success and isSuccess formats
      const isSuccess = response.success !== undefined ? response.success : response.isSuccess;
      const message = response.message || response.resultMessage;

      if (isSuccess) {
        toast.success(message || 'Hủy thông báo thành công!');
        onSuccess?.();
        onClose();
      } else {
        toast.error(message || 'Hủy thông báo thất bại');
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                           (error as { message?: string })?.message || 
                           'Đã xảy ra lỗi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Xác nhận hủy thông báo</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn hủy thông báo{' '}
            <span className="font-semibold text-gray-900">&quot;{notification.title}&quot;</span>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              <strong>Lưu ý:</strong> Thông báo sẽ được chuyển sang trạng thái &quot;Đã hủy&quot; và không thể gửi sau đó.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            <XCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Đang hủy...' : 'Hủy thông báo'}
          </Button>
        </div>
      </div>
    </div>
  );
};

