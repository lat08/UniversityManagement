'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { Dropdown, Button, Input } from '@/app/components/ui';
import { commonApi } from '@/lib/api/common';
import { subjectsApi } from '../lib/api/subjectsApi';
import type { CreateSubjectPayload, Department } from '../lib/types/types';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddSubjectModal({ isOpen, onClose, onSuccess }: AddSubjectModalProps) {
  const t = useTranslations('admin.subjectManagement.addModal');
  const tCommon = useTranslations('common.actions');

  const validationSchema = useMemo(
    () =>
      yup.object({
        subjectName: yup
          .string()
          .required(t('form.subjectName.required'))
          .max(200, t('form.subjectName.max')),
        subjectCode: yup
          .string()
          .required(t('form.subjectCode.required'))
          .max(50, t('form.subjectCode.max')),
        credits: yup
          .number()
          .required(t('form.credits.required'))
          .min(1, t('form.credits.min'))
          .max(10, t('form.credits.max')),
        theoryHours: yup
          .number()
          .required(t('form.theoryHours.required'))
          .min(0, t('form.theoryHours.min')),
        practiceHours: yup
          .number()
          .required(t('form.practiceHours.required'))
          .min(0, t('form.practiceHours.min')),
        isGeneral: yup.boolean().required(t('form.isGeneral.required')),
        departmentId: yup.string().required(t('form.departmentId.required')),
        subjectStatus: yup.string().required(t('form.subjectStatus.required')),
        prerequisiteSubjectId: yup.string().nullable(),
        description: yup.string().max(500, t('form.description.max')).nullable(),
      }),
    [t],
  );

  type FormData = InferType<typeof validationSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      subjectName: '',
      subjectCode: '',
      credits: 3,
      theoryHours: 30,
      practiceHours: 0,
      isGeneral: false,
      departmentId: '',
      subjectStatus: 'active',
      prerequisiteSubjectId: '',
      description: '',
    },
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [prerequisiteSubjects, setPrerequisiteSubjects] = useState<
    { subjectId: string; displayName: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formValues = watch();

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const [departmentsRes, subjectsRes] = await Promise.all([
          commonApi.getDepartments({}),
          commonApi.getSubjects({}),
        ]);
        if (departmentsRes.success) setDepartments(departmentsRes.data);
        if (subjectsRes.success) {
          setPrerequisiteSubjects(
            subjectsRes.data.map(
              (s: { subjectId: string; subjectName: string; subjectCode: string }) => ({
                subjectId: s.subjectId,
                displayName: `${s.subjectName} - ${s.subjectCode}`,
              }),
            ),
          );
        }
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    reset();
    onClose();
  }, [isSubmitting, reset, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, handleClose]);

  const onSubmit = async (data: FormData) => {
    if (data.theoryHours === 0 && data.practiceHours === 0) {
      toast.error(t('validation.hoursRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateSubjectPayload = {
        subjectName: data.subjectName.trim(),
        subjectCode: data.subjectCode.trim().toUpperCase(),
        credits: data.credits,
        theoryHours: data.theoryHours,
        practiceHours: data.practiceHours,
        isGeneral: data.isGeneral,
        departmentId: data.departmentId,
        subjectStatus: data.subjectStatus as 'active' | 'inactive' | 'archived',
        prerequisiteSubjectId: data.prerequisiteSubjectId || undefined,
      };

      const res = await subjectsApi.createSubject(payload);
      if (res.success) {
        toast.success(t('success'));
        onSuccess?.();
        handleClose();
      } else {
        toast.error(res.message || t('error'));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || t('errorGeneric');
      toast.error(msg);
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

  const statusOptions = [
    { value: 'active', label: t('statusOptions.active') },
    { value: 'inactive', label: t('statusOptions.inactive') },
    { value: 'archived', label: t('statusOptions.archived') },
  ];

  const isGeneralOptions = [
    { value: 'true', label: t('isGeneralOptions.general') },
    { value: 'false', label: t('isGeneralOptions.specialized') },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('description')}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.subjectName.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.subjectName.placeholder')}
                  {...register('subjectName')}
                  className={errors.subjectName ? 'border-red-500' : ''}
                />
                {errors.subjectName && (
                  <p className="mt-1 text-xs text-red-500">{errors.subjectName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.subjectCode.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.subjectCode.placeholder')}
                  {...register('subjectCode')}
                  className={errors.subjectCode ? 'border-red-500' : ''}
                />
                {errors.subjectCode && (
                  <p className="mt-1 text-xs text-red-500">{errors.subjectCode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.credits.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  {...register('credits')}
                  className={errors.credits ? 'border-red-500' : ''}
                />
                {errors.credits && (
                  <p className="mt-1 text-xs text-red-500">{errors.credits.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.departmentId.label')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={departments.map((d) => ({ value: d.departmentId, label: d.departmentName }))}
                  value={formValues.departmentId || ''}
                  placeholder={t('form.departmentId.placeholder')}
                  onChange={(value) => setValue('departmentId', value, { shouldValidate: true })}
                  className={errors.departmentId ? 'border-red-500' : ''}
                />
                {errors.departmentId && (
                  <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.theoryHours.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register('theoryHours')}
                  className={errors.theoryHours ? 'border-red-500' : ''}
                />
                {errors.theoryHours && (
                  <p className="mt-1 text-xs text-red-500">{errors.theoryHours.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.practiceHours.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register('practiceHours')}
                  className={errors.practiceHours ? 'border-red-500' : ''}
                />
                {errors.practiceHours && (
                  <p className="mt-1 text-xs text-red-500">{errors.practiceHours.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.isGeneral.label')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={isGeneralOptions}
                  value={String(formValues.isGeneral)}
                  placeholder={t('form.isGeneral.placeholder')}
                  onChange={(value) => setValue('isGeneral', value === 'true', { shouldValidate: true })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.subjectStatus.label')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formValues.subjectStatus || 'active'}
                  placeholder={t('form.subjectStatus.placeholder')}
                  onChange={(value) => setValue('subjectStatus', value)}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.prerequisiteSubjectId.label')}
                </label>
                <Dropdown
                  options={[
                    { value: '', label: t('form.prerequisiteSubjectId.none') },
                    ...prerequisiteSubjects.map((s) => ({ value: s.subjectId, label: s.displayName })),
                  ]}
                  value={formValues.prerequisiteSubjectId || ''}
                  placeholder={t('form.prerequisiteSubjectId.placeholder')}
                  onChange={(value) => setValue('prerequisiteSubjectId', value)}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.description.label')}
                </label>
                <textarea
                  {...register('description')}
                  placeholder={t('form.description.placeholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formValues.description?.length || 0}/500
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
            >
              {isSubmitting ? t('saving') : tCommon('add')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}





