import { api } from './client';
import {
  GetAcademicYearsParams,
  GetAcademicYearsResponse,
  GetBuildingsResponse,
  GetCourseClassesBySubjectResponse,
  GetInstructorsResponse,
  GetClassesParams,
  GetClassesResponse,
  GetCourseClassesResponse,
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
      
      const response = await api.get<any>('/v1/admin/students', {
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
        let studentsArray: any[] | null = null;
        
        if (responseData.students?.items && Array.isArray(responseData.students.items)) {
          // Actual structure: data.students.items
          studentsArray = responseData.students.items;
        } else if (responseData.Students?.items && Array.isArray(responseData.Students.items)) {
          // Fallback for capital S
          studentsArray = responseData.Students.items;
        } else if (responseData.Students && Array.isArray(responseData.Students)) {
          // Fallback: direct Students array
          studentsArray = responseData.Students;
        } else if (responseData.students && Array.isArray(responseData.students)) {
          // Fallback: direct students array
          studentsArray = responseData.students;
        } else if (Array.isArray(responseData)) {
          // Fallback: if data is directly an array (for backward compatibility)
          studentsArray = responseData;
        }
        
        if (studentsArray && studentsArray.length > 0) {
          const mappedStudents = studentsArray.map((s: any) => {
            return {
              studentId: s.studentId || s.id || s.userId || s.StudentId,
              studentCode: s.studentCode || s.code || s.StudentCode || s.Code,
              fullName: s.fullName || s.name || s.FullName || s.Name,
              name: s.name || s.fullName || s.Name || s.FullName,
              id: s.studentId || s.id || s.userId || s.StudentId,
              userId: s.userId || s.studentId || s.UserId || s.StudentId,
              className: s.className || s.class?.className || s.ClassName || s.Class?.ClassName || s.ClassCode,
              departmentName: s.departmentName || s.department?.departmentName || s.DepartmentName || s.Department?.DepartmentName,
              facultyName: s.facultyName || s.faculty?.facultyName || s.FacultyName || s.Faculty?.FacultyName,
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
      console.warn('No students found in response:', {
        hasData: !!response.data?.data,
        dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        hasStudents: !!response.data?.data?.students,
        studentsKeys: response.data?.data?.students ? Object.keys(response.data.data.students) : [],
        hasItems: !!response.data?.data?.students?.items,
        itemsCount: response.data?.data?.students?.items?.length || 0,
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
        const err = error as any;
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

