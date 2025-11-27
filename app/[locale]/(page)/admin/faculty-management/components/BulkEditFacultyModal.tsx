'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { Dropdown, Button } from '@/app/components/ui';
import { facultiesApi } from '../lib/api/facultiesApi';

interface BulkEditFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedFacultyIds: string[];
}

export const BulkEditFacultyModal = ({ isOpen, onClose, onSuccess, selectedFacultyIds }: BulkEditFacultyModalProps) => {
  const t = useTranslations('admin.facultyManagement');
  const tActions = useTranslations('common.actions');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isActive, setIsActive] = useState<string>('');

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
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

  const statusOptions = useMemo(() => [
    { value: '', label: t('filters.noChange') },
    { value: 'true', label: t('status.active') },
    { value: 'false', label: t('status.inactive') },
  ], [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isActive) {
      toast.error(t('hooks.bulkEditValidation'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Update each faculty individually
      const results = await Promise.allSettled(
        selectedFacultyIds.map(id => 
          facultiesApi.update(id, { isActive: isActive === 'true' })
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      
      if (successCount > 0) {
        toast.success(t('hooks.bulkEditSuccess', { count: successCount }));
        setIsActive('');
        onSuccess?.();
        handleClose();
      } else {
        toast.error(t('hooks.bulkEditError'));
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                           (error as { message?: string })?.message || 
                           t('hooks.genericError');
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
                {t('modals.bulkEdit.description', { count: selectedFacultyIds.length })}
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
                {t('modals.bulkEdit.statusLabel')}
              </label>
              <Dropdown
                options={statusOptions}
                value={isActive}
                placeholder={t('modals.bulkEdit.statusPlaceholder')}
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
              {tActions('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#0053AD] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('modals.bulkEdit.submitting') : t('modals.bulkEdit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

