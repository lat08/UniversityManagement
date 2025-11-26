'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { formatDate } from '@/lib/utils/format';
import type { RoomRequestRecord } from '@/lib/types/room-request';

interface CancelRoomRequestModalProps {
  readonly isOpen: boolean;
  readonly request: RoomRequestRecord | null;
  readonly onClose: () => void;
  readonly onConfirm: (reason: string) => void;
}

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

export const CancelRoomRequestModal = ({
  isOpen,
  request,
  onClose,
  onConfirm,
}: CancelRoomRequestModalProps) => {
  const t = useTranslations('admin.roomRequests.cancelModal');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const trimmedReason = reason.trim();
    
    if (trimmedReason.length < MIN_REASON_LENGTH) {
      setError(`Lý do phải có tối thiểu ${MIN_REASON_LENGTH} ký tự`);
      return;
    }
    
    if (trimmedReason.length > MAX_REASON_LENGTH) {
      setError(`Lý do không được quá ${MAX_REASON_LENGTH} ký tự`);
      return;
    }

    setError('');
    onConfirm(trimmedReason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] [&>button[data-radix-dialog-close]:not(.custom-close)]:hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {t('title')}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                {t('subtitle')}
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label={t('actions.cancel')}
              className="custom-close p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-600">
              {t('code', { code: request.bookingCode || request.bookingId.substring(0, 8).toUpperCase() })}
            </span>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
            <p className="text-sm">
              <span className="font-medium">{t('details.room')}:</span>{' '}
              {request.roomCode} - {request.roomName}
            </p>
            <p className="text-sm">
              <span className="font-medium">{t('details.building')}:</span>{' '}
              {request.building.buildingName}
            </p>
            <p className="text-sm">
              <span className="font-medium">{t('details.student')}:</span>{' '}
              {request.bookedByUser.fullName} - {request.bookedByUser.studentCode || 'N/A'}
            </p>
            <p className="text-sm">
              <span className="font-medium">{t('details.usageTime')}:</span>{' '}
              {formatDate(request.bookingDate)} ({request.startTime} - {request.endTime})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> {t('reason')}
            </label>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder={t('reasonPlaceholder')}
              rows={5}
              maxLength={MAX_REASON_LENGTH}
              className={`resize-none ${error ? 'border-red-300' : ''}`}
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            <p className="text-xs text-gray-500 mt-1 text-right">
              {t('reasonMaxLength', { current: reason.length, max: MAX_REASON_LENGTH })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} type="button">
            {t('actions.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            type="button"
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {t('actions.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};






