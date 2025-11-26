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
  selectedDivisionIds: string[];
  onSuccess?: () => void;
}

export const BulkEditDivisionModal = ({ isOpen, onClose, selectedDivisionIds, onSuccess }: BulkEditDivisionModalProps) => {
  const t = useTranslations('admin.divisionManagement');
  const tActions = useTranslations('common.actions');
  
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = useMemo(() => [
    { value: '', label: t('bulk.selectStatus') },
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
  ], [t]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setSelectedStatus('');
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

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.error(t('bulk.selectStatusError'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await divisionsApi.bulkUpdateStatus({
        divisionIds: selectedDivisionIds,
        status: selectedStatus as 'active' | 'inactive',
      });

      if (response.isSuccess) {
        toast.success(t('hooks.bulkUpdateSuccess', { count: response.data.updatedCount }));
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || t('hooks.bulkUpdateError'));
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('modals.bulkEdit.title')}</h2>
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

        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('form.status.label')} <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={statusOptions}
              value={selectedStatus}
              placeholder={t('bulk.selectStatus')}
              onChange={setSelectedStatus}
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10"
          >
            {tActions('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedStatus}
            className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
          >
            {isSubmitting ? t('modals.bulkEdit.submitting') : t('modals.bulkEdit.submit')}
          </Button>
        </div>
      </div>
    </div>
  );
};
