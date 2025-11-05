import { api as apiClient } from '@/lib/api/client';

// Theme API Types
export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  secondaryForeground: string;
  secondaryHover: string;
  accent: string;
  accentForeground: string;
  accentHover: string;
  muted: string;
  mutedForeground: string;
  mutedHover: string;
  success: string;
  successForeground: string;
  successLight: string;
  warning: string;
  warningForeground: string;
  warningLight: string;
  error: string;
  errorForeground: string;
  errorLight: string;
  info: string;
  infoForeground: string;
  infoLight: string;
  destructive: string;
  destructiveForeground: string;
  destructiveHover: string;
  border: string;
  input: string;
  ring: string;
  focusRing: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
  chart7: string;
  chart8: string;
  // Chart Color Groups - Simplified
  chartPrimary: string;
  chartSecondary: string;
  chartBackground: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  sidebarItemText: string;
  sidebarItemTextActive: string;
  sidebarHover: string;
  header: string;
  headerForeground: string;
  headerBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgHover: string;
  bgActive: string;
  buttonPrimary: string;
  buttonPrimaryHover: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  inputBg: string;
  inputBorder: string;
  inputFocus: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  // Badge Colors (for Notification Page)
  badgeBg: string;
  badgeText: string;
  badgeActiveBg: string;
  badgeActiveText: string;
  // Notification Page Colors - Event Type
  notificationEventBg: string;
  notificationEventIcon: string;
  notificationEventBorder: string;
  // Notification Page Colors - Tuition Type
  notificationTuitionBg: string;
  notificationTuitionIcon: string;
  notificationTuitionBorder: string;
  // Notification Page Colors - Schedule Type
  notificationScheduleBg: string;
  notificationScheduleIcon: string;
  notificationScheduleBorder: string;
  // Notification Page Colors - Important Type
  notificationImportantBg: string;
  notificationImportantIcon: string;
  notificationImportantBorder: string;
  // Notification Card Colors
  notificationCardUnreadBg: string;
  notificationCardReadBg: string;
  notificationCardUnreadBorder: string;
  // Dashboard Event Card Colors
  eventBorder: string;
  eventDotBorder: string;
  eventTitle: string;
  eventContent: string;
  eventMeta: string;
  eventTimeline: string;
  // Dashboard ClassList Card Colors
  classlistBorder: string;
  classlistTitle: string;
  classlistBadgeBg: string;
  classlistBadgeText: string;
  classlistText: string;
  classlistIcon: string;
  classlistEmptyBorder: string;
  classlistEmptyBg: string;
  classlistEmptyText: string;
  classlistEmptyIcon: string;
  // Schedule Page Colors - Weekly View
  scheduleHeaderBg: string;
  scheduleHeaderText: string;
  scheduleTheoryBg: string;
  scheduleTheoryBgHover: string;
  scheduleTheoryBorder: string;
  schedulePracticeBg: string;
  schedulePracticeBgHover: string;
  schedulePracticeBorder: string;
  scheduleCellText: string;
  schedulePrintBg: string;
  schedulePrintBgHover: string;
  schedulePrintText: string;
  scheduleEmptyBg: string;
  scheduleEmptyBorder: string;
  // Grades Page Colors - Overview Cards
  gradeCardGpaBg: string;
  gradeCardGpaBorder: string;
  gradeCardCreditBg: string;
  gradeCardCreditBorder: string;
  gradeCardCourseBg: string;
  gradeCardCourseBorder: string;
  // Grades Page Colors - Filter & Export
  gradeFilterSelectBg: string;
  gradeFilterSelectHover: string;
  gradeFilterCheckboxBg: string;
  gradeFilterCheckboxBorder: string;
  gradeExportBg: string;
  gradeExportHover: string;
  // Grades Page Colors - Table
  gradeSemesterHeaderBg: string;
  gradeTableHeaderBg: string;
  gradeTableHeaderText: string;
  gradePassText: string;
  gradeFailText: string;
  // Grades Page Colors - Summary
  gradeSummaryBg: string;
  gradeSummaryHighlight: string;
  gradeClassExcellentBg: string;
  gradeClassGoodBg: string;
  gradeClassFairBg: string;
  gradeClassAverageBg: string;
  gradeClassWeakBg: string;
  // Grades Page Colors - Modal
  gradeModalHeaderBg: string;
  gradeModalCloseBtn: string;
  gradeModalCloseBtnHover: string;
}

export interface ThemeConfig {
  themeConfigId: string;
  themeName: string;
  description?: string;
  createdByAdminId: string;
  scopeType: 'global' | 'page' | 'component';
  scopeTarget?: string;
  colors: ThemeColors;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateThemeRequest {
  themeName: string;
  description?: string;
  scopeType: 'global' | 'page' | 'component';
  scopeTarget?: string;
  colors: ThemeColors;
}

export interface UpdateThemeRequest {
  themeName?: string;
  description?: string;
  scopeType?: string;
  scopeTarget?: string;
  colors?: Partial<ThemeColors>;
}

export interface ApplyThemeRequest {
  themeConfigId: string;
  changeReason?: string;
}

export interface ThemeFilterParams {
  scopeType?: string;
  scopeTarget?: string;
  isActive?: boolean;
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
}

const executeApiCall = async <T>(apiCall: () => Promise<{ data: { data: T } }>): Promise<T> => {
  const response = await apiCall();
  return response.data.data;
};

export const themeApi = {
  getList: (params?: ThemeFilterParams): Promise<{ data: ThemeConfig[]; totalCount?: number }> =>
    executeApiCall(() => apiClient.get('/v1/theme', { params })),

  getById: (id: string): Promise<ThemeConfig> =>
    executeApiCall(() => apiClient.get(`/v1/theme/${id}`)),

  getActive: (scopeType: string = 'global', scopeTarget?: string): Promise<ThemeConfig> =>
    executeApiCall(() => apiClient.get('/v1/theme/active', { params: { scopeType, scopeTarget } })),

  create: (data: CreateThemeRequest): Promise<ThemeConfig> =>
    executeApiCall(() => apiClient.post('/v1/theme', data)),

  update: (id: string, data: UpdateThemeRequest): Promise<ThemeConfig> =>
    executeApiCall(() => apiClient.put(`/v1/theme/${id}`, data)),

  delete: (id: string): Promise<void> =>
    executeApiCall(() => apiClient.delete(`/v1/theme/${id}`)),

  apply: (data: ApplyThemeRequest): Promise<ThemeConfig> =>
    executeApiCall(() => apiClient.post('/v1/theme/apply', data)),

  getHistory: (id: string, limit: number = 50): Promise<ThemeConfig[]> =>
    executeApiCall(() => apiClient.get(`/v1/theme/${id}/history`, { params: { limit } })),
};

