'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Input, DropdownSearch, Dropdown } from '@/app/components/ui';
import { X, Calendar } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { DayPicker } from 'react-day-picker';
import { vi } from 'date-fns/locale';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { coursesApi } from '../lib/api/coursesApi';
import type { CourseClassSummary, ScheduleSuggestion } from '../lib/types/types';
import { api } from '@/lib/api/client';
import { format, parse } from 'date-fns';

interface EditCourseClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseClass: CourseClassSummary | null;
  course: { courseId: string; subjectName: string; semester: string; academicYear?: string } | null;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  startDate: yup.string().required('Ngày bắt đầu là bắt buộc'),
  maxStudents: yup
    .number()
    .typeError('Sĩ số tối đa phải là số')
    .required('Sĩ số tối đa là bắt buộc')
    .min(1, 'Sĩ số tối đa phải lớn hơn 0'),
  roomId: yup.string().required('Vui lòng chọn gợi ý lịch học'),
  periodRange: yup
    .string()
    .required('Khung giờ là bắt buộc')
    .oneOf(['morning', 'afternoon', 'evening'], 'Khung giờ không hợp lệ'),
  status: yup.string().required('Trạng thái là bắt buộc'),
});

type FormData = InferType<typeof validationSchema>;

export const EditCourseClassModal = ({ isOpen, onClose, courseClass, course, onSuccess }: EditCourseClassModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    clearErrors,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      startDate: '',
      maxStudents: 0,
      roomId: '',
      periodRange: 'morning',
      status: 'active',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleSuggestions, setScheduleSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string>('');
  const [dateInputValue, setDateInputValue] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, right: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const formValues = watch();

  // Load course class details when modal opens
  useEffect(() => {
    if (!isOpen || !courseClass) return;

    const loadDetails = async () => {
      try {
        const detailRes = await coursesApi.getCourseClassDetail(courseClass.courseClassId);
        if (detailRes.success && detailRes.data) {
          const detail = detailRes.data;
          const startDateStr = detail.startDate;
          setValue('startDate', startDateStr);
          setValue('maxStudents', detail.maxStudents);
          setValue('status', detail.courseClassStatus === 'active' ? 'active' : 'inactive');
          
          // Format date for display
          try {
            const parsed = parse(startDateStr, 'yyyy-MM-dd', new Date());
            setDateInputValue(format(parsed, 'dd/MM/yyyy'));
          } catch {
            setDateInputValue(startDateStr);
          }

          // Load suggestions for this date
          if (startDateStr) {
            const suggestionsRes = await coursesApi.getScheduleSuggestions({ date: startDateStr });
            if (suggestionsRes.success) {
              setScheduleSuggestions(suggestionsRes.data);
              // Try to pre-select the current room if it matches a suggestion
              if (detail.roomId) {
                const matchingSuggestion = suggestionsRes.data.find((s) => s.roomId === detail.roomId);
                if (matchingSuggestion) {
                  setSelectedSuggestionId(matchingSuggestion.roomId);
                  setValue('roomId', matchingSuggestion.roomId);
                  setValue('periodRange', matchingSuggestion.period);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading course class details:', error);
      }
    };

    loadDetails();
  }, [isOpen, courseClass, setValue]);

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    setSelectedSuggestionId('');
    setScheduleSuggestions([]);
    setDateInputValue('');
    setShowCalendar(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
      setScheduleSuggestions([]);
      setSelectedSuggestionId('');
      setDateInputValue('');
    }
  }, [isOpen, reset]);

  const updateCalendarPosition = useCallback(() => {
    if (dateInputRef.current && typeof window !== 'undefined') {
      const rect = dateInputRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      setCalendarPosition({
        top: rect.bottom + window.scrollY + 8,
        right: Math.max(8, viewportWidth - rect.right - 8),
      });
    }
  }, []);

  const handleCalendarToggle = () => {
    if (!showCalendar) {
      updateCalendarPosition();
    }
    setShowCalendar((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        calendarRef.current &&
        !calendarRef.current.contains(target) &&
        dateInputRef.current &&
        !dateInputRef.current.contains(target)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      updateCalendarPosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updateCalendarPosition);
      window.addEventListener('scroll', updateCalendarPosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateCalendarPosition);
      window.removeEventListener('scroll', updateCalendarPosition, true);
    };
  }, [showCalendar, updateCalendarPosition]);

  const handleDateInputChange = (value: string) => {
    setDateInputValue(value);

    if (value.length === 10) {
      try {
        const [day, month, year] = value.split('/').map(Number);
        const parsedDate = new Date(year, month - 1, day);
        if (!isNaN(parsedDate.getTime())) {
          const iso = parsedDate.toISOString().split('T')[0];
          setValue('startDate', iso);
          clearErrors('startDate');
          setSelectedSuggestionId('');
          setScheduleSuggestions([]);

          coursesApi.getScheduleSuggestions({ date: iso }).then((res) => {
            if (res.success) {
              setScheduleSuggestions(res.data);
            } else {
              toast.error(res.message || 'Không thể tải gợi ý lịch học');
            }
          });
        }
      } catch {
        // ignore
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    const iso = date.toISOString().split('T')[0];
    setValue('startDate', iso);
    setDateInputValue(
      date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    );
    setShowCalendar(false);
    clearErrors('startDate');
    setSelectedSuggestionId('');
    setScheduleSuggestions([]);

    coursesApi.getScheduleSuggestions({ date: iso }).then((res) => {
      if (res.success) {
        setScheduleSuggestions(res.data);
      } else {
        toast.error(res.message || 'Không thể tải gợi ý lịch học');
      }
    });
  };

  const statusOptions = [
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
  ];

  const onSubmit = async (data: FormData) => {
    if (!courseClass || !course) return;
    setIsSubmitting(true);
    try {
      if (!selectedSuggestionId) {
        toast.error('Vui lòng chọn một gợi ý lịch học');
        return;
      }
      const suggestion = scheduleSuggestions.find((s) => s.roomId === selectedSuggestionId);
      if (!suggestion) {
        toast.error('Gợi ý lịch học không hợp lệ');
        return;
      }

      const response = await api.put<{
        success: boolean;
        message?: string;
      }>(`/v1/course-classes/${courseClass.courseClassId}`, {
        RoomId: suggestion.roomId,
        StartDate: data.startDate,
        MaxStudents: data.maxStudents,
        PeriodRange: suggestion.period,
        CourseClassStatus: data.status,
      });

      if (response.data.success) {
        toast.success('Cập nhật lớp học phần thành công!');
        reset();
        setSelectedSuggestionId('');
        setScheduleSuggestions([]);
        setDateInputValue('');
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.data.message || 'Cập nhật lớp học phần thất bại');
      }
    } catch (error: unknown) {
      const resp = (error as { response?: { data?: { message?: string; errors?: string[] } }; message?: string })?.response?.data;
      const fallbackMessage =
        resp?.message || resp?.errors?.[0] || (error as { message?: string })?.message || 'Đã xảy ra lỗi';
      toast.error(fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !courseClass || !course) return null;

  const bookingDate = formValues.startDate ? new Date(formValues.startDate) : undefined;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ overflow: 'visible' }}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Cập nhật lớp học phần</h2>
              <p className="text-sm text-gray-600 mt-1">
                {course.subjectName} • {course.semester} {course.academicYear ? `• ${course.academicYear}` : ''}
              </p>
              <p className="text-xs text-gray-500 mt-1">Mã lớp: {courseClass.courseClassCode}</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden" style={{ overflow: 'visible' }}>
          <div className="overflow-y-auto flex-1 p-6" style={{ overflowX: 'visible' }}>
            <div className="grid grid-cols-2 gap-6">
              {/* Ngày bắt đầu */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={dateInputRef}
                    type="text"
                    value={dateInputValue}
                    onChange={(e) => handleDateInputChange(e.target.value)}
                    onFocus={() => {
                      updateCalendarPosition();
                      setShowCalendar(true);
                    }}
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                    className={`w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] bg-white ${
                      errors.startDate ? 'border-red-500' : 'border-gray-200'
                    }`}
                    onKeyDown={(e) => {
                      if (!/[0-9/]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCalendarToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Calendar className="h-5 w-5" />
                  </button>
                </div>
                {showCalendar && typeof window !== 'undefined' && createPortal(
                  <div
                    ref={calendarRef}
                    className="fixed z-[10002] bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                    style={{
                      top: calendarPosition.top,
                      right: calendarPosition.right,
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DayPicker
                      mode="single"
                      selected={bookingDate}
                      onSelect={handleCalendarSelect}
                      locale={vi}
                      classNames={{
                        day_selected: 'bg-[#0053AD] text-white',
                        day_today: 'bg-[#0053AD]/20 text-[#0053AD] font-semibold',
                        day_disabled: 'text-gray-300',
                        day: 'hover:bg-gray-100 rounded',
                      }}
                    />
                  </div>,
                  document.body,
                )}
                {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
              </div>

              {/* Sĩ số tối đa */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sĩ số tối đa <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="VD: 50"
                  {...register('maxStudents', { valueAsNumber: true })}
                  className={errors.maxStudents ? 'border-red-500' : ''}
                />
                {errors.maxStudents && <p className="mt-1 text-xs text-red-500">{errors.maxStudents.message}</p>}
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formValues.status || 'active'}
                  placeholder="Chọn trạng thái"
                  onChange={(value) => {
                    setValue('status', value);
                    clearErrors('status');
                  }}
                  buttonClassName={errors.status ? 'border-red-500' : ''}
                />
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>}
              </div>
            </div>

            {/* Gợi ý lịch học */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Gợi ý lịch học <span className="text-red-500">*</span>
              </label>
              <DropdownSearch
                options={scheduleSuggestions.map((s) => ({
                  value: s.roomId,
                  label: `${s.buildingName ? `${s.buildingName} - ` : ''}${s.roomName} | ${
                    s.period === 'morning' ? 'Buổi sáng' : s.period === 'afternoon' ? 'Buổi chiều' : 'Buổi tối'
                  } (${s.startTime} - ${s.endTime}) • Sức chứa: ${s.capacity}`,
                }))}
                value={selectedSuggestionId}
                placeholder={
                  formValues.startDate
                    ? scheduleSuggestions.length > 0
                      ? 'Chọn gợi ý lịch học'
                      : 'Không có gợi ý nào cho ngày này'
                    : 'Chọn ngày bắt đầu trước'
                }
                searchPlaceholder="Tìm kiếm phòng học..."
                onChange={(value) => {
                  setSelectedSuggestionId(value);
                  const suggestion = scheduleSuggestions.find((s) => s.roomId === value);
                  if (suggestion) {
                    setValue('roomId', suggestion.roomId);
                    setValue('periodRange', suggestion.period);
                    clearErrors('roomId');
                    clearErrors('periodRange');
                  }
                }}
                buttonClassName={errors.roomId || errors.periodRange ? 'border-red-500' : ''}
                disabled={!formValues.startDate || scheduleSuggestions.length === 0}
              />
              {(errors.roomId || errors.periodRange) && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.roomId?.message || errors.periodRange?.message}
                </p>
              )}
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
              {isSubmitting ? 'Đang lưu...' : 'Cập nhật lớp học phần'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

