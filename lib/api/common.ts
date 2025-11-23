import { api } from './client';
import {
  GetAcademicYearsParams,
  GetAcademicYearsResponse,
  GetBuildingsResponse,
  GetCourseClassesBySubjectResponse,
  GetInstructorsResponse,
  GetClassesParams,
  GetClassesResponse,
  GetCourseClassesParams,
  GetCourseClassesResponse,
  GetDepartmentsParams,
  GetDepartmentsResponse,
  GetFacultiesResponse,
  GetInstructorsParams,
  GetInstructorsResponse,
  GetSemestersResponse,
  GetSubjectsParams,
  GetCourseClassesBySubjectParams,
  GetInstructorsParams,
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
};

