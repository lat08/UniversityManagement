'use client';

import { useCallback, useEffect, useState } from 'react';
import { Dropdown, Button } from '@/app/components/ui';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { useDepartments } from '../lib/hooks/useDepartments';

interface BulkEditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedDepartmentIds: string[];
}

export const BulkEditDepartmentModal = ({
  isOpen,
  onClose,
  onSuccess,
  selectedDepartmentIds,
}: BulkEditDepartmentModalProps) => {
  const t = useTranslations('admin.departmentManagement');
  const tCommon = useTranslations('common.actions');
  const { faculties, bulkEditDepartments, isBulkEditing } = useDepartments();

  const [facultyId, setFacultyId] = useState<string>('');

  const facultyOptions = [
    { value: '', label: t('filters.noChange') },
    ...faculties.map((f) => ({ value: f.facultyId, label: f.facultyName })),
  ];


  const handleClose = useCallback(() => {
    if (!isBulkEditing) {
      setFacultyId('');
      onClose();
    }
  }, [isBulkEditing, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBulkEditing) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isBulkEditing, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facultyId) {
      toast.error(t('hooks.bulkEditValidation'));
      return;
    }

    const updates: {
      facultyId?: string;
    } = {};

    if (facultyId) updates.facultyId = facultyId;

    bulkEditDepartments({ ids: selectedDepartmentIds, updates });
    setFacultyId('');
    onSuccess?.();
    handleClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isBulkEditing) {
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
              <h2 className="text-2xl font-bold text-gray-900">{t('modals.bulkEdit.title')}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('modals.bulkEdit.description', { count: selectedDepartmentIds.length })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isBulkEditing}
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
                {t('form.faculty.label')}
              </label>
              <Dropdown
                options={facultyOptions}
                value={facultyId}
                placeholder={t('form.faculty.placeholder')}
                onChange={setFacultyId}
              />
            </div>

          </div>

          <div className="flex gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isBulkEditing}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isBulkEditing}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBulkEditing ? t('modals.bulkEdit.submitting') : t('modals.bulkEdit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

