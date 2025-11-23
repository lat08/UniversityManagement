'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dropdown, DropdownSearch, Button, Input, Textarea } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { notificationsApi } from '../lib/api/notificationsApi';
import { commonApi } from '@/lib/api/common';
import type { 
  Notification, 
  NotificationType, 
  TargetType, 
  SendingMethod 
} from '../lib/types/types';
import { NOTIFICATION_TYPE_OPTIONS as NOTIF_TYPE_OPTIONS, TARGET_TYPE_OPTIONS as TARGET_OPTIONS, SENDING_METHOD_OPTIONS as SENDING_OPTIONS, requiresTargetId } from '../lib/types/types';
import type { Faculty, Department, Class, Instructor, Student } from '@/lib/types/common';

interface EditNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  notification: Notification | null;
}

const validationSchema = yup.object({
  title: yup.string().required('Tiêu đề là bắt buộc').min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
  content: yup.string().required('Nội dung là bắt buộc').min(10, 'Nội dung phải có ít nhất 10 ký tự'),
  noticeMessage: yup.string().nullable().max(1000, 'Thông báo ngắn không được vượt quá 1000 ký tự'),
  notificationType: yup.string().required('Loại thông báo là bắt buộc').oneOf(['event', 'tuition', 'schedule', 'important']),
  targetType: yup.string().required('Đối tượng nhận là bắt buộc').oneOf(['all', 'all_students', 'all_instructors', 'faculty', 'department', 'class', 'instructor', 'student']),
  targetId: yup.string().nullable(),
  sendingMethod: yup.string().required('Phương thức gửi là bắt buộc').oneOf(['System', 'Email', 'Both']),
  scheduledDate: yup.string().nullable(),
});

type FormData = InferType<typeof validationSchema>;

export const EditNotificationModal = ({ isOpen, onClose, onSuccess, notification }: EditNotificationModalProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      title: '',
      content: '',
      noticeMessage: null,
      notificationType: 'event',
      targetType: 'all',
      targetId: null,
      sendingMethod: 'System',
      scheduledDate: null,
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [fullNotification, setFullNotification] = useState<Notification | null>(null);

  const formValues = watch();
  const targetType = formValues.targetType as TargetType;
  const needsTargetId = requiresTargetId(targetType);

  // Load notification data when modal opens
  useEffect(() => {
    const loadNotificationData = async () => {
      if (!isOpen || !notification) {
        setFullNotification(null);
        return;
      }

      // Nếu đã có content, không cần fetch lại
      if (notification.content) {
        setFullNotification(notification);
        setValue('title', notification.title);
        setValue('content', notification.content || '');
        setValue('noticeMessage', notification.noticeMessage || null);
        setValue('notificationType', notification.notificationType || 'event');
        setValue('targetType', notification.targetType);
        setValue('targetId', notification.targetId || null);
        setValue('sendingMethod', notification.sendingMethod);
        setValue('scheduledDate', notification.scheduledDate || null);
        return;
      }

      // Fetch chi tiết từ API nếu chưa có content
      setLoadingDetail(true);
      try {
        const response = await notificationsApi.getDetail(notification.scheduleId);
        if (response.success && response.data) {
          setFullNotification(response.data);
          setValue('title', response.data.title);
          setValue('content', response.data.content || '');
          setValue('noticeMessage', response.data.noticeMessage || null);
          setValue('notificationType', response.data.notificationType || 'event');
          setValue('targetType', response.data.targetType);
          setValue('targetId', response.data.targetId || null);
          setValue('sendingMethod', response.data.sendingMethod);
          setValue('scheduledDate', response.data.scheduledDate || null);
        } else {
          // Fallback to basic info
          setFullNotification(notification);
          setValue('title', notification.title);
          setValue('content', notification.content || '');
          setValue('noticeMessage', notification.noticeMessage || null);
          setValue('notificationType', notification.notificationType || 'event');
          setValue('targetType', notification.targetType);
          setValue('targetId', notification.targetId || null);
          setValue('sendingMethod', notification.sendingMethod);
          setValue('scheduledDate', notification.scheduledDate || null);
        }
      } catch (error) {
        console.error('Error fetching notification detail:', error);
        // Fallback to basic info
        setFullNotification(notification);
        setValue('title', notification.title);
        setValue('content', notification.content || '');
        setValue('noticeMessage', notification.noticeMessage || null);
        setValue('notificationType', notification.notificationType || 'event');
        setValue('targetType', notification.targetType);
        setValue('targetId', notification.targetId || null);
        setValue('sendingMethod', notification.sendingMethod);
        setValue('scheduledDate', notification.scheduledDate || null);
      } finally {
        setLoadingDetail(false);
      }
    };

    loadNotificationData();
  }, [isOpen, notification, setValue]);

  // Load target options based on targetType
  useEffect(() => {
    const loadTargetOptions = async () => {
      if (!needsTargetId) {
        return;
      }

      setLoadingTargets(true);
      try {
        switch (targetType) {
          case 'faculty':
            const facultiesRes = await commonApi.getFaculties();
            if (facultiesRes.success && facultiesRes.data) {
              // Limit to 15 items (search available)
              setFaculties(facultiesRes.data.slice(0, 15));
            }
            break;
          case 'department':
            const departmentsRes = await commonApi.getDepartments();
            if (departmentsRes.success && departmentsRes.data) {
              // Limit to 15 items (search available)
              setDepartments(departmentsRes.data.slice(0, 15));
            }
            break;
          case 'class':
            const classesRes = await commonApi.getClasses();
            if (classesRes.success && classesRes.data) {
              // Limit to 15 items (search available)
              setClasses(classesRes.data.slice(0, 15));
            }
            break;
          case 'instructor':
            const instructorsRes = await commonApi.getInstructors();
            if (instructorsRes.success && instructorsRes.data) {
              // Limit to 15 items (search available)
              setInstructors(instructorsRes.data.slice(0, 15));
            }
            break;
          case 'student':
            const studentsRes = await commonApi.getStudents({ 
              pageNumber: 1, 
              pageSize: 15, // Reduced from 100 to 15 (search available)
              searchKeyword: undefined 
            });
            if (studentsRes.success && studentsRes.data) {
              setStudents(studentsRes.data);
            } else {
              toast.error(studentsRes.message || 'Không thể tải danh sách sinh viên');
            }
            break;
        }
      } catch (error) {
        console.error('Error loading target options:', error);
      } finally {
        setLoadingTargets(false);
      }
    };

    if (isOpen && needsTargetId) {
      loadTargetOptions();
    }
  }, [targetType, needsTargetId, isOpen]);

  // Set targetId again after options are loaded to ensure dropdown recognizes the value
  useEffect(() => {
    if (!needsTargetId || loadingTargets || !fullNotification?.targetId) {
      return;
    }

    // Wait a bit for options to be set in state
    const timer = setTimeout(() => {
      const currentTargetId = formValues.targetId;
      const notificationTargetId = fullNotification.targetId;
      
      // Only set if not already set or if it's different
      if (notificationTargetId && currentTargetId !== notificationTargetId) {
        // Verify the targetId exists in the loaded options based on targetType
        let optionExists = false;
        
        switch (targetType) {
          case 'faculty':
            optionExists = faculties.some(f => f.facultyId === notificationTargetId);
            break;
          case 'department':
            optionExists = departments.some(d => d.departmentId === notificationTargetId);
            break;
          case 'class':
            optionExists = classes.some(c => c.classId === notificationTargetId);
            break;
          case 'instructor':
            optionExists = instructors.some(i => 
              (i.instructorId || i.id || i.userId) === notificationTargetId
            );
            break;
          case 'student':
            optionExists = students.some(s => 
              (s.studentId || s.id || s.userId) === notificationTargetId
            );
            break;
        }
        
        if (optionExists) {
          setValue('targetId', notificationTargetId);
        } else {
          console.warn('TargetId not found in options:', {
            targetId: notificationTargetId,
            targetType,
            studentsCount: students.length,
            facultiesCount: faculties.length,
            departmentsCount: departments.length,
            classesCount: classes.length,
            instructorsCount: instructors.length
          });
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [students, faculties, departments, classes, instructors, loadingTargets, needsTargetId, fullNotification, formValues.targetId, targetType, setValue]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset();
      setFaculties([]);
      setDepartments([]);
      setClasses([]);
      setInstructors([]);
      setStudents([]);
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
    if (!notification) return;
    
    setIsSubmitting(true);
    try {
      // Format scheduledDate properly - convert to ISO string or null
      let scheduledDateValue: string | null = null;
      if (data.scheduledDate) {
        try {
          const date = new Date(data.scheduledDate);
          if (!isNaN(date.getTime())) {
            scheduledDateValue = date.toISOString();
          }
        } catch (e) {
          console.error('Error parsing scheduledDate:', e);
        }
      }

      // Validate targetId if required
      if (needsTargetId && !data.targetId) {
        toast.error('Vui lòng chọn đối tượng nhận');
        setIsSubmitting(false);
        return;
      }

      // Prepare payload matching UpdateNotificationDto
      // Note: API should accept camelCase if configured with JsonSerializerOptions.PropertyNameCaseInsensitive
      const payload: any = {
        title: data.title,
        content: data.content,
        noticeMessage: data.noticeMessage || null,
        notificationType: data.notificationType as NotificationType,
        targetType: data.targetType as TargetType,
        targetId: needsTargetId && data.targetId ? data.targetId : null,
        sendingMethod: data.sendingMethod as SendingMethod,
      };

      // Only include scheduledDate if it has a value
      if (scheduledDateValue) {
        payload.scheduledDate = scheduledDateValue;
      }

      const response = await notificationsApi.update(notification.scheduleId, payload);

      // Check both success and isSuccess formats
      const isSuccess = response.success !== undefined ? response.success : response.isSuccess;
      const message = response.message || response.resultMessage;

      if (isSuccess) {
        toast.success(message || 'Cập nhật thông báo thành công!');
        reset();
        onSuccess?.();
        handleClose();
      } else {
        toast.error(message || 'Cập nhật thông báo thất bại');
      }
    } catch (error: unknown) {
      // Handle different error response formats
      let errorMessage = 'Đã xảy ra lỗi khi cập nhật thông báo';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { errors?: Record<string, string | string[]>; message?: string; title?: string; detail?: string; resultMessage?: string } } };
        const errorData = apiError.response?.data;
        
        if (errorData) {
          // Handle ASP.NET Core validation errors (ModelState)
          const errors = errorData.errors;
          if (errors) {
            const errorMessages: string[] = [];
            Object.keys(errors).forEach((field) => {
              const fieldErrors = errors[field];
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((msg: string) => {
                  errorMessages.push(`${field}: ${msg}`);
                });
              } else if (typeof fieldErrors === 'string') {
                errorMessages.push(`${field}: ${fieldErrors}`);
              }
            });
            
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join('\n');
            } else {
              const validationErrors = Object.values(errors)
                .flat()
                .filter((msg): msg is string => typeof msg === 'string');
              if (validationErrors.length > 0) {
                errorMessage = validationErrors.join(', ');
              }
            }
          }
          // Handle standard error message from backend
          else if (errorData.message || errorData.resultMessage) {
            errorMessage = errorData.message || errorData.resultMessage || errorMessage;
          }
          // Handle problem+json format
          else if (errorData.title) {
            errorMessage = errorData.title;
            if (errorData.detail) {
              errorMessage += ': ' + errorData.detail;
            }
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { 
        duration: 6000,
        style: {
          maxWidth: '500px',
          whiteSpace: 'pre-line',
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !notification) return null;

  // Show loading state while fetching detail
  if (loadingDetail) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0053AD] mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin thông báo...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  // Get target options based on targetType
  const getTargetOptions = () => {
    switch (targetType) {
      case 'faculty':
        return faculties.map(f => ({ value: f.facultyId, label: f.facultyName }));
      case 'department':
        return departments.map(d => ({ value: d.departmentId, label: d.departmentName }));
      case 'class':
        return classes.map(c => {
          const parts = [c.className];
          if (c.classCode) {
            parts.unshift(`[${c.classCode}]`);
          }
          if (c.departmentName) {
            parts.push(`- ${c.departmentName}`);
          }
          return { 
            value: c.classId, 
            label: parts.join(' ') 
          };
        });
      case 'instructor':
        return instructors.map(i => ({ 
          value: i.instructorId, 
          label: i.instructorName || i.fullName || i.name || i.instructorCode || i.code || 'Không có tên' 
        }));
      case 'student':
        return students.map(s => {
          const value = s.studentId || s.id || s.userId;
          const name = s.fullName || s.name || 'Không có tên';
          const code = s.studentCode || s.code || s.id || 'N/A';
          return { 
            value, 
            label: `${name} (${code})` 
          };
        });
      default:
        return [];
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
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa thông báo</h2>
              <p className="text-sm text-gray-600 mt-1">Cập nhật thông tin thông báo</p>
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
              {/* Tiêu đề */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: Thông báo chung"
                  {...register('title')}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
              </div>

              {/* Nội dung */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Nhập nội dung thông báo..."
                  {...register('content')}
                  className={errors.content ? 'border-red-500' : ''}
                  rows={5}
                />
                {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
              </div>

              {/* Thông báo ngắn */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Thông báo ngắn <span className="text-gray-500 text-xs">(Tùy chọn)</span>
                </label>
                <Textarea
                  placeholder="Nhập thông báo ngắn (tối đa 1000 ký tự)..."
                  {...register('noticeMessage')}
                  className={errors.noticeMessage ? 'border-red-500' : ''}
                  rows={3}
                  maxLength={1000}
                />
                {errors.noticeMessage && <p className="mt-1 text-xs text-red-500">{errors.noticeMessage.message}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Thông báo ngắn sẽ được hiển thị trong danh sách hoặc preview
                </p>
              </div>

              {/* Loại thông báo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Loại thông báo <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={[...NOTIF_TYPE_OPTIONS]}
                  value={formValues.notificationType || 'event'}
                  placeholder="Chọn loại thông báo"
                  onChange={(value) => setValue('notificationType', value)}
                />
                {errors.notificationType && <p className="mt-1 text-xs text-red-500">{errors.notificationType.message}</p>}
              </div>

              {/* Đối tượng nhận */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Đối tượng nhận <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={[...TARGET_OPTIONS]}
                  value={formValues.targetType || 'all'}
                  placeholder="Chọn đối tượng nhận"
                  onChange={(value) => setValue('targetType', value)}
                />
                {errors.targetType && <p className="mt-1 text-xs text-red-500">{errors.targetType.message}</p>}
              </div>

              {/* Chi tiết đối tượng (nếu cần) */}
              {needsTargetId && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {targetType === 'faculty' && 'Khoa/Viện'}
                    {targetType === 'department' && 'Bộ môn'}
                    {targetType === 'class' && 'Lớp học'}
                    {targetType === 'instructor' && 'Giảng viên'}
                    {targetType === 'student' && 'Sinh viên'}
                    <span className="text-red-500"> *</span>
                  </label>
                  {loadingTargets ? (
                    <div className="text-sm text-gray-500">Đang tải...</div>
                  ) : (
                    <DropdownSearch
                      options={getTargetOptions()}
                      value={formValues.targetId || ''}
                      placeholder={`Chọn ${targetType === 'faculty' ? 'khoa/viện' : targetType === 'department' ? 'bộ môn' : targetType === 'class' ? 'lớp học' : targetType === 'instructor' ? 'giảng viên' : 'sinh viên'}`}
                      searchPlaceholder={`Tìm kiếm ${targetType === 'faculty' ? 'khoa/viện' : targetType === 'department' ? 'bộ môn' : targetType === 'class' ? 'lớp học' : targetType === 'instructor' ? 'giảng viên' : 'sinh viên'}...`}
                      onChange={(value) => setValue('targetId', value)}
                    />
                  )}
                  {errors.targetId && <p className="mt-1 text-xs text-red-500">{errors.targetId.message}</p>}
                </div>
              )}

              {/* Ngày lên lịch */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Ngày lên lịch <span className="text-gray-500 text-xs">(Tùy chọn)</span>
                </label>
                <Input
                  type="datetime-local"
                  value={formValues.scheduledDate 
                    ? (() => {
                        try {
                          const date = new Date(formValues.scheduledDate);
                          if (!isNaN(date.getTime())) {
                            // Convert to local datetime-local format (YYYY-MM-DDTHH:mm)
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            return `${year}-${month}-${day}T${hours}:${minutes}`;
                          }
                        } catch (e) {
                          console.error('Error formatting date:', e);
                        }
                        return '';
                      })()
                    : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      // Convert datetime-local value to ISO string
                      const localDate = new Date(value);
                      if (!isNaN(localDate.getTime())) {
                        setValue('scheduledDate', localDate.toISOString());
                      } else {
                        setValue('scheduledDate', null);
                      }
                    } else {
                      setValue('scheduledDate', null);
                    }
                  }}
                  className={errors.scheduledDate ? 'border-red-500' : ''}
                />
                {errors.scheduledDate && <p className="mt-1 text-xs text-red-500">{errors.scheduledDate.message}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Để trống nếu muốn giữ nguyên ngày hiện tại
                </p>
              </div>

              {/* Phương thức gửi */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phương thức gửi <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={[...SENDING_OPTIONS]}
                  value={formValues.sendingMethod || 'System'}
                  placeholder="Chọn phương thức gửi"
                  onChange={(value) => setValue('sendingMethod', value)}
                />
                {errors.sendingMethod && <p className="mt-1 text-xs text-red-500">{errors.sendingMethod.message}</p>}
                {formValues.sendingMethod && (formValues.sendingMethod === 'Email' || formValues.sendingMethod === 'Both') && (
                  <p className="mt-1 text-xs text-gray-500">
                    Lưu ý: Chỉ gửi đến tài khoản có email đã xác thực
                  </p>
                )}
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

