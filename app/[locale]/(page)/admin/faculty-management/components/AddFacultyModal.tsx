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

interface AddFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  divisions?: Array<{ value: string; label: string }>;
}

interface FormData {
  facultyName: string;
  facultyCode: string;
  divisionId: string;
  deanId?: string;
}

export const AddFacultyModal = ({ isOpen, onClose, onSuccess, divisions = [] }: AddFacultyModalProps) => {
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
    deanId: yup.string().optional(),
  }), [t]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      facultyName: '',
      facultyCode: '',
      divisionId: '',
      deanId: '',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formValues = watch();

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
    setIsSubmitting(true);
    try {
      const payload = {
        facultyName: data.facultyName,
        facultyCode: data.facultyCode,
        divisionId: data.divisionId,
        deanId: data.deanId || undefined,
        facultyStatus: 'active' as const,
      };

      const response = await facultiesApi.create(payload);

      if (response.success) {
        toast.success(t('hooks.createSuccess'));
        reset();
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || t('hooks.createError'));
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('modals.add.title')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('modals.add.description')}</p>
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

              {/* Mã ngành */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.facultyCode.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.facultyCode.placeholder')}
                  {...register('facultyCode')}
                  className={errors.facultyCode ? 'border-red-500' : ''}
                />
                {errors.facultyCode && <p className="mt-1 text-xs text-red-500">{errors.facultyCode.message}</p>}
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

              {/* Trưởng ngành (optional) */}
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
              {isSubmitting ? t('modals.add.submitting') : t('modals.add.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
