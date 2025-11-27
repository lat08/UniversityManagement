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

interface AssignInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  course: Course | null;
  courseClassId?: string; // Optional: if provided, use this instead of course.courseId for assignment
}

const validationSchema = yup.object({
  instructorId: yup.string().required('Giảng viên là bắt buộc'),
  effectiveDate: yup.string().required('Ngày áp dụng là bắt buộc'),
  notes: yup.string().max(100, 'Ghi chú không được quá 100 ký tự'),
});

type FormData = InferType<typeof validationSchema>;

export const AssignInstructorModal = ({ isOpen, onClose, onSuccess, course, courseClassId }: AssignInstructorModalProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, clearErrors } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      instructorId: '',
      effectiveDate: '',
      notes: '',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const formValues = watch();
  const notesLength = (formValues.notes || '').length;

  useEffect(() => {
    if (isOpen) {
      coursesApi.getInstructors().then((res) => {
        if (res.success) setInstructors(res.data);
      });
    }
  }, [isOpen]);

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
    if (!course) return;

    setIsSubmitting(true);
    try {
      // Use courseClassId if provided (for course class assignment), otherwise use course.courseId (for course assignment)
      const targetId = courseClassId || course.courseId;
      const payload = {
        courseId: targetId,
        instructorId: data.instructorId,
        effectiveDate: data.effectiveDate,
        notes: data.notes || '',
      };

      const response = await coursesApi.createAssignment(payload);

      if (response.success) {
        toast.success('Phân công giảng viên thành công!');
        reset();
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || 'Phân công giảng viên thất bại');
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

  if (!isOpen || !course) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  // Get course class code if assigning to a course class
  const courseClassCode = courseClassId && course.courseClasses?.[0]?.courseClassCode;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phân công giảng viên</h2>
              <p className="text-sm text-gray-600 mt-1">
                {courseClassId ? 'Phân công giảng viên cho lớp học phần' : 'Phân công giảng viên cho học phần'}
              </p>
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
            {/* Mã */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                {courseClassId ? `Mã lớp: ${courseClassCode || 'N/A'}` : `Mã: ${course.courseCode}`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Môn học */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Môn học
                </label>
                <Input
                  value={course.subjectName}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Giảng viên */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Giảng viên <span className="text-red-500">*</span>
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
                <div className="relative">
                  <textarea
                    {...register('notes')}
                    maxLength={100}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md resize-none ${
                      errors.notes ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent`}
                    placeholder="VD: Phân công ban đầu"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                    {notesLength}/100
                  </div>
                </div>
                {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes.message}</p>}
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


