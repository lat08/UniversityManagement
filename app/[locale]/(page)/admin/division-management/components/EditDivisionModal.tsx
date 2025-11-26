'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { Dropdown, Button, Input } from '@/app/components/ui';
import { divisionsApi } from '../lib/api/divisionsApi';
import type { Division } from '../lib/types/types';

interface EditDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  division: Division | null;
  onSuccess?: () => void;
}

interface FormData {
  divisionName: string;
  divisionStatus: string;
  deanId?: string;
}

export const EditDivisionModal = ({ isOpen, onClose, division, onSuccess }: EditDivisionModalProps) => {
  const t = useTranslations('admin.divisionManagement');
  const tActions = useTranslations('common.actions');
  
  const validationSchema = useMemo(() => yup.object({
    divisionName: yup
      .string()
      .required(t('form.divisionName.required'))
      .min(3, t('form.divisionName.min')),
    divisionStatus: yup
      .string()
      .required(t('form.status.required'))
      .oneOf(['active', 'inactive'], t('form.status.invalid')),
    deanId: yup.string().optional(),
  }), [t]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      divisionName: '',
      divisionStatus: 'active',
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
    if (division && isOpen) {
      setValue('divisionName', division.divisionName);
      setValue('divisionStatus', division.divisionStatus);
      setValue('deanId', division.deanId || '');
    }
  }, [division, isOpen, setValue]);

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
    if (!division) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        divisionName: data.divisionName,
        divisionStatus: data.divisionStatus as 'active' | 'inactive',
        deanId: data.deanId || undefined,
      };

      const response = await divisionsApi.update(division.divisionId, payload);

      if (response.isSuccess) {
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

  if (!isOpen || !division) return null;

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
                {t('modals.edit.description')} <span className="font-medium">{division.divisionCode}</span>
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
              {/* Mã khoa (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.divisionCode.label')}
                </label>
                <Input
                  value={division.divisionCode}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Tên khoa */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.divisionName.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.divisionName.placeholder')}
                  {...register('divisionName')}
                  className={errors.divisionName ? 'border-red-500' : ''}
                />
                {errors.divisionName && <p className="mt-1 text-xs text-red-500">{errors.divisionName.message}</p>}
              </div>

              {/* Trưởng khoa */}
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
                  value={formValues.divisionStatus}
                  placeholder={t('form.status.placeholder')}
                  onChange={(value) => setValue('divisionStatus', value)}
                />
                {errors.divisionStatus && <p className="mt-1 text-xs text-red-500">{errors.divisionStatus.message}</p>}
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
