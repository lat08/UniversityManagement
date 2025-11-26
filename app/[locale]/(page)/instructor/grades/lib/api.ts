import { api } from '@/lib/api/client';
import type {
  ApiResponse,
  InstructorCourseClassDto,
  CourseClassGradesDto,
  UpdateStudentGradeDto,
  GradeChangeHistoryDto,
  GradeVersionDetailDto,
} from './types';

export const instructorGradesApi = {
  getCourseClasses: async (semesterId?: string): Promise<ApiResponse<InstructorCourseClassDto[]>> => {
    const params = semesterId ? { semesterId } : {};
    const response = await api.get('/v1/instructor/course-classes', { params });
    return response.data;
  },

  getCourseClassGrades: async (
    courseClassId: string,
    type?: 'draft' | 'official',
    classId?: string,
    academicYearId?: string
  ): Promise<ApiResponse<CourseClassGradesDto>> => {
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (classId) params.classId = classId;
    if (academicYearId) params.academicYearId = academicYearId;
    const response = await api.get(`/v1/instructor/course-classes/${courseClassId}/grades`, { params });
    return response.data;
  },

  updateDraftGrade: async (
    courseClassId: string,
    gradeData: UpdateStudentGradeDto
  ): Promise<ApiResponse<boolean>> => {
    const formData = new FormData();
    formData.append('enrollmentId', gradeData.enrollmentId);
    if (gradeData.attendanceGrade !== null) {
      formData.append('attendanceGrade', gradeData.attendanceGrade.toString());
    }
    if (gradeData.midtermGrade !== null) {
      formData.append('midtermGrade', gradeData.midtermGrade.toString());
    }
    if (gradeData.finalGrade !== null) {
      formData.append('finalGrade', gradeData.finalGrade.toString());
    }
    const response = await api.put(
      `/v1/instructor/course-classes/${courseClassId}/grades/draft`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  updateGradeNote: async (
    courseClassId: string,
    enrollmentId: string,
    note: string | null
  ): Promise<ApiResponse<boolean>> => {
    const formData = new FormData();
    // Always send note parameter - empty string to clear, or the actual note value
    formData.append('note', note || '');
    const response = await api.put(
      `/v1/instructor/course-classes/${courseClassId}/grades/draft/${enrollmentId}/note`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  updateDraftGradesBulk: async (
    courseClassId: string,
    grades: UpdateStudentGradeDto[]
  ): Promise<ApiResponse<boolean>> => {
    const response = await api.put(
      `/v1/instructor/course-classes/${courseClassId}/grades/draft/bulk`,
      grades
    );
    return response.data;
  },

  submitForApproval: async (
    courseClassId: string,
    submissionNote?: string
  ): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    if (submissionNote) {
      formData.append('submissionNote', submissionNote);
    }
    const response = await api.post(
      `/v1/instructor/course-classes/${courseClassId}/grades/submit-for-approval`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  getGradeHistory: async (courseClassId: string): Promise<ApiResponse<GradeChangeHistoryDto[]>> => {
    const response = await api.get(`/v1/instructor/course-classes/${courseClassId}/grades/history`);
    return response.data;
  },

  getGradeVersion: async (
    courseClassId: string,
    versionNumber: number
  ): Promise<ApiResponse<GradeVersionDetailDto>> => {
    const response = await api.get(
      `/v1/instructor/course-classes/${courseClassId}/grades/versions/${versionNumber}`
    );
    return response.data;
  },

  exportGrades: async (courseClassId: string, type?: 'draft' | 'official'): Promise<Blob> => {
    const params = type ? { type } : {};
    const response = await api.get(`/v1/instructor/course-classes/${courseClassId}/grades/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};