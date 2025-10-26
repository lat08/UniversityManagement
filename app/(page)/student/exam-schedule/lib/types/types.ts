export interface Exam {
  id: string;
  date: string;
  time: string;
  courseCode: string;
  courseName: string;
  room: string;
  examType: string;
  status: 'completed' | 'upcoming' | 'today';
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

export interface Semester {
  semesterId: string;
  semesterName: string;
  startDate: string;
  endDate: string;
}

