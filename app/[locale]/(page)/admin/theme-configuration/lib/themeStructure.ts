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

const createColorConfig = (
  key: string,
  label: string,
  description: string,
  cssVar: string,
  defaultLight: string,
  defaultDark: string,
  category: ColorConfig['category']
): ColorConfig => ({
  key,
  label,
  description,
  cssVar,
  defaultLight,
  defaultDark,
  category,
});

const createNotificationColors = (
  type: string,
  label: string,
  bgLight: string,
  bgDark: string,
  iconLight: string,
  iconDark: string
): ColorConfig[] => [
  createColorConfig(
    `notification${type}Bg`,
    `${label} Background`,
    `Màu nền icon box cho thông báo ${label}`,
    `--notification-${type.toLowerCase()}-bg`,
    bgLight,
    bgDark,
    'component'
  ),
  createColorConfig(
    `notification${type}Icon`,
    `${label} Icon`,
    `Màu icon cho thông báo ${label}`,
    `--notification-${type.toLowerCase()}-icon`,
    iconLight,
    iconDark,
    'component'
  ),
  createColorConfig(
    `notification${type}Border`,
    `${label} Border`,
    `Màu viền icon box cho thông báo ${label}`,
    `--notification-${type.toLowerCase()}-border`,
    iconLight,
    iconDark,
    'component'
  ),
];

const createEventCardColors = (): ColorConfig[] => [
  createColorConfig('eventBorder', 'Event Border', 'Màu viền của event card', '--event-border', '#2563eb', '#60a5fa', 'component'),
  createColorConfig('eventDotBorder', 'Event Dot Border', 'Màu viền của dot trên timeline', '--event-dot-border', 'rgba(30, 58, 138, 0.9)', 'rgba(96, 165, 250, 0.9)', 'component'),
  createColorConfig('eventTitle', 'Event Title', 'Màu tiêu đề của event', '--event-title', 'rgba(30, 58, 138, 0.9)', 'rgba(96, 165, 250, 0.9)', 'text'),
  createColorConfig('eventContent', 'Event Content', 'Màu nội dung mô tả event', '--event-content', '#9ca3af', '#94a3b8', 'text'),
  createColorConfig('eventMeta', 'Event Metadata', 'Màu cho location và time (MapPin, Clock)', '--event-meta', '#1f2937', '#cbd5e1', 'text'),
  createColorConfig('eventTimeline', 'Event Timeline Line', 'Màu đường timeline dọc', '--event-timeline', '#9ca3af', '#94a3b8', 'background'),
];

const createClassListCardColors = (): ColorConfig[] => [
  createColorConfig('classlistBorder', 'ClassList Border', 'Màu viền của class card', '--classlist-border', '#1d4ed8', '#3b82f6', 'component'),
  createColorConfig('classlistTitle', 'ClassList Title', 'Màu tiêu đề môn học', '--classlist-title', 'rgba(30, 58, 138, 0.9)', 'rgba(96, 165, 250, 0.9)', 'text'),
  createColorConfig('classlistBadgeBg', 'ClassList Badge Background', 'Màu nền badge mã môn học', '--classlist-badge-bg', '#f3f4f6', '#334155', 'background'),
  createColorConfig('classlistBadgeText', 'ClassList Badge Text', 'Màu chữ badge mã môn học', '--classlist-badge-text', '#6b7280', '#94a3b8', 'text'),
  createColorConfig('classlistText', 'ClassList Text', 'Màu chữ thông tin lớp (instructor, schedule)', '--classlist-text', '#4b5563', '#94a3b8', 'text'),
  createColorConfig('classlistIcon', 'ClassList Icon', 'Màu icon (User, Clock)', '--classlist-icon', '#9ca3af', '#64748b', 'component'),
  createColorConfig('classlistEmptyBorder', 'Empty State Border', 'Màu viền khi không có lớp', '--classlist-empty-border', '#d1d5db', '#475569', 'background'),
  createColorConfig('classlistEmptyBg', 'Empty State Background', 'Màu nền khi không có lớp', '--classlist-empty-bg', '#f9fafb', '#1e293b', 'background'),
  createColorConfig('classlistEmptyText', 'Empty State Text', 'Màu chữ khi không có lớp', '--classlist-empty-text', '#6b7280', '#94a3b8', 'text'),
  createColorConfig('classlistEmptyIcon', 'Empty State Icon', 'Màu icon khi không có lớp', '--classlist-empty-icon', '#9ca3af', '#64748b', 'component'),
];

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
          createColorConfig('cardBg', 'Card Background', 'Màu nền của stat card', '--card-bg', '#ffffff', '#1e293b', 'background'),
          createColorConfig('cardBorder', 'Card Border', 'Màu viền của card', '--card-border', '#e2e8f0', '#334155', 'background'),
          createColorConfig('textPrimary', 'Text Primary', 'Màu chữ chính', '--text-primary', '#0f172a', '#f8fafc', 'text'),
          createColorConfig('textSecondary', 'Text Secondary', 'Màu chữ phụ', '--text-secondary', '#64748b', '#94a3b8', 'text'),
        ],
      },
      {
        sectionId: 'charts',
        sectionName: 'Biểu Đồ (Charts)',
        description: 'Màu sắc cho tất cả biểu đồ - chỉnh một lần áp dụng cho tất cả',
        colors: [
          createColorConfig('chartPrimary', 'Chart Primary (Màu Chính)', 'Màu chính cho column chart (bar) và phần đã hoàn thành trong donut chart', '--chart-primary', '#ec4899', '#f472b6', 'component'),
          createColorConfig('chartSecondary', 'Chart Secondary (Màu Phụ)', 'Màu phụ cho donut chart (phần còn lại)', '--chart-secondary', '#c4b5fd', '#c4b5fd', 'component'),
          createColorConfig('chartBackground', 'Chart Background (Màu Đằng Sau)', 'Màu background/đằng sau cho column chart', '--chart-background', '#c9c7c7', '#94a3b8', 'component'),
          createColorConfig('chartTooltipBg', 'Chart Tooltip Background', 'Màu nền của tooltip khi hover vào biểu đồ', '--chart-tooltip-bg', '#ffffff', '#1e293b', 'component'),
          createColorConfig('chartTooltipText', 'Chart Tooltip Text', 'Màu chữ trong tooltip khi hover vào biểu đồ', '--chart-tooltip-text', '#0f172a', '#f8fafc', 'text'),
        ],
      },
      {
        sectionId: 'events-classes',
        sectionName: 'Events & Classes',
        description: 'Các thẻ sự kiện và danh sách lớp học',
        colors: [
          createColorConfig('infoLight', 'Info Light', 'Màu nền nhạt cho Info (StatCard background)', '--info-light', '#dbeafe', '#1e3a8a', 'status'),
          createColorConfig('errorLight', 'Error Light', 'Màu nền nhạt cho Error (StatCard background)', '--error-light', '#fee2e2', '#7f1d1d', 'status'),
        ],
      },
      {
        sectionId: 'event-card',
        sectionName: 'Event Card (Sự Kiện)',
        description: 'Màu sắc cho component EventCard - Timeline events',
        colors: createEventCardColors(),
      },
      {
        sectionId: 'classlist-card',
        sectionName: 'ClassList Card (Lớp Học)',
        description: 'Màu sắc cho component ClassListCard - Danh sách lớp học',
        colors: createClassListCardColors(),
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
        sectionId: 'schedule-weekly-header',
        sectionName: 'TKB Tuần - Header & Navigation',
        description: 'Màu cho header, ngày tháng, tiết học, nút điều hướng (weekly)',
        colors: [
          {
            key: 'scheduleHeaderBg',
            label: 'Header Background',
            description: 'Màu nền header ngày/tiết (Primary)',
            cssVar: '--schedule-header-bg',
            defaultLight: '#4E8EE1',
            defaultDark: '#4E8EE1',
            category: 'component',
          },
          {
            key: 'scheduleHeaderText',
            label: 'Header Text',
            description: 'Màu chữ trên header',
            cssVar: '--schedule-header-text',
            defaultLight: '#ffffff',
            defaultDark: '#ffffff',
            category: 'text',
          },
        ],
      },
      {
        sectionId: 'schedule-weekly-cells',
        sectionName: 'TKB Tuần - Ô Lịch Học',
        description: 'Màu cho các ô lịch tiết lý thuyết và thực hành (weekly)',
        colors: [
          {
            key: 'scheduleTheoryBg',
            label: 'Tiết Lý Thuyết - Màu Nền',
            description: 'Màu nền ô lịch tiết lý thuyết',
            cssVar: '--schedule-theory-bg',
            defaultLight: '#dbeafe',
            defaultDark: '#1e3a8a',
            category: 'component',
          },
          {
            key: 'scheduleTheoryBgHover',
            label: 'Tiết Lý Thuyết - Màu Hover',
            description: 'Màu nền ô lịch khi hover (lý thuyết)',
            cssVar: '--schedule-theory-bg-hover',
            defaultLight: '#3b82f6',
            defaultDark: '#2563eb',
            category: 'component',
          },
          {
            key: 'scheduleTheoryBorder',
            label: 'Tiết Lý Thuyết - Viền',
            description: 'Màu viền ô lịch lý thuyết',
            cssVar: '--schedule-theory-border',
            defaultLight: '#4E8EE1',
            defaultDark: '#4E8EE1',
            category: 'component',
          },
          {
            key: 'schedulePracticeBg',
            label: 'Tiết Thực Hành - Màu Nền',
            description: 'Màu nền ô lịch tiết thực hành',
            cssVar: '--schedule-practice-bg',
            defaultLight: '#fee2e2',
            defaultDark: '#7f1d1d',
            category: 'component',
          },
          {
            key: 'schedulePracticeBgHover',
            label: 'Tiết Thực Hành - Màu Hover',
            description: 'Màu nền ô lịch khi hover (thực hành)',
            cssVar: '--schedule-practice-bg-hover',
            defaultLight: '#ef4444',
            defaultDark: '#dc2626',
            category: 'component',
          },
          {
            key: 'schedulePracticeBorder',
            label: 'Tiết Thực Hành - Viền',
            description: 'Màu viền ô lịch thực hành',
            cssVar: '--schedule-practice-border',
            defaultLight: '#ef4444',
            defaultDark: '#ef4444',
            category: 'component',
          },
          {
            key: 'scheduleCellText',
            label: 'Text trong ô lịch',
            description: 'Màu chữ trong ô lịch học',
            cssVar: '--schedule-cell-text',
            defaultLight: '#1f2937',
            defaultDark: '#f9fafb',
            category: 'text',
          },
        ],
      },
      {
        sectionId: 'schedule-weekly-print',
        sectionName: 'TKB Tuần - Nút In',
        description: 'Màu cho nút in ở trang lịch theo tuần (weekly)',
        colors: [
          {
            key: 'schedulePrintBg',
            label: 'Nút In - Background',
            description: 'Màu nền nút in (weekly)',
            cssVar: '--schedule-print-bg',
            defaultLight: '#4E8EE1',
            defaultDark: '#4E8EE1',
            category: 'component',
          },
          {
            key: 'schedulePrintBgHover',
            label: 'Nút In - Hover',
            description: 'Màu nền nút in khi hover (weekly)',
            cssVar: '--schedule-print-bg-hover',
            defaultLight: '#3d7bc9',
            defaultDark: '#3d7bc9',
            category: 'component',
          },
          {
            key: 'schedulePrintText',
            label: 'Nút In - Text',
            description: 'Màu chữ nút in (weekly)',
            cssVar: '--schedule-print-text',
            defaultLight: '#ffffff',
            defaultDark: '#ffffff',
            category: 'text',
          },
        ],
      },
      {
        sectionId: 'schedule-weekly-empty',
        sectionName: 'TKB Tuần - Ô Trống',
        description: 'Màu nền cho các ô trống trong lịch (weekly)',
        colors: [
          {
            key: 'scheduleEmptyBg',
            label: 'Ô Trống - Background',
            description: 'Màu nền ô trống (không có lịch)',
            cssVar: '--schedule-empty-bg',
            defaultLight: '#f9fafb',
            defaultDark: '#1e293b',
            category: 'background',
          },
          {
            key: 'scheduleEmptyBorder',
            label: 'Ô Trống - Border',
            description: 'Màu viền ô trống',
            cssVar: '--schedule-empty-border',
            defaultLight: '#e5e7eb',
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
        sectionId: 'grade-overview-cards',
        sectionName: 'Thẻ Tổng Quan',
        description: 'Các thẻ hiển thị tổng quan điểm số (GPA, tín chỉ, môn hoàn thành)',
        colors: [
          {
            key: 'gradeCardGpaBg',
            label: 'Card GPA - Background',
            description: 'Màu nền card điểm trung bình',
            cssVar: '--grade-card-gpa-bg',
            defaultLight: 'linear-gradient(to bottom right, #ffedd5, #fed7aa)',
            defaultDark: 'linear-gradient(to bottom right, #7c2d12, #9a3412)',
            category: 'component',
          },
          {
            key: 'gradeCardGpaBorder',
            label: 'Card GPA - Border',
            description: 'Màu viền card điểm trung bình',
            cssVar: '--grade-card-gpa-border',
            defaultLight: '#fdba74',
            defaultDark: '#c2410c',
            category: 'component',
          },
          {
            key: 'gradeCardCreditBg',
            label: 'Card Tín Chỉ - Background',
            description: 'Màu nền card tổng tín chỉ',
            cssVar: '--grade-card-credit-bg',
            defaultLight: 'linear-gradient(to bottom right, #fce7f3, #fbcfe8)',
            defaultDark: 'linear-gradient(to bottom right, #831843, #9f1239)',
            category: 'component',
          },
          {
            key: 'gradeCardCreditBorder',
            label: 'Card Tín Chỉ - Border',
            description: 'Màu viền card tổng tín chỉ',
            cssVar: '--grade-card-credit-border',
            defaultLight: '#f9a8d4',
            defaultDark: '#be123c',
            category: 'component',
          },
          {
            key: 'gradeCardCourseBg',
            label: 'Card Môn Học - Background',
            description: 'Màu nền card môn đã hoàn thành',
            cssVar: '--grade-card-course-bg',
            defaultLight: 'linear-gradient(to bottom right, #ccfbf1, #99f6e4)',
            defaultDark: 'linear-gradient(to bottom right, #134e4a, #115e59)',
            category: 'component',
          },
          {
            key: 'gradeCardCourseBorder',
            label: 'Card Môn Học - Border',
            description: 'Màu viền card môn đã hoàn thành',
            cssVar: '--grade-card-course-border',
            defaultLight: '#5eead4',
            defaultDark: '#0f766e',
            category: 'component',
          },
        ],
      },
      {
        sectionId: 'grade-filter-export',
        sectionName: 'Bộ Lọc & Nút In',
        description: 'Màu cho dropdown lọc học kỳ và nút in bảng điểm',
        colors: [
          {
            key: 'gradeFilterSelectBg',
            label: 'Nút "Chọn tất cả" - Background',
            description: 'Màu nền nút "Chọn tất cả" trong dropdown',
            cssVar: '--grade-filter-select-bg',
            defaultLight: '#0053AD',
            defaultDark: '#0053AD',
            category: 'component',
          },
          {
            key: 'gradeFilterSelectHover',
            label: 'Nút "Chọn tất cả" - Hover',
            description: 'Màu hover nút "Chọn tất cả"',
            cssVar: '--grade-filter-select-hover',
            defaultLight: '#003d82',
            defaultDark: '#003d82',
            category: 'component',
          },
          {
            key: 'gradeFilterCheckboxBg',
            label: 'Checkbox - Background',
            description: 'Màu nền checkbox khi được chọn',
            cssVar: '--grade-filter-checkbox-bg',
            defaultLight: '#0053AD',
            defaultDark: '#0053AD',
            category: 'component',
          },
          {
            key: 'gradeFilterCheckboxBorder',
            label: 'Checkbox - Border',
            description: 'Màu viền checkbox khi được chọn',
            cssVar: '--grade-filter-checkbox-border',
            defaultLight: '#0053AD',
            defaultDark: '#0053AD',
            category: 'component',
          },
          {
            key: 'gradeExportBg',
            label: 'Nút In - Background',
            description: 'Màu nền nút in bảng điểm',
            cssVar: '--grade-export-bg',
            defaultLight: '#0053AD',
            defaultDark: '#0053AD',
            category: 'component',
          },
          {
            key: 'gradeExportHover',
            label: 'Nút In - Hover',
            description: 'Màu hover nút in bảng điểm',
            cssVar: '--grade-export-hover',
            defaultLight: '#003d82',
            defaultDark: '#003d82',
            category: 'component',
          },
        ],
      },
      {
        sectionId: 'grade-table',
        sectionName: 'Bảng Điểm Chi Tiết',
        description: 'Màu cho header và nội dung bảng điểm từng học kỳ',
        colors: [
          {
            key: 'gradeSemesterHeaderBg',
            label: 'Header Học Kỳ - Background',
            description: 'Màu nền header tên học kỳ',
            cssVar: '--grade-semester-header-bg',
            defaultLight: '#ADD8E6',
            defaultDark: '#1e3a5f',
            category: 'component',
          },
          {
            key: 'gradeTableHeaderBg',
            label: 'Header Bảng - Background',
            description: 'Màu nền header bảng điểm',
            cssVar: '--grade-table-header-bg',
            defaultLight: '#0053AD',
            defaultDark: '#0053AD',
            category: 'component',
          },
          {
            key: 'gradeTableHeaderText',
            label: 'Header Bảng - Text',
            description: 'Màu chữ trên header bảng',
            cssVar: '--grade-table-header-text',
            defaultLight: '#ffffff',
            defaultDark: '#ffffff',
            category: 'text',
          },
          {
            key: 'gradePassText',
            label: 'Điểm Đạt - Text',
            description: 'Màu chữ trạng thái "Đạt"',
            cssVar: '--grade-pass-text',
            defaultLight: '#16a34a',
            defaultDark: '#22c55e',
            category: 'status',
          },
          {
            key: 'gradeFailText',
            label: 'Điểm Không Đạt - Text',
            description: 'Màu chữ trạng thái "Không đạt"',
            cssVar: '--grade-fail-text',
            defaultLight: '#dc2626',
            defaultDark: '#ef4444',
            category: 'status',
          },
        ],
      },
      {
        sectionId: 'grade-summary',
        sectionName: 'Tổng Kết Học Kỳ',
        description: 'Màu cho phần tổng kết điểm mỗi học kỳ',
        colors: [
          {
            key: 'gradeSummaryBg',
            label: 'Tổng Kết - Background',
            description: 'Màu nền phần tổng kết',
            cssVar: '--grade-summary-bg',
            defaultLight: '#E8E8E8',
            defaultDark: '#1f2937',
            category: 'background',
          },
          {
            key: 'gradeSummaryHighlight',
            label: 'Tổng Kết - Số Liệu',
            description: 'Màu các số liệu (GPA, tín chỉ)',
            cssVar: '--grade-summary-highlight',
            defaultLight: '#4196F0',
            defaultDark: '#60a5fa',
            category: 'component',
          },
          {
            key: 'gradeClassExcellentBg',
            label: 'Xuất Sắc - Background',
            description: 'Màu nền badge "Xuất sắc"',
            cssVar: '--grade-class-excellent-bg',
            defaultLight: '#facc15',
            defaultDark: '#ca8a04',
            category: 'status',
          },
          {
            key: 'gradeClassGoodBg',
            label: 'Giỏi - Background',
            description: 'Màu nền badge "Giỏi"',
            cssVar: '--grade-class-good-bg',
            defaultLight: '#22c55e',
            defaultDark: '#16a34a',
            category: 'status',
          },
          {
            key: 'gradeClassFairBg',
            label: 'Khá - Background',
            description: 'Màu nền badge "Khá"',
            cssVar: '--grade-class-fair-bg',
            defaultLight: '#3b82f6',
            defaultDark: '#2563eb',
            category: 'status',
          },
          {
            key: 'gradeClassAverageBg',
            label: 'Trung Bình - Background',
            description: 'Màu nền badge "Trung bình"',
            cssVar: '--grade-class-average-bg',
            defaultLight: '#f97316',
            defaultDark: '#ea580c',
            category: 'status',
          },
          {
            key: 'gradeClassWeakBg',
            label: 'Yếu - Background',
            description: 'Màu nền badge "Yếu"',
            cssVar: '--grade-class-weak-bg',
            defaultLight: '#ef4444',
            defaultDark: '#dc2626',
            category: 'status',
          },
        ],
      },
      {
        sectionId: 'grade-detail-modal',
        sectionName: 'Modal Chi Tiết Điểm',
        description: 'Màu cho modal hiển thị chi tiết điểm thành phần',
        colors: [
          {
            key: 'gradeModalHeaderBg',
            label: 'Modal Header - Background',
            description: 'Màu nền header modal chi tiết',
            cssVar: '--grade-modal-header-bg',
            defaultLight: 'linear-gradient(to right, #0053AD, #003d82)',
            defaultDark: 'linear-gradient(to right, #1e3a8a, #1e40af)',
            category: 'component',
          },
          {
            key: 'gradeModalCloseBtn',
            label: 'Modal Nút Đóng - Background',
            description: 'Màu nền nút đóng modal',
            cssVar: '--grade-modal-close-btn',
            defaultLight: '#0053AD',
            defaultDark: '#0053AD',
            category: 'component',
          },
          {
            key: 'gradeModalCloseBtnHover',
            label: 'Modal Nút Đóng - Hover',
            description: 'Màu hover nút đóng modal',
            cssVar: '--grade-modal-close-btn-hover',
            defaultLight: '#003d82',
            defaultDark: '#003d82',
            category: 'component',
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
        colors: [],
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
        colors: [],
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
        colors: createNotificationColors('Event', 'Sự Kiện', '#fef3c7', '#78350f', '#d97706', '#fbbf24'),
      },
      {
        sectionId: 'notification-tuition',
        sectionName: 'Loại Thông Báo - Học Phí',
        description: 'Màu sắc cho thông báo loại Học Phí',
        colors: createNotificationColors('Tuition', 'Học Phí', '#fef3c7', '#78350f', '#f59e0b', '#fbbf24'),
      },
      {
        sectionId: 'notification-schedule',
        sectionName: 'Loại Thông Báo - Lịch Học',
        description: 'Màu sắc cho thông báo loại Lịch Học',
        colors: createNotificationColors('Schedule', 'Lịch Học', '#dbeafe', '#1e3a8a', '#3b82f6', '#60a5fa'),
      },
      {
        sectionId: 'notification-important',
        sectionName: 'Loại Thông Báo - Quan Trọng',
        description: 'Màu sắc cho thông báo loại Quan Trọng',
        colors: createNotificationColors('Important', 'Quan Trọng', '#fee2e2', '#7f1d1d', '#ef4444', '#f87171'),
      },
      {
        sectionId: 'notification-card',
        sectionName: 'Notification Card',
        description: 'Màu nền và border của thẻ thông báo',
        colors: [
          {
            key: 'notificationCardUnreadBg',
            label: 'Card Chưa Đọc - Background',
            description: 'Màu nền thông báo chưa đọc',
            cssVar: '--notification-card-unread-bg',
            defaultLight: '#e3f2fd',
            defaultDark: '#1e3a8a',
            category: 'component',
          },
          {
            key: 'notificationCardReadBg',
            label: 'Card Đã Đọc - Background',
            description: 'Màu nền thông báo đã đọc',
            cssVar: '--notification-card-read-bg',
            defaultLight: '#ffffff',
            defaultDark: '#1e293b',
            category: 'component',
          },
          {
            key: 'notificationCardUnreadBorder',
            label: 'Card Chưa Đọc - Border',
            description: 'Màu viền thông báo chưa đọc',
            cssVar: '--notification-card-unread-border',
            defaultLight: '#4E8EE1',
            defaultDark: '#4E8EE1',
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

