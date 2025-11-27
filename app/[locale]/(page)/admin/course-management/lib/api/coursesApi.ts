import { api } from '@/lib/api/client';
import { commonApi } from '@/lib/api/common';
import type {
  Course,
  CoursesResponse,
  ApiResponse,
  GetCoursesParams,
  CreateCoursePayload,
  UpdateCoursePayload,
  Subject,
  Instructor,
  Batch,
  Major,
  Specialization,
  FacultyAssignment,
  AssignmentsResponse,
  GetAssignmentsParams,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
  Semester,
  Room,
  ScheduleSuggestion,
} from '../types/types';

/**
 * @api GET /v1/common/faculties
 * @description Lấy danh sách tất cả khoa (ngành)
 * @returns Danh sách khoa
 * @auth Required (Admin)
 */
const getFacultiesFromApi = async (): Promise<Major[]> => {
  const response = await commonApi.getFaculties();
  if (response.success && response.data) {
    return response.data.map((f) => ({
      majorId: f.facultyId,
      majorName: f.facultyName,
      majorCode: f.facultyCode,
    }));
  }
  return [];
};

/**
 * @api GET /v1/common/departments
 * @description Lấy danh sách chuyên ngành (department)
 * @param facultyId - ID khoa (tùy chọn)
 * @returns Danh sách chuyên ngành
 * @auth Required (Admin)
 */
const getDepartmentsFromApi = async (facultyId?: string): Promise<Specialization[]> => {
  const response = await commonApi.getDepartments(
    facultyId ? { facultyId } : undefined
  );
  if (response.success && response.data) {
    return response.data.map((d) => ({
      specializationId: d.departmentId,
      specializationName: d.departmentName,
      specializationCode: d.departmentCode,
    }));
  }
  return [];
};

/**
 * @api GET /v1/common/subjects
 * @description Lấy danh sách môn học
 * @returns Danh sách môn học
 * @auth Required
 */
const getSubjectsFromApi = async (): Promise<Subject[]> => {
  const response = await commonApi.getSubjects();
  if (response.success && response.data) {
    return response.data.map((s) => ({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      subjectCode: s.subjectCode,
    }));
  }
  return [];
};

/**
 * @api GET /v1/common/instructors
 * @description Lấy danh sách giảng viên
 * @param searchString - Từ khóa tìm kiếm (tùy chọn)
 * @returns Danh sách giảng viên
 * @auth Required
 */
const getInstructorsFromApi = async (): Promise<Instructor[]> => {
  const response = await commonApi.getInstructors();
  if (response.success && response.data) {
    return response.data
      .filter((i) => i.fullName || i.instructorName || i.name) // Filter out instructors without a name
      .map((i) => ({
        instructorId: i.instructorId,
        instructorName: i.fullName || i.instructorName || i.name || '',
        instructorCode: i.instructorCode || i.code,
      }));
  }
  return [];
};

/**
 * @api GET /v1/common/classes
 * @description Lấy danh sách lớp (batch/khóa)
 * @param departmentId - ID chuyên ngành (tùy chọn)
 * @param facultyId - ID khoa (tùy chọn)
 * @returns Danh sách lớp
 * @auth Required
 */
const getBatchesFromApi = async (): Promise<Batch[]> => {
  const response = await commonApi.getClasses();
  if (response.success && response.data) {
    return response.data.map((c) => ({
      batchId: c.classId,
      batchName: c.className,
      batchCode: c.classCode,
    }));
  }
  return [];
};

/**
 * Map CourseResponseDto from /v1/courses to FE Course
 */
const mapCourseDtoToCourse = (item: {
  courseId: string;
  courseCode: string;
  courseName: string;
  subjectId?: string;
  subjectName: string;
  subjectCode: string;
  credits?: number;
  semesterId?: string;
  semesterName: string;
  academicYear?: string;
  academicYearId?: string;
  feePerCredit?: number;
  totalFee?: number;
  courseStatus: string;
  totalClasses: number;
  totalStudents: number;
  createdAt: string;
  updatedAt?: string | null;
  courseClasses?: Array<{
    courseClassId: string;
    courseClassCode: string;
    instructorName: string;
    enrolledStudents: number;
    maximumStudents: number;
    room: string;
    startDate: string;
    endDate: string;
    dayOfWeek: number;
    startPeriod: number;
    endPeriod: number;
    courseClassStatus: string;
  }>;
}): Course => {
  const courseClasses =
    item.courseClasses?.map((cc) => ({
      courseClassId: cc.courseClassId,
      courseClassCode: cc.courseClassCode,
      instructorName: cc.instructorName,
      enrolledStudents: cc.enrolledStudents,
      maximumStudents: cc.maximumStudents,
      room: cc.room,
      startDate: cc.startDate,
      endDate: cc.endDate,
      dayOfWeek: cc.dayOfWeek,
      startPeriod: cc.startPeriod,
      endPeriod: cc.endPeriod,
      status: cc.courseClassStatus,
    })) ?? [];

  const maxEnrollment = courseClasses.reduce(
    (sum, cc) => sum + (cc.maximumStudents || 0),
    0,
  );

  return {
    courseId: item.courseId,
    courseCode: item.courseCode || '',
    subjectId: item.subjectId,
    subjectName: item.subjectName || item.courseName,
    subjectCode: item.subjectCode,
    lecturerName: '',
    lecturerId: '',
    enrollment: item.totalStudents,
    maxEnrollment,
    semester: item.semesterName,
    semesterId: item.semesterId,
    academicYear: item.academicYear,
    academicYearId: item.academicYearId,
    feePerCredit: item.feePerCredit,
    totalFee: item.totalFee,
    status: item.courseStatus === 'active' ? 'active' : 'inactive',
    batchId: undefined,
    batchName: undefined,
    majorId: undefined,
    majorName: undefined,
    specializationId: undefined,
    specializationName: undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt || item.createdAt,
    totalClasses: item.totalClasses,
    totalStudents: item.totalStudents,
    courseClasses,
  };
};

/**
 * Map CourseClassListItemDto từ BE sang FacultyAssignment của FE
 */
const mapCourseClassToAssignment = (item: {
  courseClassId: string;
  courseClassCode: string;
  subjectName: string;
  instructorName?: string;
  instructorId?: string;
  instructorAssignedDate?: string;
  note?: string;
  semesterName: string;
}): FacultyAssignment => {
  return {
    assignmentId: item.courseClassId,
    courseId: item.courseClassId,
    courseCode: item.courseClassCode,
    courseName: item.subjectName,
    instructorId: item.instructorId || '',
    instructorName: item.instructorName || '',
    effectiveDate: item.instructorAssignedDate || new Date().toISOString().split('T')[0],
    notes: item.note || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const coursesApi = {
  /**
   * @api GET /v1/course-classes/all
 * (ĐÃ ĐỔI) Sử dụng /v1/courses để lấy danh sách khóa học với danh sách lớp học phần
   * @param params - Tham số filter và pagination
   * @returns Danh sách lớp học phần
   * @auth Required (Admin)
   */
  getCourses: async (params: GetCoursesParams = {}): Promise<ApiResponse<CoursesResponse>> => {
    try {
      const filterParams: Record<string, unknown> = {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        searchTerm: params.searchKeyword || undefined,
        subjectId: params.subjectId || undefined,
        status: params.status || undefined,
        academicYearId: params.academicYearId || undefined,
        // Map FE filters to BE filters: major = faculty, specialization = department
        facultyId: params.majorId || undefined,
        departmentId: params.specializationId || undefined,
      };

      // Remove undefined values
      Object.keys(filterParams).forEach((key) => {
        if (filterParams[key] === undefined) {
          delete filterParams[key];
        }
      });

      const response = await api.get<{
        success: boolean;
        message?: string;
        data: {
          courses: Array<{
            courseId: string;
            courseCode: string;
            courseName: string;
            subjectName: string;
            subjectCode: string;
            semesterName: string;
            academicYear: string;
            feePerCredit: number;
            totalFee: number;
            courseStatus: string;
            totalClasses: number;
            totalStudents: number;
            createdAt: string;
            updatedAt?: string | null;
            courseClasses?: Array<{
              courseClassId: string;
              courseClassCode: string;
              instructorName: string;
              enrolledStudents: number;
              maximumStudents: number;
              room: string;
              startDate: string;
              endDate: string;
              dayOfWeek: number;
              startPeriod: number;
              endPeriod: number;
              courseClassStatus: string;
            }>;
          }>;
          totalRecords: number;
          pageNumber: number;
          pageSize: number;
          totalPages: number;
        };
      }>('/v1/courses', { params: filterParams });

      if (response.data.success && response.data.data) {
        const courses = response.data.data.courses.map(mapCourseDtoToCourse);
        return {
          success: true,
          message: response.data.message || 'Lấy danh sách lớp học thành công',
          data: {
            courses,
            pagination: {
              currentPage: response.data.data.pageNumber,
              pageSize: response.data.data.pageSize,
              totalCount: response.data.data.totalRecords,
              totalPages: response.data.data.totalPages,
            },
          },
        };
      }

      return {
        success: false,
        message: response.data.message || 'Lấy danh sách lớp học thất bại',
        data: {
          courses: [],
          pagination: {
            currentPage: 1,
            pageSize: 20,
            totalCount: 0,
            totalPages: 0,
          },
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi lấy danh sách lớp học';
      return {
        success: false,
        message: errorMessage,
        data: {
          courses: [],
          pagination: {
            currentPage: 1,
            pageSize: 20,
            totalCount: 0,
            totalPages: 0,
          },
        },
      };
    }
  },

  /**
   * @api GET /v1/course-classes/all
   * @description Lấy danh sách phân công giảng viên (lớp học phần đã có giảng viên)
   * @param params - Tham số filter và pagination
   * @returns Danh sách phân công
   * @auth Required (Admin)
   */
  getAssignments: async (
    params: GetAssignmentsParams = {}
  ): Promise<ApiResponse<AssignmentsResponse>> => {
    try {
      const filterParams: Record<string, unknown> = {
        Page: params.pageNumber || 1,
        PageSize: params.pageSize || 10,
        SearchTerm: params.searchKeyword || undefined,
        SubjectId: params.subjectId || undefined,
        InstructorId: params.instructorId || undefined,
        CourseClassStatus: 'active', // Chỉ lấy các lớp đang hoạt động
      };

      // Remove undefined values
      Object.keys(filterParams).forEach((key) => {
        if (filterParams[key] === undefined) {
          delete filterParams[key];
        }
      });

      const response = await api.get<{
        success: boolean;
        message?: string;
        data: {
          items: Array<{
            courseClassId: string;
            courseClassCode: string;
            subjectName: string;
            instructorName?: string;
            instructorId?: string;
            instructorAssignedDate?: string;
            note?: string;
            semesterName: string;
          }>;
          totalCount: number;
          page: number;
          pageSize: number;
          totalPages: number;
        };
      }>('/v1/course-classes/all', { params: filterParams });

      if (response.data.success && response.data.data) {
        // Chỉ lấy các lớp đã có giảng viên
        const assignments = response.data.data.items
          .filter((item) => item.instructorId)
          .map(mapCourseClassToAssignment);

        return {
          success: true,
          message: response.data.message || 'Lấy danh sách phân công thành công',
          data: {
            assignments,
            pagination: {
              currentPage: response.data.data.page,
              pageSize: response.data.data.pageSize,
              totalCount: assignments.length,
              totalPages: Math.ceil(assignments.length / response.data.data.pageSize),
            },
          },
        };
      }

      return {
        success: false,
        message: response.data.message || 'Lấy danh sách phân công thất bại',
        data: {
          assignments: [],
          pagination: {
            currentPage: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
          },
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi lấy danh sách phân công';
      return {
        success: false,
        message: errorMessage,
        data: {
          assignments: [],
          pagination: {
            currentPage: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
          },
        },
      };
    }
  },

  /**
   * @api GET /v1/common/subjects
   * @description Lấy danh sách môn học
   * @returns Danh sách môn học
   * @auth Required
   */
  getSubjects: async (): Promise<ApiResponse<Subject[]>> => {
    try {
      const subjects = await getSubjectsFromApi();
      return {
        success: true,
        message: 'Lấy danh sách môn học thành công',
        data: subjects,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message || 'Đã xảy ra lỗi khi lấy danh sách môn học';
      return {
        success: false,
        message: errorMessage,
        data: [],
      };
    }
  },

  /**
   * @api GET /v1/common/instructors
   * @description Lấy danh sách giảng viên
   * @returns Danh sách giảng viên
   * @auth Required
   */
  getInstructors: async (): Promise<ApiResponse<Instructor[]>> => {
    try {
      const instructors = await getInstructorsFromApi();
      return {
        success: true,
        message: 'Lấy danh sách giảng viên thành công',
        data: instructors,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message || 'Đã xảy ra lỗi khi lấy danh sách giảng viên';
      return {
        success: false,
        message: errorMessage,
        data: [],
      };
    }
  },

  /**
   * @api GET /v1/common/classes
   * @description Lấy danh sách khóa/lớp
   * @returns Danh sách khóa/lớp
   * @auth Required
   */
  getBatches: async (): Promise<ApiResponse<Batch[]>> => {
    try {
      const batches = await getBatchesFromApi();
      return {
        success: true,
        message: 'Lấy danh sách khóa/lớp thành công',
        data: batches,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message || 'Đã xảy ra lỗi khi lấy danh sách khóa/lớp';
      return {
        success: false,
        message: errorMessage,
        data: [],
      };
    }
  },

  /**
   * @api GET /v1/course-classes/schedule-suggestions
   * @description Lấy gợi ý lịch học (phòng + khung giờ) cho một ngày cụ thể
   * @param date - Ngày cần gợi ý (yyyy-MM-dd)
   * @param buildingId - Lọc theo tòa nhà (tùy chọn)
   * @param roomType - Lọc theo loại phòng (tùy chọn)
   * @returns Danh sách gợi ý phòng/khung giờ
   * @auth Required (Admin)
   */
  getScheduleSuggestions: async (params: {
    date: string;
    buildingId?: string;
    roomType?: string;
  }): Promise<ApiResponse<ScheduleSuggestion[]>> => {
    try {
      const response = await api.get<{
        success: boolean;
        message?: string;
        data: {
          suggestions: Array<{
            roomId: string;
            roomName: string;
            roomType: string;
            buildingName: string;
            capacity: number;
            period: 'morning' | 'afternoon' | 'evening';
            startTime: string;
            endTime: string;
            startPeriod: number;
            endPeriod: number;
            isAvailable: boolean;
          }>;
        };
      }>('/v1/course-classes/schedule-suggestions', {
        params: {
          date: params.date,
          buildingId: params.buildingId,
          roomType: params.roomType,
        },
      });

      if (response.data.success && response.data.data) {
        const suggestions: ScheduleSuggestion[] =
          response.data.data.suggestions
            .filter((s) => s.isAvailable)
            .map((s) => ({
              roomId: s.roomId,
              roomName: s.roomName,
              roomType: s.roomType,
              buildingName: s.buildingName,
              capacity: s.capacity,
              period: s.period,
              startTime: s.startTime,
              endTime: s.endTime,
              startPeriod: s.startPeriod,
              endPeriod: s.endPeriod,
            }));

        return {
          success: true,
          message: response.data.message || 'Lấy gợi ý lịch học thành công',
          data: suggestions,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Lấy gợi ý lịch học thất bại',
        data: [],
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi lấy gợi ý lịch học';
      return {
        success: false,
        message: errorMessage,
        data: [],
      };
    }
  },

  /**
   * @api GET /v1/course-classes/{courseClassId}
   * @description Lấy chi tiết lớp học phần (dùng để prefill modal chỉnh sửa)
   */
  getCourseClassDetail: async (courseClassId: string): Promise<
    ApiResponse<{
      courseClassId: string;
      courseClassCode: string;
      subjectName: string;
      instructorName?: string;
      instructorId?: string;
      studentsEnrolled: number;
      maxStudents: number;
      semesterName: string;
      courseClassStatus: string;
      roomId?: string;
      startDate: string;
    }>
  > => {
    try {
      const response = await api.get<{
        success: boolean;
        message?: string;
        data: {
          courseClassId: string;
          courseClassCode: string;
          subjectName: string;
          instructorName?: string;
          instructorId?: string;
          studentsEnrolled: number;
          maxStudents: number;
          semesterName: string;
          courseClassStatus: string;
          roomId?: string;
          startDate: string;
        };
      }>(`/v1/course-classes/${courseClassId}`);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          message: response.data.message || 'Lấy chi tiết lớp học phần thành công',
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Lấy chi tiết lớp học phần thất bại',
        data: {} as any,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi lấy chi tiết lớp học phần';
      return {
        success: false,
        message: errorMessage,
        data: {} as any,
      };
    }
  },

  /**
   * @api GET /v1/common/faculties
   * @description Lấy danh sách ngành (khoa)
   * @returns Danh sách ngành
   * @auth Required (Admin)
   */
  getMajors: async (): Promise<ApiResponse<Major[]>> => {
    try {
      const majors = await getFacultiesFromApi();
      return {
        success: true,
        message: 'Lấy danh sách ngành thành công',
        data: majors,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message || 'Đã xảy ra lỗi khi lấy danh sách ngành';
      return {
        success: false,
        message: errorMessage,
        data: [],
      };
    }
  },

  /**
   * @api GET /v1/common/departments
   * @description Lấy danh sách chuyên ngành
   * @param facultyId - ID ngành (khoa) để lọc chuyên ngành (tùy chọn)
   * @returns Danh sách chuyên ngành
   * @auth Required (Admin)
   */
  getSpecializations: async (facultyId?: string): Promise<ApiResponse<Specialization[]>> => {
    try {
      const specializations = await getDepartmentsFromApi(facultyId);
      return {
        success: true,
        message: 'Lấy danh sách chuyên ngành thành công',
        data: specializations,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi lấy danh sách chuyên ngành';
      return {
        success: false,
        message: errorMessage,
        data: [],
      };
    }
  },

  /**
   * @api GET /v1/common/semesters
   * @description Lấy danh sách học kỳ
   * @returns Danh sách học kỳ
   * @auth Required
   */
  getSemesters: async (): Promise<ApiResponse<Semester[]>> => {
    try {
      const response = await commonApi.getSemesters();
      if (response.success && response.data) {
        return {
          success: true,
          message: 'Lấy danh sách học kỳ thành công',
          data: response.data.map((s) => ({
            semesterId: s.semesterId,
            semesterName: s.semesterName,
            semesterType: s.semesterType,
            startDate: s.startDate,
            endDate: s.endDate,
            status: s.status,
          })),
        };
      }
      return {
        success: false,
        message: 'Lấy danh sách học kỳ thất bại',
        data: [],
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message || 'Đã xảy ra lỗi khi lấy danh sách học kỳ';
      return {
        success: false,
        message: errorMessage,
        data: [],
      };
    }
  },

  /**
   * @api GET /v1/room
   * @description Lấy danh sách phòng học
   * @param status - Trạng thái phòng (tùy chọn, mặc định: active)
   * @returns Danh sách phòng học
   * @auth Required (Admin)
   */
  getRooms: async (status: string = 'active'): Promise<ApiResponse<Room[]>> => {
    try {
      const response = await api.get<{
        success: boolean;
        message?: string;
        data: {
          items: Array<{
            roomId: string;
            roomCode: string;
            roomName: string;
            buildingId?: string;
            buildingName?: string;
            roomType?: string;
            capacity?: number;
            status?: string;
          }>;
          totalCount: number;
        };
      }>('/v1/room', {
        params: {
          pageNumber: 1,
          pageSize: 1000,
          roomStatus: status,
        },
      });

      if (response.data.success && response.data.data) {
        return {
          success: true,
          message: response.data.message || 'Lấy danh sách phòng học thành công',
          data: response.data.data.items.map((r) => ({
            roomId: r.roomId,
            roomCode: r.roomCode,
            roomName: r.roomName,
            buildingId: r.buildingId,
            buildingName: r.buildingName,
            roomType: r.roomType,
            capacity: r.capacity,
            status: r.status,
          })),
        };
      }

      return {
        success: false,
        message: response.data.message || 'Lấy danh sách phòng học thất bại',
        data: [],
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi lấy danh sách phòng học';
      return {
        success: false,
        message: errorMessage,
        data: [],
      };
    }
  },

  /**
   * @api POST /v1/courses và POST /v1/course-classes
   * @description Tạo lớp học phần mới (tạo Course trước, sau đó tạo CourseClass)
   * @param payload - Thông tin lớp học phần
   * @returns Lớp học phần vừa tạo
   * @auth Required (Admin)
   */
  createCourse: async (payload: CreateCoursePayload): Promise<ApiResponse<Course>> => {
    try {
      // Bước 1: Tạo Course trước
      const createCourseResponse = await api.post<{
        success: boolean;
        message?: string;
        data: {
          courseId: string;
          courseCode: string;
        };
      }>('/v1/courses', {
        SubjectId: payload.subjectId,
        SemesterId: payload.semesterId,
        CourseCode: payload.courseCode,
        FeePerCredit: 0,
        CourseStatus: 'active',
      });

      if (!createCourseResponse.data.success || !createCourseResponse.data.data) {
        return {
          success: false,
          message: createCourseResponse.data.message || 'Tạo khóa học thất bại',
          data: {} as Course,
        };
      }

      const courseId = createCourseResponse.data.data.courseId;

      // Bước 2: Tạo CourseClass
      const createCourseClassResponse = await api.post<{
        success: boolean;
        message?: string;
        data: {
          courseClassId: string;
          courseClassCode: string;
        };
      }>('/v1/course-classes', {
        CourseId: courseId,
        RoomId: payload.roomId,
        StartDate: payload.startDate,
        MaxStudents: payload.maxEnrollment,
        PeriodRange: payload.periodRange,
      });

      if (!createCourseClassResponse.data.success || !createCourseClassResponse.data.data) {
        return {
          success: false,
          message: createCourseClassResponse.data.message || 'Tạo lớp học phần thất bại',
          data: {} as Course,
        };
      }

      // Bước 3: Lấy thông tin đầy đủ của CourseClass vừa tạo
      const courseClassId = createCourseClassResponse.data.data.courseClassId;
      const detailResponse = await api.get<{
        success: boolean;
        data: {
          courseClassId: string;
          courseClassCode: string;
          subjectName: string;
          instructorName?: string;
          instructorId?: string;
          studentsEnrolled: number;
          maxStudents: number;
          semesterName: string;
          courseClassStatus: string;
        };
      }>(`/v1/course-classes/${courseClassId}`);

      if (detailResponse.data.success && detailResponse.data.data) {
        const course = mapCourseDtoToCourse({
          courseId: createCourseResponse.data.data.courseId,
          courseCode: createCourseResponse.data.data.courseCode,
          courseName: detailResponse.data.data.subjectName,
          subjectName: detailResponse.data.data.subjectName,
          subjectCode: detailResponse.data.data.courseClassCode,
          semesterName: detailResponse.data.data.semesterName,
          courseStatus: detailResponse.data.data.courseClassStatus,
          totalClasses: 1,
          totalStudents: detailResponse.data.data.studentsEnrolled,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          courseClasses: [
            {
              courseClassId: detailResponse.data.data.courseClassId,
              courseClassCode: detailResponse.data.data.courseClassCode,
              instructorName: detailResponse.data.data.instructorName || '',
              enrolledStudents: detailResponse.data.data.studentsEnrolled,
              maximumStudents: detailResponse.data.data.maxStudents,
              room: '', // not returned here
              startDate: '', // not returned here
              endDate: '', // not returned here
              dayOfWeek: 0,
              startPeriod: 0,
              endPeriod: 0,
              courseClassStatus: detailResponse.data.data.courseClassStatus,
            },
          ],
        });
        return {
          success: true,
          message: 'Tạo lớp học phần thành công',
          data: course,
        };
      }

      return {
        success: false,
        message: 'Tạo lớp học phần thành công nhưng không thể lấy thông tin chi tiết',
        data: {} as Course,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi tạo lớp học';
      return {
        success: false,
        message: errorMessage,
        data: {} as Course,
      };
    }
  },

  /**
   * @api PUT /v1/course-classes/{courseClassId}
   * @description Cập nhật lớp học phần
   * @param payload - Thông tin cập nhật
   * @returns Lớp học phần sau khi cập nhật
   * @auth Required (Admin)
   */
  updateCourse: async (payload: UpdateCoursePayload): Promise<ApiResponse<Course>> => {
    try {
      const response = await api.put<{
        success: boolean;
        message?: string;
        data: {
          courseClassId: string;
          courseClassCode: string;
          maxStudents: number;
          status: string;
        };
      }>(`/v1/course-classes/${payload.courseId}`, {
        RoomId: payload.roomId,
        StartDate: payload.startDate,
        MaxStudents: payload.maxEnrollment,
        PeriodRange: payload.periodRange,
        CourseClassStatus: payload.status,
      });

      if (response.data.success && response.data.data) {
        // Lấy thông tin đầy đủ từ detail API
        const detailResponse = await api.get<{
          success: boolean;
          data: {
            courseClassId: string;
            courseClassCode: string;
            subjectName: string;
            instructorName?: string;
            instructorId?: string;
            studentsEnrolled: number;
            maxStudents: number;
            semesterName: string;
            courseClassStatus: string;
          };
        }>(`/v1/course-classes/${payload.courseId}`);

        if (detailResponse.data.success && detailResponse.data.data) {
          const course = mapCourseDtoToCourse({
            courseId: payload.courseId,
            courseCode: detailResponse.data.data.courseClassCode,
            courseName: detailResponse.data.data.subjectName,
            subjectName: detailResponse.data.data.subjectName,
            subjectCode: detailResponse.data.data.courseClassCode,
            semesterName: detailResponse.data.data.semesterName,
            courseStatus: detailResponse.data.data.courseClassStatus,
            totalClasses: 1,
            totalStudents: detailResponse.data.data.studentsEnrolled,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            courseClasses: [
              {
                courseClassId: detailResponse.data.data.courseClassId,
                courseClassCode: detailResponse.data.data.courseClassCode,
                instructorName: detailResponse.data.data.instructorName || '',
                enrolledStudents: detailResponse.data.data.studentsEnrolled,
                maximumStudents: detailResponse.data.data.maxStudents,
                room: '',
                startDate: '',
                endDate: '',
                dayOfWeek: 0,
                startPeriod: 0,
                endPeriod: 0,
                courseClassStatus: detailResponse.data.data.courseClassStatus,
              },
            ],
          });
          return {
            success: true,
            message: response.data.message || 'Cập nhật lớp học thành công',
            data: course,
          };
        }
      }

      return {
        success: false,
        message: response.data.message || 'Cập nhật lớp học thất bại',
        data: {} as Course,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi cập nhật lớp học';
      return {
        success: false,
        message: errorMessage,
        data: {} as Course,
      };
    }
  },

  /**
   * @api DELETE /v1/courses/{courseId}
   * @description Xóa học phần (khóa học)
   * @param courseId - ID học phần
   * @returns Kết quả xóa
   * @auth Required (Admin)
   */
  deleteCourse: async (courseId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<{
        success: boolean;
        message?: string;
      }>(`/v1/courses/${courseId}`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Xóa học phần thành công',
          data: null,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Xóa học phần thất bại',
        data: null,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi xóa lớp học';
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  /**
   * @api POST /v1/course-classes/{courseClassId}/assign-instructor
   * @description Gán giảng viên cho lớp học phần
   * @param payload - Thông tin gán giảng viên
   * @returns Phân công sau khi tạo
   * @auth Required (Admin)
   */
  createAssignment: async (
    payload: CreateAssignmentPayload
  ): Promise<ApiResponse<FacultyAssignment>> => {
    try {
      const response = await api.post<{
        success: boolean;
        message?: string;
        data: {
          courseClassId: string;
          courseClassCode: string;
          instructorId: string;
          instructorName: string;
        };
      }>(`/v1/course-classes/${payload.courseId}/assign-instructor`, {
        InstructorId: payload.instructorId,
        AssignedDate: payload.effectiveDate,
        Note: payload.notes,
      });

      if (response.data.success && response.data.data) {
        // Lấy thông tin đầy đủ từ detail API
        const detailResponse = await api.get<{
          success: boolean;
          data: {
            courseClassId: string;
            courseClassCode: string;
            subjectName: string;
            instructorName?: string;
            instructorId?: string;
            instructorAssignedDate?: string;
            note?: string;
            semesterName: string;
          };
        }>(`/v1/course-classes/${payload.courseId}`);

        if (detailResponse.data.success && detailResponse.data.data) {
          const assignment = mapCourseClassToAssignment(detailResponse.data.data);
          return {
            success: true,
            message: response.data.message || 'Thêm phân công thành công',
            data: assignment,
          };
        }
      }

      return {
        success: false,
        message: response.data.message || 'Thêm phân công thất bại',
        data: {} as FacultyAssignment,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi thêm phân công';
      return {
        success: false,
        message: errorMessage,
        data: {} as FacultyAssignment,
      };
    }
  },

  /**
   * @api POST /v1/course-classes/{courseClassId}/assign-instructor
   * @description Cập nhật phân công giảng viên
   * @param payload - Thông tin cập nhật
   * @returns Phân công sau khi cập nhật
   * @auth Required (Admin)
   */
  updateAssignment: async (
    payload: UpdateAssignmentPayload
  ): Promise<ApiResponse<FacultyAssignment>> => {
    try {
      // BE không có API update assignment riêng, cần xóa và tạo lại hoặc dùng assign-instructor
      const response = await api.post<{
        success: boolean;
        message?: string;
        data: {
          courseClassId: string;
          courseClassCode: string;
          instructorId: string;
          instructorName: string;
        };
      }>(`/v1/course-classes/${payload.courseId}/assign-instructor`, {
        InstructorId: payload.instructorId,
        AssignedDate: payload.effectiveDate,
        Note: payload.notes,
      });

      if (response.data.success && response.data.data) {
        // Lấy thông tin đầy đủ từ detail API
        const detailResponse = await api.get<{
          success: boolean;
          data: {
            courseClassId: string;
            courseClassCode: string;
            subjectName: string;
            instructorName?: string;
            instructorId?: string;
            instructorAssignedDate?: string;
            note?: string;
            semesterName: string;
          };
        }>(`/v1/course-classes/${payload.courseId}`);

        if (detailResponse.data.success && detailResponse.data.data) {
          const assignment = mapCourseClassToAssignment(detailResponse.data.data);
          return {
            success: true,
            message: response.data.message || 'Cập nhật phân công thành công',
            data: assignment,
          };
        }
      }

      return {
        success: false,
        message: response.data.message || 'Cập nhật phân công thất bại',
        data: {} as FacultyAssignment,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi cập nhật phân công';
      return {
        success: false,
        message: errorMessage,
        data: {} as FacultyAssignment,
      };
    }
  },

  /**
   * @api DELETE /v1/course-classes/{courseClassId}
   * @description Xóa phân công (xóa lớp học phần)
   * @param assignmentId - ID phân công (courseClassId)
   * @returns Kết quả xóa
   * @auth Required (Admin)
   */
  deleteAssignment: async (assignmentId: string): Promise<ApiResponse<null>> => {
    try {
      // Xóa phân công = xóa lớp học phần
      const response = await api.delete<{
        success: boolean;
        message?: string;
      }>(`/v1/course-classes/${assignmentId}`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Xóa phân công thành công',
          data: null,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Xóa phân công thất bại',
        data: null,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Đã xảy ra lỗi khi xóa phân công';
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },
};
