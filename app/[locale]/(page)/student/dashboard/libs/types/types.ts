import type { LucideIcon } from "lucide-react";

export interface StatCardData {
  title: string;
  value: number;
  unit: string;
  bgColor: string;
  iconColor: string;
  textColor: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export interface Kpi {
  gpa: number;
  completedCredits: number;
  totalCredits: number;
  ranking: string;
}

export interface KpiData {
  Kpi?: Kpi;
}

export interface Semester {
  semesterId: string;
  semesterName: string;
}

export interface Subject {
  courseId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  instructorName: string;
  roomName: string;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  semesterId: string;
}

export interface EventNotification {
  notificationId: string;
  title: string;
  content: string;
  createdAt: string;
  type: string;
  isRead: boolean;
  eventDate: string;
  location: string;
}

export interface DashboardData {
  kpi: Kpi;
  totalPeriodsThisWeek: number;
  totalExamThisWeek: number;
  activeSemesters: Semester[];
  currentSubjects: Subject[];
  events: EventNotification[];
}

export interface CourseResult {
  subjectCode: string;
  subjectName: string;
  finalScore: number;
  credits: number;
}

export interface SemesterData {
  semesterName: string;
  courses: CourseResult[];
  gpa: number;
}

export interface SemesterChartData {
  semesterId: string;
  semesters: Semester[];
}

export interface EventData {
  events?: EventNotification[];
}

export interface ClassListData {
  currentSubjects?: Subject[];
}