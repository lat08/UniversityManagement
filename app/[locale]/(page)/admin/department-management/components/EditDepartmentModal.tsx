'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { DropdownSearch, Button, Input } from '@/app/components/ui';
import { departmentsApi, commonApi } from '../lib/api/departmentsApi';
import type { Department, Faculty } from '../lib/types/types';

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  department: Department | null;
}

interface FormData {
  departmentCode?: string;
  departmentName?: string;
  facultyId?: string;
}

export const EditDepartmentModal = ({ isOpen, onClose, onSuccess, department }: EditDepartmentModalProps) => {
  const t = useTranslations('admin.departmentManagement');
  const tActions = useTranslations('common.actions');
  
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);

  const validationSchema = useMemo(() => yup.object({
    departmentCode: yup
      .string()
      .optional()
      .matches(/^[A-Z0-9_]+$/, t('form.departmentCode.invalid'))
      .max(50, t('form.departmentCode.max')),
    departmentName: yup
      .string()
      .optional()
      .max(200, t('form.departmentName.max')),
    facultyId: yup
      .string()
      .optional(),
  }), [t]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      departmentCode: '',
      departmentName: '',
      facultyId: '',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formValues = watch();

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

  useEffect(() => {
    if (isOpen && department) {
      setValue('departmentCode', department.departmentCode);
      setValue('departmentName', department.departmentName);
      setValue('facultyId', department.facultyId);
    }
  }, [isOpen, department, setValue]);

  const facultyOptions = useMemo(() => [
    { value: '', label: t('form.facultyId.placeholder') },
    ...faculties.map(f => ({ value: f.facultyId, label: `${f.facultyCode} - ${f.facultyName}` }))
  ], [faculties, t]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  }, [isSubmitting, reset, onClose]);

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

  const onSubmit = async (data: FormData) => {
    if (!department) return;
    
    setIsSubmitting(true);
    try {
      const payload: FormData = {};
      
      if (data.departmentCode && data.departmentCode !== department.departmentCode) {
        payload.departmentCode = data.departmentCode.toUpperCase().trim();
      }
      if (data.departmentName && data.departmentName !== department.departmentName) {
        payload.departmentName = data.departmentName.trim();
      }
      if (data.facultyId && data.facultyId !== department.facultyId) {
        payload.facultyId = data.facultyId;
      }

      // Only update if there are changes
      if (Object.keys(payload).length === 0) {
        toast.success(t('hooks.noChanges'));
        handleClose();
        return;
      }

      const response = await departmentsApi.update(department.departmentId, payload);

      if (response.success) {
        toast.success(t('hooks.updateSuccess'));
        reset();
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || t('hooks.updateError'));
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

  if (!isOpen || !department) return null;

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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('modals.edit.title')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('modals.edit.description')}</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Mã chuyên ngành */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.departmentCode.label')}
                </label>
                <Input
                  placeholder={t('form.departmentCode.placeholder')}
                  {...register('departmentCode')}
                  className={errors.departmentCode ? 'border-red-500' : ''}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.departmentCode && <p className="mt-1 text-xs text-red-500">{errors.departmentCode.message}</p>}
                <p className="mt-1 text-xs text-gray-500">{t('form.departmentCode.hint')}</p>
              </div>

              {/* Tên chuyên ngành */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.departmentName.label')}
                </label>
                <Input
                  placeholder={t('form.departmentName.placeholder')}
                  {...register('departmentName')}
                  className={errors.departmentName ? 'border-red-500' : ''}
                />
                {errors.departmentName && <p className="mt-1 text-xs text-red-500">{errors.departmentName.message}</p>}
              </div>

              {/* Ngành */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.facultyId.label')}
                </label>
                <DropdownSearch
                  options={facultyOptions}
                  value={formValues.facultyId || ''}
                  placeholder={t('form.facultyId.placeholder')}
                  searchPlaceholder={t('form.facultyId.searchPlaceholder')}
                  onChange={(value) => setValue('facultyId', value)}
                  disabled={loadingFaculties}
                />
                {errors.facultyId && <p className="mt-1 text-xs text-red-500">{errors.facultyId.message}</p>}
              </div>
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
              {isSubmitting ? t('modals.edit.submitting') : t('modals.edit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

