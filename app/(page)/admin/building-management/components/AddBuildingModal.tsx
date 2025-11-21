'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dropdown, Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { buildingsApi } from '../lib/api/buildingsApi';

interface AddBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  buildingName: yup.string().required('Tên tòa nhà là bắt buộc').min(3, 'Tên tòa nhà phải có ít nhất 3 ký tự'),
  buildingCode: yup.string().required('Mã tòa nhà là bắt buộc').min(2, 'Mã tòa nhà phải có ít nhất 2 ký tự'),
  address: yup.string().optional(),
  buildingStatus: yup.string().optional(),
});

type FormData = InferType<typeof validationSchema>;

export const AddBuildingModal = ({ isOpen, onClose, onSuccess }: AddBuildingModalProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      buildingName: '',
      buildingCode: '',
      address: '',
      buildingStatus: 'active',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formValues = watch();

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
    setIsSubmitting(true);
    try {
      const payload = {
        buildingName: data.buildingName,
        buildingCode: data.buildingCode,
        address: data.address || undefined,
        buildingStatus: (data.buildingStatus as 'active' | 'inactive') || 'active',
      };

      const response = await buildingsApi.create(payload);

      if (response.success) {
        toast.success('Thêm tòa nhà thành công!');
        reset();
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || 'Thêm tòa nhà thất bại');
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Thêm tòa nhà mới</h2>
              <p className="text-sm text-gray-600 mt-1">Nhập thông tin tòa nhà</p>
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
              {/* Mã tòa nhà */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mã tòa nhà <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: TN-A"
                  {...register('buildingCode')}
                  className={errors.buildingCode ? 'border-red-500' : ''}
                />
                {errors.buildingCode && <p className="mt-1 text-xs text-red-500">{errors.buildingCode.message}</p>}
              </div>

              {/* Tên tòa nhà */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tên tòa nhà <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: Tòa nhà A"
                  {...register('buildingName')}
                  className={errors.buildingName ? 'border-red-500' : ''}
                />
                {errors.buildingName && <p className="mt-1 text-xs text-red-500">{errors.buildingName.message}</p>}
              </div>

              {/* Địa chỉ */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Địa chỉ
                </label>
                <Input
                  placeholder="VD: 123 Đường ABC, Quận XYZ"
                  {...register('address')}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
              </div>

              {/* Trạng thái */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Trạng thái
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formValues.buildingStatus || 'active'}
                  placeholder="Chọn trạng thái"
                  onChange={(value) => setValue('buildingStatus', value)}
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
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

