'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { Dropdown, Button, Input } from '@/app/components/ui';
import { buildingsApi } from '../lib/api/buildingsApi';
import type { Building } from '../lib/types/types';

interface EditBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  building: Building | null;
}

interface FormData {
  buildingName: string;
  buildingCode: string;
  address?: string;
  buildingStatus?: string;
}

export const EditBuildingModal = ({ isOpen, onClose, onSuccess, building }: EditBuildingModalProps) => {
  const t = useTranslations('admin.buildingManagement');
  const tActions = useTranslations('common.actions');
  const validationSchema = useMemo(() => yup.object({
    buildingName: yup
      .string()
      .required(t('form.buildingName.required'))
      .min(3, t('form.buildingName.min')),
    buildingCode: yup
      .string()
      .required(t('form.buildingCode.required'))
      .min(2, t('form.buildingCode.min')),
    address: yup.string().optional(),
    buildingStatus: yup.string().optional(),
  }), [t]);
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      buildingName: '',
      buildingCode: '',
      address: '',
      buildingStatus: 'active',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formValues = watch();

  useEffect(() => {
    if (isOpen && building) {
      setValue('buildingName', building.buildingName);
      setValue('buildingCode', building.buildingCode);
      setValue('address', building.address || '');
      setValue('buildingStatus', building.buildingStatus);
    }
  }, [isOpen, building, setValue]);

  const statusOptions = useMemo(() => [
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
  ], [t]);

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
    if (!building) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        buildingName: data.buildingName,
        buildingCode: data.buildingCode,
        address: data.address || undefined,
        buildingStatus: (data.buildingStatus as 'active' | 'inactive') || 'active',
      };

      const response = await buildingsApi.update(building.buildingId, payload);

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

  if (!isOpen || !building) return null;

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
              {/* Mã tòa nhà */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.buildingCode.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.buildingCode.placeholder')}
                  {...register('buildingCode')}
                  className={errors.buildingCode ? 'border-red-500' : ''}
                  disabled
                />
                {errors.buildingCode && <p className="mt-1 text-xs text-red-500">{errors.buildingCode.message}</p>}
              </div>

              {/* Tên tòa nhà */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.buildingName.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.buildingName.placeholder')}
                  {...register('buildingName')}
                  className={errors.buildingName ? 'border-red-500' : ''}
                />
                {errors.buildingName && <p className="mt-1 text-xs text-red-500">{errors.buildingName.message}</p>}
              </div>

              {/* Địa chỉ */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.address.label')}
                </label>
                <Input
                  placeholder={t('form.address.placeholder')}
                  {...register('address')}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
              </div>

              {/* Trạng thái */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.status.label')}
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formValues.buildingStatus || 'active'}
                  placeholder={t('form.status.placeholder')}
                  onChange={(value) => setValue('buildingStatus', value)}
                />
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

