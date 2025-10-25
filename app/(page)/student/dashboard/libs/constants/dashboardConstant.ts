import {
  StatCardData,
  SubjectGrade,
  LearningStats,
  ClassInfo,
  Event,
} from "../types/types";

// Stat cards data
export const statCards: StatCardData[] = [
  {
    title: "Lịch học trong tuần",
    value: 20,
    unit: "Tiết",
    bgColor: "bg-[var(--info-light)]",
    iconColor: "text-[var(--info)]",
    textColor: "text-[var(--info)]",
  },
  {
    title: "Lịch thi trong tuần",
    value: 2,
    unit: "Môn thi",
    bgColor: "bg-[var(--error-light)]",
    iconColor: "text-[var(--error)]",
    textColor: "text-[var(--error)]",
  },
];

// Academic results data - matching Figma design
export const subjectGrades: SubjectGrade[] = [
  { subject: "Lập trình hướng đối tượng", grade: 8 },
  { subject: "Cấu trúc dữ liệu và giải thuật", grade: 9 },
  { subject: "Cơ sở dữ liệu", grade: 9.5 },
  { subject: "Mạng máy tính", grade: 9 },
  { subject: "Đồ án web", grade: 9.5 },
  { subject: "Lập trình nhúng & IoT", grade: 8.5 },
  { subject: "Cơ sở vật lý", grade: 9 },
];

// Learning statistics
export const learningStats: LearningStats = {
  gpa: 3.45,
  maxGpa: 4.0,
  credits: 45,
  totalCredits: 120,
  classification: "Giỏi",
};

// Current classes
export const currentClasses: ClassInfo[] = [
  {
    id: "CS101",
    name: "Lập trình hướng đối tượng",
    instructor: "Th.S Nguyễn Văn A",
    schedule: "Thứ 2, 7|5 - 11|40",
  },
  {
    id: "CS802",
    name: "Cấu trúc dữ liệu và giải thuật",
    instructor: "PGS.TS. Trần Th B",
    schedule: "Thứ 4, 13:00 - 16:30",
  },
];

// Upcoming events
export const upcomingEvents: Event[] = [
  {
    id: "1",
    title: "Lễ hội Halloween",
    date: "31/10/2025",
    type: "Sự kiện",
  },
  {
    id: "2",
    title: "Cuộc thi Face-Off",
    date: "18/12/2025",
    type: "Cuộc thi",
  },
];

// Semester options for dropdown
export const semesterOptions = [
  { value: "2025-2026-1", label: "Học kỳ 1 - Năm học 2025 - 2026" },
  { value: "2024-2025-2", label: "Học kỳ 2 - Năm học 2024 - 2025" },
  { value: "2024-2025-1", label: "Học kỳ 1 - Năm học 2024 - 2025" },
];
