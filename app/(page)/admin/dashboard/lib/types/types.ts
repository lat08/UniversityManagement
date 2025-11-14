export interface DashboardStats {
  id: string;
  title: string;
  value: number;
  description?: string;
  color: 'green' | 'blue' | 'red' | 'orange';
}

export interface PendingTask {
  id: string;
  title: string;
  description: string;
  link?: string;
}

export interface RecentUpdate {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  link?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description?: string;
  icon: string;
  action: () => void;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}

export interface DashboardContentProps {
  stats?: DashboardStats[];
  pendingTasks?: PendingTask[];
  recentUpdates?: RecentUpdate[];
  quickActions?: QuickAction[];
}