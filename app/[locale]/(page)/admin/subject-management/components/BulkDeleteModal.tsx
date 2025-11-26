'use client';

import { useEffect, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/app/components/ui';
import { subjectsApi } from '../lib/api/subjectsApi';

interface BulkDeleteModalProps {
  isOpen: boolean;
  selectedSubjectIds: string[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BulkDeleteModal({
  isOpen,
  selectedSubjectIds,
  onClose,
  onSuccess,
}: BulkDeleteModalProps) {
  const t = useTranslations('admin.subjectManagement.bulkDeleteModal');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = useCallback(() => {
    if (isDeleting) return;
    onClose();
  }, [isDeleting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isDeleting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDeleting, handleClose]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      const promises = selectedSubjectIds.map((id) => subjectsApi.deleteSubject(id));
      const results = await Promise.allSettled(promises);

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(t('success', { count: successCount }));
      }
      if (failCount > 0) {
        toast.error(t('error', { count: failCount }));
      }

      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || t('errorGeneric');
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) {
      handleClose();
    }
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
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isDeleting}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">{t('warning')}</p>
                <p className="text-sm text-red-800">{t('message', { count: selectedSubjectIds.length })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? t('deleting') : t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}





