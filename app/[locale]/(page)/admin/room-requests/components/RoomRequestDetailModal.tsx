'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui/button';
import { X } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { ROOM_REQUEST_STATUS_META } from '@/lib/constants/room-request';
import { ROOM_TYPE_LABELS } from '@/lib/types/room';
import type { RoomRequestRecord } from '@/lib/types/room-request';

interface RoomRequestDetailModalProps {
  readonly open: boolean;
  readonly request: RoomRequestRecord | null;
  readonly onClose: () => void;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
}

export const RoomRequestDetailModal = ({
  open,
  request,
  onClose,
  onApprove,
  onReject,
}: RoomRequestDetailModalProps) => {
  const t = useTranslations('admin.roomRequests.detailModal');
  const tStatus = useTranslations('admin.roomRequests.status');
  const emptyValue = '—';

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!open || !request) {
    return null;
  }

  const statusMeta = ROOM_REQUEST_STATUS_META[request.bookingStatus];
  const roomTypeLabel = ROOM_TYPE_LABELS[request.roomType as keyof typeof ROOM_TYPE_LABELS] || request.roomType;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={handleBackdropClick}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex-1">
            <p className="text-xs uppercase text-gray-400">{t('subtitle')}</p>
            <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            type="button"
            aria-label={t('actions.close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-6 max-h-[calc(90vh-200px)]">
          {/* THÔNG TIN ĐƠN ĐĂNG KÝ */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {t('sections.requestInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('fields.code')}</label>
                <input
                  type="text"
                  readOnly
                  value={request.bookingCode || request.bookingId.substring(0, 8).toUpperCase()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('fields.createdDate')}</label>
                <input
                  type="text"
                  readOnly
                  value={formatDate(request.createdAt)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600 block mb-1">{t('fields.status')}</label>
                <span
                  className={`inline-flex px-3 py-1 rounded-md text-sm font-medium ${
                    statusMeta?.badgeClass || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {statusMeta ? tStatus(request.bookingStatus) : request.bookingStatus}
                </span>
              </div>
            </div>
          </div>

          {/* THÔNG TIN SINH VIÊN */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {t('sections.studentInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('fields.studentId')}</label>
                <input
                  type="text"
                  readOnly
                  value={request.bookedByUser.studentCode || emptyValue}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('fields.fullName')}</label>
                <input
                  type="text"
                  readOnly
                  value={request.bookedByUser.fullName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('fields.class')}</label>
                <input
                  type="text"
                  readOnly
                  value={request.bookedByUser.className || emptyValue}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* THÔNG TIN PHÒNG */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {t('sections.roomInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('fields.roomId')}</label>
                <input
                  type="text"
                  readOnly
                  value={request.roomCode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('fields.roomName')}</label>
                <input
                  type="text"
                  readOnly
                  value={request.roomName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('fields.roomType')}</label>
                <input
                  type="text"
                  readOnly
                  value={roomTypeLabel}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600 block mb-1">{t('fields.building')}</label>
                <input
                  type="text"
                  readOnly
                  value={`${request.building.buildingName} - ${request.building.address || ''}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* THÔNG TIN SỬ DỤNG */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {t('sections.usageInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('fields.usageDate')}</label>
                <input
                  type="text"
                  readOnly
                  value={formatDate(request.bookingDate)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('fields.timeSlot')}</label>
                <input
                  type="text"
                  readOnly
                  value={`${request.startTime} - ${request.endTime}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('fields.peopleCount')}</label>
                <input
                  type="text"
                  readOnly
                  value={request.studentCount.toString()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600 block mb-1">{t('fields.purpose')}</label>
                <textarea
                  readOnly
                  value={request.purpose}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} type="button">
            {t('actions.close')}
          </Button>
          {request.bookingStatus === 'pending' && (
            <>
              <Button
                variant="outline"
                onClick={onReject}
                type="button"
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                {t('actions.reject')}
              </Button>
              <Button
                onClick={onApprove}
                type="button"
                className="bg-[#0053AD] text-white hover:bg-[#003d82]"
              >
                {t('actions.approve')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


