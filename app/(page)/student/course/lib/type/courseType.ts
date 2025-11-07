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
  onRegisterClick: (courseId: string) => void // Callback cho hành động Đăng ký
}

export interface RegisteredCoursesProps {
  courses: CourseDto[]
  loading: boolean // <-- THÊM: prop loading
  onCancelClick: (courseId: string, courseName: string) => void // Callback cho hành động Hủy
}