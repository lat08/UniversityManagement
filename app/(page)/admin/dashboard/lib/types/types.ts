export interface DashboardStats {
  id: string;
  title: string;
  value: number;
  icon: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  description?: string;
  color: 'green' | 'blue' | 'red' | 'orange';
}

export interface PendingTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  count?: number;
  priority?: 'low' | 'medium' | 'high';
}

export interface RecentUpdate {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
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