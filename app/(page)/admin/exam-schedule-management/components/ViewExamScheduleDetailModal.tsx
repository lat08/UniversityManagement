'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui';
import { X } from 'lucide-react';
import { examSchedulesApi } from '../lib/api/examSchedulesApi';
import { getStatusDisplay, getExamFormatLabel, type ExamScheduleDetail } from '../lib/types/types';
import { toast } from 'react-hot-toast';

interface ViewExamScheduleDetailModalProps {
  isOpen: boolean;
  examScheduleId: string | null;
  onClose: () => void;
}

export const ViewExamScheduleDetailModal = ({
  isOpen,
  examScheduleId,
  onClose,
}: ViewExamScheduleDetailModalProps) => {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ExamScheduleDetail | null>(null);

  useEffect(() => {
    if (isOpen && examScheduleId) {
      loadDetail();
    } else {
      setDetail(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, examScheduleId]);

  const loadDetail = async () => {
    if (!examScheduleId) return;
    setLoading(true);
    try {
      const data = await examSchedulesApi.getById(examScheduleId);
      setDetail(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải chi tiết lịch thi';
      toast.error(errorMessage);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!loading) {
      setDetail(null);
      onClose();
    }
  }, [loading, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, loading, handleClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  const statusDisplay = detail && detail.status ? getStatusDisplay(detail.status) : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Xem chi tiết lịch thi</h2>
              <p className="text-sm text-gray-600 mt-1">Hiển thị đầy đủ thông tin lịch thi</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0053AD]"></div>
            </div>
          ) : detail ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Tên môn thi */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tên môn thi</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {detail.subjectName}
                </div>
              </div>

              {/* Lớp */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Lớp</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {detail.courseClassCode}
                </div>
              </div>

              {/* Ngày thi */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Ngày thi</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {new Date(detail.examDate).toLocaleDateString('vi-VN')}
                </div>
              </div>

              {/* Giờ thi */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Giờ thi</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {detail.startTime ? detail.startTime.substring(0, 5) : detail.examTime || 'N/A'}
                </div>
              </div>

              {/* Thời gian thi */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Thời gian thi</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {detail.durationInMinutes || 90} phút
                </div>
              </div>

              {/* Phòng thi */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Phòng thi</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {detail.roomCode} - {detail.roomName}
                </div>
              </div>

              {/* Hình thức thi */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Hình thức thi</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {getExamFormatLabel(detail.examFormat || '')}
                </div>
              </div>

              {/* Giám thị */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">Giám thị</label>
                <div className="flex flex-wrap gap-2">
                  {detail.proctorNames && detail.proctorNames.length > 0 ? (
                    detail.proctorNames.map((name: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">Chưa có giám thị</span>
                  )}
                </div>
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Trạng thái</label>
                {statusDisplay && (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}
                  >
                    {statusDisplay.label}
                  </span>
                )}
              </div>

              {/* Lý do hủy */}
              {detail.status === 'cancelled' && detail.cancellationReason && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Lý do hủy</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                    {detail.cancellationReason}
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              {detail.notes && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Ghi chú</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                    {detail.notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

