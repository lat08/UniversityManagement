'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { Dropdown, DropdownSearch, Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslations } from 'next-intl';
import { useDepartments } from '../lib/hooks/useDepartments';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type FormData = {
  departmentName: string;
  departmentCode: string;
  facultyId: string;
  curriculumIds: string[];
};

export const AddDepartmentModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddDepartmentModalProps) => {
  const t = useTranslations('admin.departmentManagement');
  const tCommon = useTranslations('common.actions');
  const { faculties, curricula, createDepartment, isCreating } = useDepartments();

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
        curriculumIds: yup.array().of(yup.string()).min(1, t('form.curriculum.required')),
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
      curriculumIds: [],
    },
  });

  const formValues = watch();

  const facultyOptions = faculties.map((f) => ({
    value: f.facultyId,
    label: f.facultyName,
  }));

  const curriculumOptions = curricula.map((c) => ({
    value: c.curriculumId,
    label: c.curriculumName,
  }));

  const handleClose = useCallback(() => {
    if (!isCreating) {
      reset();
      onClose();
    }
  }, [isCreating, reset, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isCreating) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isCreating, handleClose]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      departmentName: data.departmentName,
      departmentCode: data.departmentCode,
      facultyId: data.facultyId,
      curriculumIds: data.curriculumIds.length > 0 ? data.curriculumIds : undefined,
    };

    createDepartment(payload);
    reset();
    onSuccess?.();
    handleClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isCreating) {
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
              disabled={isCreating}
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

              {/* Thuộc CTĐT */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.curriculum.label')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={curriculumOptions}
                  value={formValues.curriculumIds?.[0] || ''}
                  placeholder={t('form.curriculum.placeholder')}
                  onChange={(value) => {
                    setValue('curriculumIds', value ? [value] : []);
                    clearErrors('curriculumIds');
                  }}
                  buttonClassName={errors.curriculumIds ? 'border-red-500' : ''}
                />
                {errors.curriculumIds && (
                  <p className="mt-1 text-xs text-red-500">{errors.curriculumIds.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {t('form.curriculum.note', { defaultValue: 'Có thể chọn nhiều CTĐT sau khi tạo' })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? t('modals.add.submitting') : t('modals.add.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

