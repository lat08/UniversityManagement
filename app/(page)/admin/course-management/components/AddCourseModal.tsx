'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DropdownSearch, Button, Input } from '@/app/components/ui';
import { X, Calendar } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { format, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { coursesApi } from '../lib/api/coursesApi';
import type { Subject, Semester, Room } from '../lib/types/types';
import 'react-day-picker/dist/style.css';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  courseCode: yup.string().required('Mã lớp học phần là bắt buộc').min(2, 'Mã lớp học phần phải có ít nhất 2 ký tự'),
  subjectId: yup.string().required('Môn học là bắt buộc'),
  semesterId: yup.string().required('Học kỳ là bắt buộc'),
  roomId: yup.string().required('Phòng học là bắt buộc'),
  startDate: yup.string().required('Ngày bắt đầu là bắt buộc'),
  maxEnrollment: yup.number().required('Sĩ số tối đa là bắt buộc').min(1, 'Sĩ số tối đa phải lớn hơn 0'),
  periodRange: yup.string().required('Khung giờ học là bắt buộc').oneOf(['morning', 'afternoon', 'evening'], 'Khung giờ học không hợp lệ'),
});

type FormData = InferType<typeof validationSchema>;

export const AddCourseModal = ({ isOpen, onClose, onSuccess }: AddCourseModalProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, clearErrors } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      courseCode: '',
      subjectId: '',
      semesterId: '',
      roomId: '',
      startDate: '',
      maxEnrollment: 0,
      periodRange: 'morning',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [dateInputValue, setDateInputValue] = useState<string>('');
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, right: 0 });

  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const formValues = watch();

  useEffect(() => {
    if (isOpen) {
      coursesApi.getSubjects().then((res) => {
        if (res.success) setSubjects(res.data);
      });
      coursesApi.getSemesters().then((res) => {
        if (res.success) setSemesters(res.data);
      });
      coursesApi.getRooms('active').then((res) => {
        if (res.success) setRooms(res.data);
      });
    }
  }, [isOpen]);

  const subjectOptions = subjects.map((s) => ({ value: s.subjectId, label: s.subjectName }));
  const semesterOptions = semesters.map((s) => ({ value: s.semesterId, label: s.semesterName }));
  const roomOptions = rooms.map((r) => ({ 
    value: r.roomId, 
    label: `${r.roomCode} - ${r.roomName}${r.buildingName ? ` (${r.buildingName})` : ''}` 
  }));
  const periodRangeOptions = [
    { value: 'morning', label: 'Buổi sáng (7:15-11:50)' },
    { value: 'afternoon', label: 'Buổi chiều (13:30-18:00)' },
    { value: 'evening', label: 'Buổi tối (18:05-20:45)' },
  ];

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  }, [isSubmitting, reset, onClose]);

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

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        if (showCalendar) {
          setShowCalendar(false);
        } else {
          handleClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitting, handleClose, showCalendar]);

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

  useEffect(() => {
    if (!isOpen) {
      setShowCalendar(false);
      setDateInputValue('');
    }
  }, [isOpen]);

  const handleDateInputChange = (value: string) => {
    setDateInputValue(value);
    
    if (value.length === 10) {
      try {
        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
        if (!isNaN(parsedDate.getTime())) {
          const dateStr = format(parsedDate, 'yyyy-MM-dd');
          setValue('startDate', dateStr);
          clearErrors('startDate');
        }
      } catch {
        // Invalid date format
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      setValue('startDate', dateStr);
      setDateInputValue(format(date, 'dd/MM/yyyy'));
      setShowCalendar(false);
      clearErrors('startDate');
    }
  };

  const handleCalendarToggle = () => {
    if (!showCalendar) {
      updateCalendarPosition();
    }
    setShowCalendar(!showCalendar);
  };

  const bookingDate = formValues.startDate ? (() => {
    try {
      return parse(formValues.startDate, 'yyyy-MM-dd', new Date());
    } catch {
      return undefined;
    }
  })() : undefined;

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        courseCode: data.courseCode,
        subjectId: data.subjectId,
        semesterId: data.semesterId,
        roomId: data.roomId,
        startDate: data.startDate,
        maxEnrollment: data.maxEnrollment,
        periodRange: data.periodRange as 'morning' | 'afternoon' | 'evening',
      };

      const response = await coursesApi.createCourse(payload);

      if (response.success) {
        toast.success('Thêm lớp học thành công!');
        reset();
        setDateInputValue('');
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
    if (e.target === e.currentTarget && !isSubmitting && !showCalendar) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ overflow: 'visible' }}>
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden" style={{ overflow: 'visible' }}>
          <div className="overflow-y-auto flex-1 p-6" style={{ overflowX: 'visible' }}>
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
                <div style={{ zIndex: 10000, position: 'relative' }}>
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
                    dropdownClassName="z-[10001]"
                  />
                </div>
                {errors.subjectId && <p className="mt-1 text-xs text-red-500">{errors.subjectId.message}</p>}
              </div>

              {/* Học kỳ */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Học kỳ <span className="text-red-500">*</span>
                </label>
                <div style={{ zIndex: 10000, position: 'relative' }}>
                  <DropdownSearch
                    options={semesterOptions}
                    value={formValues.semesterId || ''}
                    placeholder="Chọn học kỳ"
                    searchPlaceholder="Tìm kiếm học kỳ..."
                    onChange={(value) => {
                      setValue('semesterId', value);
                      clearErrors('semesterId');
                    }}
                    buttonClassName={errors.semesterId ? 'border-red-500' : ''}
                    dropdownClassName="z-[10001]"
                  />
                </div>
                {errors.semesterId && <p className="mt-1 text-xs text-red-500">{errors.semesterId.message}</p>}
              </div>

              {/* Phòng học */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phòng học <span className="text-red-500">*</span>
                </label>
                <div style={{ zIndex: 10000, position: 'relative' }}>
                  <DropdownSearch
                    options={roomOptions}
                    value={formValues.roomId || ''}
                    placeholder="Chọn phòng học"
                    searchPlaceholder="Tìm kiếm phòng học..."
                    onChange={(value) => {
                      setValue('roomId', value);
                      clearErrors('roomId');
                    }}
                    buttonClassName={errors.roomId ? 'border-red-500' : ''}
                    dropdownClassName="z-[10001]"
                  />
                </div>
                {errors.roomId && <p className="mt-1 text-xs text-red-500">{errors.roomId.message}</p>}
              </div>

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
                      if (!/[0-9/]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
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
                {showCalendar && typeof window !== 'undefined' && document.body && createPortal(
                  <div 
                    ref={calendarRef}
                    className="fixed z-[10002] bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                    style={{
                      top: `${calendarPosition.top}px`,
                      right: `${calendarPosition.right}px`,
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DayPicker
                      mode="single"
                      selected={bookingDate}
                      onSelect={handleCalendarSelect}
                      disabled={{
                        before: new Date(),
                      }}
                      locale={vi}
                      classNames={{
                        day_selected: 'bg-[#0053AD] text-white',
                        day_today: 'bg-[#0053AD]/20 text-[#0053AD] font-semibold',
                        day_disabled: 'text-gray-300',
                        day: 'hover:bg-gray-100 rounded',
                      }}
                    />
                  </div>,
                  document.body
                )}
                {bookingDate && (
                  <p className="text-sm text-gray-600 mt-2">
                    Ngày đã chọn: {format(bookingDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
                  </p>
                )}
                {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
              </div>

              {/* Khung giờ học */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Khung giờ học <span className="text-red-500">*</span>
                </label>
                <div style={{ zIndex: 10000, position: 'relative' }}>
                  <DropdownSearch
                    options={periodRangeOptions}
                    value={formValues.periodRange || 'morning'}
                    placeholder="Chọn khung giờ học"
                    onChange={(value) => {
                      setValue('periodRange', value as 'morning' | 'afternoon' | 'evening');
                      clearErrors('periodRange');
                    }}
                    buttonClassName={errors.periodRange ? 'border-red-500' : ''}
                    dropdownClassName="z-[10001]"
                  />
                </div>
                {errors.periodRange && <p className="mt-1 text-xs text-red-500">{errors.periodRange.message}</p>}
              </div>

              {/* Sĩ số tối đa */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sĩ số tối đa <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="VD: 50"
                  min={1}
                  max={300}
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
