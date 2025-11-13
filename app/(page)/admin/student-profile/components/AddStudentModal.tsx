'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dropdown, DropdownSearch, Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { studentsApi } from '../lib/api/studentsApi';
import { Faculty, Department, ClassItem, ENROLLMENT_STATUS_OPTIONS } from '../lib/types/types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  name: yup.string().required('Họ và tên là bắt buộc').min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  citizenId: yup.string().required('CMND/CCCD là bắt buộc').matches(/^\d{9,12}$/, 'CMND/CCCD phải có 9-12 số'),
  dob: yup.string()
    .required('Ngày sinh là bắt buộc')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Ngày sinh phải có định dạng DD/MM/YYYY')
    .test('valid-date', 'Ngày sinh không hợp lệ', (value) => {
      if (!value) return false;
      const [day, month, year] = value.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
    }),
  gender: yup.string().required('Giới tính là bắt buộc'),
  phone: yup.string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 số'),
  facultyId: yup.string().required('Ngành học là bắt buộc'),
  departmentId: yup.string().required('Chuyên ngành là bắt buộc'),
  class: yup.string().optional(),
  address: yup.string().required('Địa chỉ là bắt buộc').min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  classId: yup.string().required('Lớp là bắt buộc'),
  enrollmentStatus: yup.string().optional(),
  profilePicturePath: yup.string().optional(),
});

type FormData = InferType<typeof validationSchema>;

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
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
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
          `Thêm sinh viên thành công!\nMã sinh viên: ${response.data.studentCode}`,
          { duration: 4000, style: { minWidth: '300px' } }
        );
        reset();
        setDobISO('');
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || 'Thêm sinh viên thất bại');
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                           (error as { message?: string })?.message || 
                           'Đã xảy ra lỗi';
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
              <h2 className="text-2xl font-bold text-gray-900">Thêm sinh viên mới</h2>
              <p className="text-sm text-gray-600 mt-1">Nhập thông tin sinh viên</p>
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
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nguyễn Văn A"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* CMND / CCCD */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                CMND / CCCD <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="012345678900"
                {...register('citizenId')}
                className={errors.citizenId ? 'border-red-500' : ''}
              />
              {errors.citizenId && <p className="mt-1 text-xs text-red-500">{errors.citizenId.message}</p>}
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngày sinh <span className="text-red-500">*</span>
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
                Giới tính <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={genderOptions}
                value={formValues.gender || ''}
                placeholder="Chọn giới tính"
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
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="0000000000"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Ngành học */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngành học <span className="text-red-500">*</span>
              </label>
              <DropdownSearch
                options={facultyOptions}
                value={formValues.facultyId || ''}
                placeholder="Chọn ngành"
                searchPlaceholder="Tìm kiếm ngành..."
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
                Chuyên ngành <span className="text-red-500">*</span>
              </label>
              <DropdownSearch
                options={departmentOptions}
                value={formValues.departmentId || ''}
                placeholder="Chọn chuyên ngành"
                searchPlaceholder="Tìm kiếm chuyên ngành..."
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
                Lớp <span className="text-red-500">*</span>
              </label>
              <DropdownSearch
                options={classOptions}
                value={formValues.classId || ''}
                placeholder="Chọn lớp"
                searchPlaceholder="Tìm kiếm lớp..."
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
                Trạng thái
              </label>
              <Dropdown
                options={enrollmentStatusOptions}
                value={formValues.enrollmentStatus || 'active'}
                placeholder="Chọn trạng thái"
                onChange={(value) => setValue('enrollmentStatus', value)}
              />
            </div>

            {/* Địa chỉ - Full width */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập địa chỉ"
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
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
