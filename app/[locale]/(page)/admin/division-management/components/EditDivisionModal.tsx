'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { DropdownSearch, Button, Input, Dropdown } from '@/app/components/ui';
import { divisionsApi, commonApi, type Instructor } from '../lib/api/divisionsApi';
import type { Division } from '../lib/types/types';

interface EditDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  division: Division | null;
}

interface FormData {
  divisionName: string;
  deanId?: string;
  divisionStatus?: string;
}

export const EditDivisionModal = ({ isOpen, onClose, onSuccess, division }: EditDivisionModalProps) => {
  const t = useTranslations('admin.divisionManagement');
  const tActions = useTranslations('common.actions');
  
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [instructorSearchQuery, setInstructorSearchQuery] = useState('');

  const validationSchema = useMemo(() => yup.object({
    divisionName: yup
      .string()
      .required(t('form.divisionName.required'))
      .max(200, t('form.divisionName.max')),
    deanId: yup.string().optional(),
    divisionStatus: yup.string().optional(),
  }), [t]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      divisionName: '',
      deanId: undefined,
      divisionStatus: 'active',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formValues = watch();

  useEffect(() => {
    if (isOpen && division) {
      setValue('divisionName', division.divisionName);
      setValue('deanId', division.deanId || undefined);
      setValue('divisionStatus', division.divisionStatus || 'active');
    }
  }, [isOpen, division, setValue]);

  // Load instructors on mount and when search query changes
  useEffect(() => {
    if (isOpen) {
      const loadInstructors = async () => {
        setLoadingInstructors(true);
        try {
          const data = await commonApi.getInstructors(instructorSearchQuery || undefined);
          setInstructors(data);
        } catch {
          toast.error(t('hooks.loadInstructorsError'));
        } finally {
          setLoadingInstructors(false);
        }
      };

      const timer = setTimeout(() => {
        loadInstructors();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, instructorSearchQuery, t]);

  const instructorOptions = useMemo(() => [
    { value: '', label: t('form.deanId.placeholder') },
    ...instructors.map(i => ({ 
      value: i.instructorId, 
      label: `${i.instructorCode} - ${i.fullName}` 
    }))
  ], [instructors, t]);

  const statusOptions = useMemo(() => [
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
  ], [t]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset();
      setInstructorSearchQuery('');
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
        deanId: data.deanId && data.deanId !== '' ? data.deanId : undefined,
        divisionStatus: (data.divisionStatus as 'active' | 'inactive') || 'active',
      };

      const response = await divisionsApi.update(division.divisionId, payload);

      if (response.success) {
        toast.success(t('hooks.updateSuccess'));
        reset();
        setInstructorSearchQuery('');
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
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.deanId.label')}
                </label>
                <DropdownSearch
                  options={instructorOptions}
                  value={formValues.deanId || ''}
                  placeholder={t('form.deanId.placeholder')}
                  searchPlaceholder={t('form.deanId.searchPlaceholder')}
                  onChange={(value) => {
                    setValue('deanId', value && value !== '' ? value : undefined);
                  }}
                  onSearch={setInstructorSearchQuery}
                  disabled={loadingInstructors}
                  showEmptyOption
                  emptyOptionLabel={t('form.deanId.placeholder')}
                />
                {errors.deanId && <p className="mt-1 text-xs text-red-500">{errors.deanId.message}</p>}
              </div>

              {/* Trạng thái */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.status.label')}
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formValues.divisionStatus || 'active'}
                  placeholder={t('form.status.placeholder')}
                  onChange={(value) => setValue('divisionStatus', value)}
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
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#0053AD] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('modals.edit.submitting') : t('modals.edit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

