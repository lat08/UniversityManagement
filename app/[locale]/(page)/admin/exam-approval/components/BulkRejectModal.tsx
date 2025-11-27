'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Textarea } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BulkRejectModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (reason: string) => void;
  readonly selectedCount: number;
  readonly isRejecting?: boolean;
}

export const BulkRejectModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isRejecting = false,
}: BulkRejectModalProps) => {
  const t = useTranslations('admin.examApproval.modals.bulkReject');
  const tCommon = useTranslations('common.actions');
  const tValidation = useTranslations('admin.examApproval.rejectModal.validation');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleClose = useCallback(() => {
    if (!isRejecting) {
      setReason('');
      setError('');
      onClose();
    }
  }, [isRejecting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isRejecting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isRejecting, handleClose]);

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isRejecting) {
      handleClose();
    }
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError(tValidation('minLength', { min: 1 }));
      return;
    }
    if (reason.trim().length < 10) {
      setError(tValidation('minLength', { min: 10 }));
      return;
    }
    if (reason.trim().length > 500) {
      setError(tValidation('maxLength', { max: 500 }));
      return;
    }
    setError('');
    onConfirm(reason.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isRejecting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-700">{t('description', { count: selectedCount })}</p>
          <p className="text-sm text-gray-500">{t('note')}</p>

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
              rows={4}
              className={error ? 'border-red-500' : ''}
              disabled={isRejecting}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            <p className="mt-1 text-xs text-gray-500">
              {reason.length}/500 ký tự
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isRejecting}
            className="flex-1"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isRejecting || !reason.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isRejecting ? t('submitting') : t('submit')}
          </Button>
        </div>
      </div>
    </div>
  );
};

