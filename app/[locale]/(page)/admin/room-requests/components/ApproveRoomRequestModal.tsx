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

interface ApproveRoomRequestModalProps {
  readonly isOpen: boolean;
  readonly request: RoomRequestRecord | null;
  readonly onClose: () => void;
  readonly onConfirm: (note?: string) => void;
}

const MAX_NOTE_LENGTH = 100;

export const ApproveRoomRequestModal = ({
  isOpen,
  request,
  onClose,
  onConfirm,
}: ApproveRoomRequestModalProps) => {
  const t = useTranslations('admin.roomRequests.approveModal');
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm(note.trim() || undefined);
    setNote('');
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] [&>button[data-radix-dialog-close]:not(.custom-close)]:hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {t('title')}
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
          <p className="text-sm text-gray-700">{t('question')}</p>

          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-600">
              {t('code', { code: request.bookingCode || request.bookingId.substring(0, 8).toUpperCase() })}
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
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






