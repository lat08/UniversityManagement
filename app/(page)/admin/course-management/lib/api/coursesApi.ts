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
} from '../types/types';

// Mock data
const mockSubjects: Subject[] = [
  { subjectId: '1', subjectName: 'Lập trình Website', subjectCode: 'LTW' },
  { subjectId: '2', subjectName: 'Cơ sở dữ liệu', subjectCode: 'CSDL' },
  { subjectId: '3', subjectName: 'Mạng máy tính', subjectCode: 'MMT' },
  { subjectId: '4', subjectName: 'Cơ sở lập trình', subjectCode: 'CSLT' },
  { subjectId: '5', subjectName: 'Nhập môn lập trình Python', subjectCode: 'NMLTP' },
  { subjectId: '6', subjectName: 'Toán cao cấp', subjectCode: 'TCC' },
  { subjectId: '7', subjectName: 'Xác suất thống kê', subjectCode: 'XSTK' },
  { subjectId: '8', subjectName: 'Công nghệ phần mềm', subjectCode: 'CNPM' },
];

const mockInstructors: Instructor[] = [
  { instructorId: '1', instructorName: 'Th.S Nguyễn Văn A', instructorCode: 'NVA' },
  { instructorId: '2', instructorName: 'TS. Trần Văn B', instructorCode: 'TVB' },
  { instructorId: '3', instructorName: 'PGS. Trần Công Hùng', instructorCode: 'TCH' },
];

const mockBatches: Batch[] = [
  { batchId: '1', batchName: 'K24', batchCode: 'K24' },
  { batchId: '2', batchName: 'K25', batchCode: 'K25' },
  { batchId: '3', batchName: 'K26', batchCode: 'K26' },
];

const mockMajors: Major[] = [
  { majorId: '1', majorName: 'Khoa học máy tính', majorCode: 'KHMT' },
  { majorId: '2', majorName: 'Kỹ thuật phần mềm', majorCode: 'KTPM' },
];

const mockSpecializations: Specialization[] = [
  { specializationId: '1', specializationName: 'Chuyên ngành 1', specializationCode: 'CN1' },
  { specializationId: '2', specializationName: 'Chuyên ngành 2', specializationCode: 'CN2' },
];

const generateMockCourses = (params: GetCoursesParams): CoursesResponse => {
  const mockCourses: Course[] = [
    {
      courseId: '1',
      courseCode: 'LTW01',
      subjectName: 'Lập trình Website',
      lecturerName: 'Th.S Nguyễn Văn A',
      lecturerId: '1',
      enrollment: 20,
      maxEnrollment: 40,
      semester: 'HKII 2024-2025',
      status: 'active',
      batchId: '1',
      batchName: 'K24',
      majorId: '1',
      majorName: 'Khoa học máy tính',
      specializationId: '1',
      specializationName: 'Chuyên ngành 1',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
    },
    {
      courseId: '2',
      courseCode: 'CSDL01',
      subjectName: 'Cơ sở dữ liệu',
      lecturerName: 'TS. Trần Văn B',
      lecturerId: '2',
      enrollment: 30,
      maxEnrollment: 50,
      semester: 'HKII 2024-2025',
      status: 'active',
      batchId: '1',
      batchName: 'K24',
      majorId: '1',
      majorName: 'Khoa học máy tính',
      specializationId: '1',
      specializationName: 'Chuyên ngành 1',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
    },
    {
      courseId: '3',
      courseCode: 'MMT01',
      subjectName: 'Mạng máy tính',
      lecturerName: 'TS. Trần Văn B',
      lecturerId: '2',
      enrollment: 40,
      maxEnrollment: 50,
      semester: 'HKII 2024-2025',
      status: 'active',
      batchId: '1',
      batchName: 'K24',
      majorId: '1',
      majorName: 'Khoa học máy tính',
      specializationId: '1',
      specializationName: 'Chuyên ngành 1',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
    },
    {
      courseId: '4',
      courseCode: 'CSLT01',
      subjectName: 'Cơ sở lập trình',
      lecturerName: 'TS. Trần Văn B',
      lecturerId: '2',
      enrollment: 22,
      maxEnrollment: 50,
      semester: 'HKI 2024-2025',
      status: 'active',
      batchId: '1',
      batchName: 'K24',
      majorId: '1',
      majorName: 'Khoa học máy tính',
      specializationId: '1',
      specializationName: 'Chuyên ngành 1',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
    },
  ];

  let filteredCourses = mockCourses;

  if (params.searchKeyword) {
    const keyword = params.searchKeyword.toLowerCase();
    filteredCourses = filteredCourses.filter(
      (c) =>
        c.courseCode.toLowerCase().includes(keyword) ||
        c.subjectName.toLowerCase().includes(keyword) ||
        c.lecturerName.toLowerCase().includes(keyword)
    );
  }

  if (params.batchId) {
    filteredCourses = filteredCourses.filter((c) => c.batchId === params.batchId);
  }

  if (params.majorId) {
    filteredCourses = filteredCourses.filter((c) => c.majorId === params.majorId);
  }

  if (params.specializationId) {
    filteredCourses = filteredCourses.filter((c) => c.specializationId === params.specializationId);
  }

  if (params.status) {
    filteredCourses = filteredCourses.filter((c) => c.status === params.status);
  }

  const pageNumber = params.pageNumber || 1;
  const pageSize = params.pageSize || 20;
  const totalCount = filteredCourses.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  return {
    courses: paginatedCourses,
    pagination: {
      currentPage: pageNumber,
      pageSize,
      totalCount,
      totalPages,
    },
  };
};

const generateMockAssignments = (params: GetAssignmentsParams): AssignmentsResponse => {
  const mockAssignments: FacultyAssignment[] = [
    {
      assignmentId: '1',
      courseId: '1',
      courseCode: 'LTW01',
      courseName: 'Lập trình Website',
      instructorId: '1',
      instructorName: 'Th.S Nguyễn Văn A',
      effectiveDate: '2025-12-13',
      notes: 'Phân công ban đầu',
      subjectId: '1',
      subjectName: 'Lập trình Website',
      batchId: '1',
      batchName: 'K24',
      majorId: '1',
      majorName: 'Khoa học máy tính',
      specializationId: '1',
      specializationName: 'Chuyên ngành 1',
      createdAt: '2024-12-13T08:00:00Z',
      updatedAt: '2024-12-13T08:00:00Z',
    },
    {
      assignmentId: '2',
      courseId: '2',
      courseCode: 'CSDL01',
      courseName: 'Cơ sở dữ liệu',
      instructorId: '2',
      instructorName: 'TS. Trần Văn B',
      effectiveDate: '2025-12-10',
      notes: 'Phân công bả',
      subjectId: '2',
      subjectName: 'Cơ sở dữ liệu',
      batchId: '1',
      batchName: 'K24',
      majorId: '1',
      majorName: 'Khoa học máy tính',
      specializationId: '1',
      specializationName: 'Chuyên ngành 1',
      createdAt: '2024-12-10T08:00:00Z',
      updatedAt: '2024-12-10T08:00:00Z',
    },
    {
      assignmentId: '3',
      courseId: '3',
      courseCode: 'MMT01',
      courseName: 'Mạng máy tính',
      instructorId: '2',
      instructorName: 'TS. Trần Văn B',
      effectiveDate: '2025-11-26',
      notes: 'Phân công bả',
      subjectId: '3',
      subjectName: 'Mạng máy tính',
      batchId: '1',
      batchName: 'K24',
      majorId: '1',
      majorName: 'Khoa học máy tính',
      specializationId: '1',
      specializationName: 'Chuyên ngành 1',
      createdAt: '2024-11-26T08:00:00Z',
      updatedAt: '2024-11-26T08:00:00Z',
    },
    {
      assignmentId: '4',
      courseId: '4',
      courseCode: 'CSLT01',
      courseName: 'Cơ sở lập trình',
      instructorId: '2',
      instructorName: 'TS. Trần Văn B',
      effectiveDate: '2025-11-11',
      notes: 'Phân công ban đầu',
      subjectId: '4',
      subjectName: 'Cơ sở lập trình',
      batchId: '1',
      batchName: 'K24',
      majorId: '1',
      majorName: 'Khoa học máy tính',
      specializationId: '1',
      specializationName: 'Chuyên ngành 1',
      createdAt: '2024-11-11T08:00:00Z',
      updatedAt: '2024-11-11T08:00:00Z',
    },
  ];

  let filteredAssignments = mockAssignments;

  if (params.searchKeyword) {
    const keyword = params.searchKeyword.toLowerCase();
    filteredAssignments = filteredAssignments.filter(
      (a) =>
        a.courseCode.toLowerCase().includes(keyword) ||
        a.courseName.toLowerCase().includes(keyword) ||
        a.instructorName.toLowerCase().includes(keyword)
    );
  }

  if (params.subjectId) {
    filteredAssignments = filteredAssignments.filter((a) => a.subjectId === params.subjectId);
  }

  if (params.instructorId) {
    filteredAssignments = filteredAssignments.filter((a) => a.instructorId === params.instructorId);
  }

  if (params.batchId) {
    filteredAssignments = filteredAssignments.filter((a) => a.batchId === params.batchId);
  }

  if (params.majorId) {
    filteredAssignments = filteredAssignments.filter((a) => a.majorId === params.majorId);
  }

  if (params.specializationId) {
    filteredAssignments = filteredAssignments.filter((a) => a.specializationId === params.specializationId);
  }

  const pageNumber = params.pageNumber || 1;
  const pageSize = params.pageSize || 10;
  const totalCount = filteredAssignments.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  return {
    assignments: paginatedAssignments,
    pagination: {
      currentPage: pageNumber,
      pageSize,
      totalCount,
      totalPages,
    },
  };
};

export const coursesApi = {
  getCourses: async (params: GetCoursesParams = {}): Promise<ApiResponse<CoursesResponse>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const data = generateMockCourses(params);

    return {
      success: true,
      message: 'Lấy danh sách lớp học thành công',
      data,
    };
  },

  getAssignments: async (params: GetAssignmentsParams = {}): Promise<ApiResponse<AssignmentsResponse>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const data = generateMockAssignments(params);

    return {
      success: true,
      message: 'Lấy danh sách phân công thành công',
      data,
    };
  },

  getSubjects: async (): Promise<ApiResponse<Subject[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Lấy danh sách môn học thành công',
      data: mockSubjects,
    };
  },

  getInstructors: async (): Promise<ApiResponse<Instructor[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Lấy danh sách giảng viên thành công',
      data: mockInstructors,
    };
  },

  getBatches: async (): Promise<ApiResponse<Batch[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Lấy danh sách khóa/lớp thành công',
      data: mockBatches,
    };
  },

  getMajors: async (): Promise<ApiResponse<Major[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Lấy danh sách ngành thành công',
      data: mockMajors,
    };
  },

  getSpecializations: async (): Promise<ApiResponse<Specialization[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Lấy danh sách chuyên ngành thành công',
      data: mockSpecializations,
    };
  },

  createCourse: async (payload: CreateCoursePayload): Promise<ApiResponse<Course>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const subject = mockSubjects.find((s) => s.subjectId === payload.subjectId);
    const newCourse: Course = {
      courseId: Math.random().toString(36).substr(2, 9),
      courseCode: payload.courseCode,
      subjectName: subject?.subjectName || '',
      lecturerName: '',
      lecturerId: '',
      enrollment: 0,
      maxEnrollment: payload.maxEnrollment,
      semester: '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Thêm lớp học thành công',
      data: newCourse,
    };
  },

  updateCourse: async (payload: UpdateCoursePayload): Promise<ApiResponse<Course>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockCourseList = generateMockCourses({}).courses;
    const existingCourse = mockCourseList.find((c) => c.courseId === payload.courseId);
    const subject = mockSubjects.find((s) => s.subjectId === payload.subjectId);
    
    const updatedCourse: Course = {
      courseId: payload.courseId,
      courseCode: existingCourse?.courseCode || '',
      subjectName: subject?.subjectName || '',
      lecturerName: existingCourse?.lecturerName || '',
      lecturerId: existingCourse?.lecturerId || '',
      enrollment: existingCourse?.enrollment || 0,
      maxEnrollment: payload.maxEnrollment,
      semester: existingCourse?.semester || '',
      status: payload.status,
      batchId: existingCourse?.batchId,
      batchName: existingCourse?.batchName,
      majorId: existingCourse?.majorId,
      majorName: existingCourse?.majorName,
      specializationId: existingCourse?.specializationId,
      specializationName: existingCourse?.specializationName,
      createdAt: existingCourse?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Cập nhật lớp học thành công',
      data: updatedCourse,
    };
  },

  deleteCourse: async (courseId: string): Promise<ApiResponse<null>> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    void courseId;

    return {
      success: true,
      message: 'Xóa lớp học thành công',
      data: null,
    };
  },

  createAssignment: async (payload: CreateAssignmentPayload): Promise<ApiResponse<FacultyAssignment>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const course = generateMockCourses({}).courses.find((c) => c.courseId === payload.courseId);

    const newAssignment: FacultyAssignment = {
      assignmentId: Math.random().toString(36).substr(2, 9),
      courseId: payload.courseId,
      courseCode: course?.courseCode || '',
      courseName: course?.subjectName || '',
      instructorId: payload.instructorId,
      instructorName: mockInstructors.find((i) => i.instructorId === payload.instructorId)?.instructorName || '',
      effectiveDate: payload.effectiveDate,
      notes: payload.notes,
      subjectId: course?.courseId,
      subjectName: course?.subjectName,
      batchId: course?.batchId,
      batchName: course?.batchName,
      majorId: course?.majorId,
      majorName: course?.majorName,
      specializationId: course?.specializationId,
      specializationName: course?.specializationName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Thêm phân công thành công',
      data: newAssignment,
    };
  },

  updateAssignment: async (payload: UpdateAssignmentPayload): Promise<ApiResponse<FacultyAssignment>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const course = generateMockCourses({}).courses.find((c) => c.courseId === payload.courseId);

    const updatedAssignment: FacultyAssignment = {
      assignmentId: payload.assignmentId,
      courseId: payload.courseId,
      courseCode: course?.courseCode || '',
      courseName: course?.subjectName || '',
      instructorId: payload.instructorId,
      instructorName: mockInstructors.find((i) => i.instructorId === payload.instructorId)?.instructorName || '',
      effectiveDate: payload.effectiveDate,
      notes: payload.notes,
      subjectId: course?.courseId,
      subjectName: course?.subjectName,
      batchId: course?.batchId,
      batchName: course?.batchName,
      majorId: course?.majorId,
      majorName: course?.majorName,
      specializationId: course?.specializationId,
      specializationName: course?.specializationName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Cập nhật phân công thành công',
      data: updatedAssignment,
    };
  },

  deleteAssignment: async (assignmentId: string): Promise<ApiResponse<null>> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    void assignmentId;

    return {
      success: true,
      message: 'Xóa phân công thành công',
      data: null,
    };
  },
};
