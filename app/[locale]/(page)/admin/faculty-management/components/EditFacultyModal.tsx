'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { Dropdown, Button, Input } from '@/app/components/ui';
import { facultiesApi } from '../lib/api/facultiesApi';
import type { Faculty } from '../lib/types/types';

interface EditFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: Faculty | null;
  onSuccess?: () => void;
  divisions?: Array<{ value: string; label: string }>;
}

interface FormData {
  facultyName: string;
  facultyCode: string;
  divisionId: string;
  facultyStatus: string;
  deanId?: string;
}

export const EditFacultyModal = ({ isOpen, onClose, faculty, onSuccess, divisions = [] }: EditFacultyModalProps) => {
  const t = useTranslations('admin.facultyManagement');
  const tActions = useTranslations('common.actions');
  
  const validationSchema = useMemo(() => yup.object({
    facultyName: yup
      .string()
      .required(t('form.facultyName.required'))
      .min(3, t('form.facultyName.min')),
    facultyCode: yup
      .string()
      .required(t('form.facultyCode.required'))
      .min(2, t('form.facultyCode.min')),
    divisionId: yup
      .string()
      .required(t('form.divisionId.required')),
    facultyStatus: yup
      .string()
      .required(t('form.status.required'))
      .oneOf(['active', 'inactive'], t('form.status.invalid')),
    deanId: yup.string().optional(),
  }), [t]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      facultyName: '',
      facultyCode: '',
      divisionId: '',
      facultyStatus: 'active',
      deanId: '',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formValues = watch();

  const statusOptions = useMemo(() => [
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
  ], [t]);

  useEffect(() => {
    if (faculty && isOpen) {
      setValue('facultyName', faculty.facultyName);
      setValue('facultyCode', faculty.facultyCode);
      setValue('divisionId', faculty.divisionId);
      setValue('facultyStatus', faculty.facultyStatus);
      setValue('deanId', faculty.deanId || '');
    }
  }, [faculty, isOpen, setValue]);

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
    if (!faculty) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        facultyName: data.facultyName,
        facultyCode: data.facultyCode,
        divisionId: data.divisionId,
        facultyStatus: data.facultyStatus as 'active' | 'inactive',
        deanId: data.deanId || undefined,
      };

      const response = await facultiesApi.update(faculty.facultyId, payload);

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

  if (!isOpen || !faculty) return null;

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
              <p className="text-sm text-gray-600 mt-1">
                {t('modals.edit.description')} <span className="font-medium">{faculty.facultyCode}</span>
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-6">
              {/* Mã ngành (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.facultyCode.label')}
                </label>
                <Input
                  value={faculty.facultyCode}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Tên ngành */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.facultyName.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.facultyName.placeholder')}
                  {...register('facultyName')}
                  className={errors.facultyName ? 'border-red-500' : ''}
                />
                {errors.facultyName && <p className="mt-1 text-xs text-red-500">{errors.facultyName.message}</p>}
              </div>

              {/* Khoa phụ trách */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.divisionId.label')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={divisions}
                  value={formValues.divisionId}
                  placeholder={t('form.divisionId.placeholder')}
                  onChange={(value) => setValue('divisionId', value)}
                />
                {errors.divisionId && <p className="mt-1 text-xs text-red-500">{errors.divisionId.message}</p>}
              </div>

              {/* Trưởng ngành */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.deanId.label')}
                </label>
                <Input
                  placeholder={t('form.deanId.placeholder')}
                  {...register('deanId')}
                  className={errors.deanId ? 'border-red-500' : ''}
                />
                {errors.deanId && <p className="mt-1 text-xs text-red-500">{errors.deanId.message}</p>}
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.status.label')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formValues.facultyStatus}
                  placeholder={t('form.status.placeholder')}
                  onChange={(value) => setValue('facultyStatus', value)}
                />
                {errors.facultyStatus && <p className="mt-1 text-xs text-red-500">{errors.facultyStatus.message}</p>}
              </div>
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
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
            >
              {isSubmitting ? t('modals.edit.submitting') : t('modals.edit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
