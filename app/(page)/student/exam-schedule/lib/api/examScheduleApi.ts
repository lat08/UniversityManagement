import { api } from '@/lib/api/client';
import { ExamScheduleResponse, Semester } from '../types/types';

/**
 * Fetch list of semesters
 */
export async function getSemesters(): Promise<Semester[]> {
  try {
    const response = await api.get('/v1/common/semesters');
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching semesters:', error);
    throw error;
  }
}

/**
 * Fetch exam schedule for a specific semester
 * @param semesterId - The ID of the semester
 */
export async function getExamSchedule(semesterId: string): Promise<ExamScheduleResponse[]> {
  try {
    const response = await api.get(`/v1/exam-schedules`, {
      params: { SemesterId: semesterId },
    });
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching exam schedule:', error);
    throw error;
  }
}

