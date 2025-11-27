import { DashboardStats, PendingTask, RecentUpdate } from '../types/types';

export const mockDashboardStats: DashboardStats[] = [
  {
    id: '1',
    title: 'Tổng sinh viên',
    value: 2847,
    description: '+12% so với kỳ trước',
    color: 'green',
  },
  {
    id: '2',
    title: 'Tổng giảng viên',
    value: 156,
    description: '+3 giảng viên mới',
    color: 'blue',
  },
  {
    id: '3',
    title: 'Lớp học',
    value: 89,
    description: 'Học kỳ I năm 2024 - 2025',
    color: 'red',
  },
  {
    id: '4',
    title: 'Môn học',
    value: 234,
    description: 'Đang giảng dạy',
    color: 'orange',
  },
];

export const mockPendingTasks: PendingTask[] = [
  {
    id: '1',
    title: 'Yêu cầu sử dụng phòng chức năng',
    description: '3 yêu cầu sử dụng phòng chức năng đang chờ phê duyệt',
    link: '/admin/room-requests',
  },
  {
    id: '2',
    title: 'Đăng ký học phần',
    description: '8 đơn xin đăng ký học phần đang chờ phê duyệt',
    link: '/admin/course-registration',
  },
  {
    id: '3',
    title: 'Lịch thi chưa công bố',
    description: '1 lịch thi chuyển ngành cần công bố cho sinh viên',
    link: '/admin/exam-schedule',
  },
];

export const mockRecentUpdates: RecentUpdate[] = [
  {
    id: '1',
    title: 'Hạn nộp bảo phí học kỳ I năm 2025 - 2026',
    description: 'Hạn nộp bảo phí cho học kỳ I từ 10/11/2025',
    timestamp: '10 giờ trước',
    link: '/admin/tuition',
  },
  {
    id: '2',
    title: 'Công bố lịch thi học kỳ I năm 2025 - 2026',
    description: 'Vui lòng xem thông tin chi tiết lịch thi học kỳ I năm 2025 - 2026',
    timestamp: '5 giờ trước',
    link: '/admin/exam-schedule',
  },
  {
    id: '3',
    title: 'Đăng ký học phần',
    description: 'Mở đăng ký học phần từ Học kỳ I năm 2025 - 2026',
    timestamp: '1 giờ trước',
    link: '/admin/course-registration',
  },
];