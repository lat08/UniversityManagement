'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dropdown, Button } from '@/app/components/ui';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notificationsApi } from '../lib/api/notificationsApi';
import { NOTIFICATION_TYPE_OPTIONS, SENDING_METHOD_OPTIONS, STATUS_OPTIONS } from '../lib/types/types';

interface BulkEditNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedNotificationIds: string[];
}

export const BulkEditNotificationModal = ({ isOpen, onClose, onSuccess, selectedNotificationIds }: BulkEditNotificationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [notificationType, setNotificationType] = useState<string>('');
  const [sendingMethod, setSendingMethod] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isActive, setIsActive] = useState<string>('');

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setNotificationType('');
      setSendingMethod('');
      setStatus('');
      setIsActive('');
      onClose();
    }
  }, [isSubmitting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitting, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notificationType && !sendingMethod && !status && !isActive) {
      toast.error('Vui lòng chọn ít nhất một trường để cập nhật');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: {
        scheduleIds: string[];
        notificationType?: string;
        sendingMethod?: string;
        status?: string;
        isActive?: boolean;
      } = {
        scheduleIds: selectedNotificationIds,
      };

      if (notificationType) payload.notificationType = notificationType;
      if (sendingMethod) payload.sendingMethod = sendingMethod;
      if (status) payload.status = status;
      if (isActive) payload.isActive = isActive === 'true';

      const response = await notificationsApi.bulkUpdate(payload);

      // Check both success and isSuccess formats
      const isSuccess = response.success !== undefined ? response.success : response.isSuccess;
      const message = response.message || response.resultMessage;

      if (isSuccess) {
        toast.success(message || `Đã cập nhật ${selectedNotificationIds.length} thông báo`);
        setNotificationType('');
        setSendingMethod('');
        setStatus('');
        setIsActive('');
        onSuccess?.();
        handleClose();
      } else {
        toast.error(message || 'Cập nhật hàng loạt thất bại');
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

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  const notificationTypeOptions = [
    { value: '', label: 'Không thay đổi' },
    ...NOTIFICATION_TYPE_OPTIONS,
  ];

  const sendingMethodOptions = [
    { value: '', label: 'Không thay đổi' },
    ...SENDING_METHOD_OPTIONS,
  ];

  const statusOptions = [
    { value: '', label: 'Không thay đổi' },
    ...STATUS_OPTIONS.filter(s => s.value !== ''), // Remove "Tất cả" option
  ];

  const isActiveOptions = [
    { value: '', label: 'Không thay đổi' },
    { value: 'true', label: 'Đang hoạt động' },
    { value: 'false', label: 'Ngừng hoạt động' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa hàng loạt</h2>
              <p className="text-sm text-gray-600 mt-1">
                Đã chọn {selectedNotificationIds.length} thông báo
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Loại thông báo
              </label>
              <Dropdown
                options={notificationTypeOptions}
                value={notificationType}
                placeholder="Chọn loại thông báo"
                onChange={setNotificationType}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phương thức gửi
              </label>
              <Dropdown
                options={sendingMethodOptions}
                value={sendingMethod}
                placeholder="Chọn phương thức gửi"
                onChange={setSendingMethod}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Trạng thái
              </label>
              <Dropdown
                options={statusOptions}
                value={status}
                placeholder="Chọn trạng thái"
                onChange={setStatus}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Trạng thái hoạt động
              </label>
              <Dropdown
                options={isActiveOptions}
                value={isActive}
                placeholder="Chọn trạng thái hoạt động"
                onChange={setIsActive}
              />
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

