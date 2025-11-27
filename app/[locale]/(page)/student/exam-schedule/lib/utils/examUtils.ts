import { Exam, ExamScheduleResponse, ExamStatusVariant } from '../types/types';

const STATUS_PRIORITY: Record<ExamStatusVariant, number> = {
  upcoming: 1,
  pending: 2,
  completed: 3,
  other: 4,
};

export const getExamStatusVariant = (status: string): ExamStatusVariant => {
  const normalized = status?.toLowerCase();
  if (normalized === 'đã thi' || normalized === 'completed') {
    return 'completed';
  }
  if (normalized === 'sắp tới' || normalized === 'upcoming') {
    return 'upcoming';
  }
  if (normalized === 'chưa tới' || normalized === 'pending') {
    return 'pending';
  }
  return 'other';
};

export function sortExamsByStatus(exams: Exam[]): Exam[] {
  return [...exams].sort((a, b) => {
    return STATUS_PRIORITY[getExamStatusVariant(a.status)] - STATUS_PRIORITY[getExamStatusVariant(b.status)];
  });
}

export function transformExamData(data: ExamScheduleResponse[]): Exam[] {
  return data.map((item, index) => ({
    id: `${item.subjectNameCode}-${index}`,
    subjectNameCode: item.subjectNameCode,
    examDate: item.examDate,
    examTimeDuration: item.examTimeDuration,
    roomCode: item.roomCode,
    studentCount: item.studentCount,
    examFormat: item.examFormat,
    status: item.status,
  }));
}

