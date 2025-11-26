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
import type { Subject, Instructor, Semester } from '@/lib/types/common';
import type { Room, CourseClass } from '../lib/types/types';

interface AddExamScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  subjectId: yup.string().required('Môn thi là bắt buộc'),
  courseClassId: yup.string().required('Lớp học là bắt buộc'),
  examDate: yup.string().required('Ngày thi là bắt buộc'),
  examTime: yup.string().required('Giờ thi là bắt buộc'),
  durationInMinutes: yup.number().required('Thời gian thi là bắt buộc').min(1, 'Thời gian thi phải lớn hơn 0'),
  roomId: yup.string().required('Phòng thi là bắt buộc'),
  examFormat: yup.string().required('Hình thức thi là bắt buộc'),
  proctorIds: yup.array().of(yup.string()).min(1, 'Phải chọn ít nhất một giám thị'),
  notes: yup.string().optional(),
});

type FormData = InferType<typeof validationSchema>;

export const AddExamScheduleModal = ({ isOpen, onClose, onSuccess }: AddExamScheduleModalProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      subjectId: '',
      courseClassId: '',
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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedProctors, setSelectedProctors] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingCourseClasses, setLoadingCourseClasses] = useState(false);
  const [proctorSearchQuery, setProctorSearchQuery] = useState('');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [currentSemesterId, setCurrentSemesterId] = useState('');
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [hasLoadedSemesterFilter, setHasLoadedSemesterFilter] = useState(false);

  const formValues = watch();
  const selectedSubjectId = formValues.subjectId;

  const determineCurrentSemester = useCallback((items: Semester[]) => {
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    const today = new Date();
    const normalized = items
      .map((semester) => {
        const start = semester.startDate ? new Date(semester.startDate) : null;
        const end = semester.endDate ? new Date(semester.endDate) : null;
        return start && end
          ? { raw: semester, start, end }
          : null;
      })
      .filter((item): item is { raw: Semester; start: Date; end: Date } => item !== null)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const running = normalized.find(
      (semester) => today >= semester.start && today <= semester.end
    );
    if (running) return running.raw;

    const upcoming = normalized.find((semester) => semester.start > today);
    if (upcoming) return upcoming.raw;

    const past = [...normalized].reverse().find((semester) => semester.start <= today);
    if (past) return past.raw;

    return items[0];
  }, []);

  const loadSubjects = useCallback(async (semesterId?: string) => {
    setLoadingSubjects(true);
    try {
      const subjectsRes = await commonApi.getSubjects(
        semesterId ? { semesterId } : undefined
      );
      if (subjectsRes.success) {
        setSubjects(
          Array.isArray(subjectsRes.data) ? subjectsRes.data : []
        );
      } else {
        setSubjects([]);
        toast.error('Không thể tải danh sách môn học');
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      setSubjects([]);
      toast.error('Không thể tải danh sách môn học');
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoadingData(true);
    setHasLoadedSemesterFilter(false);
    setSubjects([]);
    try {
      const [semestersRes, instructorsRes] = await Promise.all([
        commonApi.getSemesters().catch(() => ({ success: false, data: [] })),
        commonApi.getInstructors().catch(() => ({ success: false, data: [] })),
      ]);

      if (semestersRes.success) {
        const semesterList = Array.isArray(semestersRes.data) ? semestersRes.data : [];
        setSemesters(semesterList);
        const defaultSemester = determineCurrentSemester(semesterList);
        setCurrentSemesterId(defaultSemester?.semesterId || '');
        setSelectedSemesterId(defaultSemester?.semesterId || '');
      } else {
        setSemesters([]);
        setCurrentSemesterId('');
        setSelectedSemesterId('');
      }

      if (instructorsRes.success) {
        setInstructors(Array.isArray(instructorsRes.data) ? instructorsRes.data : []);
      } else {
        setInstructors([]);
      }

      const roomTypes = ['exam', 'computer_lab', 'laboratory', 'swimming_pool'];
      const roomPromises = roomTypes.map((roomType) =>
        api
          .get('/v1/room', {
            params: {
              roomType,
              pageNumber: 1,
              pageSize: 1000,
            },
          })
          .then((r) => {
            if (r.data.success && r.data.data) {
              const roomsData = r.data.data;
              return roomsData.Items || roomsData.items || (Array.isArray(roomsData) ? roomsData : []);
            }
            return [];
          })
          .catch((error) => {
            console.error(`Error loading rooms for type ${roomType}:`, error);
            return [];
          }),
      );

      const allRoomsArrays = await Promise.all(roomPromises);
      const allRooms = allRoomsArrays.flat();
      const uniqueRooms = Array.from(
        new Map(allRooms.map((room: Room) => [room.roomId || room.id || '', room])).values(),
      );
      setRooms(uniqueRooms);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Không thể tải dữ liệu');
      setSemesters([]);
      setCurrentSemesterId('');
      setSelectedSemesterId('');
      setInstructors([]);
      setRooms([]);
    } finally {
      setHasLoadedSemesterFilter(true);
      setLoadingData(false);
    }
  }, [determineCurrentSemester]);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, loadInitialData]);

  useEffect(() => {
    if (!isOpen || !hasLoadedSemesterFilter) return;
    loadSubjects(selectedSemesterId || undefined);
  }, [isOpen, hasLoadedSemesterFilter, selectedSemesterId, loadSubjects]);

  useEffect(() => {
    if (!isOpen) return;
    setValue('subjectId', '');
    setValue('courseClassId', '');
    setCourseClasses([]);
  }, [selectedSemesterId, isOpen, setValue]);

  const loadCourseClasses = useCallback(async (subjectId: string, semesterId?: string) => {
    if (!subjectId) {
      setCourseClasses([]);
      return;
    }

    const normalizedSemesterId =
      semesterId && semesterId.trim() && semesterId.trim().length === 36
        ? semesterId.trim()
        : undefined;

    setLoadingCourseClasses(true);
    try {
      const fetchCourseClasses = async (semesterFilter?: string) =>
        commonApi.getCourseClassesBySubject({
          subjectId,
          semesterId: semesterFilter || undefined,
        });

      const response = await fetchCourseClasses(normalizedSemesterId);
      let classes = response.success && Array.isArray(response.data) ? response.data : [];
      let usedFallback = false;

      if (classes.length === 0 && normalizedSemesterId) {
        const fallbackResponse = await fetchCourseClasses(undefined);
        if (fallbackResponse.success) {
          const fallbackClasses = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
          if (fallbackClasses.length > 0) {
            classes = fallbackClasses;
            usedFallback = true;
          }
        }
      }

      setCourseClasses(classes);
      if (classes.length === 0) {
        toast.error('Môn học này chưa có lớp học phần nào', { duration: 3000 });
      } else if (usedFallback) {
        toast((t) => (
          <div className="text-sm text-gray-800">
            Không có lớp học phần trong học kỳ đã chọn. Đang hiển thị tất cả lớp học phần của môn này.
            <button
              type="button"
              className="ml-2 text-[#0053AD] underline"
              onClick={() => toast.dismiss(t.id)}
            >
              Đóng
            </button>
          </div>
        ), { duration: 4500 });
      }
    } catch (error) {
      console.error('Error loading course classes:', error);
      toast.error('Không thể tải danh sách lớp học phần');
      setCourseClasses([]);
    } finally {
      setLoadingCourseClasses(false);
    }
  }, []);

  // Load course classes when subject changes
  useEffect(() => {
    if (selectedSubjectId) {
      loadCourseClasses(selectedSubjectId, selectedSemesterId);
    } else {
      setCourseClasses([]);
    }
  }, [selectedSubjectId, selectedSemesterId, loadCourseClasses]);

  useEffect(() => {
    if (!selectedSubjectId) return;
    const exists = subjects.some(
      (subject) => subject.subjectId === selectedSubjectId
    );
    if (!exists) {
      setValue('subjectId', '');
    }
  }, [subjects, selectedSubjectId, setValue]);


  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset();
      setSelectedProctors([]);
      setProctorSearchQuery('');
      setCourseClasses([]);
      setRooms([]);
      setInstructors([]);
      setSemesters([]);
      setSelectedSemesterId('');
      setCurrentSemesterId('');
      setSubjects([]);
      setHasLoadedSemesterFilter(false);
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
      // Validate required fields
      if (!data.courseClassId) {
        toast.error('Vui lòng chọn lớp học phần');
        setIsSubmitting(false);
        return;
      }
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

      // Prepare payload matching CreateAdminExamScheduleDto
      // Backend expects: Guid CourseClassId, Guid RoomId, DateOnly ExamDate, TimeOnly ExamTime, 
      // int DurationInMinutes, string ExamFormat, List<Guid> ProctorIds, string? Notes
      
      // Format examTime to HH:mm:ss for .NET TimeOnly deserialization
      // TimeOnly can parse "HH:mm" or "HH:mm:ss", but "HH:mm:ss" is more reliable
      const examTimeFormatted = data.examTime.includes(':') 
        ? (data.examTime.split(':').length === 2 ? `${data.examTime}:00` : data.examTime)
        : `${data.examTime}:00:00`;
      
      const payload = {
        courseClassId: data.courseClassId, // Will be converted to Guid by backend
        roomId: data.roomId, // Will be converted to Guid by backend
        examDate: data.examDate, // Format: YYYY-MM-DD (DateOnly)
        examTime: examTimeFormatted, // Format: HH:mm:ss (TimeOnly - .NET requires seconds for reliable parsing)
        durationInMinutes: Number(data.durationInMinutes),
        examFormat: data.examFormat,
        proctorIds: (data.proctorIds || []).filter((id): id is string => !!id), // Will be converted to List<Guid> by backend
        notes: data.notes && data.notes.trim() ? data.notes.trim() : undefined,
      };

      // Debug: Log payload before sending
      console.log('=== Add Exam Schedule - Payload Debug ===');
      console.log('Raw form data:', data);
      console.log('Payload to send:', JSON.stringify(payload, null, 2));
      console.log('Payload types:', {
        courseClassId: typeof payload.courseClassId,
        roomId: typeof payload.roomId,
        examDate: typeof payload.examDate,
        examTime: typeof payload.examTime,
        durationInMinutes: typeof payload.durationInMinutes,
        examFormat: typeof payload.examFormat,
        proctorIds: Array.isArray(payload.proctorIds) ? `Array[${payload.proctorIds.length}]` : typeof payload.proctorIds,
        notes: typeof payload.notes,
      });
      console.log('========================================');

      const response = await examSchedulesApi.create(payload);

      // Debug: Log response
      console.log('=== Add Exam Schedule - Response ===');
      console.log('Response:', response);
      console.log('=====================================');

      if (response.success) {
        toast.success('Thêm lịch thi thành công!');
        reset();
        setSelectedProctors([]);
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || 'Thêm lịch thi thất bại');
      }
    } catch (error: unknown) {
      console.error('Error creating exam schedule:', error);
      
      // Debug: Log full error response
      console.log('=== Add Exam Schedule - Error Details ===');
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; statusText?: string; data?: { errors?: unknown } } };
        if (apiError.response) {
          console.log('Status:', apiError.response.status);
          console.log('Status Text:', apiError.response.statusText);
          console.log('Response Data:', JSON.stringify(apiError.response.data, null, 2));
          if (apiError.response.data?.errors) {
            console.log('Validation Errors:', JSON.stringify(apiError.response.data.errors, null, 2));
          }
        }
      }
      console.log('==========================================');
      
      // Handle different error response formats
      let errorMessage = 'Đã xảy ra lỗi khi thêm lịch thi';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { errors?: Record<string, string | string[]>; message?: string; title?: string; detail?: string } } };
        const errorData = apiError.response?.data;
        
        if (errorData) {
        // Handle ASP.NET Core validation errors (ModelState)
          const errors = errorData.errors;
          if (errors) {
            console.log('Parsing validation errors:', errors);
          // errors object structure: { "FieldName": ["Error message 1", "Error message 2"] }
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
            console.log('Formatted error messages:', errorMessages);
          } else {
            // Fallback: try to extract all error messages
              const validationErrors = Object.values(errors)
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
          else if (apiError.response?.status === 500 && errorData.message) {
          errorMessage = errorData.message || 'Lỗi máy chủ. Vui lòng thử lại sau.';
          }
        }
      } else if (error instanceof Error) {
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

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  const subjectOptions = Array.isArray(subjects) ? subjects.map((s) => ({
    value: s.subjectId,
    label: `${s.subjectCode} - ${s.subjectName}`,
  })) : [];

  const selectedSubject = subjects.find((s) => s.subjectId === formValues.subjectId);
  const selectedCourseClass = courseClasses.find(
    (cc) => (cc.courseClassId || cc.id) === formValues.courseClassId
  );
  const selectedRoom = rooms.find((room) => (room.roomId || room.id) === formValues.roomId);
  const formHighlights = [
    selectedSubject
      ? {
          label: 'Môn thi',
          value: `${selectedSubject.subjectCode} - ${selectedSubject.subjectName}`,
        }
      : null,
    selectedCourseClass
      ? {
          label: 'Lớp học phần',
          value: `${selectedCourseClass.courseClassCode || selectedCourseClass.code || ''}${
            selectedCourseClass.semesterName ? ` • ${selectedCourseClass.semesterName}` : ''
          }`,
        }
      : null,
    selectedRoom
      ? {
          label: 'Phòng thi',
          value: `${selectedRoom.roomCode || selectedRoom.code || ''} - ${
            selectedRoom.roomName || selectedRoom.name || ''
          }`,
        }
      : null,
    formValues.examDate
      ? {
          label: 'Ngày/Giờ',
          value: `${new Date(formValues.examDate).toLocaleDateString('vi-VN')} ${
            formValues.examTime || ''
          }`,
        }
      : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  const semesterOptions = [
    { value: '', label: 'Tất cả học kỳ' },
    ...semesters.map((semester) => ({
      value: semester.semesterId,
      label:
        semester.semesterId === currentSemesterId
          ? `${semester.semesterName} (Hiện tại)`
          : semester.semesterName,
    })),
  ];

  const currentSemester = semesters.find(
    (semester) => semester.semesterId === currentSemesterId
  );
  const isSubjectDropdownDisabled = loadingSubjects || !hasLoadedSemesterFilter;

  const courseClassOptions = Array.isArray(courseClasses) ? courseClasses
    .map((cc) => {
      const id = cc.courseClassId || cc.id;
      if (!id) return null;
    const code = cc.courseClassCode || cc.code || '';
    const semesterName = cc.semesterName || '';
    
    // Format: "Mã lớp - Học kỳ" hoặc chỉ "Mã lớp" nếu không có học kỳ
    const label = semesterName 
      ? `${code} - ${semesterName}`
      : code;
    
    return {
        value: id,
      label: label,
    };
    })
    .filter((opt): opt is { value: string; label: string } => opt !== null) : [];

  const roomOptions = Array.isArray(rooms) ? rooms
    .filter((r) => r.roomStatus !== 'deleted' && r.roomStatus !== 'inactive') // Filter available rooms
    .map((r) => {
      const id = r.roomId || r.id;
      if (!id) return null;
      return {
        value: id,
      label: `${r.roomCode || r.code || ''} - ${r.roomName || r.name || ''}${r.capacity ? ` (${r.capacity} chỗ)` : ''}`.trim(),
      };
    })
    .filter((opt): opt is { value: string; label: string } => opt !== null) : [];

  const instructorOptions = Array.isArray(instructors) ? instructors
    .map((i) => {
      const id = i.instructorId || i.id || i.userId;
      if (!id) return null;
      return {
        value: id,
    label: `${i.instructorCode || i.code || ''} - ${i.instructorName || i.fullName || i.name || ''}`.trim(),
      };
    })
    .filter((opt): opt is { value: string; label: string } => opt !== null) : [];

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
              <h2 className="text-2xl font-bold text-gray-900">Thêm lịch thi mới</h2>
              <p className="text-sm text-gray-600 mt-1">Điền thông tin để tạo lịch thi mới</p>
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
                {formHighlights.length > 0 && (
                  <div className="col-span-2">
                    <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">
                        Tổng quan lựa chọn
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formHighlights.map((item) => (
                          <span
                            key={item.label}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-blue-900 shadow-sm ring-1 ring-blue-100"
                          >
                            <span className="font-semibold text-blue-700">{item.label}:</span>
                            <span className="text-blue-900">{item.value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Bước 1 · Chọn môn & lớp học phần
                  </p>
                  <p className="text-xs text-gray-500">
                    Ưu tiên lọc theo học kỳ để tìm đúng môn, sau đó chọn lớp học phần tương ứng.
                  </p>
                </div>

                {/* Bộ lọc học kỳ */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Học kỳ hiển thị môn học
                  </label>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex-1">
                      <Dropdown
                        options={semesterOptions}
                        value={selectedSemesterId}
                        placeholder="Chọn học kỳ"
                        onChange={(value) => setSelectedSemesterId(value)}
                        disabled={!hasLoadedSemesterFilter}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSemesterId(currentSemesterId || '')}
                        disabled={!currentSemesterId || selectedSemesterId === currentSemesterId}
                        className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
                      >
                        Về học kỳ hiện tại
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSemesterId('')}
                        disabled={selectedSemesterId === ''}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Xem tất cả môn
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {currentSemester
                      ? `Mặc định ưu tiên học kỳ ${currentSemester.semesterName} để tránh chọn nhầm môn ở học kỳ khác.`
                      : 'Bạn có thể chọn học kỳ để thu gọn danh sách môn học.'}
                  </p>
                </div>

                {/* Tên môn thi */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tên môn thi <span className="text-red-500">*</span>
                    {loadingSubjects && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-500">
                        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#0053AD]"></span>
                        Đang tải môn học...
                      </span>
                    )}
                  </label>
                  <DropdownSearch
                    options={subjectOptions}
                    value={formValues.subjectId || ''}
                    placeholder={
                      loadingSubjects
                        ? 'Đang tải môn học...'
                        : subjectOptions.length === 0
                          ? 'Không có môn trong học kỳ này'
                          : 'Chọn môn thi'
                    }
                    searchPlaceholder="Tìm kiếm môn thi..."
                    onChange={(value) => {
                      setValue('subjectId', value);
                      setValue('courseClassId', ''); // Reset course class
                    }}
                    disabled={isSubjectDropdownDisabled || subjectOptions.length === 0}
                  />
                  {!loadingSubjects && hasLoadedSemesterFilter && subjectOptions.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      Không có môn học khả dụng cho học kỳ này. Vui lòng chọn học kỳ khác hoặc kiểm tra dữ liệu.
                    </p>
                  )}
                  {errors.subjectId && (
                    <p className="mt-1 text-xs text-red-500">{errors.subjectId.message}</p>
                  )}
                </div>

                {/* Lớp học phần */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Lớp học phần <span className="text-red-500">*</span>
                  </label>
                  {!selectedSubjectId ? (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm">
                      Vui lòng chọn môn thi trước
                    </div>
                  ) : loadingCourseClasses ? (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-2 text-gray-600 text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0053AD]"></div>
                      Đang tải danh sách lớp học phần...
                    </div>
                  ) : (
                    <>
                      <DropdownSearch
                        options={courseClassOptions}
                        value={formValues.courseClassId || ''}
                        placeholder={courseClassOptions.length === 0 ? "Không có lớp học phần" : "Chọn lớp học phần"}
                        searchPlaceholder="Tìm kiếm lớp học phần..."
                        onChange={(value) => setValue('courseClassId', value)}
                        disabled={!selectedSubjectId || loadingCourseClasses || courseClassOptions.length === 0}
                      />
                      {courseClassOptions.length === 0 && selectedSubjectId && !loadingCourseClasses && (
                        <p className="mt-1 text-xs text-amber-600">
                          Môn học này chưa có lớp học phần nào. Vui lòng chọn môn học khác.
                        </p>
                      )}
                      {errors.courseClassId && (
                        <p className="mt-1 text-xs text-red-500">{errors.courseClassId.message}</p>
                      )}
                    </>
                  )}
                </div>

                <div className="col-span-2 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Bước 2 · Thiết lập lịch thi
                  </p>
                  <p className="text-xs text-gray-500">
                    Kiểm tra kỹ ngày giờ, thời lượng và phòng thi để tránh trùng lịch.
                  </p>
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
                    onChange={(value) => setValue('roomId', value || '')}
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

                <div className="col-span-2 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Bước 3 · Giám thị coi thi
                  </p>
                  <p className="text-xs text-gray-500">
                    Sử dụng ô tìm kiếm để lọc nhanh theo mã hoặc tên. Có thể chọn tất cả kết quả lọc chỉ với một cú
                    nhấp chuột.
                  </p>
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

                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Bước 4 · Ghi chú bổ sung
                  </p>
                  <p className="text-xs text-gray-500">
                    Ghi lại yêu cầu đặc biệt hoặc lưu ý dành cho giám thị/ban quản trị (không bắt buộc).
                  </p>
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
              {isSubmitting ? 'Đang lưu...' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

