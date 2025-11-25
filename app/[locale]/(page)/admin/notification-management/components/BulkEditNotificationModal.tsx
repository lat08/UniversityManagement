'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Dropdown, Button } from '@/app/components/ui';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notificationsApi } from '../lib/api/notificationsApi';
import { NOTIFICATION_TYPE_OPTIONS, SENDING_METHOD_OPTIONS, STATUS_OPTIONS } from '../lib/types/types';

interface BulkEditNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedNotificationIds: string[];
}

export const BulkEditNotificationModal = ({ isOpen, onClose, onSuccess, selectedNotificationIds }: BulkEditNotificationModalProps) => {
  const t = useTranslations('admin.modals.bulkEditNotification');
  const tCommon = useTranslations('common.actions');
  const tNotif = useTranslations('admin.notificationManagement');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [notificationType, setNotificationType] = useState<string>('');
  const [sendingMethod, setSendingMethod] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isActive, setIsActive] = useState<string>('');

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setNotificationType('');
      setSendingMethod('');
      setStatus('');
      setIsActive('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notificationType && !sendingMethod && !status && !isActive) {
      toast.error(t('selectAtLeastOne'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: {
        scheduleIds: string[];
        notificationType?: string;
        sendingMethod?: string;
        status?: string;
        isActive?: boolean;
      } = {
        scheduleIds: selectedNotificationIds,
      };

      if (notificationType) payload.notificationType = notificationType;
      if (sendingMethod) payload.sendingMethod = sendingMethod;
      if (status) payload.status = status;
      if (isActive) payload.isActive = isActive === 'true';

      const response = await notificationsApi.bulkUpdate(payload);

      // Check both success and isSuccess formats
      const isSuccess = response.success !== undefined ? response.success : response.isSuccess;
      const message = response.message || response.resultMessage;

      if (isSuccess) {
        toast.success(message || t('success', { count: selectedNotificationIds.length }));
        setNotificationType('');
        setSendingMethod('');
        setStatus('');
        setIsActive('');
        onSuccess?.();
        handleClose();
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

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  const notificationTypeOptions = [
    { value: '', label: t('noChange') },
    ...NOTIFICATION_TYPE_OPTIONS,
  ];

  const sendingMethodOptions = [
    { value: '', label: t('noChange') },
    ...SENDING_METHOD_OPTIONS,
  ];

  const statusOptions = [
    { value: '', label: t('noChange') },
    ...STATUS_OPTIONS.filter(s => s.value !== ''), // Remove "Tất cả" option
  ];

  const isActiveOptions = [
    { value: '', label: t('noChange') },
    { value: 'true', label: t('active') },
    { value: 'false', label: t('inactive') },
  ];

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
                {t('selected', { count: selectedNotificationIds.length })}
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

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('fields.notificationType')}
              </label>
              <Dropdown
                options={notificationTypeOptions}
                value={notificationType}
                placeholder={tNotif('selectType')}
                onChange={setNotificationType}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('fields.sendingMethod')}
              </label>
              <Dropdown
                options={sendingMethodOptions}
                value={sendingMethod}
                placeholder={tNotif('selectMethod')}
                onChange={setSendingMethod}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('fields.status')}
              </label>
              <Dropdown
                options={statusOptions}
                value={status}
                placeholder={t('selectStatus')}
                onChange={setStatus}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('fields.isActive')}
              </label>
              <Dropdown
                options={isActiveOptions}
                value={isActive}
                placeholder={t('selectIsActive')}
                onChange={setIsActive}
              />
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('updating') : t('update')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

