'use client';

import { useState, useEffect, useCallback } from 'react';
import { DropdownSearch, Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { coursesApi } from '../lib/api/coursesApi';
import type { Subject } from '../lib/types/types';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  courseCode: yup.string().required('Mã lớp học phần là bắt buộc').min(2, 'Mã lớp học phần phải có ít nhất 2 ký tự'),
  subjectId: yup.string().required('Môn học là bắt buộc'),
  maxEnrollment: yup.number().required('Sĩ số tối đa là bắt buộc').min(1, 'Sĩ số tối đa phải lớn hơn 0'),
});

type FormData = InferType<typeof validationSchema>;

export const AddCourseModal = ({ isOpen, onClose, onSuccess }: AddCourseModalProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, clearErrors } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      courseCode: '',
      subjectId: '',
      maxEnrollment: 0,
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const formValues = watch();

  useEffect(() => {
    if (isOpen) {
      coursesApi.getSubjects().then((res) => {
        if (res.success) setSubjects(res.data);
      });
    }
  }, [isOpen]);

  const subjectOptions = subjects.map((s) => ({ value: s.subjectId, label: s.subjectName }));

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
        courseCode: data.courseCode,
        subjectId: data.subjectId,
        maxEnrollment: data.maxEnrollment,
      };

      const response = await coursesApi.createCourse(payload);

      if (response.success) {
        toast.success('Thêm lớp học thành công!');
        reset();
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || 'Thêm lớp học thất bại');
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
              <h2 className="text-2xl font-bold text-gray-900">Thêm lớp học phần mới</h2>
              <p className="text-sm text-gray-600 mt-1">Nhập thông tin lớp học phần</p>
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
              {/* Mã lớp học phần */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mã lớp học phần <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: LTW01"
                  {...register('courseCode')}
                  className={errors.courseCode ? 'border-red-500' : ''}
                />
                {errors.courseCode && <p className="mt-1 text-xs text-red-500">{errors.courseCode.message}</p>}
              </div>

              {/* Môn học */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Môn học <span className="text-red-500">*</span>
                </label>
                <DropdownSearch
                  options={subjectOptions}
                  value={formValues.subjectId || ''}
                  placeholder="Chọn môn học"
                  searchPlaceholder="Tìm kiếm môn học..."
                  onChange={(value) => {
                    setValue('subjectId', value);
                    clearErrors('subjectId');
                  }}
                  buttonClassName={errors.subjectId ? 'border-red-500' : ''}
                />
                {errors.subjectId && <p className="mt-1 text-xs text-red-500">{errors.subjectId.message}</p>}
              </div>

              {/* Sĩ số tối đa */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sĩ số tối đa <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="VD: 50"
                  {...register('maxEnrollment', { valueAsNumber: true })}
                  className={errors.maxEnrollment ? 'border-red-500' : ''}
                />
                {errors.maxEnrollment && <p className="mt-1 text-xs text-red-500">{errors.maxEnrollment.message}</p>}
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
              {isSubmitting ? 'Đang lưu...' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

