export interface ExamScheduleResponse {
  subjectNameCode: string;
  examDate: string;
  examTimeDuration: string;
  roomCode: string;
  studentCount: number;
  examFormat: string;
  status: 'Đã thi' | 'Chưa tới' | 'Sắp tới';
}

export interface Exam {
  id: string;
  subjectNameCode: string;
  examDate: string;
  examTimeDuration: string;
  roomCode: string;
  studentCount: number;
  examFormat: string;
  status: 'Đã thi' | 'Chưa tới' | 'Sắp tới';
}

export interface ExamStatCard {
  title: string;
  value: number | string;
  subtitle?: string;
  bgColor: string;
  iconColor: string;
  textColor: string;
  progress?: number;
}

export interface Note {
  id: string;
  content: string;
  completed: boolean;
}


