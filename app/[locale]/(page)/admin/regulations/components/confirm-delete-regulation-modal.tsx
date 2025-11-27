'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui/button';
import { X } from 'lucide-react';

interface ConfirmDeleteRegulationModalProps {
  readonly isOpen: boolean;
  readonly regulationTitle?: string;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export const ConfirmDeleteRegulationModal = ({
  isOpen,
  regulationTitle,
  onClose,
  onConfirm,
}: ConfirmDeleteRegulationModalProps) => {
  const t = useTranslations('admin.regulations');
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('delete.title')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} type="button" aria-label={t('delete.cancel')}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 py-5">
          <p className="text-gray-700">
            {t('delete.message', { title: regulationTitle ?? t('delete.defaultName') })}
          </p>
          <p className="mt-2 text-sm text-red-600">{t('delete.warning')}</p>
        </div>

        <div className="flex gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t('delete.cancel')}
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-600 text-white hover:bg-red-700">
            {t('delete.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};


