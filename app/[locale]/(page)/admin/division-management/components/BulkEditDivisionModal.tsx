'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { Dropdown, Button } from '@/app/components/ui';
import { divisionsApi } from '../lib/api/divisionsApi';

interface BulkEditDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedDivisionIds: string[];
}

export const BulkEditDivisionModal = ({ isOpen, onClose, onSuccess, selectedDivisionIds }: BulkEditDivisionModalProps) => {
  const t = useTranslations('admin.divisionManagement');
  const tActions = useTranslations('common.actions');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [divisionStatus, setDivisionStatus] = useState<string>('');

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setDivisionStatus('');
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
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
  ], [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!divisionStatus) {
      toast.error(t('hooks.bulkEditValidation'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await divisionsApi.bulkUpdateStatus({
        divisionIds: selectedDivisionIds,
        status: divisionStatus as 'active' | 'inactive',
      });

      if (response.success) {
        toast.success(response.message || t('hooks.bulkEditSuccess', { count: selectedDivisionIds.length }));
        setDivisionStatus('');
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || t('hooks.bulkEditError'));
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
                {t('modals.bulkEdit.description', { count: selectedDivisionIds.length })}
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
                value={divisionStatus}
                placeholder={t('modals.bulkEdit.statusPlaceholder')}
                onChange={setDivisionStatus}
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

