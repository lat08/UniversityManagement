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
} from '@/app/components/ui/dialog';
import { formatDate } from '@/lib/utils/format';
import type { RoomRequestRecord } from '@/lib/types/room-request';

interface BulkRejectRoomRequestsModalProps {
  readonly isOpen: boolean;
  readonly requests: RoomRequestRecord[];
  readonly onClose: () => void;
  readonly onConfirm: (reason: string) => void;
}

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

export const BulkRejectRoomRequestsModal = ({
  isOpen,
  requests,
  onClose,
  onConfirm,
}: BulkRejectRoomRequestsModalProps) => {
  const t = useTranslations('admin.roomRequests.bulkRejectModal');
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] [&>button[data-radix-dialog-close]:not(.custom-close)]:hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {t('title', { count: requests.length })}
            </DialogTitle>
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium">
              {t('warning', { count: requests.length })}
            </p>
          </div>

          <p className="text-sm text-gray-700">{t('description')}</p>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {requests.map((req) => (
              <div
                key={req.bookingId}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm"
              >
                {req.bookingCode || req.bookingId.substring(0, 8).toUpperCase()} · {req.roomCode} ·{' '}
                {req.bookedByUser.fullName} ({req.bookedByUser.studentCode || 'N/A'}) ·{' '}
                {formatDate(req.bookingDate)} ({req.startTime} - {req.endTime})
              </div>
            ))}
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






