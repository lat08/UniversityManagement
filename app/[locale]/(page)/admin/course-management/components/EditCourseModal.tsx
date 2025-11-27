'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Dropdown } from '@/app/components/ui';
import { X } from 'lucide-react';
import type { Course } from '../lib/types/types';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api/client';
import { useTranslations } from 'next-intl';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  course: Course | null;
}

const validationSchema = yup.object({
  feePerCredit: yup
    .number()
    .typeError('validation.feePerCredit.type')
    .required('validation.feePerCredit.required')
    .moreThan(0, 'validation.feePerCredit.min'),
  courseStatus: yup
    .string()
    .required('validation.status.required')
    .oneOf(['active', 'inactive', 'completed'], 'validation.status.invalid'),
});

type FormData = InferType<typeof validationSchema>;

export const EditCourseModal = ({ isOpen, onClose, onSuccess, course }: EditCourseModalProps) => {
  const t = useTranslations('admin.courseManagement');
  const modalT = useTranslations('admin.courseManagement.modals.editCourse');
  const translateError = (message?: string) => (message ? t(message) : '');

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
      feePerCredit: 0,
      courseStatus: 'active',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formValues = watch();

  useEffect(() => {
    if (isOpen && course) {
      reset({
        feePerCredit: course.feePerCredit ?? 0,
        courseStatus: course.status || 'active',
      });
    }
  }, [isOpen, course, reset]);

  const statusOptions = [
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
    { value: 'completed', label: t('status.completed') },
  ];

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    if (!course) return;
    setIsSubmitting(true);
    try {
      const response = await api.put<{
        success: boolean;
        message?: string;
      }>(`/v1/courses/${course.courseId}`, {
        FeePerCredit: data.feePerCredit,
        CourseStatus: data.courseStatus,
      });

      if (response.data.success) {
        toast.success(modalT('toast.success'));
        reset();
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.data.message || modalT('toast.failure'));
      }
    } catch (error: unknown) {
      const resp = (error as { response?: { data?: { message?: string; errors?: string[] } }; message?: string })?.response?.data;
      const fallbackMessage =
        resp?.message || resp?.errors?.[0] || (error as { message?: string })?.message || modalT('toast.error');
      toast.error(fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{modalT('title')}</h2>
              <p className="text-sm text-gray-600 mt-1">{modalT('subtitle')}</p>
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
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {/* Thông tin cơ bản (readonly) */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{modalT('fields.courseCode.readonlyLabel')}</label>
                <Input value={course.courseCode} disabled className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{modalT('fields.subject.readonlyLabel')}</label>
                <Input value={course.subjectName} disabled className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{modalT('fields.semester.readonlyLabel')}</label>
                <Input value={course.semester} disabled className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{modalT('fields.academicYear.readonlyLabel')}</label>
                <Input value={course.academicYear || ''} disabled className="bg-gray-50" />
              </div>
            </div>

            {/* Học phí & trạng thái */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {modalT('fields.feePerCredit.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register('feePerCredit', { valueAsNumber: true })}
                  className={errors.feePerCredit ? 'border-red-500' : ''}
                />
                {errors.feePerCredit && (
                  <p className="mt-1 text-xs text-red-500">
                    {translateError(errors.feePerCredit.message)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {modalT('fields.status.label')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formValues.courseStatus || 'active'}
                  placeholder={modalT('fields.status.placeholder')}
                  onChange={(value) => setValue('courseStatus', value as FormData['courseStatus'])}
                  buttonClassName={errors.courseStatus ? 'border-red-500' : ''}
                />
                {errors.courseStatus && (
                  <p className="mt-1 text-xs text-red-500">
                    {translateError(errors.courseStatus.message)}
                  </p>
                )}
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
              {t('buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('buttons.saving') : modalT('submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


