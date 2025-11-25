'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Dropdown, DropdownSearch, Button, Input, Textarea } from '@/app/components/ui';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { notificationsApi } from '../lib/api/notificationsApi';
import { commonApi } from '@/lib/api/common';
import type { 
  NotificationType, 
  TargetType, 
  SendingMethod,
  CreateNotificationDto,
  TranslateFn
} from '../lib/types/types';
import { 
  buildNotificationTypeOptions,
  buildSendingMethodOptions,
  buildTargetTypeOptions,
  requiresTargetId as requiresTarget 
} from '../lib/types/types';
import type { Faculty, Department, Class, Instructor, Student } from '@/lib/types/common';

interface AddNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// FormData type definition
type FormData = {
  title: string;
  content: string;
  noticeMessage: string | null;
  notificationType: string;
  targetType: string;
  targetId: string | null;
  sendingMethod: string;
  scheduledDate: string | null;
};

export const AddNotificationModal = ({ isOpen, onClose, onSuccess }: AddNotificationModalProps) => {
  const t = useTranslations('admin.modals.addNotification');
  const tCommon = useTranslations('common.actions');
  const tNotif = useTranslations('admin.notificationManagement');
  const translate = tNotif as unknown as TranslateFn;
  const notificationTypeOptions = useMemo(() => buildNotificationTypeOptions(translate), [translate]);
  const targetTypeOptions = useMemo(() => buildTargetTypeOptions(translate), [translate]);
  const sendingMethodOptions = useMemo(() => buildSendingMethodOptions(translate), [translate]);
  
  // Tạo validation schema với translations
  const validationSchema = yup.object({
    title: yup.string().required(t('titleRequired')).min(3, t('titleMin')),
    content: yup.string().required(t('contentRequired')).min(10, t('contentMin')),
    noticeMessage: yup.string().nullable().max(1000, t('noticeMessageMax')),
    notificationType: yup.string().required(t('notificationTypeRequired')).oneOf(['event', 'tuition', 'schedule', 'important']),
    targetType: yup.string().required(t('targetTypeRequired')).oneOf(['all', 'all_students', 'all_instructors', 'faculty', 'department', 'class', 'instructor', 'student']),
    targetId: yup.string().nullable(),
    sendingMethod: yup.string().required(t('sendingMethodRequired')).oneOf(['System', 'Email', 'Both']),
    scheduledDate: yup.string().nullable(),
  });

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
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);

  const formValues = watch();
  const targetType = formValues.targetType as TargetType;
  const needsTargetId = requiresTarget(targetType);

  // Load target options based on targetType
  useEffect(() => {
    const loadTargetOptions = async () => {
      if (!needsTargetId) {
        setValue('targetId', null);
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
              toast.error(studentsRes.message || tNotif('general.studentLoadError'));
            }
            break;
        }
      } catch (error) {
        console.error('Error loading target options:', error);
      } finally {
        setLoadingTargets(false);
      }
    };

    if (isOpen) {
      loadTargetOptions();
    }
  }, [targetType, needsTargetId, isOpen, setValue, tNotif]);

  // Reset targetId when targetType changes
  useEffect(() => {
    if (!needsTargetId) {
      setValue('targetId', null);
    } else {
      setValue('targetId', null);
    }
  }, [targetType, needsTargetId, setValue]);

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

      const payload: CreateNotificationDto = {
        title: data.title,
        content: data.content,
        noticeMessage: data.noticeMessage || null,
        notificationType: data.notificationType as NotificationType,
        targetType: data.targetType as TargetType,
        targetId: needsTargetId && data.targetId ? data.targetId : null,
        sendingMethod: data.sendingMethod as SendingMethod,
        scheduledDate: scheduledDateValue || null,
      };

      // Validate targetId if required
      if (needsTargetId && !data.targetId) {
        toast.error(t('targetIdRequired'));
        setIsSubmitting(false);
        return;
      }

      const response = await notificationsApi.save(payload);

      // Check both success and isSuccess formats
      const isSuccess = response.success !== undefined ? response.success : response.isSuccess;
      const message = response.message || response.resultMessage;

      if (isSuccess) {
        toast.success(message || t('saveSuccess'));
        reset();
        onSuccess?.();
        handleClose();
      } else {
        toast.error(message || t('saveError'));
      }
    } catch (error: unknown) {
      let errorMessage = t('saveError');
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { errors?: Record<string, string | string[]>; message?: string; resultMessage?: string; title?: string; detail?: string } } };
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

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  // Get target options based on targetType
  const getTargetOptions = () => {
    const fallbackName = tCommon('noName');
    const notAvailableLabel = tNotif('general.notAvailable');
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
          value: i.instructorId || i.id || i.userId || '', 
          label: i.instructorName || i.fullName || i.name || i.instructorCode || i.code || fallbackName 
        }));
      case 'student':
        return students.map(s => {
          const value = s.studentId || s.id || s.userId || '';
          const name = s.fullName || s.name || fallbackName;
          const code = s.studentCode || s.code || s.id || notAvailableLabel;
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
              <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('subtitle')}</p>
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
                  {t('titleLabel')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('titlePlaceholder')}
                  {...register('title')}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
              </div>

              {/* Nội dung */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('content')} <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder={t('contentPlaceholder')}
                  {...register('content')}
                  className={errors.content ? 'border-red-500' : ''}
                  rows={5}
                />
                {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
              </div>

              {/* Thông báo ngắn */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('noticeMessage')} <span className="text-gray-500 text-xs">({tCommon('optional')})</span>
                </label>
                <Textarea
                  placeholder={t('noticeMessagePlaceholder')}
                  {...register('noticeMessage')}
                  className={errors.noticeMessage ? 'border-red-500' : ''}
                  rows={3}
                  maxLength={1000}
                />
                {errors.noticeMessage && <p className="mt-1 text-xs text-red-500">{errors.noticeMessage.message}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  {t('noticeMessageHint')}
                </p>
              </div>

              {/* Loại thông báo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('notificationType')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={notificationTypeOptions}
                  value={formValues.notificationType || 'event'}
                  placeholder={tNotif('selectType')}
                  onChange={(value) => setValue('notificationType', value)}
                />
                {errors.notificationType && <p className="mt-1 text-xs text-red-500">{errors.notificationType.message}</p>}
              </div>

              {/* Đối tượng nhận */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('targetType')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={targetTypeOptions}
                  value={formValues.targetType || 'all'}
                  placeholder={t('targetTypePlaceholder')}
                  onChange={(value) => setValue('targetType', value)}
                />
                {errors.targetType && <p className="mt-1 text-xs text-red-500">{errors.targetType.message}</p>}
              </div>

              {/* Chi tiết đối tượng (nếu cần) */}
              {needsTargetId && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {targetType === 'faculty' && tNotif('faculty')}
                    {targetType === 'department' && tNotif('department')}
                    {targetType === 'class' && tNotif('class')}
                    {targetType === 'instructor' && tNotif('instructor')}
                    {targetType === 'student' && tNotif('student')}
                    <span className="text-red-500"> *</span>
                  </label>
                  {loadingTargets ? (
                    <div className="text-sm text-gray-500">{tCommon('loading')}</div>
                  ) : (
                    <DropdownSearch
                      options={getTargetOptions()}
                      value={formValues.targetId || ''}
                      placeholder={
                        targetType === 'faculty' ? tNotif('selectFaculty') :
                        targetType === 'department' ? tNotif('selectDepartment') :
                        targetType === 'class' ? tNotif('selectClass') :
                        targetType === 'instructor' ? tNotif('selectInstructor') :
                        tNotif('selectStudent')
                      }
                      searchPlaceholder={
                        targetType === 'faculty' ? tNotif('searchFaculty') :
                        targetType === 'department' ? tNotif('searchDepartment') :
                        targetType === 'class' ? tNotif('searchClass') :
                        targetType === 'instructor' ? tNotif('searchInstructor') :
                        tNotif('searchStudent')
                      }
                      onChange={(value) => setValue('targetId', value || null)}
                    />
                  )}
                  {errors.targetId && <p className="mt-1 text-xs text-red-500">{errors.targetId.message}</p>}
                </div>
              )}

              {/* Ngày lên lịch */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('scheduledDate')} <span className="text-gray-500 text-xs">({tCommon('optional')})</span>
                </label>
                <Input
                  type="datetime-local"
                  value={formValues.scheduledDate ? new Date(formValues.scheduledDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setValue('scheduledDate', value ? new Date(value).toISOString() : null);
                  }}
                  className={errors.scheduledDate ? 'border-red-500' : ''}
                />
                {errors.scheduledDate && <p className="mt-1 text-xs text-red-500">{errors.scheduledDate.message}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  {t('scheduledDateHint')}
                </p>
              </div>

              {/* Phương thức gửi */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('sendingMethod')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={sendingMethodOptions}
                  value={formValues.sendingMethod || 'System'}
                  placeholder={tNotif('selectMethod')}
                  onChange={(value) => setValue('sendingMethod', value)}
                />
                {errors.sendingMethod && <p className="mt-1 text-xs text-red-500">{errors.sendingMethod.message}</p>}
                {formValues.sendingMethod && (formValues.sendingMethod === 'Email' || formValues.sendingMethod === 'Both') && (
                  <p className="mt-1 text-xs text-gray-500">
                    {t('note')}
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
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

