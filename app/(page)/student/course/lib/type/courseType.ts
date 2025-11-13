// Path: lib/type/courseType.ts

export interface WeeklyScheduleDto {
  dayOfWeek: number;          // Số thứ tự, ví dụ: 2 (thứ 2)
  dayOfWeekName: string;      // Tên thứ, ví dụ: "Thứ 2"
  startPeriod: number;        // Tiết bắt đầu
  endPeriod: number;          // Tiết kết thúc
  roomCode: string;           // Mã phòng, ví dụ: "C09"
  roomName: string;           // Tên phòng, ví dụ: "Phòng học C09"
  timeRange: string;          // Chuỗi tiết học, ví dụ: "Tiết 1-3"
}

export interface CourseDto {
  courseId: string;           // Guid (string trong JS)
  enrollmentId?: string;      // ID enrollment (cho registered courses)
  subjectName: string;
  subjectCode: string;
  credits: number;
  instructorName: string;
  instructorCode: string;
  startDate: string;          // DateTime → string
  endDate: string;            // DateTime → string
  registeredStudents: number; // Số sinh viên đã đăng ký
  maxStudents: number;        // Số sinh viên tối đa
  registrationStatus: string; // ví dụ: "42/45 sinh viên"
  isRegistered: boolean;
  courseStatus: string;
  weeklySchedules: WeeklyScheduleDto[];
  isAvailableForThisStudent: boolean;
  isFull: boolean;
  hasScheduleConflict: boolean;
  unavailabilityReason: string | null;
  isLocked?: boolean;         // Môn đã bị khóa không thể hủy
  isGeneral?: boolean;        // Môn đại cương hay chuyên ngành
  isInStudentCurriculum?: boolean; // Môn trong chương trình đào tạo
}

// Pagination response wrapper
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Interface mới cho CourseCard
export interface CourseCardProps extends CourseDto {
  // onAction handler: có thể nhận ID và Tên môn (cho Hủy), hoặc chỉ ID (cho Đăng ký)
  onAction: (courseId: string, courseName?: string) => void; 
  actionType?: "register" | "cancel"; // Loại hành động để tùy biến hiển thị
}

export interface AvailableCoursesProps {
  // Bỏ courses: CourseDto[] vì component AvailableCourses tự fetch
  onRegisterClick: (courseId: string) => void // Callback cho hành động Đăng ký đơn lẻ
  onBulkRegisterClick?: (courseIds: string[]) => Promise<void> // Callback cho hành động Đăng ký nhiều môn
  isRegistering?: boolean // Trạng thái đang đăng ký đơn lẻ
  isBulkRegistering?: boolean // Trạng thái đang đăng ký nhiều môn
}

export interface RegisteredCoursesProps {
  courses: CourseDto[]
  loading: boolean // <-- THÊM: prop loading
  onCancelClick: (courseId: string, courseName: string) => void // Callback cho hành động Hủy
}

// Types for bulk enrollment result
export interface EnrollmentErrorDto {
  courseId: string;
  errorMessage: string;
}

export interface EnrollmentResultDto {
  enrollmentId: string;
  studentId: string;
  courseId: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  enrollmentDate: string;
  status: string;
}

export interface BulkEnrollmentResult {
  successCount: number;
  failedCount: number;
  successResults: EnrollmentResultDto[];
  failedResults: EnrollmentErrorDto[];
}