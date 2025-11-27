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
  const [isLoading, setIsLoading] = useState(false);
  const [pendingInstructorData, setPendingInstructorData] = useState<{
    instructorId?: string;
    effectiveDate?: string;
    note?: string;
  } | null>(null);

  const formValues = watch();
  const notesLength = (formValues.notes || '').length;

  // Set form values after instructors list is loaded
  useEffect(() => {
    if (pendingInstructorData && instructors.length > 0) {
      if (pendingInstructorData.instructorId) {
        // Verify instructor exists in list
        const instructorExists = instructors.some(
          (i) => i.instructorId === pendingInstructorData.instructorId
        );
        if (instructorExists) {
          setValue('instructorId', pendingInstructorData.instructorId, { shouldValidate: false });
        } else {
          console.warn('Instructor not found in list:', pendingInstructorData.instructorId);
        }
      }
      if (pendingInstructorData.effectiveDate) {
        setValue('effectiveDate', pendingInstructorData.effectiveDate, { shouldValidate: false });
      }
      if (pendingInstructorData.note) {
        setValue('notes', pendingInstructorData.note, { shouldValidate: false });
      }
      setPendingInstructorData(null);
    }
  }, [instructors, pendingInstructorData, setValue]);

  // Load existing assignment data and available instructors when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      
      // If courseClassId is provided, load existing assignment data and available instructors
      if (courseClassId) {
        // Load course class detail first to get existing assignment info
        coursesApi.getCourseClassDetail(courseClassId)
          .then((detailRes) => {
            // Then load available instructors
            return coursesApi.getAvailableInstructorsForCourseClass(courseClassId)
              .then((instructorsRes) => {
                // Load available instructors
                let instructorsList: Instructor[] = [];
                if (instructorsRes.success) {
                  instructorsList = instructorsRes.data;
                } else {
                  console.error('Failed to load available instructors:', instructorsRes.message);
                  toast.error(instructorsRes.message || 'Không thể tải danh sách giảng viên khả dụng');
                }

                // Preload existing assignment data
                if (detailRes.success && detailRes.data) {
                  const detail = detailRes.data;
                  
                  // If there's an existing instructor, make sure they're in the list
                  if (detail.instructorId && detail.instructorName) {
                    const existingInstructorInList = instructorsList.find(
                      (i) => i.instructorId === detail.instructorId
                    );
                    
                    // If current instructor is not in available list, add them at the beginning
                    if (!existingInstructorInList) {
                      instructorsList = [
                        {
                          instructorId: detail.instructorId,
                          instructorName: detail.instructorName,
                          instructorCode: undefined,
                        },
                        ...instructorsList,
                      ];
                    }
                  }
                  
                  // Prepare form data to be set after instructors are loaded
                  const formData: {
                    instructorId?: string;
                    effectiveDate?: string;
                    note?: string;
                  } = {};
                  
                  if (detail.instructorId) {
                    formData.instructorId = detail.instructorId;
                  }
                  if (detail.instructorAssignedDate) {
                    // Convert date format if needed (yyyy-MM-dd)
                    const dateStr = detail.instructorAssignedDate.includes('T') 
                      ? detail.instructorAssignedDate.split('T')[0]
                      : detail.instructorAssignedDate;
                    formData.effectiveDate = dateStr;
                  } else {
                    // Default to today if no assigned date
                    formData.effectiveDate = new Date().toISOString().split('T')[0];
                  }
                  if (detail.note) {
                    formData.note = detail.note;
                  }
                  
                  // Set instructors list first
                  setInstructors(instructorsList);
                  
                  // Set pending data to be applied after instructors list is set (via useEffect)
                  setPendingInstructorData(formData);
                } else {
                  setInstructors(instructorsList);
                }
              });
          })
          .catch((error) => {
            console.error('Error loading course class data:', error);
            toast.error('Đã xảy ra lỗi khi tải thông tin lớp học phần');
            setInstructors([]);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // For course assignment (not course class), just load all instructors
        coursesApi.getInstructors()
          .then((res) => {
            if (res.success) setInstructors(res.data);
          })
          .catch((error) => {
            console.error('Error loading instructors:', error);
            toast.error('Đã xảy ra lỗi khi tải danh sách giảng viên');
            setInstructors([]);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } else {
      // Reset when modal closes
      setInstructors([]);
      setPendingInstructorData(null);
      reset();
    }
  }, [isOpen, courseClassId, setValue, reset]);

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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Đang tải thông tin...</div>
              </div>
            ) : (
              <>
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
              </>
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
              disabled={isSubmitting || isLoading}
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


