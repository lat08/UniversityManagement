'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { scheduleChangeApi } from '../lib/api/scheduleChangeApi';
import type { LeaveRequest } from '../lib/types/types';

interface RejectScheduleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  request: LeaveRequest | null;
}

export const RejectScheduleChangeModal = ({
  isOpen,
  onClose,
  onSuccess,
  request,
}: RejectScheduleChangeModalProps) => {
  const t = useTranslations('admin.scheduleChangeManagement.modals.reject');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setReason('');
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setReason('');
      onClose();
    }
  }, [isSubmitting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitting, handleClose]);

  const handleSubmit = async () => {
    if (!request) return;

    if (!reason.trim()) {
      toast.error(t('errors.reasonRequired'));
      return;
    }

    if (reason.length > 500) {
      toast.error(t('errors.reasonMaxLength'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await scheduleChangeApi.reject(request.requestId, { reason: reason.trim() });

      if (response.success) {
        toast.success(t('success'));
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || t('error'));
      }
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.message || apiError?.message || t('error');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('description', { code: request.requestCode })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('reason')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053AD] focus:border-[#0053AD] resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('characters', { count: reason.length })}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10"
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('processing') : t('submit')}
          </Button>
        </div>
      </div>
    </div>
  );
};

