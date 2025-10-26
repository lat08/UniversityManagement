import { api } from '@/lib/api/client';
import { Exam, Semester } from '../types/types';

/**
 * Fetch list of semesters for exam schedule
 */
export async function getSemesters(): Promise<Semester[]> {
  try {
    const response = await api.get('/v1/exam-schedule/semesters');
    return response.data;
  } catch (error) {
    console.error('Error fetching semesters:', error);
    throw error;
  }
}

/**
 * Fetch exam schedule for a specific semester
 * @param semesterId - The ID of the semester
 */
export async function getExamSchedule(semesterId: string): Promise<Exam[]> {
  try {
    const response = await api.get(`/v1/exam-schedule/exams`, {
      params: { semesterId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching exam schedule:', error);
    throw error;
  }
}

/**
 * Export exam schedule as PDF
 * @param semesterId - The ID of the semester
 */
export async function exportExamSchedule(semesterId: string): Promise<Blob> {
  try {
    const response = await api.get(`/v1/exam-schedule/export`, {
      params: { semesterId },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting exam schedule:', error);
    throw error;
  }
}

