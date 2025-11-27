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
import type { Course, Instructor } from '../lib/types/types';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  courseId: yup.string().required('Lớp học phần là bắt buộc'),
  instructorId: yup.string().required('Giảng viên phụ trách là bắt buộc'),
  effectiveDate: yup.string().required('Ngày áp dụng là bắt buộc'),
  notes: yup.string().optional(),
});

type FormData = InferType<typeof validationSchema>;

export const AddAssignmentModal = ({ isOpen, onClose, onSuccess }: AddAssignmentModalProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, clearErrors } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      courseId: '',
      instructorId: '',
      effectiveDate: '',
      notes: '',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const formValues = watch();

  useEffect(() => {
    if (isOpen) {
      coursesApi.getCourses({ pageSize: 1000 }).then((res) => {
        if (res.success) setCourses(res.data.courses);
      });
      coursesApi.getInstructors().then((res) => {
        if (res.success) setInstructors(res.data);
      });
    }
  }, [isOpen]);

  const courseOptions = courses.map((c) => ({ value: c.courseId, label: `${c.courseCode} - ${c.subjectName}` }));
  const instructorOptions = instructors.map((i) => ({ value: i.instructorId, label: i.instructorName }));

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
        courseId: data.courseId,
        instructorId: data.instructorId,
        effectiveDate: data.effectiveDate,
        notes: data.notes || '',
      };

      const response = await coursesApi.createAssignment(payload);

      if (response.success) {
        toast.success('Thêm phân công thành công!');
        reset();
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || 'Thêm phân công thất bại');
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
              <h2 className="text-2xl font-bold text-gray-900">Thêm phân công giảng viên</h2>
              <p className="text-sm text-gray-600 mt-1">Nhập thông tin phân công</p>
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
              {/* Lớp học phần */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Lớp học phần <span className="text-red-500">*</span>
                </label>
                <DropdownSearch
                  options={courseOptions}
                  value={formValues.courseId || ''}
                  placeholder="Chọn lớp học phần"
                  searchPlaceholder="Tìm kiếm lớp học phần..."
                  onChange={(value) => {
                    setValue('courseId', value);
                    clearErrors('courseId');
                  }}
                  buttonClassName={errors.courseId ? 'border-red-500' : ''}
                />
                {errors.courseId && <p className="mt-1 text-xs text-red-500">{errors.courseId.message}</p>}
              </div>

              {/* Giảng viên phụ trách */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Giảng viên phụ trách <span className="text-red-500">*</span>
                </label>
                <DropdownSearch
                  options={instructorOptions}
                  value={formValues.instructorId || ''}
                  placeholder="Chọn giảng viên"
                  searchPlaceholder="Tìm kiếm giảng viên..."
                  onChange={(value) => {
                    setValue('instructorId', value);
                    clearErrors('instructorId');
                  }}
                  buttonClassName={errors.instructorId ? 'border-red-500' : ''}
                />
                {errors.instructorId && <p className="mt-1 text-xs text-red-500">{errors.instructorId.message}</p>}
              </div>

              {/* Ngày áp dụng */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Ngày áp dụng <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  {...register('effectiveDate')}
                  className={errors.effectiveDate ? 'border-red-500' : ''}
                />
                {errors.effectiveDate && <p className="mt-1 text-xs text-red-500">{errors.effectiveDate.message}</p>}
              </div>

              {/* Ghi chú */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Ghi chú
                </label>
                <Input
                  placeholder="VD: Phân công ban đầu"
                  {...register('notes')}
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


