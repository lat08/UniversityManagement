import { api } from '@/lib/api/client';
import { Semester, CourseClass, CourseClassGrades } from '../types/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const gradesApi = {
  // Get all semesters
  getSemesters: async (): Promise<ApiResponse<Semester[]>> => {
    const response = await api.get<ApiResponse<Semester[]>>('/v1/common/semesters');
    return response.data;
  },

  // Get course classes by semester
  getCourseClassesBySemester: async (semesterId: string): Promise<ApiResponse<CourseClass[]>> => {
    const response = await api.get<ApiResponse<CourseClass[]>>(
      `/v1/instructor/course-classes?semesterId=${semesterId}`
    );
    return response.data;
  },

  // Get grades for a specific course class
  getCourseClassGrades: async (courseClassId: string): Promise<ApiResponse<CourseClassGrades>> => {
    const response = await api.get<ApiResponse<CourseClassGrades>>(
      `/v1/instructor/course-classes/${courseClassId}/grades`
    );
    return response.data;
  },
};

