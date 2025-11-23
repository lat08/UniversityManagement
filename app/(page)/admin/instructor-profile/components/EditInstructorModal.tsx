'use client';

import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { Dropdown, Button, Input } from '@/app/components/ui';
import { commonApi } from '@/lib/api/common';
import { instructorsApi } from '../lib/api/instructorsApi';
import { DEGREE_OPTIONS, EMPLOYMENT_STATUS_OPTIONS } from '../lib/constants/filters';
import { FacultyOption, InstructorDetail, UpdateInstructorPayload } from '../lib/types/types';

interface EditInstructorModalProps {
  isOpen: boolean;
  instructorId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  fullName: yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  gender: yup.string().required('Giới tính là bắt buộc'),
  facultyId: yup.string().required('Khoa/Bộ môn là bắt buộc'),
  dateOfBirth: yup.string().nullable(),
  hireDate: yup.string().nullable(),
  phoneNumber: yup
    .string()
    .nullable()
    .test('phone-valid', 'Số điện thoại phải có 10-11 số', (value) => {
      if (!value) return true;
      return /^[0-9]{10,11}$/.test(value);
    }),
  citizenId: yup
    .string()
    .nullable()
    .test('cid-valid', 'CMND/CCCD phải có 9-12 số', (value) => {
      if (!value) return true;
      return /^[0-9]{9,12}$/.test(value);
    }),
  address: yup.string().nullable(),
  degree: yup.string().nullable(),
  specialization: yup.string().nullable(),
  employmentStatus: yup.string().nullable(),
});

type FormData = InferType<typeof validationSchema>;

export default function EditInstructorModal({ isOpen, instructorId, onClose, onSuccess }: EditInstructorModalProps) {
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
        toast.error('Không thể tải thông tin giảng viên');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [isOpen, instructorId, reset]);

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
        toast.success('Cập nhật giảng viên thành công');
        onSuccess?.();
        handleClose();
      } else {
        toast.error(res.message || 'Cập nhật giảng viên thất bại');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi cập nhật giảng viên';
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
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
  ];

  const facultyOptions = faculties.map((f) => ({ value: f.facultyId, label: f.facultyName }));
  const degreeOptions = DEGREE_OPTIONS.map((d) => ({ value: d.value, label: d.label }));
  const statusOptions = EMPLOYMENT_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }));

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Cập nhật giảng viên</h2>
              <p className="text-sm text-gray-600 mt-1">Chỉnh sửa thông tin giảng viên</p>
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
              <div className="text-center text-sm text-gray-500 py-10">Đang tải dữ liệu...</div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Nguyễn Văn A"
                    {...register('fullName')}
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Số điện thoại</label>
                  <Input
                    placeholder="0000000000"
                    {...register('phoneNumber')}
                    className={errors.phoneNumber ? 'border-red-500' : ''}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Ngày sinh</label>
                  <Input type="date" {...register('dateOfBirth')} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Ngày tuyển dụng</label>
                  <Input type="date" {...register('hireDate')} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Khoa/Bộ môn <span className="text-red-500">*</span>
                  </label>
                  <Dropdown
                    options={facultyOptions}
                    value={formValues.facultyId || ''}
                    placeholder="Chọn khoa/Bộ môn"
                    onChange={(value) => setValue('facultyId', value, { shouldValidate: true })}
                    className={errors.facultyId ? 'border-red-500' : ''}
                  />
                  {errors.facultyId && (
                    <p className="mt-1 text-xs text-red-500">{errors.facultyId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Học vị</label>
                  <Dropdown
                    options={degreeOptions}
                    value={formValues.degree || ''}
                    placeholder="Chọn học vị"
                    onChange={(value) => setValue('degree', value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Giới tính</label>
                  <Dropdown
                    options={genderOptions}
                    value={formValues.gender || ''}
                    placeholder="Chọn giới tính"
                    onChange={(value) => setValue('gender', value, { shouldValidate: true })}
                    className={errors.gender ? 'border-red-500' : ''}
                  />
                  {errors.gender && (
                    <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Chuyên môn</label>
                  <Input placeholder="VD: Lập trình Web" {...register('specialization')} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">CMND/CCCD</label>
                  <Input
                    placeholder="012345678900"
                    {...register('citizenId')}
                    className={errors.citizenId ? 'border-red-500' : ''}
                  />
                  {errors.citizenId && (
                    <p className="mt-1 text-xs text-red-500">{errors.citizenId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Trạng thái</label>
                  <Dropdown
                    options={statusOptions}
                    value={formValues.employmentStatus || 'active'}
                    placeholder="Chọn trạng thái"
                    onChange={(value) => setValue('employmentStatus', value)}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Địa chỉ</label>
                  <Input
                    placeholder="Nhập địa chỉ"
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
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}