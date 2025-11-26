'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui';
import { X, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { scheduleChangeApi } from '../lib/api/scheduleChangeApi';
import type { LeaveRequest } from '../lib/types/types';

interface RevertScheduleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  request: LeaveRequest | null;
}

export const RevertScheduleChangeModal = ({
  isOpen,
  onClose,
  onSuccess,
  request,
}: RevertScheduleChangeModalProps) => {
  const t = useTranslations('admin.scheduleChangeManagement.modals.revert');
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

    if (reason.length > 500) {
      toast.error(t('errors.reasonMaxLength'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await scheduleChangeApi.revert(request.requestId, { 
        reason: reason.trim() || undefined 
      });

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

  const statusLabel = request.status === 'approved' ? t('statusApproved') : t('statusRejected');

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
                {t('description', { code: request.requestCode, status: statusLabel })}
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 mb-1">
                  {t('confirmTitle')}
                </p>
                <p className="text-xs text-yellow-700">
                  {t('confirmDesc', { 
                    additional: request.status === 'approved' ? t('confirmDescApproved') : '' 
                  })}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('reason')}
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
            disabled={isSubmitting}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('processing') : t('submit')}
          </Button>
        </div>
      </div>
    </div>
  );
};

