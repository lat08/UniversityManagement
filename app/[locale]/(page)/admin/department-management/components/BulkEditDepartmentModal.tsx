'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { DropdownSearch, Button, Input } from '@/app/components/ui';
import { departmentsApi, commonApi } from '../lib/api/departmentsApi';
import type { Faculty } from '../lib/types/types';

interface BulkEditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedDepartmentIds: string[];
}

export const BulkEditDepartmentModal = ({ isOpen, onClose, onSuccess, selectedDepartmentIds }: BulkEditDepartmentModalProps) => {
  const t = useTranslations('admin.departmentManagement');
  const tActions = useTranslations('common.actions');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [departmentCode, setDepartmentCode] = useState<string>('');
  const [departmentName, setDepartmentName] = useState<string>('');
  const [facultyId, setFacultyId] = useState<string>('');
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);

  // Load faculties on mount
  useEffect(() => {
    if (isOpen) {
      setLoadingFaculties(true);
      commonApi.getFaculties()
        .then(setFaculties)
        .catch(() => toast.error(t('hooks.loadFacultiesError')))
        .finally(() => setLoadingFaculties(false));
    }
  }, [isOpen, t]);

  const facultyOptions = useMemo(() => [
    { value: '', label: t('filters.noChange') },
    ...faculties.map(f => ({ value: f.facultyId, label: `${f.facultyCode} - ${f.facultyName}` }))
  ], [faculties, t]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setDepartmentCode('');
      setDepartmentName('');
      setFacultyId('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!departmentCode && !departmentName && !facultyId) {
      toast.error(t('hooks.bulkEditValidation'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Update each department individually
      const results = await Promise.allSettled(
        selectedDepartmentIds.map(async (id) => {
          const payload: { departmentCode?: string; departmentName?: string; facultyId?: string } = {};
          if (departmentCode) payload.departmentCode = departmentCode.toUpperCase().trim();
          if (departmentName) payload.departmentName = departmentName.trim();
          if (facultyId) payload.facultyId = facultyId;
          
          return departmentsApi.update(id, payload);
        })
      );

      const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
      
      if (failed.length > 0) {
        toast.success(t('hooks.bulkEditSuccess', { 
          success: selectedDepartmentIds.length - failed.length,
          total: selectedDepartmentIds.length 
        }));
      } else {
        toast.success(t('hooks.bulkEditSuccess', { 
          success: selectedDepartmentIds.length,
          total: selectedDepartmentIds.length 
        }));
      }

      setDepartmentCode('');
      setDepartmentName('');
      setFacultyId('');
      onSuccess?.();
      handleClose();
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
                {t('modals.bulkEdit.description', { count: selectedDepartmentIds.length })}
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
                {t('modals.bulkEdit.departmentCodeLabel')}
              </label>
              <Input
                placeholder={t('modals.bulkEdit.departmentCodePlaceholder')}
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('modals.bulkEdit.departmentNameLabel')}
              </label>
              <Input
                placeholder={t('modals.bulkEdit.departmentNamePlaceholder')}
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('modals.bulkEdit.facultyLabel')}
              </label>
              <DropdownSearch
                options={facultyOptions}
                value={facultyId}
                placeholder={t('modals.bulkEdit.facultyPlaceholder')}
                searchPlaceholder={t('form.facultyId.searchPlaceholder')}
                onChange={setFacultyId}
                disabled={loadingFaculties}
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
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('modals.bulkEdit.submitting') : t('modals.bulkEdit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

