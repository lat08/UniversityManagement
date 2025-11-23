'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dropdown, DropdownSearch, Button, Input } from '@/app/components/ui';
import { X, Search, UserCheck } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { examSchedulesApi } from '../lib/api/examSchedulesApi';
import { commonApi } from '@/lib/api/common';
import { api } from '@/lib/api/client';
import { EXAM_FORMAT_OPTIONS, EXAM_TIME_OPTIONS } from '../lib/types/types';
import type { ExamScheduleDetail } from '../lib/types/types';

interface EditExamScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  examSchedule: ExamScheduleDetail | null;
}

const validationSchema = yup.object({
  examDate: yup.string().required('Ngày thi là bắt buộc'),
  examTime: yup.string().required('Giờ thi là bắt buộc'),
  durationInMinutes: yup.number().required('Thời gian thi là bắt buộc').min(1, 'Thời gian thi phải lớn hơn 0'),
  roomId: yup.string().required('Phòng thi là bắt buộc'),
  examFormat: yup.string().required('Hình thức thi là bắt buộc'),
  proctorIds: yup.array().of(yup.string()).min(1, 'Phải chọn ít nhất một giám thị'),
  notes: yup.string().optional(),
});

type FormData = InferType<typeof validationSchema>;

export const EditExamScheduleModal = ({
  isOpen,
  onClose,
  onSuccess,
  examSchedule,
}: EditExamScheduleModalProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      examDate: '',
      examTime: '',
      durationInMinutes: 90,
      roomId: '',
      examFormat: '',
      proctorIds: [],
      notes: '',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [selectedProctors, setSelectedProctors] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [proctorSearchQuery, setProctorSearchQuery] = useState('');

  const formValues = watch();

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (examSchedule) {
        loadExamScheduleData();
      }
    }
  }, [isOpen, examSchedule]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      // Load instructors from CommonControllers
      const instructorsRes = await commonApi.getInstructors().catch(() => ({ success: false, data: [] }));

      // Handle instructors response
      if (instructorsRes.success) {
        setInstructors(Array.isArray(instructorsRes.data) ? instructorsRes.data : []);
      } else {
        setInstructors([]);
      }

      // Load rooms from multiple room types: exam, computer_lab, laboratory, swimming_pool
      // API: GET /v1/rooms?roomType={type}&pageNumber=1&pageSize=1000
      const roomTypes = ['exam', 'computer_lab', 'laboratory', 'swimming_pool'];
      const roomPromises = roomTypes.map(roomType =>
        api.get('/v1/rooms', { 
          params: { 
            roomType: roomType, 
            pageNumber: 1, 
            pageSize: 1000 
          } 
        })
        .then((r) => {
          // API returns ApiResponse<RoomListResult>
          // Structure: { success: true, data: { Items: [...], PageNumber, PageSize, TotalCount, TotalPages } }
          if (r.data.success && r.data.data) {
            const roomsData = r.data.data;
            return roomsData.Items || roomsData.items || (Array.isArray(roomsData) ? roomsData : []);
          }
          return [];
        })
        .catch((error) => {
          console.error(`Error loading rooms for type ${roomType}:`, error);
          return [];
        })
      );

      const allRoomsArrays = await Promise.all(roomPromises);
      // Merge all rooms and remove duplicates by roomId
      const allRooms = allRoomsArrays.flat();
      const uniqueRooms = Array.from(
        new Map(allRooms.map((room: any) => [room.roomId || room.id, room])).values()
      );
      setRooms(uniqueRooms);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Không thể tải dữ liệu');
      setRooms([]);
      setInstructors([]);
    } finally {
      setLoadingData(false);
    }
  };

  const loadExamScheduleData = () => {
    if (!examSchedule) return;

    const examDate = examSchedule.examDate ? new Date(examSchedule.examDate).toISOString().split('T')[0] : '';
    const examTime = examSchedule.examTime || examSchedule.startTime?.substring(0, 5) || '';
    const proctorIds = examSchedule.proctorIds || [];

    setValue('examDate', examDate);
    setValue('examTime', examTime);
    setValue('durationInMinutes', examSchedule.durationInMinutes || 90);
    setValue('roomId', examSchedule.roomId || '');
    setValue('examFormat', examSchedule.examFormat || '');
    setValue('notes', examSchedule.notes || '');
    setValue('proctorIds', proctorIds);
    setSelectedProctors(proctorIds);
  };

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset();
      setSelectedProctors([]);
      setProctorSearchQuery('');
      setRooms([]);
      setInstructors([]);
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
    if (!examSchedule) return;

    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!data.roomId) {
        toast.error('Vui lòng chọn phòng thi');
        setIsSubmitting(false);
        return;
      }
      if (!data.examDate) {
        toast.error('Vui lòng chọn ngày thi');
        setIsSubmitting(false);
        return;
      }
      if (!data.examTime) {
        toast.error('Vui lòng chọn giờ thi');
        setIsSubmitting(false);
        return;
      }
      if (!data.proctorIds || data.proctorIds.length === 0) {
        toast.error('Vui lòng chọn ít nhất một giám thị');
        setIsSubmitting(false);
        return;
      }

      // Validate exam date and time - must be in the future
      if (data.examDate && data.examTime) {
        const examDateTime = new Date(`${data.examDate}T${data.examTime}`);
        const now = new Date();
        if (examDateTime <= now) {
          toast.error('Thời gian thi phải ở trong tương lai');
          setIsSubmitting(false);
          return;
        }
      }

      // Validate duration
      if (data.durationInMinutes < 15 || data.durationInMinutes > 300) {
        toast.error('Thời gian thi phải từ 15 đến 300 phút');
        setIsSubmitting(false);
        return;
      }

      // Prepare payload matching UpdateAdminExamScheduleDto
      // Backend expects: Guid? RoomId, DateOnly? ExamDate, TimeOnly? ExamTime, 
      // int? DurationInMinutes, string? ExamFormat, List<Guid>? ProctorIds, string? Notes
      
      // Format examTime to HH:mm:ss for .NET TimeOnly deserialization
      // TimeOnly can parse "HH:mm" or "HH:mm:ss", but "HH:mm:ss" is more reliable
      const examTimeFormatted = data.examTime.includes(':') 
        ? (data.examTime.split(':').length === 2 ? `${data.examTime}:00` : data.examTime)
        : `${data.examTime}:00:00`;
      
      const payload = {
        roomId: data.roomId, // Will be converted to Guid by backend
        examDate: data.examDate, // Format: YYYY-MM-DD (DateOnly)
        examTime: examTimeFormatted, // Format: HH:mm:ss (TimeOnly - .NET requires seconds for reliable parsing)
        durationInMinutes: Number(data.durationInMinutes),
        examFormat: data.examFormat,
        proctorIds: (data.proctorIds || []).filter((id): id is string => !!id), // Will be converted to List<Guid> by backend
        notes: data.notes && data.notes.trim() ? data.notes.trim() : undefined,
      };

      // Debug: Log payload before sending
      console.log('=== Edit Exam Schedule - Payload Debug ===');
      console.log('Exam Schedule ID:', examSchedule.id);
      console.log('Raw form data:', data);
      console.log('Payload to send:', JSON.stringify(payload, null, 2));
      console.log('Payload types:', {
        roomId: typeof payload.roomId,
        examDate: typeof payload.examDate,
        examTime: typeof payload.examTime,
        durationInMinutes: typeof payload.durationInMinutes,
        examFormat: typeof payload.examFormat,
        proctorIds: Array.isArray(payload.proctorIds) ? `Array[${payload.proctorIds.length}]` : typeof payload.proctorIds,
        notes: typeof payload.notes,
      });
      console.log('==========================================');

      const response = await examSchedulesApi.update(examSchedule.id, payload);

      // Debug: Log response
      console.log('=== Edit Exam Schedule - Response ===');
      console.log('Response:', response);
      console.log('=====================================');

      if (response.success) {
        toast.success('Cập nhật lịch thi thành công!');
        reset();
        setSelectedProctors([]);
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || 'Cập nhật lịch thi thất bại');
      }
    } catch (error: any) {
      console.error('Error updating exam schedule:', error);
      
      // Debug: Log full error response
      console.log('=== Edit Exam Schedule - Error Details ===');
      if (error?.response) {
        console.log('Status:', error.response.status);
        console.log('Status Text:', error.response.statusText);
        console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
        if (error.response.data?.errors) {
          console.log('Validation Errors:', JSON.stringify(error.response.data.errors, null, 2));
        }
      }
      console.log('==========================================');
      
      // Handle different error response formats
      let errorMessage = 'Đã xảy ra lỗi khi cập nhật lịch thi';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        // Handle ASP.NET Core validation errors (ModelState)
        if (errorData.errors) {
          console.log('Parsing validation errors:', errorData.errors);
          // errors object structure: { "FieldName": ["Error message 1", "Error message 2"] }
          const errorMessages: string[] = [];
          Object.keys(errorData.errors).forEach((field) => {
            const fieldErrors = errorData.errors[field];
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
            console.log('Formatted error messages:', errorMessages);
          } else {
            // Fallback: try to extract all error messages
            const validationErrors = Object.values(errorData.errors)
              .flat()
              .filter((msg): msg is string => typeof msg === 'string');
            if (validationErrors.length > 0) {
              errorMessage = validationErrors.join(', ');
            }
          }
        }
        // Handle standard error message from backend
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Handle problem+json format
        else if (errorData.title) {
          errorMessage = errorData.title;
          if (errorData.detail) {
            errorMessage += ': ' + errorData.detail;
          }
        }
        // Handle 500 Internal Server Error - show backend message if available
        else if (error.response.status === 500 && errorData.message) {
          errorMessage = errorData.message || 'Lỗi máy chủ. Vui lòng thử lại sau.';
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Show error toast with longer duration for better visibility
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

  if (!isOpen || !examSchedule) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  const roomOptions = Array.isArray(rooms) ? rooms
    .filter((r) => r.roomStatus !== 'deleted' && r.roomStatus !== 'inactive') // Filter available rooms
    .map((r) => ({
      value: r.roomId || r.id,
      label: `${r.roomCode || r.code || ''} - ${r.roomName || r.name || ''}${r.capacity ? ` (${r.capacity} chỗ)` : ''}`.trim(),
    })) : [];

  const instructorOptions = Array.isArray(instructors) ? instructors.map((i) => ({
    value: i.instructorId || i.id || i.userId,
    label: `${i.instructorCode || i.code || ''} - ${i.instructorName || i.fullName || i.name || ''}`.trim(),
  })) : [];

  const handleProctorToggle = (instructorId: string) => {
    const newProctors = selectedProctors.includes(instructorId)
      ? selectedProctors.filter((id) => id !== instructorId)
      : [...selectedProctors, instructorId];
    setSelectedProctors(newProctors);
    setValue('proctorIds', newProctors);
  };

  const handleSelectAllProctors = () => {
    const filtered = getFilteredInstructorOptions();
    const allIds = filtered.map(opt => opt.value);
    const newProctors = filtered.length === allIds.filter(id => selectedProctors.includes(id)).length
      ? selectedProctors.filter(id => !allIds.includes(id)) // Deselect all if all are selected
      : [...new Set([...selectedProctors, ...allIds])]; // Select all
    setSelectedProctors(newProctors);
    setValue('proctorIds', newProctors);
  };

  const getFilteredInstructorOptions = () => {
    if (!proctorSearchQuery.trim()) return instructorOptions;
    const query = proctorSearchQuery.toLowerCase();
    return instructorOptions.filter(opt => 
      opt.label.toLowerCase().includes(query)
    );
  };

  const filteredInstructorOptions = getFilteredInstructorOptions();
  const selectedProctorOptions = instructorOptions.filter(opt => selectedProctors.includes(opt.value));

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Cập nhật lịch thi</h2>
              <p className="text-sm text-gray-600 mt-1">Điền thông tin để cập nhật lịch thi</p>
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
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0053AD]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {/* Tên môn thi - Read only */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tên môn thi</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                    {examSchedule.subjectName}
                  </div>
                </div>

                {/* Lớp - Read only */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Lớp</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                    {examSchedule.courseClassCode}
                  </div>
                </div>

                {/* Ngày thi */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Ngày thi <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    {...register('examDate')}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.examDate ? 'border-red-500' : ''}
                  />
                  {errors.examDate && (
                    <p className="mt-1 text-xs text-red-500">{errors.examDate.message}</p>
                  )}
                </div>

                {/* Giờ thi */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Giờ thi <span className="text-red-500">*</span>
                  </label>
                  <Dropdown
                    options={EXAM_TIME_OPTIONS}
                    value={formValues.examTime || ''}
                    placeholder="Chọn giờ"
                    onChange={(value) => setValue('examTime', value)}
                  />
                  {errors.examTime && (
                    <p className="mt-1 text-xs text-red-500">{errors.examTime.message}</p>
                  )}
                </div>

                {/* Thời gian thi */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Thời gian thi (phút) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    {...register('durationInMinutes', { valueAsNumber: true })}
                    min={1}
                    placeholder="Nhập thời gian thi"
                    className={errors.durationInMinutes ? 'border-red-500' : ''}
                  />
                  {errors.durationInMinutes && (
                    <p className="mt-1 text-xs text-red-500">{errors.durationInMinutes.message}</p>
                  )}
                </div>

                {/* Phòng thi */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Phòng thi <span className="text-red-500">*</span>
                  </label>
                  <DropdownSearch
                    options={roomOptions}
                    value={formValues.roomId || ''}
                    placeholder="Chọn phòng thi"
                    searchPlaceholder="Tìm kiếm phòng thi..."
                    onChange={(value) => setValue('roomId', value)}
                  />
                  {errors.roomId && (
                    <p className="mt-1 text-xs text-red-500">{errors.roomId.message}</p>
                  )}
                </div>

                {/* Hình thức thi */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Hình thức thi <span className="text-red-500">*</span>
                  </label>
                  <Dropdown
                    options={EXAM_FORMAT_OPTIONS}
                    value={formValues.examFormat || ''}
                    placeholder="Chọn hình thức thi"
                    onChange={(value) => setValue('examFormat', value)}
                  />
                  {errors.examFormat && (
                    <p className="mt-1 text-xs text-red-500">{errors.examFormat.message}</p>
                  )}
                </div>

                {/* Giám thị */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Giám thị <span className="text-red-500">*</span>
                    </label>
                    {selectedProctors.length > 0 && (
                      <span className="text-xs text-[#0053AD] font-medium flex items-center gap-1">
                        <UserCheck className="w-4 h-4" />
                        Đã chọn: {selectedProctors.length}
                      </span>
                    )}
                  </div>

                  {/* Selected Proctors Display */}
                  {selectedProctorOptions.length > 0 && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-900">Giám thị đã chọn:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProctors([]);
                            setValue('proctorIds', []);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedProctorOptions.map((option) => (
                          <span
                            key={option.value}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded-md text-xs text-blue-900 list-none"
                            style={{ listStyle: 'none' }}
                          >
                            {option.label}
                            <button
                              type="button"
                              onClick={() => handleProctorToggle(option.value)}
                              className="text-blue-600 hover:text-blue-800 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search and Select All */}
                  {instructorOptions.length > 0 && (
                    <div className="mb-2 space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Tìm kiếm giám thị..."
                          value={proctorSearchQuery}
                          onChange={(e) => setProctorSearchQuery(e.target.value)}
                          className="pl-10 pr-4"
                        />
                      </div>
                      {filteredInstructorOptions.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSelectAllProctors}
                          className="text-xs text-[#0053AD] hover:text-[#003d82] font-medium"
                        >
                          {filteredInstructorOptions.every(opt => selectedProctors.includes(opt.value))
                            ? 'Bỏ chọn tất cả' 
                            : 'Chọn tất cả'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Proctors List */}
                  <div className="border border-gray-300 rounded-md p-3 min-h-[120px] max-h-[250px] overflow-y-auto bg-gray-50">
                    {instructorOptions.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">Đang tải danh sách giám thị...</p>
                    ) : filteredInstructorOptions.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">Không tìm thấy giám thị nào</p>
                    ) : (
                      <div className="space-y-1">
                        {filteredInstructorOptions.map((option) => {
                          const isSelected = selectedProctors.includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className={`flex items-center gap-2 cursor-pointer p-2 rounded transition-colors list-none ${
                                isSelected 
                                  ? 'bg-blue-100 border border-blue-300' 
                                  : 'hover:bg-white border border-transparent'
                              }`}
                              style={{ listStyle: 'none' }}
                            >
                              <div className="relative flex-shrink-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleProctorToggle(option.value)}
                                  className="w-4 h-4 cursor-pointer accent-[#0053AD] appearance-none checked:bg-[#0053AD] checked:border-[#0053AD] border-2 border-gray-300 rounded"
                                  style={{ 
                                    backgroundImage: isSelected ? 'none' : 'none',
                                    listStyle: 'none'
                                  }}
                                />
                              </div>
                              <span className={`text-sm flex-1 ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {errors.proctorIds && (
                    <p className="mt-1 text-xs text-red-500">{errors.proctorIds.message}</p>
                  )}
                </div>

                {/* Ghi chú */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    placeholder="Nhập ghi chú (nếu có)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                  />
                  {errors.notes && (
                    <p className="mt-1 text-xs text-red-500">{errors.notes.message}</p>
                  )}
                </div>

                {/* Trạng thái */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Trạng thái</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                    {examSchedule.status === 'ready' ? 'Sẵn sàng' :
                     examSchedule.status === 'published' ? 'Đã công bố' :
                     examSchedule.status === 'cancelled' ? 'Đã hủy' : 
                     examSchedule.status === 'scheduled' ? 'Sẵn sàng' : // backward compatibility
                     examSchedule.status === 'completed' ? 'Đã công bố' : // backward compatibility
                     examSchedule.status || 'Không xác định'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loadingData}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

