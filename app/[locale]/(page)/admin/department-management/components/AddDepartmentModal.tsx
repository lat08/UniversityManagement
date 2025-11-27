'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { DropdownSearch, Button, Input } from '@/app/components/ui';
import { departmentsApi, commonApi } from '../lib/api/departmentsApi';
import type { Faculty, Curriculum } from '../lib/types/types';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  departmentCode: string;
  departmentName: string;
  facultyId: string;
  curriculumIds?: string[];
}

export const AddDepartmentModal = ({ isOpen, onClose, onSuccess }: AddDepartmentModalProps) => {
  const t = useTranslations('admin.departmentManagement');
  const tActions = useTranslations('common.actions');
  
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingCurriculums, setLoadingCurriculums] = useState(false);
  const [selectedCurriculumIds, setSelectedCurriculumIds] = useState<string[]>([]);

  const validationSchema = useMemo(() => yup.object({
    departmentCode: yup
      .string()
      .required(t('form.departmentCode.required'))
      .matches(/^[A-Z0-9_]+$/, t('form.departmentCode.invalid'))
      .max(50, t('form.departmentCode.max')),
    departmentName: yup
      .string()
      .required(t('form.departmentName.required'))
      .max(200, t('form.departmentName.max')),
    facultyId: yup
      .string()
      .required(t('form.facultyId.required')),
  }), [t]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      departmentCode: '',
      departmentName: '',
      facultyId: '',
      curriculumIds: [],
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formValues = watch();

  // Load faculties on mount
  useEffect(() => {
    if (isOpen) {
      setLoadingFaculties(true);
      commonApi.getFaculties()
        .then(setFaculties)
        .catch(() => toast.error(t('hooks.loadFacultiesError')))
        .finally(() => setLoadingFaculties(false));
    }
  }, [isOpen, t]);

  // Load curriculums when faculty changes
  useEffect(() => {
    if (isOpen && formValues.facultyId) {
      setLoadingCurriculums(true);
      // Load all curriculums, filtering will be done on backend when creating department
      commonApi.getCurriculums(undefined, formValues.facultyId)
        .then(setCurriculums)
        .catch(() => toast.error(t('hooks.loadCurriculumsError')))
        .finally(() => setLoadingCurriculums(false));
    } else {
      setCurriculums([]);
      setSelectedCurriculumIds([]);
    }
  }, [isOpen, formValues.facultyId, t]);

  const facultyOptions = useMemo(() => [
    { value: '', label: t('form.facultyId.placeholder') },
    ...faculties.map(f => ({ value: f.facultyId, label: `${f.facultyCode} - ${f.facultyName}` }))
  ], [faculties, t]);

  const curriculumOptions = useMemo(() => 
    curriculums.map(c => ({ 
      value: c.curriculumId, 
      label: t('form.curriculumIds.optionLabel', {
        code: c.curriculumCode,
        name: c.curriculumName,
        year: c.appliedYear,
        version: c.versionNumber,
        status: c.isActive ? '' : t('form.curriculumIds.inactiveTag')
      })
    }))
  , [curriculums, t]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset();
      setSelectedCurriculumIds([]);
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
        departmentCode: data.departmentCode.toUpperCase().trim(),
        departmentName: data.departmentName.trim(),
        facultyId: data.facultyId,
        curriculumIds: selectedCurriculumIds.length > 0 ? selectedCurriculumIds : undefined,
      };

      const response = await departmentsApi.create(payload);

      if (response.success) {
        toast.success(t('hooks.createSuccess'));
        reset();
        setSelectedCurriculumIds([]);
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || t('hooks.createError'));
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
                  {t('form.departmentCode.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('form.departmentCode.placeholder')}
                  {...register('departmentCode')}
                  className={errors.departmentCode ? 'border-red-500' : ''}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.departmentCode && <p className="mt-1 text-xs text-red-500">{errors.departmentCode.message}</p>}
                <p className="mt-1 text-xs text-gray-500">{t('form.departmentCode.hint')}</p>
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
                {errors.departmentName && <p className="mt-1 text-xs text-red-500">{errors.departmentName.message}</p>}
              </div>

              {/* Ngành */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('form.facultyId.label')} <span className="text-red-500">*</span>
                </label>
                <DropdownSearch
                  options={facultyOptions}
                  value={formValues.facultyId || ''}
                  placeholder={t('form.facultyId.placeholder')}
                  searchPlaceholder={t('form.facultyId.searchPlaceholder')}
                  onChange={(value) => {
                    setValue('facultyId', value);
                    setSelectedCurriculumIds([]);
                  }}
                  disabled={loadingFaculties}
                />
                {errors.facultyId && <p className="mt-1 text-xs text-red-500">{errors.facultyId.message}</p>}
              </div>

              {/* Chương trình đào tạo (tùy chọn) */}
              {formValues.facultyId && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {t('form.curriculumIds.label')}
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      ({t('form.curriculumIds.hint')})
                    </span>
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
                    {loadingCurriculums ? (
                      <p className="text-sm text-gray-500 text-center py-2">{t('form.curriculumIds.loading')}</p>
                    ) : curriculumOptions.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">{t('form.curriculumIds.empty')}</p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                          <span className="text-xs font-medium text-gray-600">
                            {t('form.curriculumIds.selected', { count: selectedCurriculumIds.length })} / {curriculumOptions.length}
                          </span>
                          {selectedCurriculumIds.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedCurriculumIds([])}
                              className="text-xs text-[#0053AD] hover:text-[#003d82]"
                            >
                              {t('form.curriculumIds.clearAll')}
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {curriculumOptions.map((option) => {
                            const curriculum = curriculums.find(c => c.curriculumId === option.value);
                            const isSelected = selectedCurriculumIds.includes(option.value);
                            return (
                              <label 
                                key={option.value} 
                                className={`flex items-start gap-3 cursor-pointer p-2 rounded transition-colors ${
                                  isSelected ? 'bg-[#E8F4FF] border border-[#0053AD]/30' : 'hover:bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCurriculumIds([...selectedCurriculumIds, option.value]);
                                    } else {
                                      setSelectedCurriculumIds(selectedCurriculumIds.filter(id => id !== option.value));
                                    }
                                  }}
                                  className="w-4 h-4 mt-0.5 cursor-pointer accent-[#0053AD] flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">{curriculum?.curriculumCode}</span>
                                    {curriculum && !curriculum.isActive && (
                                      <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                                        {t('status.inactive')}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-700 block truncate">{curriculum?.curriculumName}</span>
                                  <span className="text-xs text-gray-500">
                                    {t('form.curriculumIds.yearVersion', { 
                                      year: curriculum?.appliedYear ?? 0, 
                                      version: curriculum?.versionNumber ?? 0
                                    })}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
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
              {isSubmitting ? t('modals.add.submitting') : t('modals.add.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

