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
    subjectNameCode: 'PHƯƠNG PHÁP SỐ (CT533168)',
    examDate: 'Thứ 4, 02/05/2025',
    examTimeDuration: '8:30–11:00 (150 phút)',
    roomCode: 'DQAT14',
    studentCount: 45,
    examFormat: 'Trắc nghiệm và Tự luận',
    status: 'Đã thi',
  },
  {
    id: '2',
    subjectNameCode: 'TOÁN CAO CẤP (MATH101)',
    examDate: 'Thứ 5, 15/05/2025',
    examTimeDuration: '8:30–11:00 (150 phút)',
    roomCode: 'DQAT15',
    studentCount: 50,
    examFormat: 'Tự luận',
    status: 'Sắp tới',
  },
  {
    id: '3',
    subjectNameCode: 'LẬP TRÌNH C++ (CS101)',
    examDate: 'Thứ 6, 20/05/2025',
    examTimeDuration: '8:30–11:00 (150 phút)',
    roomCode: 'DQAT16',
    studentCount: 40,
    examFormat: 'Thực hành',
    status: 'Chưa tới',
  },
  {
    id: '4',
    subjectNameCode: 'CƠ SỞ DỮ LIỆU (CS102)',
    examDate: 'Thứ 2, 25/05/2025',
    examTimeDuration: '8:30–11:00 (150 phút)',
    roomCode: 'DQAT17',
    studentCount: 35,
    examFormat: 'Trắc nghiệm',
    status: 'Chưa tới',
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

