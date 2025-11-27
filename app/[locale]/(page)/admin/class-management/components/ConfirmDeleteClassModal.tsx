'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';
import { X, AlertTriangle } from 'lucide-react';
import type { Class } from '../lib/types/types';

interface ConfirmDeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: Class | null;
  onConfirm: () => void;
}

export default function ConfirmDeleteClassModal({
  isOpen,
  onClose,
  classItem,
  onConfirm,
}: ConfirmDeleteClassModalProps) {
  const t = useTranslations('admin.classManagement');
  const tCommon = useTranslations('common.actions');

  if (!isOpen || !classItem) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('modals.delete.title')}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              {t('modals.delete.message', { className: classItem.className })}
            </p>
            <p className="text-sm text-red-600 font-medium">
              {t('modals.delete.warning')}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {tCommon('delete')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

