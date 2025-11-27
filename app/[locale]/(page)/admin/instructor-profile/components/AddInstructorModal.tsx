'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Dropdown, Button, Input } from '@/app/components/ui';
import { commonApi } from '@/lib/api/common';
import { instructorsApi } from '../lib/api/instructorsApi';
import { getDegreeOptions, getEmploymentStatusOptions } from '../lib/constants/filters';
import { FacultyOption, CreateInstructorPayload } from '../lib/types/types';

interface AddInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const getValidationSchema = (t: (key: string) => string) =>
  yup.object({
    fullName: yup
      .string()
      .required(t('fullNameRequired'))
      .min(2, t('fullNameMin'))
      .max(100, t('fullNameMax')),
    gender: yup.string().required(t('genderRequired')),
    facultyId: yup.string().required(t('facultyRequired')),
    dateOfBirth: yup.string().nullable(),
    hireDate: yup.string().nullable(),
    phoneNumber: yup
      .string()
      .nullable()
      .test('phone-valid', t('phoneNumberInvalid'), (value) => {
        if (!value) return true;
        return /^[0-9]{10,11}$/.test(value);
      }),
    citizenId: yup
      .string()
      .nullable()
      .test('cid-valid', t('citizenIdInvalid'), (value) => {
        if (!value) return true;
        return /^[0-9]{9,12}$/.test(value);
      }),
    address: yup.string().nullable().max(255, t('addressMax')),
    degree: yup.string().nullable(),
    specialization: yup.string().nullable().max(200, t('specializationMax')),
    employmentStatus: yup.string().nullable(),
  });

type FormData = {
  fullName: string;
  gender: string;
  facultyId: string;
  dateOfBirth: string | null;
  hireDate: string | null;
  phoneNumber: string | null;
  citizenId: string | null;
  address: string | null;
  degree: string | null;
  specialization: string | null;
  employmentStatus: string | null;
};

export default function AddInstructorModal({ isOpen, onClose, onSuccess }: AddInstructorModalProps) {
  const t = useTranslations('admin.instructorProfile.addModal');
  const tFilters = useTranslations('admin.instructorProfile.filters');
  const validationSchema = getValidationSchema(t);
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
      fullName: '',
      gender: '',
      facultyId: '',
      dateOfBirth: '',
      hireDate: '',
      phoneNumber: '',
      citizenId: '',
      address: '',
      degree: '',
      specialization: '',
      employmentStatus: 'active',
    },
  });

  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formValues = watch();
  const degreeOptions = useMemo(() => getDegreeOptions(tFilters), [tFilters]);
  const statusOptions = useMemo(() => getEmploymentStatusOptions(tFilters), [tFilters]);

  // Input handlers với validation
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-ZÀ-ỹ\s]/g, '');
    setValue('fullName', value, { shouldValidate: true });
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setValue('phoneNumber', value || null, { shouldValidate: true });
  };

  const handleCitizenIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setValue('citizenId', value || null, { shouldValidate: true });
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchFaculties = async () => {
      try {
        const res = await commonApi.getFaculties();
        if (res.success) {
          setFaculties(res.data);
        }
      } catch (error) {
        console.error('Error fetching faculties', error);
      }
    };

    fetchFaculties();
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
    setIsSubmitting(true);
    try {
      const payload: CreateInstructorPayload = {
        fullName: data.fullName.trim(),
        gender: data.gender,
        facultyId: data.facultyId,
        dateOfBirth: data.dateOfBirth || undefined,
        hireDate: data.hireDate || undefined,
        phoneNumber: data.phoneNumber || undefined,
        citizenId: data.citizenId || undefined,
        address: data.address || undefined,
        degree: (data.degree || undefined) as CreateInstructorPayload['degree'],
        specialization: data.specialization || undefined,
        employmentStatus:
          (data.employmentStatus || undefined) as CreateInstructorPayload['employmentStatus'],
      };

      const res = await instructorsApi.createInstructor(payload);
      if (res.success) {
        toast.success(
          t('addSuccessWithCode', { code: res.data.instructorCode }),
          { duration: 4000, style: { minWidth: '280px' } },
        );
        onSuccess?.();
        handleClose();
      } else {
        toast.error(res.message || t('addError'));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || t('addErrorGeneric');
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

  const genderOptions = [
    { value: 'male', label: t('genderMale') },
    { value: 'female', label: t('genderFemale') },
  ];

  const facultyOptions = faculties.map((f) => ({ value: f.facultyId, label: f.facultyName }));

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
                  {t('fullName')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    placeholder={t('fullNamePlaceholder')}
                    maxLength={100}
                    value={formValues.fullName || ''}
                    onChange={handleFullNameChange}
                    className={`pr-16 ${errors.fullName ? 'border-red-500' : ''}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {formValues.fullName?.length || 0}/100
                  </span>
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t('phoneNumber')}</label>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder={t('phoneNumberPlaceholder')}
                    maxLength={11}
                    value={formValues.phoneNumber || ''}
                    onChange={handlePhoneNumberChange}
                    className={`pr-16 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {formValues.phoneNumber?.length || 0}/11
                  </span>
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t('dateOfBirth')}</label>
                <Input type="date" {...register('dateOfBirth')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t('hireDate')}</label>
                <Input type="date" {...register('hireDate')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('faculty')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={facultyOptions}
                  value={formValues.facultyId || ''}
                  placeholder={t('selectFaculty')}
                  onChange={(value) => setValue('facultyId', value, { shouldValidate: true })}
                  className={errors.facultyId ? 'border-red-500' : ''}
                />
                {errors.facultyId && (
                  <p className="mt-1 text-xs text-red-500">{errors.facultyId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t('degree')}</label>
                <Dropdown
                  options={degreeOptions}
                  value={formValues.degree || ''}
                  placeholder={t('selectDegree')}
                  onChange={(value) => setValue('degree', value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t('gender')}</label>
                <Dropdown
                  options={genderOptions}
                  value={formValues.gender || ''}
                  placeholder={t('selectGender')}
                  onChange={(value) => setValue('gender', value, { shouldValidate: true })}
                  className={errors.gender ? 'border-red-500' : ''}
                />
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t('specialization')}</label>
                <div className="relative">
                  <Input
                    placeholder={t('specializationPlaceholder')}
                    maxLength={200}
                    value={formValues.specialization || ''}
                    onChange={(e) => setValue('specialization', e.target.value || null, { shouldValidate: true })}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {formValues.specialization?.length || 0}/200
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t('citizenId')}</label>
                <div className="relative">
                  <Input
                    placeholder={t('citizenIdPlaceholder')}
                    maxLength={12}
                    value={formValues.citizenId || ''}
                    onChange={handleCitizenIdChange}
                    className={`pr-16 ${errors.citizenId ? 'border-red-500' : ''}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {formValues.citizenId?.length || 0}/12
                  </span>
                </div>
                {errors.citizenId && (
                  <p className="mt-1 text-xs text-red-500">{errors.citizenId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t('status')}</label>
                <Dropdown
                  options={statusOptions}
                  value={formValues.employmentStatus || 'active'}
                  placeholder={t('selectStatus')}
                  onChange={(value) => setValue('employmentStatus', value)}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">{t('address')}</label>
                <div className="relative">
                  <Input
                    placeholder={t('enterAddress')}
                    maxLength={255}
                    value={formValues.address || ''}
                    onChange={(e) => setValue('address', e.target.value || null, { shouldValidate: true })}
                    className={`pr-16 ${errors.address ? 'border-red-500' : ''}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {formValues.address?.length || 0}/255
                  </span>
                </div>
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
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
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

