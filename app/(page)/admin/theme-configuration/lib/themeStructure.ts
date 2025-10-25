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
        description: 'Biểu đồ Academic Results và Learning Stats',
        colors: [
          {
            key: 'chart1',
            label: 'Chart Color 1',
            description: 'Màu đầu tiên cho biểu đồ',
            cssVar: '--chart-1',
            defaultLight: '#3b82f6',
            defaultDark: '#60a5fa',
            category: 'component',
          },
          {
            key: 'chart2',
            label: 'Chart Color 2',
            description: 'Màu thứ hai cho biểu đồ',
            cssVar: '--chart-2',
            defaultLight: '#10b981',
            defaultDark: '#34d399',
            category: 'component',
          },
          {
            key: 'chart3',
            label: 'Chart Color 3',
            description: 'Màu thứ ba cho biểu đồ',
            cssVar: '--chart-3',
            defaultLight: '#f59e0b',
            defaultDark: '#fbbf24',
            category: 'component',
          },
          {
            key: 'chart4',
            label: 'Chart Color 4',
            description: 'Màu thứ tư cho biểu đồ',
            cssVar: '--chart-4',
            defaultLight: '#ef4444',
            defaultDark: '#f87171',
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
    description: 'Trang thông báo',
    sections: [
      {
        sectionId: 'notification-types',
        sectionName: 'Loại Thông Báo',
        description: 'Màu sắc theo loại thông báo',
        colors: [
          {
            key: 'info',
            label: 'Info Notification',
            description: 'Thông báo thông tin',
            cssVar: '--info',
            defaultLight: '#3b82f6',
            defaultDark: '#3b82f6',
            category: 'status',
          },
          {
            key: 'success',
            label: 'Success Notification',
            description: 'Thông báo thành công',
            cssVar: '--success',
            defaultLight: '#10b981',
            defaultDark: '#10b981',
            category: 'status',
          },
          {
            key: 'warning',
            label: 'Warning Notification',
            description: 'Thông báo cảnh báo',
            cssVar: '--warning',
            defaultLight: '#f59e0b',
            defaultDark: '#f59e0b',
            category: 'status',
          },
          {
            key: 'error',
            label: 'Error Notification',
            description: 'Thông báo lỗi',
            cssVar: '--error',
            defaultLight: '#ef4444',
            defaultDark: '#ef4444',
            category: 'status',
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

