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

interface BulkApproveRoomRequestsModalProps {
  readonly isOpen: boolean;
  readonly requests: RoomRequestRecord[];
  readonly onClose: () => void;
  readonly onConfirm: (note?: string) => void;
}

const MAX_NOTE_LENGTH = 100;

export const BulkApproveRoomRequestsModal = ({
  isOpen,
  requests,
  onClose,
  onConfirm,
}: BulkApproveRoomRequestsModalProps) => {
  const t = useTranslations('admin.roomRequests.bulkApproveModal');
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm(note.trim() || undefined);
    setNote('');
  };

  const handleClose = () => {
    setNote('');
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
          <p className="text-sm text-gray-700">{t('description')}</p>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {requests.map((req) => (
              <div
                key={req.bookingId}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm"
              >
                {req.bookingCode || req.bookingId.substring(0, 8).toUpperCase()} · {req.roomCode} ·{' '}
                {req.bookedByUser.fullName} ({req.bookedByUser.studentCode || 'N/A'}) ·{' '}
                {formatDate(req.bookingDate)} ({req.startTime} - {req.endTime})
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('note')}
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('notePlaceholder')}
              rows={3}
              maxLength={MAX_NOTE_LENGTH}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {t('noteMaxLength', { current: note.length, max: MAX_NOTE_LENGTH })}
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
            className="bg-[#0053AD] text-white hover:bg-[#003d82]"
          >
            {t('actions.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};






