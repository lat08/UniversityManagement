export interface AdminDashboardSummary {
  totalStudents: number;
  totalInstructors: number;
  totalClasses?: number;
  totalCourseClassesThisSemester?: number; // Backend field name
  totalSubjects: number;
  studentGrowthRate: number;
  instructorGrowthRate: number;
}

export interface AdminDashboardPendingCounts {
  roomRequestPendingCount: number;
  gradeApprovalPendingCount: number;
  scheduleChangePendingCount: number;
  totalPendingCount: number;
}

export interface AdminDashboardRecentUpdate {
  id: string;
  title: string;
  description: string;
  category: 'tuition' | 'examSchedule' | 'courseRegistration' | 'regulation' | 'other';
  createdAt: string;
  link?: string;
}

export interface AdminDashboardResponse {
  summary: AdminDashboardSummary;
  studentStatistic: {
    currentYearStudents: number;
    lastYearStudents: number;
    growthRate: number;
  };
  instructorStatistic: {
    currentYearInstructors: number;
    lastYearInstructors: number;
    growthRate: number;
  };
  pendingTaskCount: number;
  roomRequestPendingCount: number;
  gradeApprovalPendingCount: number;
  scheduleChangePendingCount: number;
  regulations: unknown[];
  recentUpdates: AdminDashboardRecentUpdate[];
}


