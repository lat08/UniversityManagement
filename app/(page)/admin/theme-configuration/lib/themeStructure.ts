/**
 * Theme Structure - Định nghĩa cấu trúc màu sắc theo từng trang và component
 */

export interface ColorConfig {
  key: string;
  label: string;
  description: string;
  cssVar: string;
  defaultLight: string;
  defaultDark: string;
  category: 'primary' | 'secondary' | 'accent' | 'status' | 'text' | 'background' | 'component';
}

export interface PageThemeConfig {
  pageId: string;
  pageName: string;
  pageIcon: string;
  description: string;
  sections: ThemeSection[];
}

export interface ThemeSection {
  sectionId: string;
  sectionName: string;
  description: string;
  colors: ColorConfig[];
}

// ============================================
// STUDENT PAGES THEME CONFIGURATION
// ============================================

export const studentPagesTheme: PageThemeConfig[] = [
  {
    pageId: 'student-dashboard',
    pageName: 'Dashboard',
    pageIcon: '📊',
    description: 'Trang dashboard chính của sinh viên với thống kê và biểu đồ',
    sections: [
      {
        sectionId: 'stat-cards',
        sectionName: 'Thẻ Thống Kê (Stat Cards)',
        description: 'Các thẻ hiển thị GPA, credits, attendance',
        colors: [
          {
            key: 'cardBg',
            label: 'Card Background',
            description: 'Màu nền của stat card',
            cssVar: '--card-bg',
            defaultLight: '#ffffff',
            defaultDark: '#1e293b',
            category: 'background',
          },
          {
            key: 'cardBorder',
            label: 'Card Border',
            description: 'Màu viền của card',
            cssVar: '--card-border',
            defaultLight: '#e2e8f0',
            defaultDark: '#334155',
            category: 'background',
          },
          {
            key: 'primary',
            label: 'Primary Color',
            description: 'Màu chính cho icon và accent',
            cssVar: '--primary',
            defaultLight: '#4E8EE1',
            defaultDark: '#4E8EE1',
            category: 'primary',
          },
          {
            key: 'textPrimary',
            label: 'Text Primary',
            description: 'Màu chữ chính',
            cssVar: '--text-primary',
            defaultLight: '#0f172a',
            defaultDark: '#f8fafc',
            category: 'text',
          },
          {
            key: 'textSecondary',
            label: 'Text Secondary',
            description: 'Màu chữ phụ',
            cssVar: '--text-secondary',
            defaultLight: '#64748b',
            defaultDark: '#94a3b8',
            category: 'text',
          },
        ],
      },
      {
        sectionId: 'charts',
        sectionName: 'Biểu Đồ (Charts)',
        description: 'Màu sắc cho tất cả biểu đồ - chỉnh một lần áp dụng cho tất cả',
        colors: [
          {
            key: 'chartPrimary',
            label: 'Chart Primary (Màu Chính)',
            description: 'Màu chính cho column chart (bar) và phần đã hoàn thành trong donut chart',
            cssVar: '--chart-primary',
            defaultLight: '#ec4899',
            defaultDark: '#f472b6',
            category: 'component',
          },
          {
            key: 'chartSecondary',
            label: 'Chart Secondary (Màu Phụ)',
            description: 'Màu phụ cho donut chart (phần còn lại)',
            cssVar: '--chart-secondary',
            defaultLight: '#c4b5fd',
            defaultDark: '#c4b5fd',
            category: 'component',
          },
          {
            key: 'chartBackground',
            label: 'Chart Background (Màu Đằng Sau)',
            description: 'Màu background/đằng sau cho column chart',
            cssVar: '--chart-background',
            defaultLight: '#c9c7c7',
            defaultDark: '#94a3b8',
            category: 'component',
          },
        ],
      },
      {
        sectionId: 'events-classes',
        sectionName: 'Events & Classes',
        description: 'Các thẻ sự kiện và danh sách lớp học',
        colors: [
          {
            key: 'success',
            label: 'Success Color',
            description: 'Màu cho trạng thái thành công',
            cssVar: '--success',
            defaultLight: '#10b981',
            defaultDark: '#10b981',
            category: 'status',
          },
          {
            key: 'warning',
            label: 'Warning Color',
            description: 'Màu cảnh báo',
            cssVar: '--warning',
            defaultLight: '#f59e0b',
            defaultDark: '#f59e0b',
            category: 'status',
          },
          {
            key: 'error',
            label: 'Error Color',
            description: 'Màu lỗi',
            cssVar: '--error',
            defaultLight: '#ef4444',
            defaultDark: '#ef4444',
            category: 'status',
          },
          {
            key: 'info',
            label: 'Info Color',
            description: 'Màu thông tin (dùng cho StatCard xanh)',
            cssVar: '--info',
            defaultLight: '#3b82f6',
            defaultDark: '#3b82f6',
            category: 'status',
          },
          {
            key: 'infoLight',
            label: 'Info Light',
            description: 'Màu nền nhạt cho Info (StatCard background)',
            cssVar: '--info-light',
            defaultLight: '#dbeafe',
            defaultDark: '#1e3a8a',
            category: 'status',
          },
          {
            key: 'errorLight',
            label: 'Error Light',
            description: 'Màu nền nhạt cho Error (StatCard background)',
            cssVar: '--error-light',
            defaultLight: '#fee2e2',
            defaultDark: '#7f1d1d',
            category: 'status',
          },
        ],
      },
      {
        sectionId: 'event-card',
        sectionName: 'Event Card (Sự Kiện)',
        description: 'Màu sắc cho component EventCard - Timeline events',
        colors: [
          {
            key: 'eventBorder',
            label: 'Event Border',
            description: 'Màu viền của event card',
            cssVar: '--event-border',
            defaultLight: '#2563eb',
            defaultDark: '#60a5fa',
            category: 'component',
          },
          {
            key: 'eventDotBorder',
            label: 'Event Dot Border',
            description: 'Màu viền của dot trên timeline',
            cssVar: '--event-dot-border',
            defaultLight: 'rgba(30, 58, 138, 0.9)',
            defaultDark: 'rgba(96, 165, 250, 0.9)',
            category: 'component',
          },
          {
            key: 'eventTitle',
            label: 'Event Title',
            description: 'Màu tiêu đề của event',
            cssVar: '--event-title',
            defaultLight: 'rgba(30, 58, 138, 0.9)',
            defaultDark: 'rgba(96, 165, 250, 0.9)',
            category: 'text',
          },
          {
            key: 'eventContent',
            label: 'Event Content',
            description: 'Màu nội dung mô tả event',
            cssVar: '--event-content',
            defaultLight: '#9ca3af',
            defaultDark: '#94a3b8',
            category: 'text',
          },
          {
            key: 'eventMeta',
            label: 'Event Metadata',
            description: 'Màu cho location và time (MapPin, Clock)',
            cssVar: '--event-meta',
            defaultLight: '#1f2937',
            defaultDark: '#cbd5e1',
            category: 'text',
          },
          {
            key: 'eventTimeline',
            label: 'Event Timeline Line',
            description: 'Màu đường timeline dọc',
            cssVar: '--event-timeline',
            defaultLight: '#9ca3af',
            defaultDark: '#94a3b8',
            category: 'background',
          },
        ],
      },
      {
        sectionId: 'classlist-card',
        sectionName: 'ClassList Card (Lớp Học)',
        description: 'Màu sắc cho component ClassListCard - Danh sách lớp học',
        colors: [
          {
            key: 'classlistBorder',
            label: 'ClassList Border',
            description: 'Màu viền của class card',
            cssVar: '--classlist-border',
            defaultLight: '#1d4ed8',
            defaultDark: '#3b82f6',
            category: 'component',
          },
          {
            key: 'classlistTitle',
            label: 'ClassList Title',
            description: 'Màu tiêu đề môn học',
            cssVar: '--classlist-title',
            defaultLight: 'rgba(30, 58, 138, 0.9)',
            defaultDark: 'rgba(96, 165, 250, 0.9)',
            category: 'text',
          },
          {
            key: 'classlistBadgeBg',
            label: 'ClassList Badge Background',
            description: 'Màu nền badge mã môn học',
            cssVar: '--classlist-badge-bg',
            defaultLight: '#f3f4f6',
            defaultDark: '#334155',
            category: 'background',
          },
          {
            key: 'classlistBadgeText',
            label: 'ClassList Badge Text',
            description: 'Màu chữ badge mã môn học',
            cssVar: '--classlist-badge-text',
            defaultLight: '#6b7280',
            defaultDark: '#94a3b8',
            category: 'text',
          },
          {
            key: 'classlistText',
            label: 'ClassList Text',
            description: 'Màu chữ thông tin lớp (instructor, schedule)',
            cssVar: '--classlist-text',
            defaultLight: '#4b5563',
            defaultDark: '#94a3b8',
            category: 'text',
          },
          {
            key: 'classlistIcon',
            label: 'ClassList Icon',
            description: 'Màu icon (User, Clock)',
            cssVar: '--classlist-icon',
            defaultLight: '#9ca3af',
            defaultDark: '#64748b',
            category: 'component',
          },
          {
            key: 'classlistEmptyBorder',
            label: 'Empty State Border',
            description: 'Màu viền khi không có lớp',
            cssVar: '--classlist-empty-border',
            defaultLight: '#d1d5db',
            defaultDark: '#475569',
            category: 'background',
          },
          {
            key: 'classlistEmptyBg',
            label: 'Empty State Background',
            description: 'Màu nền khi không có lớp',
            cssVar: '--classlist-empty-bg',
            defaultLight: '#f9fafb',
            defaultDark: '#1e293b',
            category: 'background',
          },
          {
            key: 'classlistEmptyText',
            label: 'Empty State Text',
            description: 'Màu chữ khi không có lớp',
            cssVar: '--classlist-empty-text',
            defaultLight: '#6b7280',
            defaultDark: '#94a3b8',
            category: 'text',
          },
          {
            key: 'classlistEmptyIcon',
            label: 'Empty State Icon',
            description: 'Màu icon khi không có lớp',
            cssVar: '--classlist-empty-icon',
            defaultLight: '#9ca3af',
            defaultDark: '#64748b',
            category: 'component',
          },
        ],
      },
    ],
  },
  {
    pageId: 'student-schedule',
    pageName: 'Lịch Học',
    pageIcon: '📅',
    description: 'Trang lịch học tuần và học kỳ',
    sections: [
      {
        sectionId: 'schedule-table',
        sectionName: 'Bảng Lịch',
        description: 'Bảng lịch học với các ô thời khóa biểu',
        colors: [
          {
            key: 'primary',
            label: 'Primary Color',
            description: 'Màu chính cho các ô lịch',
            cssVar: '--primary',
            defaultLight: '#4E8EE1',
            defaultDark: '#4E8EE1',
            category: 'primary',
          },
          {
            key: 'primaryLight',
            label: 'Primary Light',
            description: 'Màu nhạt cho background ô lịch',
            cssVar: '--primary-light',
            defaultLight: '#e3f2fd',
            defaultDark: '#1e3a8a',
            category: 'primary',
          },
          {
            key: 'border',
            label: 'Border Color',
            description: 'Màu viền bảng lịch',
            cssVar: '--border',
            defaultLight: '#e2e8f0',
            defaultDark: '#334155',
            category: 'background',
          },
        ],
      },
    ],
  },
  {
    pageId: 'student-grades',
    pageName: 'Điểm Số',
    pageIcon: '📝',
    description: 'Trang xem điểm và bảng điểm',
    sections: [
      {
        sectionId: 'grade-table',
        sectionName: 'Bảng Điểm',
        description: 'Bảng hiển thị điểm các môn học',
        colors: [
          {
            key: 'success',
            label: 'Success (Pass)',
            description: 'Màu cho điểm đạt',
            cssVar: '--success',
            defaultLight: '#10b981',
            defaultDark: '#10b981',
            category: 'status',
          },
          {
            key: 'successLight',
            label: 'Success Light',
            description: 'Màu nền cho điểm đạt',
            cssVar: '--success-light',
            defaultLight: '#d1fae5',
            defaultDark: '#064e3b',
            category: 'status',
          },
          {
            key: 'error',
            label: 'Error (Fail)',
            description: 'Màu cho điểm không đạt',
            cssVar: '--error',
            defaultLight: '#ef4444',
            defaultDark: '#ef4444',
            category: 'status',
          },
          {
            key: 'errorLight',
            label: 'Error Light',
            description: 'Màu nền cho điểm không đạt',
            cssVar: '--error-light',
            defaultLight: '#fee2e2',
            defaultDark: '#7f1d1d',
            category: 'status',
          },
        ],
      },
    ],
  },
  {
    pageId: 'student-courses',
    pageName: 'Môn Học',
    pageIcon: '📚',
    description: 'Trang đăng ký và quản lý môn học',
    sections: [
      {
        sectionId: 'course-cards',
        sectionName: 'Course Cards',
        description: 'Các thẻ môn học',
        colors: [
          {
            key: 'cardBg',
            label: 'Card Background',
            description: 'Màu nền card môn học',
            cssVar: '--card-bg',
            defaultLight: '#ffffff',
            defaultDark: '#1e293b',
            category: 'background',
          },
          {
            key: 'primary',
            label: 'Primary Color',
            description: 'Màu cho button và action',
            cssVar: '--primary',
            defaultLight: '#4E8EE1',
            defaultDark: '#4E8EE1',
            category: 'primary',
          },
          {
            key: 'info',
            label: 'Info Color',
            description: 'Màu thông tin môn học',
            cssVar: '--info',
            defaultLight: '#3b82f6',
            defaultDark: '#3b82f6',
            category: 'status',
          },
        ],
      },
    ],
  },
  {
    pageId: 'student-tuition',
    pageName: 'Học Phí',
    pageIcon: '💰',
    description: 'Trang quản lý học phí',
    sections: [
      {
        sectionId: 'payment-status',
        sectionName: 'Trạng Thái Thanh Toán',
        description: 'Hiển thị trạng thái đã/chưa thanh toán',
        colors: [
          {
            key: 'success',
            label: 'Paid Status',
            description: 'Màu cho trạng thái đã thanh toán',
            cssVar: '--success',
            defaultLight: '#10b981',
            defaultDark: '#10b981',
            category: 'status',
          },
          {
            key: 'warning',
            label: 'Pending Status',
            description: 'Màu cho trạng thái chờ',
            cssVar: '--warning',
            defaultLight: '#f59e0b',
            defaultDark: '#f59e0b',
            category: 'status',
          },
          {
            key: 'error',
            label: 'Overdue Status',
            description: 'Màu cho trạng thái quá hạn',
            cssVar: '--error',
            defaultLight: '#ef4444',
            defaultDark: '#ef4444',
            category: 'status',
          },
        ],
      },
    ],
  },
  {
    pageId: 'student-notifications',
    pageName: 'Thông Báo',
    pageIcon: '🔔',
    description: 'Trang thông báo - Notification Page',
    sections: [
      {
        sectionId: 'notification-badge',
        sectionName: 'Badge Số Lượng Chưa Đọc',
        description: 'Màu badge hiển thị số thông báo chưa đọc trên filter tabs',
        colors: [
          {
            key: 'badgeBg',
            label: 'Badge Background',
            description: 'Màu nền badge (tab inactive)',
            cssVar: '--badge-bg',
            defaultLight: '#ef4444',
            defaultDark: '#f87171',
            category: 'component',
          },
          {
            key: 'badgeText',
            label: 'Badge Text',
            description: 'Màu chữ badge (tab inactive)',
            cssVar: '--badge-text',
            defaultLight: '#ffffff',
            defaultDark: '#ffffff',
            category: 'text',
          },
          {
            key: 'badgeActiveBg',
            label: 'Badge Active Background',
            description: 'Màu nền badge khi tab được chọn',
            cssVar: '--badge-active-bg',
            defaultLight: '#ffffff',
            defaultDark: '#ffffff',
            category: 'component',
          },
          {
            key: 'badgeActiveText',
            label: 'Badge Active Text',
            description: 'Màu chữ badge khi tab được chọn',
            cssVar: '--badge-active-text',
            defaultLight: '#ef4444',
            defaultDark: '#f87171',
            category: 'text',
          },
        ],
      },
      {
        sectionId: 'notification-types',
        sectionName: 'Loại Thông Báo - Event',
        description: 'Màu sắc cho thông báo loại Sự Kiện',
        colors: [
          {
            key: 'notificationEventBg',
            label: 'Event Background',
            description: 'Màu nền icon box cho thông báo Sự Kiện',
            cssVar: '--notification-event-bg',
            defaultLight: '#fef3c7',
            defaultDark: '#78350f',
            category: 'component',
          },
          {
            key: 'notificationEventIcon',
            label: 'Event Icon',
            description: 'Màu icon cho thông báo Sự Kiện',
            cssVar: '--notification-event-icon',
            defaultLight: '#d97706',
            defaultDark: '#fbbf24',
            category: 'component',
          },
          {
            key: 'notificationEventBorder',
            label: 'Event Border',
            description: 'Màu viền icon box cho thông báo Sự Kiện',
            cssVar: '--notification-event-border',
            defaultLight: '#d97706',
            defaultDark: '#fbbf24',
            category: 'component',
          },
        ],
      },
      {
        sectionId: 'notification-tuition',
        sectionName: 'Loại Thông Báo - Học Phí',
        description: 'Màu sắc cho thông báo loại Học Phí',
        colors: [
          {
            key: 'notificationTuitionBg',
            label: 'Tuition Background',
            description: 'Màu nền icon box cho thông báo Học Phí',
            cssVar: '--notification-tuition-bg',
            defaultLight: '#fef3c7',
            defaultDark: '#78350f',
            category: 'component',
          },
          {
            key: 'notificationTuitionIcon',
            label: 'Tuition Icon',
            description: 'Màu icon cho thông báo Học Phí',
            cssVar: '--notification-tuition-icon',
            defaultLight: '#f59e0b',
            defaultDark: '#fbbf24',
            category: 'component',
          },
          {
            key: 'notificationTuitionBorder',
            label: 'Tuition Border',
            description: 'Màu viền icon box cho thông báo Học Phí',
            cssVar: '--notification-tuition-border',
            defaultLight: '#f59e0b',
            defaultDark: '#fbbf24',
            category: 'component',
          },
        ],
      },
      {
        sectionId: 'notification-schedule',
        sectionName: 'Loại Thông Báo - Lịch Học',
        description: 'Màu sắc cho thông báo loại Lịch Học',
        colors: [
          {
            key: 'notificationScheduleBg',
            label: 'Schedule Background',
            description: 'Màu nền icon box cho thông báo Lịch Học',
            cssVar: '--notification-schedule-bg',
            defaultLight: '#dbeafe',
            defaultDark: '#1e3a8a',
            category: 'component',
          },
          {
            key: 'notificationScheduleIcon',
            label: 'Schedule Icon',
            description: 'Màu icon cho thông báo Lịch Học',
            cssVar: '--notification-schedule-icon',
            defaultLight: '#3b82f6',
            defaultDark: '#60a5fa',
            category: 'component',
          },
          {
            key: 'notificationScheduleBorder',
            label: 'Schedule Border',
            description: 'Màu viền icon box cho thông báo Lịch Học',
            cssVar: '--notification-schedule-border',
            defaultLight: '#3b82f6',
            defaultDark: '#60a5fa',
            category: 'component',
          },
        ],
      },
      {
        sectionId: 'notification-important',
        sectionName: 'Loại Thông Báo - Quan Trọng',
        description: 'Màu sắc cho thông báo loại Quan Trọng',
        colors: [
          {
            key: 'notificationImportantBg',
            label: 'Important Background',
            description: 'Màu nền icon box cho thông báo Quan Trọng',
            cssVar: '--notification-important-bg',
            defaultLight: '#fee2e2',
            defaultDark: '#7f1d1d',
            category: 'component',
          },
          {
            key: 'notificationImportantIcon',
            label: 'Important Icon',
            description: 'Màu icon cho thông báo Quan Trọng',
            cssVar: '--notification-important-icon',
            defaultLight: '#ef4444',
            defaultDark: '#f87171',
            category: 'component',
          },
          {
            key: 'notificationImportantBorder',
            label: 'Important Border',
            description: 'Màu viền icon box cho thông báo Quan Trọng',
            cssVar: '--notification-important-border',
            defaultLight: '#ef4444',
            defaultDark: '#f87171',
            category: 'component',
          },
        ],
      },
    ],
  },
];

// ============================================
// GLOBAL/SHARED THEME CONFIGURATION
// ============================================

export const globalThemeConfig: PageThemeConfig = {
  pageId: 'global',
  pageName: 'Global Theme',
  pageIcon: '🌐',
  description: 'Cấu hình màu sắc toàn cục cho toàn bộ hệ thống',
  sections: [
    {
      sectionId: 'sidebar',
      sectionName: 'Sidebar',
      description: 'Màu sắc của sidebar navigation',
      colors: [
        {
          key: 'sidebar',
          label: 'Sidebar Background',
          description: 'Màu nền sidebar',
          cssVar: '--sidebar',
          defaultLight: '#f8fafc',
          defaultDark: '#1e293b',
          category: 'background',
        },
        {
          key: 'sidebarForeground',
          label: 'Sidebar Text',
          description: 'Màu chữ trong sidebar (title)',
          cssVar: '--sidebar-foreground',
          defaultLight: '#0f172a',
          defaultDark: '#f8fafc',
          category: 'text',
        },
        {
          key: 'sidebarItemText',
          label: 'Sidebar Item Text',
          description: 'Màu chữ menu item khi không được chọn',
          cssVar: '--sidebar-item-text',
          defaultLight: '#0f172a',
          defaultDark: '#f8fafc',
          category: 'text',
        },
        {
          key: 'sidebarPrimary',
          label: 'Sidebar Active Background',
          description: 'Màu nền item được chọn',
          cssVar: '--sidebar-primary',
          defaultLight: '#1e293b',
          defaultDark: '#0f172a',
          category: 'component',
        },
        {
          key: 'sidebarItemTextActive',
          label: 'Sidebar Item Text Active',
          description: 'Màu chữ menu item khi được chọn',
          cssVar: '--sidebar-item-text-active',
          defaultLight: '#f8fafc',
          defaultDark: '#f8fafc',
          category: 'text',
        },
        {
          key: 'sidebarHover',
          label: 'Sidebar Hover',
          description: 'Màu nền khi hover menu item trong sidebar',
          cssVar: '--sidebar-hover',
          defaultLight: '#f1f5f9',
          defaultDark: '#334155',
          category: 'component',
        },
        {
          key: 'sidebarBorder',
          label: 'Sidebar Border',
          description: 'Màu viền sidebar',
          cssVar: '--sidebar-border',
          defaultLight: '#e2e8f0',
          defaultDark: '#334155',
          category: 'background',
        },
      ],
    },
    {
      sectionId: 'header',
      sectionName: 'Header',
      description: 'Màu sắc của header/topbar',
      colors: [
        {
          key: 'header',
          label: 'Header Background',
          description: 'Màu nền header',
          cssVar: '--header',
          defaultLight: '#ffffff',
          defaultDark: '#1e293b',
          category: 'background',
        },
        {
          key: 'headerForeground',
          label: 'Header Text',
          description: 'Màu chữ header',
          cssVar: '--header-foreground',
          defaultLight: '#0f172a',
          defaultDark: '#f8fafc',
          category: 'text',
        },
        {
          key: 'headerBorder',
          label: 'Header Border',
          description: 'Màu viền dưới header',
          cssVar: '--header-border',
          defaultLight: '#e2e8f0',
          defaultDark: '#334155',
          category: 'background',
        },
      ],
    },
    {
      sectionId: 'primary-colors',
      sectionName: 'Primary Colors',
      description: 'Màu chính của hệ thống',
      colors: [
        {
          key: 'primary',
          label: 'Primary',
          description: 'Màu chính (buttons, links, actions)',
          cssVar: '--primary',
          defaultLight: '#4E8EE1',
          defaultDark: '#4E8EE1',
          category: 'primary',
        },
        {
          key: 'primaryForeground',
          label: 'Primary Text',
          description: 'Màu chữ trên nền primary',
          cssVar: '--primary-foreground',
          defaultLight: '#ffffff',
          defaultDark: '#ffffff',
          category: 'primary',
        },
        {
          key: 'primaryHover',
          label: 'Primary Hover',
          description: 'Màu primary khi hover',
          cssVar: '--primary-hover',
          defaultLight: '#3d7bc9',
          defaultDark: '#3d7bc9',
          category: 'primary',
        },
        {
          key: 'accent',
          label: 'Accent (Button Hover)',
          description: 'Màu accent - dùng cho hover ghost/outline buttons',
          cssVar: '--accent',
          defaultLight: '#f5f5f5',
          defaultDark: '#334155',
          category: 'primary',
        },
        {
          key: 'accentForeground',
          label: 'Accent Text',
          description: 'Màu chữ trên nền accent',
          cssVar: '--accent-foreground',
          defaultLight: '#1e293b',
          defaultDark: '#f8fafc',
          category: 'primary',
        },
        {
          key: 'accentHover',
          label: 'Accent Hover',
          description: 'Màu accent khi hover',
          cssVar: '--accent-hover',
          defaultLight: '#e5e5e5',
          defaultDark: '#475569',
          category: 'primary',
        },
      ],
    },
    {
      sectionId: 'status-colors',
      sectionName: 'Status Colors',
      description: 'Màu trạng thái (success, warning, error, info)',
      colors: [
        {
          key: 'success',
          label: 'Success',
          description: 'Màu thành công',
          cssVar: '--success',
          defaultLight: '#10b981',
          defaultDark: '#10b981',
          category: 'status',
        },
        {
          key: 'warning',
          label: 'Warning',
          description: 'Màu cảnh báo',
          cssVar: '--warning',
          defaultLight: '#f59e0b',
          defaultDark: '#f59e0b',
          category: 'status',
        },
        {
          key: 'error',
          label: 'Error',
          description: 'Màu lỗi',
          cssVar: '--error',
          defaultLight: '#ef4444',
          defaultDark: '#ef4444',
          category: 'status',
        },
        {
          key: 'info',
          label: 'Info',
          description: 'Màu thông tin',
          cssVar: '--info',
          defaultLight: '#3b82f6',
          defaultDark: '#3b82f6',
          category: 'status',
        },
      ],
    },
    {
      sectionId: 'background',
      sectionName: 'Background Colors',
      description: 'Màu nền chính của ứng dụng',
      colors: [
        {
          key: 'background',
          label: 'Main Background',
          description: 'Màu nền chính của trang',
          cssVar: '--background',
          defaultLight: '#ffffff',
          defaultDark: '#0f172a',
          category: 'background',
        },
        {
          key: 'foreground',
          label: 'Main Text',
          description: 'Màu chữ chính',
          cssVar: '--foreground',
          defaultLight: '#0f172a',
          defaultDark: '#f8fafc',
          category: 'text',
        },
        {
          key: 'border',
          label: 'Border',
          description: 'Màu viền mặc định',
          cssVar: '--border',
          defaultLight: '#e2e8f0',
          defaultDark: '#334155',
          category: 'background',
        },
      ],
    },
  ],
};

// Helper functions
export const getAllPages = (): PageThemeConfig[] => {
  return [globalThemeConfig, ...studentPagesTheme];
};

export const getPageById = (pageId: string): PageThemeConfig | undefined => {
  return getAllPages().find(page => page.pageId === pageId);
};

export const getAllColorKeys = (): string[] => {
  const allPages = getAllPages();
  const keys = new Set<string>();
  
  allPages.forEach(page => {
    page.sections.forEach(section => {
      section.colors.forEach(color => {
        keys.add(color.key);
      });
    });
  });
  
  return Array.from(keys);
};

export const getColorConfigByKey = (key: string): ColorConfig | undefined => {
  const allPages = getAllPages();
  
  for (const page of allPages) {
    for (const section of page.sections) {
      const color = section.colors.find(c => c.key === key);
      if (color) return color;
    }
  }
  
  return undefined;
};

