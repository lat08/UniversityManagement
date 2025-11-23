/**
 * Centralized Query Keys Factory
 * Consistent cache key structure for React Query
 */

import { NotificationQueryParams } from '@/lib/types/notification';
import { RegulationQueryParams } from '@/lib/types/regulation';

export const queryKeys = {
  common: {
    all: ['common'] as const,
    semesters: () => ['common', 'semesters'] as const,
    subjects: (semesterId?: string) => ['common', 'subjects', semesterId ?? 'all'] as const,
    faculties: () => ['common', 'faculties'] as const,
    departments: (facultyId?: string) => ['common', 'departments', facultyId ?? 'all'] as const,
    instructors: (searchKey?: string) => ['common', 'instructors', searchKey ?? 'all'] as const,
    courseClasses: (subjectId?: string, semesterId?: string) =>
      ['common', 'courseClasses', subjectId ?? 'all', semesterId ?? 'all'] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (params: NotificationQueryParams) => 
      [...queryKeys.notifications.lists(), params] as const,
    details: () => [...queryKeys.notifications.all, 'detail'] as const,
    detail: (id: string, role?: string) => 
      [...queryKeys.notifications.details(), id, role] as const,
    unreadCounts: (role?: string) => 
      [...queryKeys.notifications.all, 'unreadCounts', role] as const,
  },
  
  tuition: {
    all: ['tuition'] as const,
    semesters: () => [...queryKeys.tuition.all, 'semesters'] as const,
    fees: (semesterId: string) => 
      [...queryKeys.tuition.all, 'fees', semesterId] as const,
    insurance: () => [...queryKeys.tuition.all, 'insurance'] as const,
    history: () => [...queryKeys.tuition.all, 'history'] as const,
  },
  
  schedule: {
    all: ['schedule'] as const,
    current: () => [...queryKeys.schedule.all, 'current'] as const,
    week: (date: string) => [...queryKeys.schedule.all, 'week', date] as const,
    weekly: (semesterId: string, weekNumber: number) => 
      [...queryKeys.schedule.all, 'weekly', semesterId, weekNumber] as const,
    weeklyBySubject: (semesterId: string, weekNumber: number, subjectId: string) => 
      [...queryKeys.schedule.all, 'weekly', semesterId, weekNumber, 'subject', subjectId] as const,
    semester: (semesterId: string) => 
      [...queryKeys.schedule.all, 'semester', semesterId] as const,
    semesterBySubject: (semesterId: string, subjectId: string) => 
      [...queryKeys.schedule.all, 'semester', semesterId, 'subject', subjectId] as const,
    weeks: (semesterId: string) => 
      [...queryKeys.schedule.all, 'weeks', semesterId] as const,
    instructor: {
      all: () => [...queryKeys.schedule.all, 'instructor'] as const,
      weekly: (semesterId: string, weekNumber: number) => 
        [...queryKeys.schedule.instructor.all(), 'weekly', semesterId, weekNumber] as const,
      weeklyBySubject: (semesterId: string, weekNumber: number, subjectId: string) => 
        [...queryKeys.schedule.instructor.all(), 'weekly', semesterId, weekNumber, 'subject', subjectId] as const,
      semester: (semesterId: string) => 
        [...queryKeys.schedule.instructor.all(), 'semester', semesterId] as const,
      semesterBySubject: (semesterId: string, subjectId: string) => 
        [...queryKeys.schedule.instructor.all(), 'semester', semesterId, 'subject', subjectId] as const,
    },
  },
  
  profile: {
    all: ['profile'] as const,
    instructor: () => [...queryKeys.profile.all, 'instructor'] as const,
    student: () => [...queryKeys.profile.all, 'student'] as const,
  },
  
  regulations: {
    all: ['regulations'] as const,
    lists: () => [...queryKeys.regulations.all, 'list'] as const,
    list: (params?: RegulationQueryParams) =>
      [...queryKeys.regulations.lists(), params ?? {}] as const,
    details: () => [...queryKeys.regulations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.regulations.details(), id] as const,
  },
  
  roomBooking: {
    all: ['roomBooking'] as const,
    rooms: {
      all: () => [...queryKeys.roomBooking.all, 'rooms'] as const,
      list: (params: { page: number; pageSize: number; filters: Record<string, string> }) =>
        [...queryKeys.roomBooking.rooms.all(), params] as const,
    },
    bookings: {
      all: () => [...queryKeys.roomBooking.all, 'bookings'] as const,
      my: (params: { page: number; pageSize: number; filters: Record<string, string> }) =>
        [...queryKeys.roomBooking.bookings.all(), 'my', params] as const,
    },
    availability: (roomId: string, date: string) =>
      [...queryKeys.roomBooking.all, 'availability', roomId, date] as const,
  },

  examSchedule: {
    all: ['examSchedule'] as const,
    bySemester: (semesterId: string) => 
      [...queryKeys.examSchedule.all, 'semester', semesterId] as const,
  },

  notes: {
    all: ['notes'] as const,
    list: (params: { pageNumber: number; pageSize: number; sortOrder: string }) =>
      [...queryKeys.notes.all, 'list', params] as const,
  },

  grades: {
    all: ['grades'] as const,
    cumulative: () => [...queryKeys.grades.all, 'cumulative'] as const,
    semester: (semesterId: string) => 
      [...queryKeys.grades.all, 'semester', semesterId] as const,
  },

  dashboard: {
    all: ['dashboard'] as const,
    instructor: () => [...queryKeys.dashboard.all, 'instructor'] as const,
  },

  exams: {
    all: ['exams'] as const,
    lists: () => [...queryKeys.exams.all, 'list'] as const,
    list: (params: {
      semesterId?: string;
      subjectId?: string;
      status?: string;
      examType?: string;
      searchKeyword?: string;
      pageNumber?: number;
      pageSize?: number;
    }) => [...queryKeys.exams.lists(), params] as const,
    details: () => [...queryKeys.exams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.exams.details(), id] as const,
  },

  instructorGrades: {
    all: ['instructorGrades'] as const,
    courseClasses: (semesterId?: string) => 
      [...queryKeys.instructorGrades.all, 'courseClasses', semesterId] as const,
    grades: (courseClassId: string, type?: 'draft' | 'official') => 
      [...queryKeys.instructorGrades.all, 'grades', courseClassId, type] as const,
    history: (courseClassId: string) => 
      [...queryKeys.instructorGrades.all, 'history', courseClassId] as const,
    version: (courseClassId: string, versionNumber: number) => 
      [...queryKeys.instructorGrades.all, 'version', courseClassId, versionNumber] as const,
  },

  materials: {
    all: ['materials'] as const,
    lists: () => [...queryKeys.materials.all, 'list'] as const,
    list: (params: {
      keyword?: string;
      semesterId?: string;
      subjectId?: string;
      documentType?: string;
      pageNumber?: number;
      pageSize?: number;
    }) => [...queryKeys.materials.lists(), params] as const,
    documents: (params: {
      keyword?: string;
      semesterId?: string;
      subjectId?: string;
      documentType?: string;
      pageNumber?: number;
      pageSize?: number;
    }) => [...queryKeys.materials.all, 'documents', params] as const,
    documentTypes: () => [...queryKeys.materials.all, 'documentTypes'] as const,
    courseClasses: (semesterId?: string) => 
      [...queryKeys.materials.all, 'courseClasses', semesterId] as const,
  },

  adminGradeApprovals: {
    all: ['adminGradeApprovals'] as const,
    lists: () => ['adminGradeApprovals', 'list'] as const,
    list: (params: unknown) =>
      ['adminGradeApprovals', 'list', params] as const,
    details: () => ['adminGradeApprovals', 'detail'] as const,
    detail: (gradeVersionId: string) => ['adminGradeApprovals', 'detail', gradeVersionId] as const,
    statistics: () => ['adminGradeApprovals', 'statistics'] as const,
  },
} as const;
