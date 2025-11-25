"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown, DropdownSearch, Button, Input } from "@/app/components/ui";
import { X } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import { majorsApi } from "../lib/api/majorsApi";
import type { Faculty, TrainingSystem, Curriculum } from "../lib/types/types";
import { useTranslations } from "next-intl";

interface AddMajorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type FormData = {
  majorName: string;
  majorCode: string;
  facultyId: string;
  trainingSystemId: string;
  curriculumId: string;
  status?: string;
};

export const AddMajorModal = ({ isOpen, onClose, onSuccess }: AddMajorModalProps) => {
  const t = useTranslations("admin.majorManagement");
  const tCommon = useTranslations("common.actions");
  const validationSchema = useMemo(
    () =>
      yup.object({
        majorName: yup
          .string()
          .required(t("form.majorName.required"))
          .min(3, t("form.majorName.min")),
        majorCode: yup
          .string()
          .required(t("form.majorCode.required"))
          .min(2, t("form.majorCode.min")),
        facultyId: yup.string().required(t("form.faculty.required")),
        trainingSystemId: yup.string().required(t("form.trainingSystem.required")),
        curriculumId: yup.string().required(t("form.curriculum.required")),
        status: yup.string().optional(),
      }),
    [t],
  );
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, clearErrors } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      majorName: '',
      majorCode: '',
      facultyId: '',
      trainingSystemId: '',
      curriculumId: '',
      status: 'active',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [trainingSystems, setTrainingSystems] = useState<TrainingSystem[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);

  const formValues = watch();

  useEffect(() => {
    if (isOpen) {
      majorsApi.getFaculties().then((res) => {
        if (res.success) setFaculties(res.data);
      });
      majorsApi.getTrainingSystems().then((res) => {
        if (res.success) setTrainingSystems(res.data);
      });
      majorsApi.getCurricula().then((res) => {
        if (res.success) setCurricula(res.data);
      });
    }
  }, [isOpen]);

  const facultyOptions = faculties.map((f) => ({ value: f.facultyId, label: f.facultyName }));
  const trainingSystemOptions = trainingSystems.map((t) => ({ value: t.trainingSystemId, label: t.trainingSystemName }));
  const curriculumOptions = curricula.map((c) => ({ value: c.curriculumId, label: c.curriculumName }));
  const statusOptions = [
    { value: 'active', label: t('filters.active') },
    { value: 'inactive', label: t('filters.inactive') },
  ];

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
    setIsSubmitting(true);
    try {
      const payload = {
        majorName: data.majorName,
        majorCode: data.majorCode,
        facultyId: data.facultyId,
        trainingSystemId: data.trainingSystemId,
        curriculumId: data.curriculumId,
        status: (data.status as 'active' | 'inactive') || 'active',
      };

      const response = await majorsApi.createMajor(payload);

      if (response.success) {
        toast.success(t('hooks.createSuccess'));
        reset();
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || t('hooks.createError'));
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                           (error as { message?: string })?.message || 
                           tCommon('error');
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Mã chuyên ngành */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.majorCode.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.majorCode.placeholder')}
                  {...register('majorCode')}
                  className={errors.majorCode ? 'border-red-500' : ''}
                />
                {errors.majorCode && <p className="mt-1 text-xs text-red-500">{errors.majorCode.message}</p>}
              </div>

              {/* Tên chuyên ngành */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.majorName.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.majorName.placeholder')}
                  {...register('majorName')}
                  className={errors.majorName ? 'border-red-500' : ''}
                />
                {errors.majorName && <p className="mt-1 text-xs text-red-500">{errors.majorName.message}</p>}
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
                {errors.facultyId && <p className="mt-1 text-xs text-red-500">{errors.facultyId.message}</p>}
              </div>

              {/* Hệ đào tạo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.trainingSystem.label')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={trainingSystemOptions}
                  value={formValues.trainingSystemId || ''}
                  placeholder={t('form.trainingSystem.placeholder')}
                  onChange={(value) => {
                    setValue('trainingSystemId', value);
                    clearErrors('trainingSystemId');
                  }}
                  buttonClassName={errors.trainingSystemId ? 'border-red-500' : ''}
                />
                {errors.trainingSystemId && <p className="mt-1 text-xs text-red-500">{errors.trainingSystemId.message}</p>}
              </div>

              {/* Thuộc CTĐT */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.curriculum.label')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={curriculumOptions}
                  value={formValues.curriculumId || ''}
                  placeholder={t('form.curriculum.placeholder')}
                  onChange={(value) => {
                    setValue('curriculumId', value);
                    clearErrors('curriculumId');
                  }}
                  buttonClassName={errors.curriculumId ? 'border-red-500' : ''}
                />
                {errors.curriculumId && <p className="mt-1 text-xs text-red-500">{errors.curriculumId.message}</p>}
              </div>

              {/* Trạng thái */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.status.label')}
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formValues.status || 'active'}
                  placeholder={t('form.status.placeholder')}
                  onChange={(value) => setValue('status', value)}
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
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('modals.add.submitting') : t('modals.add.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
