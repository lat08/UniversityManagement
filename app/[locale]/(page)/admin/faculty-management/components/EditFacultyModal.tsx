'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { DropdownSearch, Button, Input, Dropdown } from '@/app/components/ui';
import { facultiesApi, commonApi } from '../lib/api/facultiesApi';
import type { Faculty, Division, Instructor } from '../lib/types/types';

interface EditFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  faculty: Faculty | null;
}

interface FormData {
  facultyCode: string;
  facultyName: string;
  divisionId: string;
  deanId?: string;
  isActive?: boolean;
}

export const EditFacultyModal = ({ isOpen, onClose, onSuccess, faculty }: EditFacultyModalProps) => {
  const t = useTranslations('admin.facultyManagement');
  const tActions = useTranslations('common.actions');
  
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [instructorSearchQuery, setInstructorSearchQuery] = useState('');

  const validationSchema = useMemo(() => yup.object({
    facultyCode: yup
      .string()
      .required(t('form.facultyCode.required'))
      .matches(/^[A-Z0-9_]+$/, t('form.facultyCode.invalid'))
      .max(50, t('form.facultyCode.max')),
    facultyName: yup
      .string()
      .required(t('form.facultyName.required'))
      .max(200, t('form.facultyName.max')),
    divisionId: yup
      .string()
      .required(t('form.divisionId.required')),
    deanId: yup.string().optional(),
    isActive: yup.boolean().optional(),
  }), [t]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      facultyCode: '',
      facultyName: '',
      divisionId: '',
      deanId: undefined,
      isActive: true,
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formValues = watch();

  useEffect(() => {
    if (isOpen && faculty) {
      setValue('facultyCode', faculty.facultyCode);
      setValue('facultyName', faculty.facultyName);
      setValue('divisionId', faculty.divisionId || '');
      setValue('deanId', faculty.deanId || undefined);
      setValue('isActive', faculty.isActive ?? true);
    }
  }, [isOpen, faculty, setValue]);

  // Load divisions on mount
  useEffect(() => {
    if (isOpen) {
      setLoadingDivisions(true);
      commonApi.getDivisions()
        .then(setDivisions)
        .catch(() => toast.error(t('errors.loadDivisions')))
        .finally(() => setLoadingDivisions(false));
    }
  }, [isOpen]);

  // Load instructors on mount and when search query changes
  useEffect(() => {
    if (isOpen) {
      const loadInstructors = async () => {
        setLoadingInstructors(true);
        try {
          const data = await commonApi.getInstructors(instructorSearchQuery || undefined);
          setInstructors(data);
        } catch {
          toast.error(t('errors.loadInstructors'));
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

  const divisionOptions = useMemo(() => [
    { value: '', label: t('form.divisionId.placeholder') },
    ...divisions.map(d => ({ value: d.divisionId, label: `${d.divisionCode} - ${d.divisionName}` }))
  ], [divisions, t]);

  const instructorOptions = useMemo(() => [
    { value: '', label: t('form.deanId.placeholder') },
    ...instructors.map(i => ({ 
      value: i.instructorId, 
      label: `${i.instructorCode} - ${i.fullName}` 
    }))
  ], [instructors, t]);

  const statusOptions = useMemo(() => [
    { value: 'true', label: t('status.active') },
    { value: 'false', label: t('status.inactive') },
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
    if (!faculty) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        facultyCode: data.facultyCode.toUpperCase().trim(),
        facultyName: data.facultyName.trim(),
        divisionId: data.divisionId,
        deanId: data.deanId && data.deanId !== '' ? data.deanId : undefined,
        isActive: data.isActive ?? true,
      };

      const response = await facultiesApi.update(faculty.facultyId, payload);

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
              {/* Mã ngành */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.facultyCode.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.facultyCode.placeholder')}
                  {...register('facultyCode')}
                  className={errors.facultyCode ? 'border-red-500' : ''}
                  onChange={(e) => {
                    setValue('facultyCode', e.target.value.toUpperCase());
                  }}
                />
                {errors.facultyCode && <p className="mt-1 text-xs text-red-500">{errors.facultyCode.message}</p>}
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

              {/* Khoa */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.divisionId.label')} <span className="text-red-500">*</span>
                </label>
                <DropdownSearch
                  options={divisionOptions}
                  value={formValues.divisionId || ''}
                  placeholder={t('form.divisionId.placeholder')}
                  searchPlaceholder={t('form.divisionId.searchPlaceholder')}
                  onChange={(value) => {
                    setValue('divisionId', value);
                  }}
                  disabled={loadingDivisions}
                />
                {errors.divisionId && <p className="mt-1 text-xs text-red-500">{errors.divisionId.message}</p>}
              </div>

              {/* Trưởng ngành */}
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
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.isActive.label')}
                </label>
                <Dropdown
                  options={statusOptions}
                  value={String(formValues.isActive ?? true)}
                  placeholder={t('form.isActive.placeholder')}
                  onChange={(value) => {
                    setValue('isActive', value === 'true');
                  }}
                />
                {errors.isActive && <p className="mt-1 text-xs text-red-500">{errors.isActive.message}</p>}
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

