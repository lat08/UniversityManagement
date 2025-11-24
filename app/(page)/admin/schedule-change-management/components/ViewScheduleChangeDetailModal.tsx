'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Dropdown } from '@/app/components/ui';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { LeaveRequest } from '../lib/types/types';
import { getPeriodLabel, getPeriodTimeRange } from '../lib/types/types';

interface ViewScheduleChangeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
}

export const ViewScheduleChangeDetailModal = ({
  isOpen,
  onClose,
  request,
}: ViewScheduleChangeDetailModalProps) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  if (!isOpen || !request) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const cancelDate = new Date(request.cancelDate);
  const makeUpDate = request.makeUpDate ? new Date(request.makeUpDate) : null;
  const approvedMakeupDate = request.makeup ? new Date(request.makeup.makeupDate) : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Thông tin yêu cầu đổi lịch</h2>
              <p className="text-sm text-gray-600 mt-1">Chi tiết yêu cầu đổi lịch của giảng viên</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Mã yêu cầu */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Mã:</label>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <span className="text-gray-900 font-medium">{request.requestCode}</span>
            </div>
          </div>

          {/* Thông tin chung */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin chung</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giảng viên:</label>
                <p className="text-gray-900">{request.instructorName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Môn học:</label>
                <p className="text-gray-900">{request.subjectName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lớp học:</label>
                <p className="text-gray-900">{request.courseClassCode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đề xuất:</label>
                <p className="text-gray-900">
                  {makeUpDate 
                    ? format(makeUpDate, 'dd/MM/yyyy', { locale: vi })
                    : format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: vi })}
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do đề xuất:</label>
                <p className="text-gray-900">{request.reason || '-'}</p>
              </div>
            </div>
          </div>

          {/* Lịch hiện tại */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Lịch hiện tại</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày:</label>
                <p className="text-gray-900">
                  {format(cancelDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiết:</label>
                <p className="text-gray-900">{getPeriodLabel(request.cancelStartPeriod, request.cancelEndPeriod)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng:</label>
                <p className="text-gray-900">{request.oldRoomCode || '-'}</p>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian:</label>
                <p className="text-gray-900">{getPeriodTimeRange(request.cancelStartPeriod, request.cancelEndPeriod)}</p>
              </div>
            </div>
          </div>

          {/* Lịch đề xuất */}
          {makeUpDate && (
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300 space-y-3">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Lịch đề xuất</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Ngày:</label>
                  <p className="text-blue-900 font-medium">
                    {format(makeUpDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Tiết:</label>
                  <p className="text-blue-900 font-medium">
                    {getPeriodLabel(request.startPeriod, request.endPeriod)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Phòng:</label>
                  <p className="text-blue-900 font-medium">{request.makeUpRoomCode || '-'}</p>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-blue-700 mb-1">Thời gian:</label>
                  <p className="text-blue-900 font-medium">{getPeriodTimeRange(request.startPeriod, request.endPeriod)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Lịch dạy bù đã duyệt (nếu có) */}
          {request.makeup && approvedMakeupDate && (
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300 space-y-3">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Lịch dạy bù đã duyệt</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Ngày:</label>
                  <p className="text-green-900 font-medium">
                    {format(approvedMakeupDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Tiết:</label>
                  <p className="text-green-900 font-medium">
                    {getPeriodLabel(request.makeup.startPeriod, request.makeup.endPeriod)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Phòng:</label>
                  <p className="text-green-900 font-medium">{request.makeup.roomName}</p>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-green-700 mb-1">Thời gian:</label>
                  <p className="text-green-900 font-medium">{getPeriodTimeRange(request.makeup.startPeriod, request.makeup.endPeriod)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Trạng thái:</label>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <span className="text-gray-900 font-medium">
                {request.status === 'pending' && 'Chờ duyệt'}
                {request.status === 'approved' && 'Đã duyệt'}
                {request.status === 'rejected' && 'Từ chối'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

