import { LucideIcon } from "lucide-react";

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



export interface SubjectGrade {
  subject: string;
  grade: number;
}

export interface LearningStats {
  gpa: number;
  maxGpa: number;
  credits: number;
  totalCredits: number;
  classification: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  instructor: string;
  schedule: string;
}


export interface DashboardData {
  kpi: Kpi;
  totalPeriodsThisWeek: number;
  totalExamThisWeek: number;
  activeSemesters: Semester[];
  currentSubjects: Subject[];
  events: EventNotification[];
}

export const emptyDashboardData: DashboardData = {
  kpi: {
    gpa: 0,
    completedCredits: 0,
    totalCredits: 0,
    ranking: "Yếu"
  },
  totalPeriodsThisWeek: 0,
  totalExamThisWeek: 0,
  activeSemesters: [],
  currentSubjects: [],
  events: [],
};


interface Kpi {
  gpa: number;
  completedCredits: number;
  totalCredits: number;
  ranking: string;
}

export interface KpiData {
  Kpi? : Kpi;
}

import { Semester as CommonSemester } from "@/lib/types";

export type Semester = Pick<CommonSemester, 'semesterId' | 'semesterName' | 'startDate' | 'endDate' | 'registrationStartDate' | 'registrationEndDate'>;

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
  semesterId?: string;
}

export interface EventNotification {
  notificationId: string;
  title: string;
  content: string;
  createdAt: string; // ISO date string
  type: 'event' | string;
  isRead: boolean;
  eventDate: string; // ISO date string
  location: string;
}

interface Courses {
  subjectCode : string;
  subjectName : string; 
  finalScore : number;
  credits : number
}

export interface SemesterChartData {
  semesterId : string;
  semesters : Semester[];
}

export interface EventData {
  events : EventNotification[];
}

export interface SemesterData {
  semesterName : string; 
  courses : Courses[];
  gpa : number;
}

export interface ClassListData {
  currentSubjects: Subject[];
}