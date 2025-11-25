'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';
import { X, Archive } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { notificationsApi } from '../lib/api/notificationsApi';
import type { Notification } from '../lib/types/types';

interface ArchiveNotificationModalProps {
  isOpen: boolean;
  notification: Notification | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ArchiveNotificationModal = ({
  isOpen,
  notification,
  onClose,
  onSuccess,
}: ArchiveNotificationModalProps) => {
  const t = useTranslations('admin.modals.archiveNotification');
  const tCommon = useTranslations('common.actions');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !notification) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await notificationsApi.archive(notification.scheduleId);
      
      // Check both success and isSuccess formats
      const isSuccess = response.success !== undefined ? response.success : response.isSuccess;
      const message = response.message || response.resultMessage;

      if (isSuccess) {
        toast.success(message || t('success'));
        onSuccess?.();
        onClose();
      } else {
        toast.error(message || t('error'));
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                           (error as { message?: string })?.message || 
                           t('error');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            {t('confirm', { title: notification.title })}
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">
              <strong>{t('noteLabel')}:</strong> {t('note')}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
          >
            <Archive className="w-4 h-4 mr-2" />
            {isSubmitting ? t('archiving') : t('archive')}
          </Button>
        </div>
      </div>
    </div>
  );
};

