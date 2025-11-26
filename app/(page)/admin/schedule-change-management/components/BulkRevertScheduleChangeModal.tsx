'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui';
import { X, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { scheduleChangeApi } from '../lib/api/scheduleChangeApi';
import type { LeaveRequest } from '../lib/types/types';

interface BulkRevertScheduleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedRequestIds: string[];
  requests?: LeaveRequest[];
}

export const BulkRevertScheduleChangeModal = ({
  isOpen,
  onClose,
  onSuccess,
  selectedRequestIds,
  requests = [],
}: BulkRevertScheduleChangeModalProps) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<{
    total: number;
    processing: number;
    success: number;
    failed: number;
    errors: Array<{ id: string; message: string }>;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setProcessingStatus(null);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setReason('');
      setProcessingStatus(null);
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

  // Get eligible requests (only approved or rejected)
  const getEligibleRequests = useCallback(() => {
    return requests.filter((req) => {
      return (
        selectedRequestIds.includes(req.requestId) &&
        (req.status === 'approved' || req.status === 'rejected')
      );
    });
  }, [requests, selectedRequestIds]);

  const handleSubmit = async () => {
    if (reason.length > 500) {
      toast.error('Lý do hoàn tác không được vượt quá 500 ký tự');
      return;
    }

    const eligibleRequests = getEligibleRequests();
    
    if (eligibleRequests.length === 0) {
      toast.error('Không có yêu cầu nào đủ điều kiện để hoàn tác. Chỉ có thể hoàn tác yêu cầu ở trạng thái "Đã duyệt" hoặc "Từ chối".');
      return;
    }

    const total = selectedRequestIds.length;
    const skipped = total - eligibleRequests.length;

    setIsSubmitting(true);
    setProcessingStatus({
      total: eligibleRequests.length,
      processing: 0,
      success: 0,
      failed: 0,
      errors: [],
    });

    try {
      const errors: Array<{ id: string; message: string }> = [];
      let successCount = 0;
      let failedCount = 0;

      // Process each request sequentially
      for (let i = 0; i < eligibleRequests.length; i++) {
        const request = eligibleRequests[i];
        
        setProcessingStatus((prev) => prev ? {
          ...prev,
          processing: i + 1,
        } : null);

        try {
          const response = await scheduleChangeApi.revert(request.requestId, {
            reason: reason.trim() || undefined,
          });

          if (response.success) {
            successCount++;
          } else {
            failedCount++;
            errors.push({
              id: request.requestId,
              message: response.message || 'Hoàn tác thất bại',
            });
          }
        } catch (error) {
          failedCount++;
          const apiError = error as { response?: { data?: { message?: string } }; message?: string };
          const errorMessage = apiError?.response?.data?.message || apiError?.message || 'Đã xảy ra lỗi';
          errors.push({
            id: request.requestId,
            message: errorMessage,
          });
        }

        // Update status
        setProcessingStatus((prev) => prev ? {
          ...prev,
          success: successCount,
          failed: failedCount,
          errors,
        } : null);
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Đã hoàn tác thành công ${successCount}/${eligibleRequests.length} yêu cầu`);
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} yêu cầu hoàn tác thất bại`);
      }

      if (skipped > 0) {
        toast(`${skipped} yêu cầu bị bỏ qua (chỉ có thể hoàn tác yêu cầu đã duyệt/từ chối)`, {
          icon: '⚠️',
          duration: 4000,
        });
      }

      if (successCount === eligibleRequests.length && skipped === 0) {
        onSuccess?.();
        handleClose();
      } else if (successCount > 0) {
        // Some succeeded, refresh data
        onSuccess?.();
      }
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.message || apiError?.message || 'Đã xảy ra lỗi';
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

  const eligibleRequests = getEligibleRequests();
  const ineligibleCount = selectedRequestIds.length - eligibleRequests.length;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hoàn tác yêu cầu đổi lịch</h2>
              <p className="text-sm text-gray-600 mt-1">
                Hoàn tác {selectedRequestIds.length} yêu cầu đã chọn
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

        <div className="p-6 space-y-4">
          {/* Info about eligible requests */}
          {eligibleRequests.length > 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    {eligibleRequests.length} yêu cầu đủ điều kiện để hoàn tác
                  </p>
                  <p className="text-xs text-yellow-700">
                    Các yêu cầu này sẽ được chuyển về trạng thái &quot;Chờ duyệt&quot;. 
                    Lịch dạy bù đã được phân công (nếu có) sẽ bị hủy.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 mb-1">
                    Không có yêu cầu nào đủ điều kiện
                  </p>
                  <p className="text-xs text-red-700">
                    Chỉ có thể hoàn tác yêu cầu ở trạng thái &quot;Đã duyệt&quot; hoặc &quot;Từ chối&quot;.
                  </p>
                </div>
              </div>
            </div>
          )}

          {ineligibleCount > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>{ineligibleCount}</strong> yêu cầu sẽ bị bỏ qua (không ở trạng thái đã duyệt/từ chối)
              </p>
            </div>
          )}

          {/* Processing status */}
          {processingStatus && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Đang xử lý:</span>
                <span className="font-medium text-gray-900">
                  {processingStatus.processing}/{processingStatus.total}
                </span>
              </div>
              {processingStatus.processing > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(processingStatus.processing / processingStatus.total) * 100}%` }}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                <div>
                  <span className="text-gray-600">Thành công:</span>
                  <span className="ml-1 font-medium text-green-600">{processingStatus.success}</span>
                </div>
                <div>
                  <span className="text-gray-600">Thất bại:</span>
                  <span className="ml-1 font-medium text-red-600">{processingStatus.failed}</span>
                </div>
              </div>
              {processingStatus.errors.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-700 mb-1">Chi tiết lỗi:</p>
                  {processingStatus.errors.map((error, idx) => (
                    <p key={idx} className="text-xs text-red-600">
                      • {error.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Lý do hoàn tác (Tùy chọn) - Áp dụng cho tất cả yêu cầu
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do hoàn tác (nếu có)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053AD] focus:border-[#0053AD] resize-none"
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/500 ký tự
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10"
          >
            {processingStatus ? 'Đóng' : 'Hủy'}
          </Button>
          {eligibleRequests.length > 0 && !processingStatus && (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang xử lý...' : `Hoàn tác ${eligibleRequests.length} yêu cầu`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

