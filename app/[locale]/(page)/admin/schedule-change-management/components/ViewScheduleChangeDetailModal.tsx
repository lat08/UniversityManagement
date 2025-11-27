'use client';

import { useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
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
  const t = useTranslations('admin.scheduleChangeManagement.modals.viewDetail');
  const tSchedule = useTranslations('common.schedule');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  const tStatus = useTranslations('admin.scheduleChangeManagement.status');
  
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

  const makeUpDate = request.makeUpDate ? new Date(request.makeUpDate) : null;
  const approvedMakeupDate = request.makeup ? new Date(request.makeup.makeupDate) : null;

  // Helper function to calculate date from cancelled week and day of week
  const calculateCancelledDate = (cancelledWeek: number, dayOfWeek: number, createdAt: string): Date | null => {
    try {
      const createdDate = new Date(createdAt);
      const createdDayOfWeek = createdDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Convert to our dayOfWeek format (2=Monday, 8=Sunday)
      const createdDayOfWeekFormatted = createdDayOfWeek === 0 ? 8 : createdDayOfWeek + 1;
      
      // Calculate days difference
      let daysDiff = dayOfWeek - createdDayOfWeekFormatted;
      if (daysDiff < 0) daysDiff += 7;
      
      // Estimate: assume cancelled week is relative to created date
      const weekOffset = (cancelledWeek - 1) * 7;
      const cancelledDate = new Date(createdDate);
      cancelledDate.setDate(createdDate.getDate() + daysDiff + weekOffset);
      
      return cancelledDate;
    } catch {
      return null;
    }
  };

  const cancelledDate = calculateCancelledDate(request.cancelledWeek, request.dayOfWeek, request.createdAt);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('description')}</p>
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
            <label className="block text-sm font-medium text-gray-900 mb-2">{t('code')}</label>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <span className="text-gray-900 font-medium">{request.requestCode}</span>
            </div>
          </div>

          {/* Thông tin chung */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('generalInfo')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('instructor')}</label>
                <p className="text-gray-900">{request.instructorName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('subject')}</label>
                <p className="text-gray-900">{request.subjectName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('class')}</label>
                <p className="text-gray-900">{request.courseClassCode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('proposedDate')}</label>
                <p className="text-gray-900">
                  {makeUpDate 
                    ? format(makeUpDate, 'dd/MM/yyyy', { locale: dateLocale })
                    : format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: dateLocale })}
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('reason')}</label>
                <p className="text-gray-900">{request.reason || '-'}</p>
              </div>
            </div>
          </div>

          {/* Lịch hiện tại */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('currentSchedule')}</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
                <p className="text-gray-900">
                  {cancelledDate 
                    ? format(cancelledDate, 'EEEE, dd/MM/yyyy', { locale: dateLocale })
                    : request.dayOfWeekText}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('cancelledWeek')}</label>
                <p className="text-gray-900">{request.cancelledWeek}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('period')}</label>
                <p className="text-gray-900">
                  {getPeriodLabel(
                    request.startPeriod,
                    request.endPeriod,
                    (key: string, params?: Record<string, unknown>) =>
                      tSchedule(key, params as Parameters<typeof tSchedule>[1]),
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('room')}</label>
                <p className="text-gray-900">{request.currentRoomCode || request.currentRoomName || '-'}</p>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('timeRange')}</label>
                <p className="text-gray-900">{getPeriodTimeRange(request.startPeriod, request.endPeriod)}</p>
              </div>
            </div>
          </div>

          {/* Lịch đề xuất */}
          {(makeUpDate || request.makeupWeek) && (
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300 space-y-3">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">{t('proposedSchedule')}</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('date')}</label>
                  <p className="text-blue-900 font-medium">
                    {makeUpDate
                      ? format(makeUpDate, "EEEE, dd/MM/yyyy", { locale: dateLocale })
                      : request.makeupWeek
                        ? `${t('makeupWeek')} ${request.makeupWeek}`
                        : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('makeupWeek')}</label>
                  <p className="text-blue-900 font-medium">{request.makeupWeek ? `${t('makeupWeek')} ${request.makeupWeek}` : '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('period')}</label>
                  <p className="text-blue-900 font-medium">
                    {getPeriodLabel(request.startPeriod, request.endPeriod)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('room')}</label>
                  <p className="text-blue-900 font-medium">{request.makeUpRoomCode || request.makeUpRoomName || '-'}</p>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('timeRange')}</label>
                  <p className="text-blue-900 font-medium">{getPeriodTimeRange(request.startPeriod, request.endPeriod)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Lịch dạy bù đã duyệt (nếu có) */}
          {request.makeup && approvedMakeupDate && (
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300 space-y-3">
              <h3 className="text-lg font-semibold text-green-900 mb-3">{t('approvedSchedule')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">{t('date')}</label>
                  <p className="text-green-900 font-medium">
                    {format(approvedMakeupDate, "EEEE, dd/MM/yyyy", { locale: dateLocale })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">{t('period')}</label>
                  <p className="text-green-900 font-medium">
                    {getPeriodLabel(
                      request.makeup.startPeriod,
                      request.makeup.endPeriod,
                      (key: string, params?: Record<string, unknown>) =>
                        t(key, params as Parameters<typeof t>[1]),
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">{t('room')}</label>
                  <p className="text-green-900 font-medium">{request.makeup.roomName}</p>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-green-700 mb-1">{t('time')}</label>
                  <p className="text-green-900 font-medium">{getPeriodTimeRange(request.makeup.startPeriod, request.makeup.endPeriod)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">{t('status')}</label>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <span className="text-gray-900 font-medium">
                {tStatus(request.status)}
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
            {t('close')}
          </Button>
        </div>
      </div>
    </div>
  );
};

