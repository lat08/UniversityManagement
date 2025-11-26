'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';
import { X } from 'lucide-react';

interface ConfirmDeleteFacultyModalProps {
  isOpen: boolean;
  facultyName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ConfirmDeleteFacultyModal = ({
  isOpen,
  facultyName,
  onClose,
  onConfirm,
}: ConfirmDeleteFacultyModalProps) => {
  const t = useTranslations('admin.facultyManagement');
  const tActions = useTranslations('common.actions');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t('modals.confirmDelete.title')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            {t('modals.confirmDelete.description', { name: facultyName ?? tActions('noName') })}
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-red-700 font-medium">
              {t('modals.confirmDelete.warning')}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {t('modals.confirmDelete.note')}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {tActions('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {t('modals.confirmDelete.submit')}
          </Button>
        </div>
      </div>
    </div>
  );
};
