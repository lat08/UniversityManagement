import { api } from '@/lib/api/client';
import { ExamScheduleResponse } from '../types/types';
import { commonApi } from '@/lib/api';

export async function getSemesters() {
  const response = await commonApi.getSemesters();
  return response.data || [];
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
    throw error;
  }
}

