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
import type { Department, AcademicYear, TrainingSystem, InstructorBasicDto, CurriculumBasicDto } from '../lib/types/types';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  classCode: yup.string().required('Mã lớp là bắt buộc').min(2, 'Mã lớp phải có ít nhất 2 ký tự'),
  className: yup.string().required('Tên lớp là bắt buộc').min(2, 'Tên lớp phải có ít nhất 2 ký tự'),
  departmentId: yup.string().required('Chuyên ngành là bắt buộc'),
  advisorInstructorId: yup.string().optional(),
  trainingSystemId: yup.string().required('Hệ đào tạo là bắt buộc'),
  startAcademicYearId: yup.string().required('Năm học bắt đầu là bắt buộc'),
  curriculumId: yup.string().optional(),
});

type FormData = yup.InferType<typeof validationSchema>;

export default function AddClassModal({ isOpen, onClose, onSuccess }: AddClassModalProps) {
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
      classCode: '',
      className: '',
      departmentId: '',
      advisorInstructorId: '',
      trainingSystemId: '',
      startAcademicYearId: '',
      curriculumId: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [trainingSystems, setTrainingSystems] = useState<TrainingSystem[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<InstructorBasicDto[]>([]);
  const [availableCurriculums, setAvailableCurriculums] = useState<CurriculumBasicDto[]>([]);

  const formValues = watch();

  useEffect(() => {
    if (!isOpen) return;

    classesApi.getDepartments().then(setDepartments);
    classesApi.getAcademicYears(10).then(setAcademicYears);
    classesApi.getTrainingSystems().then(setTrainingSystems);
  }, [isOpen]);

  useEffect(() => {
    if (formValues.departmentId) {
      classesApi.getAvailableInstructors(formValues.departmentId).then((res) => {
        if (res.success) {
          setAvailableInstructors(res.data);
        }
      });
      classesApi.getAvailableCurriculums(formValues.departmentId).then((res) => {
        if (res.success) {
          setAvailableCurriculums(res.data);
        }
      });
    } else {
      setAvailableInstructors([]);
      setAvailableCurriculums([]);
    }
    setValue('advisorInstructorId', '');
    setValue('curriculumId', '');
  }, [formValues.departmentId, setValue]);

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await classesApi.createClass({
        classCode: data.classCode,
        className: data.className,
        departmentId: data.departmentId,
        advisorInstructorId: data.advisorInstructorId || undefined,
        trainingSystemId: data.trainingSystemId,
        startAcademicYearId: data.startAcademicYearId,
        curriculumId: data.curriculumId || undefined,
      });

      if (response.success) {
        toast.success(t('toast.createSuccess'));
        reset();
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || t('toast.createError'));
      }
    } catch (error: unknown) {
      const resp = (error as { response?: { data?: { message?: string; errors?: string[] } }; message?: string })?.response?.data;
      const fallbackMessage =
        resp?.message || resp?.errors?.[0] || (error as { message?: string })?.message || t('toast.createError');
      toast.error(fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.add.classCode')} <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('classCode')}
                placeholder={t('modals.add.classCodePlaceholder')}
              />
              {errors.classCode && (
                <p className="mt-1 text-sm text-red-600">{errors.classCode.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.add.className')} <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('className')}
                placeholder={t('modals.add.classNamePlaceholder')}
              />
              {errors.className && (
                <p className="mt-1 text-sm text-red-600">{errors.className.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.add.department')} <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={[
                  { value: '', label: t('modals.add.selectDepartment') },
                  ...departments.map(d => ({ value: d.departmentId, label: d.departmentName }))
                ]}
                value={formValues.departmentId || ''}
                placeholder={t('modals.add.selectDepartment')}
                onChange={(value) => setValue('departmentId', value)}
              />
              {errors.departmentId && (
                <p className="mt-1 text-sm text-red-600">{errors.departmentId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.add.trainingSystem')} <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={[
                  { value: '', label: t('modals.add.selectTrainingSystem') },
                  ...trainingSystems.map(ts => ({ value: ts.trainingSystemId, label: ts.trainingSystemName }))
                ]}
                value={formValues.trainingSystemId || ''}
                placeholder={t('modals.add.selectTrainingSystem')}
                onChange={(value) => setValue('trainingSystemId', value)}
              />
              {errors.trainingSystemId && (
                <p className="mt-1 text-sm text-red-600">{errors.trainingSystemId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.add.startAcademicYear')} <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={[
                  { value: '', label: t('modals.add.selectAcademicYear') },
                  ...academicYears.map(y => ({ value: y.academicYearId, label: y.yearName }))
                ]}
                value={formValues.startAcademicYearId || ''}
                placeholder={t('modals.add.selectAcademicYear')}
                onChange={(value) => setValue('startAcademicYearId', value)}
              />
              {errors.startAcademicYearId && (
                <p className="mt-1 text-sm text-red-600">{errors.startAcademicYearId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.add.advisorInstructor')}
              </label>
              <DropdownSearch
                options={availableInstructors.map(i => ({ value: i.instructorId, label: i.fullName }))}
                value={formValues.advisorInstructorId || undefined}
                placeholder={t('modals.add.selectInstructor')}
                searchPlaceholder={t('modals.add.searchInstructor') || 'Tìm kiếm giảng viên...'}
                onChange={(value) => setValue('advisorInstructorId', value || '')}
                disabled={!formValues.departmentId}
                showEmptyOption
                emptyOptionLabel={t('modals.add.selectInstructor')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('modals.add.curriculum')}
              </label>
              <DropdownSearch
                options={availableCurriculums.map(c => ({ value: c.curriculumId, label: c.curriculumName }))}
                value={formValues.curriculumId || undefined}
                placeholder={t('modals.add.selectCurriculum')}
                searchPlaceholder={t('modals.add.searchCurriculum') || 'Tìm kiếm chương trình đào tạo...'}
                onChange={(value) => setValue('curriculumId', value || '')}
                disabled={!formValues.departmentId}
                showEmptyOption
                emptyOptionLabel={t('modals.add.selectCurriculum')}
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

