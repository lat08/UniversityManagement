import { api } from '@/lib/api/client';
import { ExamScheduleResponse } from '../types/types';

export async function getExamSchedule(semesterId: string): Promise<ExamScheduleResponse[]> {
  const response = await api.get(`/v1/exam-schedules`, {
    params: { SemesterId: semesterId },
  });
  if (response.data.success) {
    return response.data.data;
  }
  return [];
}

