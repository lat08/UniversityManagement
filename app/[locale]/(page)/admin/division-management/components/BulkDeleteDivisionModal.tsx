'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';
import type { Division } from '../lib/types/types';

interface BulkDeleteDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedDivisionIds: string[];
  divisions: Division[];
  isDeleting?: boolean;
}

export const BulkDeleteDivisionModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedDivisionIds,
  divisions,
  isDeleting = false
}: BulkDeleteDivisionModalProps) => {
  const t = useTranslations('admin.divisionManagement');
  const tActions = useTranslations('common.actions');

  const selectedDivisions = useMemo(() => {
    return divisions.filter(d => selectedDivisionIds.includes(d.divisionId));
  }, [divisions, selectedDivisionIds]);

  const hasConstraints = useMemo(() => {
    return selectedDivisions.some(d => 
      (d.facultyCount > 0) || (d.subjectCount > 0) || (d.instructorCount > 0)
    );
  }, [selectedDivisions]);

  const totalConstraints = useMemo(() => {
    return {
      faculties: selectedDivisions.reduce((sum, d) => sum + d.facultyCount, 0),
      subjects: selectedDivisions.reduce((sum, d) => sum + d.subjectCount, 0),
      instructors: selectedDivisions.reduce((sum, d) => sum + d.instructorCount, 0),
    };
  }, [selectedDivisions]);

  const constraintMessages = useMemo(() => {
    const messages: string[] = [];
    if (totalConstraints.faculties > 0) {
      messages.push(t('modals.bulkDelete.constraints.faculty', { count: totalConstraints.faculties }));
    }
    if (totalConstraints.subjects > 0) {
      messages.push(t('modals.bulkDelete.constraints.subject', { count: totalConstraints.subjects }));
    }
    if (totalConstraints.instructors > 0) {
      messages.push(t('modals.bulkDelete.constraints.instructor', { count: totalConstraints.instructors }));
    }
    return messages;
  }, [totalConstraints, t]);

  const handleClose = useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [isDeleting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isDeleting, handleClose]);

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
            <h2 className="text-xl font-bold text-gray-900">{t('modals.bulkDelete.title')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isDeleting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            {t('modals.bulkDelete.description', { count: selectedDivisionIds.length })}
          </p>

          {hasConstraints && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 mb-2">
                    {t('modals.bulkDelete.warningTitle')}
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                    {constraintMessages.map((message, index) => (
                      <li key={index}>{message}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-amber-700 mt-3 font-medium">
                    {t('modals.bulkDelete.warningNote')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500">
            {t('modals.bulkDelete.note')}
          </p>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1"
          >
            {tActions('cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? t('modals.bulkDelete.submitting') : t('modals.bulkDelete.submit')}
          </Button>
        </div>
      </div>
    </div>
  );
};

