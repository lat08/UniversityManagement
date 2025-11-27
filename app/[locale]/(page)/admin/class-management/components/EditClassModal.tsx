'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Dropdown, DropdownSearch } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { classesApi } from '../lib/api/classesApi';
import type { Class, TrainingSystem, InstructorBasicDto, CurriculumBasicDto } from '../lib/types/types';
import { CLASS_STATUS_OPTIONS } from '../lib/types/types';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: Class;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  className: yup.string().required('Tên lớp là bắt buộc').min(2, 'Tên lớp phải có ít nhất 2 ký tự'),
  advisorInstructorId: yup.string().optional(),
  trainingSystemId: yup.string().required('Hệ đào tạo là bắt buộc'),
  classStatus: yup.string().required('Trạng thái là bắt buộc'),
  curriculumId: yup.string().optional(),
});

type FormData = yup.InferType<typeof validationSchema>;

export default function EditClassModal({ isOpen, onClose, classItem, onSuccess }: EditClassModalProps) {
  const t = useTranslations('admin.classManagement');
  const tCommon = useTranslations('common.actions');
  
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
      className: classItem.className,
      advisorInstructorId: classItem.advisorInstructorId || '',
      trainingSystemId: classItem.trainingSystemId,
      classStatus: classItem.classStatus,
      curriculumId: classItem.curriculumId || '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainingSystems, setTrainingSystems] = useState<TrainingSystem[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<InstructorBasicDto[]>([]);
  const [availableCurriculums, setAvailableCurriculums] = useState<CurriculumBasicDto[]>([]);

  const formValues = watch();

  useEffect(() => {
    if (!isOpen) return;

    reset({
      className: classItem.className,
      advisorInstructorId: classItem.advisorInstructorId || '',
      trainingSystemId: classItem.trainingSystemId,
      classStatus: classItem.classStatus,
      curriculumId: classItem.curriculumId || '',
    });

    classesApi.getTrainingSystems().then(setTrainingSystems);
    classesApi.getAvailableInstructors(classItem.departmentId).then((res) => {
      if (res.success) {
        setAvailableInstructors(res.data);
      }
    });
    classesApi.getAvailableCurriculums(classItem.departmentId).then((res) => {
      if (res.success) {
        setAvailableCurriculums(res.data);
      }
    });
  }, [isOpen, classItem, reset]);

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await classesApi.updateClass(classItem.classId, {
        className: data.className,
        advisorInstructorId: data.advisorInstructorId || undefined,
        trainingSystemId: data.trainingSystemId,
        classStatus: data.classStatus,
        curriculumId: data.curriculumId || undefined,
      });

      if (response.success) {
        toast.success(t('toast.updateSuccess'));
        reset();
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || t('toast.updateError'));
      }
    } catch (error: unknown) {
      const resp = (error as { response?: { data?: { message?: string; errors?: string[] } }; message?: string })?.response?.data;
      const fallbackMessage =
        resp?.message || resp?.errors?.[0] || (error as { message?: string })?.message || t('toast.updateError');
      toast.error(fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const statusOptions = CLASS_STATUS_OPTIONS.map(opt => ({
    value: opt.value,
    label: t(`status.${opt.value}`),
  }));

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

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.edit.classCode')}
              </label>
              <Input
                value={classItem.classCode}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.edit.className')} <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('className')}
                placeholder={t('modals.edit.classNamePlaceholder')}
                error={errors.className?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.edit.trainingSystem')} <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={[
                  { value: '', label: t('modals.edit.selectTrainingSystem') },
                  ...trainingSystems.map(ts => ({ value: ts.trainingSystemId, label: ts.trainingSystemName }))
                ]}
                value={formValues.trainingSystemId || ''}
                placeholder={t('modals.edit.selectTrainingSystem')}
                onChange={(value) => setValue('trainingSystemId', value)}
              />
              {errors.trainingSystemId && (
                <p className="mt-1 text-sm text-red-600">{errors.trainingSystemId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.edit.classStatus')} <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={statusOptions}
                value={formValues.classStatus || ''}
                placeholder={t('modals.edit.selectStatus')}
                onChange={(value) => setValue('classStatus', value)}
              />
              {errors.classStatus && (
                <p className="mt-1 text-sm text-red-600">{errors.classStatus.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.edit.advisorInstructor')}
              </label>
              <DropdownSearch
                options={availableInstructors.map(i => ({ value: i.instructorId, label: i.fullName }))}
                value={formValues.advisorInstructorId || undefined}
                placeholder={t('modals.edit.selectInstructor')}
                searchPlaceholder={t('modals.edit.searchInstructor') || 'Tìm kiếm giảng viên...'}
                onChange={(value) => setValue('advisorInstructorId', value || '')}
                showEmptyOption
                emptyOptionLabel={t('modals.edit.selectInstructor')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.edit.curriculum')}
              </label>
              <DropdownSearch
                options={availableCurriculums.map(c => ({ value: c.curriculumId, label: c.curriculumName }))}
                value={formValues.curriculumId || undefined}
                placeholder={t('modals.edit.selectCurriculum')}
                searchPlaceholder={t('modals.edit.searchCurriculum') || 'Tìm kiếm chương trình đào tạo...'}
                onChange={(value) => setValue('curriculumId', value || '')}
                showEmptyOption
                emptyOptionLabel={t('modals.edit.selectCurriculum')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0053AD] hover:bg-[#003d82] text-white"
            >
              {isSubmitting ? tCommon('saving') : tCommon('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

