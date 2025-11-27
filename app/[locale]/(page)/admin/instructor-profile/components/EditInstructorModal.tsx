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
import { FacultyOption, InstructorDetail, UpdateInstructorPayload } from '../lib/types/types';

interface EditInstructorModalProps {
  isOpen: boolean;
  instructorId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const getValidationSchema = (t: (key: string) => string) =>
  yup.object({
    fullName: yup
      .string()
      .required(t('fullNameRequired'))
      .min(2, t('fullNameMin')),
    gender: yup.string().required(t('genderRequired')),
    facultyId: yup.string().required(t('facultyRequired')),
    email: yup
      .string()
      .nullable()
      .test('email-valid', t('emailInvalid'), (value) => {
        if (!value) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }),
    dateOfBirth: yup
      .string()
      .nullable()
      .test('dob-not-future', t('dateOfBirthFuture'), (value) => {
        if (!value) return true;
        const dob = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dob <= today;
      })
      .test('dob-min-age', t('dateOfBirthMinAge'), (value) => {
        if (!value) return true;
        const dob = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
        return actualAge >= 20;
      }),
    hireDate: yup
      .string()
      .nullable()
      .test('hire-not-future', t('hireDateFuture'), (value) => {
        if (!value) return true;
        const hireDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return hireDate <= today;
      })
      .test('hire-after-dob', t('hireDateBeforeBirth'), function (value) {
        if (!value) return true;
        const { dateOfBirth } = this.parent;
        if (!dateOfBirth) return true;
        const dob = new Date(dateOfBirth);
        const hire = new Date(value);
        const minHireDate = new Date(dob);
        minHireDate.setFullYear(minHireDate.getFullYear() + 20);
        return hire >= minHireDate;
      }),
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
    address: yup.string().nullable(),
    degree: yup.string().nullable(),
    specialization: yup.string().nullable(),
    employmentStatus: yup.string().nullable(),
  });

type FormData = {
  fullName: string;
  gender: string;
  facultyId: string;
  email: string | null;
  dateOfBirth: string | null;
  hireDate: string | null;
  phoneNumber: string | null;
  citizenId: string | null;
  address: string | null;
  degree: string | null;
  specialization: string | null;
  employmentStatus: string | null;
};

export default function EditInstructorModal({ isOpen, instructorId, onClose, onSuccess }: EditInstructorModalProps) {
  const t = useTranslations('admin.instructorProfile.editModal');
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
  });

  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const formValues = watch();
  const degreeOptions = useMemo(() => getDegreeOptions(tFilters), [tFilters]);
  const statusOptions = useMemo(() => getEmploymentStatusOptions(tFilters), [tFilters]);

  useEffect(() => {
    if (!isOpen || !instructorId) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [facRes, detailRes] = await Promise.all([
          commonApi.getFaculties(),
          instructorsApi.getInstructorById(instructorId),
        ]);

        if (facRes.success) {
          setFaculties(facRes.data);
        }

        if (detailRes.success) {
          const d: InstructorDetail = detailRes.data;
          reset({
            fullName: d.fullName,
            gender: d.gender,
            facultyId: d.facultyId,
            email: d.email || '',
            dateOfBirth: d.dateOfBirth ? d.dateOfBirth.split('T')[0] : '',
            hireDate: d.hireDate ? d.hireDate.split('T')[0] : '',
            phoneNumber: d.phoneNumber || '',
            citizenId: d.citizenId || '',
            address: d.address || '',
            degree: d.degree || '',
            specialization: d.specialization || '',
            employmentStatus: d.employmentStatus || 'active',
          });
        }
      } catch (error) {
        console.error('Error loading instructor for edit', error);
        toast.error(t('loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [isOpen, instructorId, reset, t]);

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
    if (!instructorId) return;

    setIsSubmitting(true);
    try {
      const payload: UpdateInstructorPayload = {
        fullName: data.fullName.trim(),
        gender: data.gender,
        facultyId: data.facultyId,
        email: data.email || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        hireDate: data.hireDate || undefined,
        phoneNumber: data.phoneNumber || undefined,
        citizenId: data.citizenId || undefined,
        address: data.address || undefined,
        degree: (data.degree || undefined) as UpdateInstructorPayload['degree'],
        specialization: data.specialization || undefined,
        employmentStatus:
          (data.employmentStatus || undefined) as UpdateInstructorPayload['employmentStatus'],
      };

      const res = await instructorsApi.updateInstructor(instructorId, payload);
      if (res.success) {
        toast.success(t('updateSuccess'));
        onSuccess?.();
        handleClose();
      } else {
        toast.error(res.message || t('updateError'));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        err.response?.data?.message || err.message || t('updateErrorGeneric');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !instructorId) return null;

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
            {loading ? (
              <div className="text-center text-sm text-gray-500 py-10">{t('loading')}</div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {t('fullName')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder={t('fullNamePlaceholder')}
                    {...register('fullName')}
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">{t('email')}</label>
                  <Input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">{t('phoneNumber')}</label>
                  <Input
                    placeholder={t('phoneNumberPlaceholder')}
                    {...register('phoneNumber')}
                    className={errors.phoneNumber ? 'border-red-500' : ''}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">{t('dateOfBirth')}</label>
                  <Input 
                    type="date" 
                    {...register('dateOfBirth')}
                    className={errors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">{t('hireDate')}</label>
                  <Input 
                    type="date" 
                    {...register('hireDate')}
                    className={errors.hireDate ? 'border-red-500' : ''}
                  />
                  {errors.hireDate && (
                    <p className="mt-1 text-xs text-red-500">{errors.hireDate.message}</p>
                  )}
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
                  <Input placeholder={t('specializationPlaceholder')} {...register('specialization')} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">{t('citizenId')}</label>
                  <Input
                    placeholder={t('citizenIdPlaceholder')}
                    {...register('citizenId')}
                    className={errors.citizenId ? 'border-red-500' : ''}
                  />
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
                  <Input
                    placeholder={t('enterAddress')}
                    {...register('address')}
                    className={errors.address ? 'border-red-500' : ''}
                  />
                </div>
              </div>
            )}
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