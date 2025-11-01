export interface DashboardResponse {
  totalClasses: number;
  documentsThisWeek: number;
  weeklySchedule: WeeklySchedule[];
  reminders: Reminder[];
}

export interface WeeklySchedule {
  courseClassId: string;
  subjectCode: string;
  subjectName: string;
  classCode: string;
  roomName: string;
  roomCode: string;
  dayOfWeek: string;
  timeRange: string;
}

export interface Reminder {
  notificationId: string;
  title: string;
  content: string;
  notificationType: 'tuition' | 'schedule' | 'important';
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

