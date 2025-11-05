import { DashboardStats, PendingTask, RecentUpdate } from '../types/types';

export const mockDashboardStats: DashboardStats[] = [
  {
    id: '1',
    title: 'Tổng sinh viên',
    value: 2847,
    icon: '👥',
    change: '+12% so với kỳ trước',
    changeType: 'increase',
    color: 'green',
  },
  {
    id: '2',
    title: 'Tổng giảng viên',
    value: 156,
    icon: '👨‍🏫',
    change: '+3 giảng viên mới',
    changeType: 'increase',
    color: 'blue',
  },
  {
    id: '3',
    title: 'Lớp học',
    value: 89,
    icon: '📚',
    description: 'Học kỳ I năm 2024 - 2025',
    color: 'red',
  },
  {
    id: '4',
    title: 'Môn học',
    value: 234,
    icon: '📖',
    description: 'Đang giảng dạy',
    color: 'orange',
  },
];

export const mockPendingTasks: PendingTask[] = [
  {
    id: '1',
    title: 'Yêu cầu sử dụng phòng chức năng',
    description: '3 yêu cầu sử dụng phòng chức năng đang chờ phê duyệt',
    icon: '📋',
    count: 3,
    priority: 'high',
  },
  {
    id: '2',
    title: 'Đăng ký học phần',
    description: '8 đơn xin đăng ký học phần đang chờ phê duyệt',
    icon: '📝',
    count: 8,
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Lịch thi chưa công bố',
    description: '1 lịch thi chuyển ngành cần công bố cho sinh viên',
    icon: '📅',
    count: 1,
    priority: 'high',
  },
];

export const mockRecentUpdates: RecentUpdate[] = [
  {
    id: '1',
    title: 'Hạn nộp bảo phí học kỳ I năm 2025 - 2026',
    description: 'Hạn nộp bảo phí cho học kỳ I từ 10/11/2025',
    timestamp: '3 giờ trước',
    type: 'info',
  },
  {
    id: '2',
    title: 'Công bố lịch thi học kỳ I năm 2025 - 2026',
    description: 'Giải nhất thông tin chi tiết lịch thi học kỳ I năm 2025 - 2026',
    timestamp: '5 giờ trước',
    type: 'success',
  },
  {
    id: '3',
    title: 'Đăng ký học phần',
    description: 'Mở đăng ký học phần từ Học kỳ I năm 2025 - 2026',
    timestamp: '1 giờ trước',
    type: 'warning',
  },
];