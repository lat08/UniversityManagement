// Maps to AdminExamScheduleDto from backend
// Backend uses PascalCase properties but JSON serialization uses camelCase
export interface ExamSchedule {
  id: string; // Guid -> string
  subjectCode?: string; // SubjectCode
  subjectName?: string; // SubjectName
  courseClassCode?: string; // CourseClassCode
  courseClassId?: string; // Not in DTO, but may be needed
  examDate: string; // ExamDate: DateOnly -> YYYY-MM-DD string
  examTime?: string; // ExamTime: TimeOnly -> HH:mm string
  roomCode?: string; // RoomCode
  roomName?: string; // RoomName
  roomId?: string; // Not in DTO, but may be needed
  examFormat?: string; // ExamFormat
  status?: string; // Status: 'scheduled' | 'completed' | 'cancelled'
  proctorNames?: string[]; // ProctorNames: List<string?>
  proctorIds?: string[]; // Not in DTO, but may be needed
  durationInMinutes?: number; // Not in list DTO
  notes?: string; // Not in list DTO
  cancellationReason?: string; // Not in list DTO
}

// Maps to AdminExamScheduleDetailDto from backend
export interface ExamScheduleDetail {
  id: string; // Guid -> string
  subjectCode?: string; // SubjectCode
  subjectName?: string; // SubjectName
  courseClassCode?: string; // CourseClassCode
  examDate: string; // ExamDate: DateOnly -> YYYY-MM-DD string
  startTime: string; // StartTime: TimeOnly -> HH:mm:ss string
  durationInMinutes: number; // DurationInMinutes: int
  roomCode?: string; // RoomCode
  roomName?: string; // RoomName
  examFormat?: string; // ExamFormat
  status?: string; // Status
  proctorNames?: string[]; // ProctorNames: List<string?>
  studentCount: number; // StudentCount: int
  notes?: string; // Notes
  cancellationReason?: string; // CancellationReason
  createdAt: string; // CreatedAt: DateTime -> ISO string
  updatedAt?: string; // UpdatedAt: DateTime? -> ISO string
  // Additional fields for compatibility
  courseClassId?: string;
  roomId?: string;
  examTime?: string; // Derived from startTime
  proctorIds?: string[];
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ExamSchedulesResponse {
  success: boolean;
  message: string;
  data: ExamSchedule[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface GetExamSchedulesParams {
  pageNumber?: number;
  pageSize?: number;
  semesterId?: string;
  courseClassId?: string;
  status?: 'ready' | 'published' | 'cancelled';
  searchTerm?: string;
}

export interface CreateExamSchedulePayload {
  courseClassId: string;
  roomId: string;
  examDate: string; // YYYY-MM-DD
  examTime: string; // HH:mm
  durationInMinutes: number;
  examFormat: string;
  proctorIds: string[];
  notes?: string;
}

export interface UpdateExamSchedulePayload {
  roomId?: string;
  examDate?: string; // YYYY-MM-DD
  examTime?: string; // HH:mm
  durationInMinutes?: number;
  examFormat?: string;
  proctorIds?: string[];
  notes?: string;
}

export interface BulkActionDto {
  ids: string[];
}

export interface BulkCancelDto extends BulkActionDto {
  reason: string;
}

export interface BulkActionResultDto {
  successCount: number;
  failureCount: number;
  errorMessages: string[];
}

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'ready', label: 'Sẵn sàng' },
  { value: 'published', label: 'Đã công bố' },
  { value: 'cancelled', label: 'Đã hủy' },
];

// Exam format mapping: Database value -> Display label
export const EXAM_FORMAT_OPTIONS = [
  { value: 'essay', label: 'Tự luận' },
  { value: 'multiple_choice', label: 'Trắc nghiệm' },
  { value: 'oral', label: 'Vấn đáp' },
  { value: 'practical', label: 'Thực hành' },
  { value: 'mixed', label: 'Kết hợp' },
];

// Helper function to get display label from database value
export const getExamFormatLabel = (value: string): string => {
  const option = EXAM_FORMAT_OPTIONS.find(opt => opt.value === value);
  return option?.label || value;
};

// Helper function to get database value from display label (for backward compatibility)
export const getExamFormatValue = (label: string): string => {
  const option = EXAM_FORMAT_OPTIONS.find(opt => opt.label === label);
  return option?.value || label;
};

// Generate exam time options based on FunctionRoomController.cs schedule
// Morning slots: 07:15, 08:10, 09:10, 10:05, 11:00
// Afternoon/Evening slots: 13:30, 14:25, 15:20, 16:15, 17:10, 18:05, 19:00, 19:55
export const EXAM_TIME_OPTIONS = [
  { value: '07:15', label: '07:15 (Sáng - Tiết 1)' },
  { value: '08:10', label: '08:10 (Sáng - Tiết 2)' },
  { value: '09:10', label: '09:10 (Sáng - Tiết 3)' },
  { value: '10:05', label: '10:05 (Sáng - Tiết 4)' },
  { value: '11:00', label: '11:00 (Sáng - Tiết 5)' },
  { value: '13:30', label: '13:30 (Chiều - Tiết 6)' },
  { value: '14:25', label: '14:25 (Chiều - Tiết 7)' },
  { value: '15:20', label: '15:20 (Chiều - Tiết 8)' },
  { value: '16:15', label: '16:15 (Chiều - Tiết 9)' },
  { value: '17:10', label: '17:10 (Chiều - Tiết 10)' },
  { value: '18:05', label: '18:05 (Tối - Tiết 11)' },
  { value: '19:00', label: '19:00 (Tối - Tiết 12)' },
  { value: '19:55', label: '19:55 (Tối - Tiết 13)' },
];

export const getStatusDisplay = (status: string) => {
  const statusLower = status?.toLowerCase() || '';
  const statusMap: Record<string, { label: string; color: string }> = {
    ready: { label: 'Sẵn sàng', color: 'bg-amber-100 text-amber-800 border border-amber-300' },
    published: { label: 'Đã công bố', color: 'bg-emerald-100 text-emerald-800 border border-emerald-300' },
    cancelled: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 border border-rose-300' },
    // Backward compatibility
    scheduled: { label: 'Sẵn sàng', color: 'bg-amber-100 text-amber-800 border border-amber-300' },
    completed: { label: 'Đã công bố', color: 'bg-emerald-100 text-emerald-800 border border-emerald-300' },
  };
  return statusMap[statusLower] || { label: status || 'Không xác định', color: 'bg-slate-100 text-slate-700 border border-slate-300' };
};

// Room type for API responses
export interface Room {
  roomId: string;
  id?: string; // Alternative field name
  roomCode: string;
  code?: string; // Alternative field name
  roomName: string;
  name?: string; // Alternative field name
  capacity?: number;
  roomType?: string;
  roomStatus?: string;
  building?: {
    buildingId: string;
    buildingName: string;
    buildingCode: string;
  };
}

// CourseClass type for API responses
export interface CourseClass {
  courseClassId: string;
  id?: string; // Alternative field name
  courseClassCode: string;
  code?: string; // Alternative field name
  subjectId?: string;
  subjectCode?: string;
  subjectName?: string;
  semesterId?: string;
  semesterName?: string; // Semester name for display
  instructorId?: string;
  instructorName?: string;
}

