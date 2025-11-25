'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Dropdown, DropdownSearch, Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { studentsApi } from '../lib/api/studentsApi';
import { Faculty, Department, ClassItem, ENROLLMENT_STATUS_OPTIONS } from '../lib/types/types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const fetchFaculties = async (): Promise<Faculty[]> => {
  try {
    const response = await studentsApi.getFaculties({
      pageNumber: 1,
      pageSize: 100,
    });
    return response.success ? response.data.items : [];
  } catch {
    return [];
  }
};

const fetchDepartments = async (): Promise<Department[]> => {
  try {
    const response = await studentsApi.getDepartments({
      pageNumber: 1,
      pageSize: 100,
    });
    return response.success ? response.data.items : [];
  } catch {
    return [];
  }
};

const fetchClasses = async (departmentId?: string): Promise<ClassItem[]> => {
  try {
    const response = await studentsApi.getClasses({ departmentId });
    return response.success ? response.data : [];
  } catch {
    return [];
  }
};

export default function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
  const t = useTranslations('admin.modals.addStudent');
  const tCommon = useTranslations('common.actions');
  
  // FormData type definition
  type FormData = {
    name: string;
    citizenId: string;
    dob: string;
    gender: string;
    phone: string;
    facultyId: string;
    departmentId: string;
    classId: string;
    address: string;
    enrollmentStatus: string;
    class?: string;
    profilePicturePath?: string;
  };

  // Tạo validation schema với translations
  const validationSchema = yup.object({
    name: yup.string().required(t('nameRequired')).min(2, t('nameMin')),
    citizenId: yup.string().required(t('citizenIdRequired')).matches(/^\d{9,12}$/, t('citizenIdInvalid')),
    dob: yup.string()
      .required(t('dobRequired'))
      .matches(/^\d{2}\/\d{2}\/\d{4}$/, t('dobInvalid'))
      .test('valid-date', t('dobInvalidDate'), (value) => {
        if (!value) return false;
        const [day, month, year] = value.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
      }),
    gender: yup.string().required(t('genderRequired')),
    phone: yup.string()
      .required(t('phoneRequired'))
      .matches(/^[0-9]{10,11}$/, t('phoneInvalid')),
    facultyId: yup.string().required(t('facultyRequired')),
    departmentId: yup.string().required(t('departmentRequired')),
    class: yup.string().optional(),
    address: yup.string().required(t('addressRequired')).min(5, t('addressMin')),
    classId: yup.string().required(t('classRequired')),
    enrollmentStatus: yup.string().optional(),
    profilePicturePath: yup.string().optional(),
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, clearErrors } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      name: '',
      citizenId: '',
      dob: '',
      gender: '',
      phone: '',
      facultyId: '',
      departmentId: '',
      class: '',
      address: '',
      classId: '',
      enrollmentStatus: 'active',
      profilePicturePath: '',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dobISO, setDobISO] = useState('');

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const formValues = watch();

  useEffect(() => {
    if (isOpen) {
      fetchFaculties().then(setFaculties);
      fetchDepartments().then(setDepartments);
      fetchClasses().then(setClasses);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!formValues.facultyId) {
      setValue('departmentId', '');
    }
  }, [formValues.facultyId, setValue]);

  useEffect(() => {
    fetchClasses(formValues.departmentId || undefined).then(setClasses);
    setValue('classId', '');
  }, [formValues.departmentId, setValue]);

  const genders = [
    { value: 'male', label: t('genderMale') },
    { value: 'female', label: t('genderFemale') },
  ];

  const genderOptions = genders.map(g => ({ value: g.value, label: g.label }));

  const facultyOptions = faculties.map(f => ({ value: f.facultyId, label: f.facultyName }));

  const departmentOptions = departments
    .filter(d => !formValues.facultyId || d.facultyId === formValues.facultyId)
    .map(d => ({ value: d.departmentId, label: d.departmentName }));

  const classOptions = classes.map(c => ({ value: c.classId, label: c.className }));

  const enrollmentStatusOptions = ENROLLMENT_STATUS_OPTIONS.map(s => ({ value: s.value, label: s.label }));

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset();
      setDobISO('');
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
      const [day, month, year] = data.dob.split('/');
      const formattedDob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      const payload = {
        fullName: data.name,
        dateOfBirth: formattedDob,
        gender: data.gender,
        phoneNumber: data.phone,
        citizenId: data.citizenId,
        address: data.address,
        classId: data.classId,
        enrollmentStatus: data.enrollmentStatus || 'active',
        profilePicturePath: data.profilePicturePath,
      };

      const response = await studentsApi.createStudent(payload);

      if (response.success) {
        toast.success(
          t('addSuccessWithCode', { code: response.data.studentCode }),
          { duration: 4000, style: { minWidth: '300px' } }
        );
        reset();
        setDobISO('');
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || t('error'));
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                           (error as { message?: string })?.message || 
                           t('error');
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
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('description')}</p>
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
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('name')} <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder={t('namePlaceholder')}
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* CMND / CCCD */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('citizenId')} <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder={t('citizenIdPlaceholder')}
                {...register('citizenId')}
                className={errors.citizenId ? 'border-red-500' : ''}
              />
              {errors.citizenId && <p className="mt-1 text-xs text-red-500">{errors.citizenId.message}</p>}
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('dob')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={dobISO}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const iso = e.target.value;
                  setDobISO(iso);
                  if (iso) {
                    const [y, m, d] = iso.split('-');
                    setValue('dob', `${d}/${m}/${y}`, { shouldValidate: true });
                  } else {
                    setValue('dob', '', { shouldValidate: true });
                  }
                }}
                className={errors.dob ? 'border-red-500' : ''}
              />
              <input type="hidden" {...register('dob')} />
              {errors.dob && <p className="mt-1 text-xs text-red-500">{errors.dob.message}</p>}
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('gender')} <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={genderOptions}
                value={formValues.gender || ''}
                placeholder={t('selectGender')}
                onChange={(value) => {
                  setValue('gender', value);
                  clearErrors('gender');
                }}
                buttonClassName={errors.gender ? 'border-red-500' : ''}
              />
              {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('phone')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder={t('phonePlaceholder')}
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Ngành học */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('faculty')} <span className="text-red-500">*</span>
              </label>
              <DropdownSearch
                options={facultyOptions}
                value={formValues.facultyId || ''}
                placeholder={t('selectFaculty')}
                searchPlaceholder={t('searchFaculty')}
                onChange={(value) => {
                  setValue('facultyId', value);
                  setValue('departmentId', '');
                  clearErrors('facultyId');
                }}
                buttonClassName={errors.facultyId ? 'border-red-500' : ''}
              />
              {errors.facultyId && <p className="mt-1 text-xs text-red-500">{errors.facultyId.message}</p>}
            </div>

            {/* Chuyên ngành */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('department')} <span className="text-red-500">*</span>
              </label>
              <DropdownSearch
                options={departmentOptions}
                value={formValues.departmentId || ''}
                placeholder={t('selectDepartment')}
                searchPlaceholder={t('searchDepartment')}
                onChange={(value) => {
                  setValue('departmentId', value);
                  clearErrors('departmentId');
                }}
                disabled={!formValues.facultyId}
                buttonClassName={errors.departmentId ? 'border-red-500' : ''}
              />
              {errors.departmentId && <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>}
            </div>

            {/* Lớp (Class) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('class')} <span className="text-red-500">*</span>
              </label>
              <DropdownSearch
                options={classOptions}
                value={formValues.classId || ''}
                placeholder={t('selectClass')}
                searchPlaceholder={t('searchClass')}
                onChange={(value) => {
                  setValue('classId', value);
                  clearErrors('classId');
                }}
                disabled={!formValues.departmentId}
                buttonClassName={errors.classId ? 'border-red-500' : ''}
              />
              {errors.classId && <p className="mt-1 text-xs text-red-500">{errors.classId.message}</p>}
            </div>

            {/* Trạng thái nhập học */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('status')}
              </label>
              <Dropdown
                options={enrollmentStatusOptions}
                value={formValues.enrollmentStatus || 'active'}
                placeholder={t('selectStatus')}
                onChange={(value) => setValue('enrollmentStatus', value)}
              />
            </div>

            {/* Địa chỉ - Full width */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('address')} <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder={t('addressPlaceholder')}
                {...register('address')}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
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
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
