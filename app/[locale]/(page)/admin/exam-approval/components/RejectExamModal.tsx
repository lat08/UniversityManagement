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

interface RejectExamModalProps {
  readonly isOpen: boolean;
  readonly examTitle: string;
  readonly examType: string;
  readonly onClose: () => void;
  readonly onConfirm: (reason: string) => void;
}

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 1000;

export const RejectExamModal = ({
  isOpen,
  examTitle,
  examType,
  onClose,
  onConfirm,
}: RejectExamModalProps) => {
  const t = useTranslations('admin.examApproval.rejectModal');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const trimmedReason = reason.trim();
    
    if (trimmedReason.length < MIN_REASON_LENGTH) {
      setError(t('validation.minLength', { min: MIN_REASON_LENGTH }));
      return;
    }
    
    if (trimmedReason.length > MAX_REASON_LENGTH) {
      setError(t('validation.maxLength', { max: MAX_REASON_LENGTH }));
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

  const remainingChars = MAX_REASON_LENGTH - reason.length;

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
              aria-label={t('close')}
              className="custom-close p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            {t('confirmation', { title: examTitle, type: examType })}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reasonLabel')}
            </label>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder={t('reasonPlaceholder')}
              rows={5}
              className={`resize-none ${error ? 'border-red-300' : ''}`}
            />
            <div className="flex items-center justify-between mt-1">
              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}
              <p className={`text-xs ml-auto ${remainingChars < 50 ? 'text-red-600' : 'text-gray-500'}`}>
                {reason.length}/{MAX_REASON_LENGTH}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              type="button"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
              type="button"
            >
              {t('reject')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};






