'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dropdown, DropdownSearch, Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { divisionsApi } from '../lib/api/divisionsApi';
import type { Division, Instructor } from '../lib/types/types';

interface EditDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  division: Division | null;
}

const validationSchema = yup.object({
  divisionName: yup.string().required('Tên khoa là bắt buộc').min(3, 'Tên khoa phải có ít nhất 3 ký tự').max(200, 'Tên khoa không được vượt quá 200 ký tự'),
  divisionCode: yup.string().required('Mã khoa là bắt buộc'),
  deanId: yup.string().optional(),
  status: yup.string().optional(),
});

type FormData = InferType<typeof validationSchema>;

export const EditDivisionModal = ({ isOpen, onClose, onSuccess, division }: EditDivisionModalProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, clearErrors } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      divisionName: '',
      divisionCode: '',
      deanId: '',
      status: 'active',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const formValues = watch();

  useEffect(() => {
    if (isOpen && division) {
      setValue('divisionName', division.divisionName);
      setValue('divisionCode', division.divisionCode);
      setValue('deanId', division.deanId || '');
      setValue('status', division.status);
    } else if (isOpen && !division) {
      // Reset form when modal opens without division
      reset();
    }
  }, [isOpen, division, setValue, reset]);

  useEffect(() => {
    if (isOpen) {
      divisionsApi.getInstructors().then((res) => {
        if (res.success) setInstructors(res.data);
      });
    }
  }, [isOpen]);

  const instructorOptions = [
    { value: '', label: 'Chưa chỉ định' },
    ...instructors
      .filter((i) => i.instructorId && i.instructorName)
      .map((i) => ({ value: i.instructorId, label: i.instructorName })),
  ];

  const statusOptions = [
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Ngừng hoạt động' },
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
    if (!division) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        divisionId: division.divisionId,
        divisionName: data.divisionName.trim(),
        deanId: data.deanId || undefined,
        status: (data.status as 'active' | 'inactive') || 'active',
      };

      const response = await divisionsApi.updateDivision(payload);

      if (response.success) {
        toast.success('Cập nhật khoa thành công!');
        reset();
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || 'Cập nhật khoa thất bại');
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

  if (!isOpen || !division) return null;

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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sửa khoa</h2>
              <p className="text-sm text-gray-600 mt-1">Sửa thông tin khoa</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-6">
              {/* Mã khoa */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mã <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('divisionCode')}
                  className={errors.divisionCode ? 'border-red-500' : ''}
                  disabled
                  style={{ backgroundColor: '#f3f4f6' }}
                />
                {errors.divisionCode && <p className="mt-1 text-xs text-red-500">{errors.divisionCode.message}</p>}
              </div>

              {/* Tên khoa */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tên Khoa <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Nhập tên khoa..."
                  {...register('divisionName')}
                  className={errors.divisionName ? 'border-red-500' : ''}
                />
                {errors.divisionName && <p className="mt-1 text-xs text-red-500">{errors.divisionName.message}</p>}
              </div>

              {/* Trưởng khoa */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Trưởng khoa
                </label>
                <DropdownSearch
                  options={instructorOptions}
                  value={formValues.deanId || ''}
                  placeholder="Chọn trưởng khoa..."
                  searchPlaceholder="Tìm kiếm giảng viên..."
                  onChange={(value) => {
                    setValue('deanId', value);
                    clearErrors('deanId');
                  }}
                  buttonClassName={errors.deanId ? 'border-red-500' : ''}
                />
                {errors.deanId && <p className="mt-1 text-xs text-red-500">{errors.deanId.message}</p>}
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Trạng thái
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formValues.status || 'active'}
                  placeholder="Chọn trạng thái"
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
};

