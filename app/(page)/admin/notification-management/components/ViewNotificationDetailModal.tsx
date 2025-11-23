'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui';
import { X, Eye, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notificationsApi } from '../lib/api/notificationsApi';
import type { Notification } from '../lib/types/types';
import { 
  getStatusDisplay, 
  getNotificationTypeDisplay, 
  getTargetTypeDisplay, 
  getSendingMethodDisplay 
} from '../lib/types/types';

interface ViewNotificationDetailModalProps {
  isOpen: boolean;
  notification: Notification | null;
  onClose: () => void;
}

export const ViewNotificationDetailModal = ({
  isOpen,
  notification,
  onClose,
}: ViewNotificationDetailModalProps) => {
  const [detailNotification, setDetailNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!isOpen || !notification) {
        setDetailNotification(null);
        return;
      }

      // Nếu đã có content, không cần fetch lại
      if (notification.content) {
        setDetailNotification(notification);
        return;
      }

      // Fetch chi tiết từ API
      setLoading(true);
      try {
        const response = await notificationsApi.getDetail(notification.scheduleId);
        // Check both success and isSuccess formats
        const isSuccess = response.success !== undefined ? response.success : response.isSuccess;
        
        if (isSuccess && response.data) {
          setDetailNotification(response.data);
        } else {
          const errorMsg = response.message || response.resultMessage || 'Không thể tải chi tiết thông báo';
          toast.error(errorMsg);
          setDetailNotification(notification); // Fallback to basic info
        }
      } catch (error) {
        console.error('Error fetching notification detail:', error);
        let errorMessage = 'Không thể tải chi tiết thông báo';
        
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response?: { data?: { message?: string; resultMessage?: string } } };
          errorMessage = apiError.response?.data?.message || apiError.response?.data?.resultMessage || errorMessage;
        }
        
        toast.error(errorMessage);
        setDetailNotification(notification); // Fallback to basic info
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, notification]);

  if (!isOpen || !notification) return null;

  const displayNotification = detailNotification || notification;
  const statusDisplay = getStatusDisplay(displayNotification.status);
  const typeDisplay = getNotificationTypeDisplay(displayNotification.notificationType || 'event');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-[#0053AD]" />
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết thông báo</h2>
            </div>
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

        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-6">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề</label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-900 font-medium">{displayNotification.title}</p>
              </div>
            </div>

            {/* Thông báo ngắn */}
            {displayNotification.noticeMessage && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Thông báo ngắn</label>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {displayNotification.noticeMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Nội dung */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung</label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[100px]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0053AD]" />
                    <span className="ml-2 text-gray-600">Đang tải nội dung...</span>
                  </div>
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {displayNotification.content || 'Không có nội dung'}
                  </p>
                )}
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="grid grid-cols-2 gap-6">
              {/* Loại thông báo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loại thông báo</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${typeDisplay.color}`}>
                    {typeDisplay.label}
                  </span>
                </div>
              </div>

              {/* Tiêu đề (nếu cần hiển thị lại) */}
              <div className="col-span-2 hidden">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900 font-medium">{displayNotification.title}</p>
                </div>
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${statusDisplay.color}`}>
                    {statusDisplay.label}
                  </span>
                </div>
              </div>

              {/* Đối tượng nhận */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Đối tượng nhận</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900">
                    {getTargetTypeDisplay(notification.targetType)}
                    {notification.targetValue && (
                      <span className="text-gray-600 ml-2">({notification.targetValue})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Phương thức gửi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phương thức gửi</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900">{getSendingMethodDisplay(displayNotification.sendingMethod)}</p>
                </div>
              </div>

              {/* Số người nhận */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số người nhận</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900 font-medium">{displayNotification.totalRecipients || 0} người</p>
                </div>
              </div>

              {/* Ngày lên lịch */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày lên lịch</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900">
                    {displayNotification.scheduledDate 
                      ? new Date(displayNotification.scheduledDate).toLocaleString('vi-VN')
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Ngày tạo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày tạo</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900">
                    {displayNotification.createdAt 
                      ? new Date(displayNotification.createdAt).toLocaleString('vi-VN')
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Người tạo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Người tạo</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900">{displayNotification.createdBy || '-'}</p>
                </div>
              </div>

              {/* Ngày cập nhật */}
              {displayNotification.updatedAt && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày cập nhật</label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-900">
                      {new Date(displayNotification.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}

              {/* Trạng thái hoạt động */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái hoạt động</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900">
                    {displayNotification.isActive !== false ? 'Đang hoạt động' : 'Đã lưu trữ'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            onClick={onClose}
            className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

