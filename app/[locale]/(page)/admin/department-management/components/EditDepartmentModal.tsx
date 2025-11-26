'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { DropdownSearch, Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslations } from 'next-intl';
import { useDepartments } from '../lib/hooks/useDepartments';
import type { Department } from '../lib/types/types';

// Note: Edit modal không cho phép sửa curriculumIds và status
// CurriculumIds và status được quản lý riêng trong backend

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  department: Department | null;
}

type FormData = {
  departmentName: string;
  departmentCode: string;
  facultyId: string;
};

export const EditDepartmentModal = ({
  isOpen,
  onClose,
  onSuccess,
  department,
}: EditDepartmentModalProps) => {
  const t = useTranslations('admin.departmentManagement');
  const tCommon = useTranslations('common.actions');
  const { faculties, updateDepartment, isUpdating } = useDepartments();

  const validationSchema = useMemo(
    () =>
      yup.object({
        departmentName: yup
          .string()
          .required(t('form.departmentName.required'))
          .min(3, t('form.departmentName.min')),
        departmentCode: yup
          .string()
          .required(t('form.departmentCode.required'))
          .min(2, t('form.departmentCode.min')),
        facultyId: yup.string().required(t('form.faculty.required')),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    clearErrors,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      departmentName: '',
      departmentCode: '',
      facultyId: '',
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (isOpen && department) {
      setValue('departmentName', department.departmentName);
      setValue('departmentCode', department.departmentCode);
      setValue('facultyId', department.facultyId);
    }
  }, [isOpen, department, setValue]);

  const facultyOptions = faculties.map((f) => ({
    value: f.facultyId,
    label: f.facultyName,
  }));


  const handleClose = useCallback(() => {
    if (!isUpdating) {
      reset();
      onClose();
    }
  }, [isUpdating, reset, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isUpdating) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isUpdating, handleClose]);

  const onSubmit = async (data: FormData) => {
    if (!department) return;

    const payload = {
      departmentName: data.departmentName,
      departmentCode: data.departmentCode,
      facultyId: data.facultyId,
    };

    updateDepartment({ id: department.departmentId, data: payload });
    reset();
    onSuccess?.();
    handleClose();
  };

  if (!isOpen || !department) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isUpdating) {
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
              disabled={isUpdating}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Mã chuyên ngành */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.departmentCode.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.departmentCode.placeholder')}
                  {...register('departmentCode')}
                  className={errors.departmentCode ? 'border-red-500' : ''}
                  disabled
                />
                {errors.departmentCode && (
                  <p className="mt-1 text-xs text-red-500">{errors.departmentCode.message}</p>
                )}
              </div>

              {/* Tên chuyên ngành */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.departmentName.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.departmentName.placeholder')}
                  {...register('departmentName')}
                  className={errors.departmentName ? 'border-red-500' : ''}
                />
                {errors.departmentName && (
                  <p className="mt-1 text-xs text-red-500">{errors.departmentName.message}</p>
                )}
              </div>

              {/* Ngành học */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.faculty.label')} <span className="text-red-500">*</span>
                </label>
                <DropdownSearch
                  options={facultyOptions}
                  value={formValues.facultyId || ''}
                  placeholder={t('form.faculty.placeholder')}
                  searchPlaceholder={t('form.faculty.search')}
                  onChange={(value) => {
                    setValue('facultyId', value);
                    clearErrors('facultyId');
                  }}
                  buttonClassName={errors.facultyId ? 'border-red-500' : ''}
                />
                {errors.facultyId && (
                  <p className="mt-1 text-xs text-red-500">{errors.facultyId.message}</p>
                )}
              </div>

            </div>
          </div>

          <div className="flex gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? t('modals.edit.submitting') : t('modals.edit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


