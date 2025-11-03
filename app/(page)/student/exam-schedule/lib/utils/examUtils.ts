import { Exam, ExamScheduleResponse } from '../types/types';

export function sortExamsByStatus(exams: Exam[]): Exam[] {
  const statusPriority: Record<Exam['status'], number> = {
    'Sắp tới': 1,
    'Chưa tới': 2,
    'Đã thi': 3,
  };

  return [...exams].sort((a, b) => {
    return statusPriority[a.status] - statusPriority[b.status];
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

