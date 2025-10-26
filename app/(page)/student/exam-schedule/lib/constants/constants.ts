import { Semester, Exam, Note } from '../types/types';

// Mock semesters data
export const MOCK_SEMESTERS: Semester[] = [
  {
    semesterId: '1',
    semesterName: 'Học kỳ 1 - Năm học 2025 - 2026',
    startDate: '2025-09-01',
    endDate: '2026-01-31',
  },
  {
    semesterId: '2',
    semesterName: 'Học kỳ 2 - Năm học 2024 - 2025',
    startDate: '2025-02-01',
    endDate: '2025-06-30',
  },
  {
    semesterId: '3',
    semesterName: 'Học kỳ 1 - Năm học 2024 - 2025',
    startDate: '2024-09-01',
    endDate: '2025-01-31',
  },
];

// Mock exam data
export const MOCK_EXAMS: Exam[] = [
  {
    id: '1',
    date: 'Thứ 4, 02/05/2025',
    time: '8:30 - 11:00',
    courseCode: 'CT533168',
    courseName: 'PHƯƠNG PHÁP SỐ',
    room: 'Phòng DQAT14',
    examType: 'Trắc nghiệm và Tự luận',
    status: 'completed',
  },
  {
    id: '2',
    date: 'Thứ 4, 02/05/2025',
    time: '8:30 - 11:00',
    courseCode: 'CT533168',
    courseName: 'PHƯƠNG PHÁP SỐ',
    room: 'Phòng DQAT14',
    examType: 'Trắc nghiệm và Tự luận',
    status: 'upcoming',
  },
  {
    id: '3',
    date: 'Thứ 4, 02/05/2025',
    time: '8:30 - 11:00',
    courseCode: 'CT533168',
    courseName: 'PHƯƠNG PHÁP SỐ',
    room: 'Phòng DQAT14',
    examType: 'Trắc nghiệm và Tự luận',
    status: 'upcoming',
  },
  {
    id: '4',
    date: 'Thứ 4, 02/05/2025',
    time: '8:30 - 11:00',
    courseCode: 'CT533168',
    courseName: 'PHƯƠNG PHÁP SỐ',
    room: 'Phòng DQAT14',
    examType: 'Trắc nghiệm và Tự luận',
    status: 'today',
  },
];

// Mock notes data
export const MOCK_NOTES: Note[] = [
  {
    id: '1',
    content: 'Hãy đến phòng thi sớm 15 phút',
    completed: false,
  },
  {
    id: '2',
    content: 'Nhớ mang theo thẻ sinh viên hoặc CCCD khi đi thi',
    completed: false,
  },
];

