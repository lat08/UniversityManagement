import { api } from './client';
import {
  GetAcademicYearsParams,
  GetAcademicYearsResponse,
  GetBuildingsResponse,
  GetCourseClassesBySubjectResponse,
  GetInstructorsResponse,
  GetClassesParams,
  GetClassesResponse,
  GetDepartmentsParams,
  GetDepartmentsResponse,
  GetFacultiesResponse,
  GetInstructorsParams,
  GetSemestersResponse,
  GetSubjectsParams,
  GetSubjectsResponse,
  GetCourseClassesBySubjectParams,
  GetStudentsParams,
  GetStudentsResponse,
  Student,
} from '../types/common';

export const commonApi = {
  getSemesters: async (): Promise<GetSemestersResponse> => {
    const response = await api.get<GetSemestersResponse>('/v1/common/semesters');
    return response.data;
  },

  getSubjects: async (params?: GetSubjectsParams): Promise<GetSubjectsResponse> => {
    const response = await api.get<GetSubjectsResponse>('/v1/common/subjects', {
      params: {
        instructorId: params?.instructorId || undefined,
        semesterId: params?.semesterId || undefined,
      },
    });
    return response.data;
  },

  getFaculties: async (): Promise<GetFacultiesResponse> => {
    const response = await api.get<GetFacultiesResponse>('/v1/common/faculties');
    return response.data;
  },

  getDepartments: async (params?: GetDepartmentsParams): Promise<GetDepartmentsResponse> => {
    const response = await api.get<GetDepartmentsResponse>('/v1/common/departments', {
      params: {
        facultyId: params?.facultyId || undefined,
      },
    });
    return response.data;
  },

  getClasses: async (params?: GetClassesParams): Promise<GetClassesResponse> => {
    const response = await api.get<GetClassesResponse>('/v1/common/classes', {
      params: {
        departmentId: params?.departmentId || undefined,
        facultyId: params?.facultyId || undefined,
        semesterId: params?.semesterId || undefined,
      },
    });
    return response.data;
  },

  getAcademicYears: async (params?: GetAcademicYearsParams): Promise<GetAcademicYearsResponse> => {
    const response = await api.get<GetAcademicYearsResponse>('/v1/common/academic-years', {
      params: {
        count: params?.count || undefined,
      },
    });
    return response.data;
  },

  getBuildings: async (): Promise<GetBuildingsResponse> => {
    const response = await api.get<GetBuildingsResponse>('/v1/common/buildings');
    return response.data;
  },

  getCourseClassesBySubject: async (params?: GetCourseClassesBySubjectParams): Promise<GetCourseClassesBySubjectResponse> => {
    const response = await api.get<GetCourseClassesBySubjectResponse>('/v1/common/course-classes', {
      params: {
        subjectId: params?.subjectId || undefined,
        semesterId: params?.semesterId || undefined,
      },
    });
    return response.data;
  },

  getInstructors: async (params?: GetInstructorsParams): Promise<GetInstructorsResponse> => {
    const response = await api.get<GetInstructorsResponse>('/v1/common/instructors', {
      params: {
        searchString: params?.searchString || undefined,
      },
    });
    return response.data;
  },

  getStudents: async (params?: GetStudentsParams): Promise<GetStudentsResponse> => {
    try {
      // Use searchKeyword if provided, otherwise fall back to searchTerm for backward compatibility
      const searchKeyword = params?.searchKeyword || params?.searchTerm;
      
      interface RawApiResponse {
        success: boolean;
        message?: string;
        data?: {
          students?: {
            items?: unknown[];
          };
          Students?: {
            items?: unknown[];
          } | unknown[];
        } | unknown[];
      }
      
      const response = await api.get<RawApiResponse>('/v1/admin/students', {
        params: {
          searchKeyword: searchKeyword || undefined,
          facultyId: params?.facultyId || undefined,
          departmentId: params?.departmentId || undefined,
          academicYearId: params?.academicYearId || undefined,
          classId: params?.classId || undefined,
          trainingSystemId: params?.trainingSystemId || undefined,
          enrollmentStatus: params?.enrollmentStatus || undefined,
          nearestYearsCount: params?.nearestYearsCount || undefined,
          pageNumber: params?.pageNumber || 1,
          pageSize: params?.pageSize || 100, // Get more results for dropdown
        },
      });
      
      // Transform response to match expected format
      // Response structure: { success: true, data: { students: { items: [...], totalCount: ..., ... }, ... } }
      if (response.data?.success && response.data?.data) {
        const responseData = response.data.data;
        
        // Check for students.items (actual structure from API)
        let studentsArray: unknown[] | null = null;
        
        // Type guard: check if responseData is an object (not an array)
        if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
          const dataObj = responseData as Record<string, unknown>;
          
          if (dataObj.students && typeof dataObj.students === 'object' && !Array.isArray(dataObj.students)) {
            const studentsObj = dataObj.students as Record<string, unknown>;
            if (studentsObj.items && Array.isArray(studentsObj.items)) {
              // Actual structure: data.students.items
              studentsArray = studentsObj.items;
            }
          } else if (dataObj.Students && typeof dataObj.Students === 'object' && !Array.isArray(dataObj.Students)) {
            const StudentsObj = dataObj.Students as Record<string, unknown>;
            if (StudentsObj.items && Array.isArray(StudentsObj.items)) {
              // Fallback for capital S
              studentsArray = StudentsObj.items;
            }
          } else if (dataObj.Students && Array.isArray(dataObj.Students)) {
            // Fallback: direct Students array
            studentsArray = dataObj.Students;
          } else if (dataObj.students && Array.isArray(dataObj.students)) {
            // Fallback: direct students array
            studentsArray = dataObj.students;
          }
        } else if (Array.isArray(responseData)) {
          // Fallback: if data is directly an array (for backward compatibility)
          studentsArray = responseData;
        }
        
        if (studentsArray && studentsArray.length > 0) {
          const mappedStudents = studentsArray.map((s): Student => {
            const student = s as Record<string, unknown>;
            const classObj = student.class as Record<string, unknown> | undefined;
            const departmentObj = student.department as Record<string, unknown> | undefined;
            const facultyObj = student.faculty as Record<string, unknown> | undefined;
            const ClassObj = student.Class as Record<string, unknown> | undefined;
            const DepartmentObj = student.Department as Record<string, unknown> | undefined;
            const FacultyObj = student.Faculty as Record<string, unknown> | undefined;
            
            return {
              studentId: (student.studentId || student.id || student.userId || student.StudentId) as string,
              studentCode: (student.studentCode || student.code || student.StudentCode || student.Code) as string | undefined,
              fullName: (student.fullName || student.name || student.FullName || student.Name) as string | undefined,
              name: (student.name || student.fullName || student.Name || student.FullName) as string | undefined,
              id: (student.studentId || student.id || student.userId || student.StudentId) as string | undefined,
              userId: (student.userId || student.studentId || student.UserId || student.StudentId) as string | undefined,
              className: (student.className || classObj?.className || student.ClassName || ClassObj?.ClassName || student.ClassCode) as string | undefined,
              departmentName: (student.departmentName || departmentObj?.departmentName || student.DepartmentName || DepartmentObj?.DepartmentName) as string | undefined,
              facultyName: (student.facultyName || facultyObj?.facultyName || student.FacultyName || FacultyObj?.FacultyName) as string | undefined,
            };
          });
          
          return {
            success: response.data.success,
            message: response.data.message || 'Lấy danh sách sinh viên thành công',
            data: mappedStudents,
          };
        }
      }
      
      // Log error if we reach here
      const logData = response.data?.data;
      const dataObj = logData && typeof logData === 'object' && !Array.isArray(logData) 
        ? logData as Record<string, unknown>
        : null;
      const studentsObj = dataObj?.students && typeof dataObj.students === 'object' && !Array.isArray(dataObj.students)
        ? dataObj.students as Record<string, unknown>
        : null;
      
      console.warn('No students found in response:', {
        hasData: !!logData,
        dataKeys: dataObj ? Object.keys(dataObj) : [],
        hasStudents: !!dataObj?.students,
        studentsKeys: studentsObj ? Object.keys(studentsObj) : [],
        hasItems: !!studentsObj?.items,
        itemsCount: Array.isArray(studentsObj?.items) ? studentsObj.items.length : 0,
      });
      
      // Fallback: return empty array if structure doesn't match
      return {
        success: false,
        message: 'Không thể lấy danh sách sinh viên - cấu trúc response không đúng',
        data: [],
      };
    } catch (error) {
      console.error('Error fetching students:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        interface ErrorWithResponse {
          response?: {
            data?: unknown;
          };
        }
        const err = error as ErrorWithResponse;
        console.error('Error response:', err.response?.data);
      }
      return {
        success: false,
        message: 'Lỗi khi lấy danh sách sinh viên',
        data: [],
      };
    }
  },
};

