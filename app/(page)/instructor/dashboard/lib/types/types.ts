export interface DashboardResponse {
  totalClasses: number;
  documents: {
    totalDocuments: number;
    newDocumentsThisWeek: number;
  };
  currentSemester: string;
  requests: {
    totalRequests: number;
    newRequestsToday: number;
  };
  weeklySchedule: WeeklySchedule[];
  reminders: Reminder[];
}

export interface WeeklySchedule {
  courseClassId: string;
  subjectCode: string;
  subjectName: string;
  classCode: string;
  roomName: string;
  classType: string;
  dayOfWeek: string;
  timeRange: string;
}

export interface Reminder {
  notificationId: string;
  title: string;
  content: string;
  notificationType: 'tuition' | 'schedule' | 'important' | 'event';
  createdAt: string;
}

export interface DashboardStatCard {
  title: string;
  value: number | string;
  subtitle?: string;
  bgColor: string;
  iconColor: string;
  textColor: string;
}

