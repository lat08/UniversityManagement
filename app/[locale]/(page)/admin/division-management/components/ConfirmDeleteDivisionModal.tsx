'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';
import { X, AlertTriangle } from 'lucide-react';
import type { Division } from '../lib/types/types';

interface ConfirmDeleteDivisionModalProps {
  isOpen: boolean;
  division: Division | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ConfirmDeleteDivisionModal = ({
  isOpen,
  division,
  onClose,
  onConfirm,
}: ConfirmDeleteDivisionModalProps) => {
  const t = useTranslations('admin.divisionManagement');
  const tActions = useTranslations('common.actions');

  const hasConstraints = useMemo(() => {
    if (!division) return false;
    return (division.facultyCount > 0) || (division.subjectCount > 0) || (division.instructorCount > 0);
  }, [division]);

  const constraintMessages = useMemo(() => {
    if (!division) return [];
    const messages: string[] = [];
    if (division.facultyCount > 0) {
      messages.push(t('modals.confirmDelete.constraints.faculty', { count: division.facultyCount }));
    }
    if (division.subjectCount > 0) {
      messages.push(t('modals.confirmDelete.constraints.subject', { count: division.subjectCount }));
    }
    if (division.instructorCount > 0) {
      messages.push(t('modals.confirmDelete.constraints.instructor', { count: division.instructorCount }));
    }
    return messages;
  }, [division, t]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
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
          <p className="text-gray-700 mb-4">
            {t('modals.confirmDelete.description', { name: division?.divisionName ?? tActions('noName') })}
          </p>

          {hasConstraints && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 mb-2">
                    {t('modals.confirmDelete.warningTitle')}
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                    {constraintMessages.map((message, index) => (
                      <li key={index}>{message}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-amber-700 mt-3 font-medium">
                    {t('modals.confirmDelete.warningNote')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-red-600">
            {t('modals.confirmDelete.note')}
          </p>
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

