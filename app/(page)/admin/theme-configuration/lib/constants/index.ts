import { type ThemeColors } from '../api/theme';
import { getAllPages as getAllPagesFromStructure } from '../themeStructure';

// Re-export constants from theme structure
export {
  studentPagesTheme,
  globalThemeConfig,
  getAllPages,
  getPageById,
  getAllColorKeys,
  getColorConfigByKey,
} from '../themeStructure';

/**
 * Generate complete ThemeColors object with all required fields from themeStructure
 * This ensures no field is missing when creating a theme
 */
export function getCompleteThemeColors(isDarkMode: boolean = false): ThemeColors {
  const allPages = getAllPagesFromStructure();
  
  const colors: Record<string, string> = {};
  
  // Extract all colors from all pages and sections
  allPages.forEach((page: { sections: { colors: { key: string; defaultLight: string; defaultDark: string }[] }[] }) => {
    page.sections.forEach(section => {
      section.colors.forEach(color => {
        colors[color.key] = isDarkMode ? color.defaultDark : color.defaultLight;
      });
    });
  });
  
  // Ensure ALL required fields are present with fallback defaults
  const completeColors: ThemeColors = {
    // Base Colors
    background: colors.background || '#ffffff',
    foreground: colors.foreground || '#0f172a',
    card: colors.card || colors.cardBg || '#ffffff',
    cardForeground: colors.cardForeground || colors.textPrimary || '#0f172a',
    popover: colors.popover || '#ffffff',
    popoverForeground: colors.popoverForeground || '#0f172a',
    
    // Primary Colors
    primary: colors.primary || '#4E8EE1',
    primaryForeground: colors.primaryForeground || '#ffffff',
    primaryHover: colors.primaryHover || '#3d7bc9',
    primaryLight: colors.primaryLight || '#e3f2fd',
    
    // Secondary Colors
    secondary: colors.secondary || '#64748b',
    secondaryForeground: colors.secondaryForeground || '#ffffff',
    secondaryHover: colors.secondaryHover || '#475569',
    
    // Accent Colors
    accent: colors.accent || '#f5f5f5',
    accentForeground: colors.accentForeground || '#1e293b',
    accentHover: colors.accentHover || '#e5e5e5',
    
    // Muted Colors
    muted: colors.muted || '#f1f5f9',
    mutedForeground: colors.mutedForeground || '#64748b',
    mutedHover: colors.mutedHover || '#e2e8f0',
    
    // Status Colors
    success: colors.success || '#10b981',
    successForeground: colors.successForeground || '#ffffff',
    successLight: colors.successLight || '#d1fae5',
    warning: colors.warning || '#f59e0b',
    warningForeground: colors.warningForeground || '#ffffff',
    warningLight: colors.warningLight || '#fed7aa',
    error: colors.error || '#ef4444',
    errorForeground: colors.errorForeground || '#ffffff',
    errorLight: colors.errorLight || '#fee2e2',
    info: colors.info || '#3b82f6',
    infoForeground: colors.infoForeground || '#ffffff',
    infoLight: colors.infoLight || '#dbeafe',
    
    // Destructive Colors
    destructive: colors.destructive || '#ef4444',
    destructiveForeground: colors.destructiveForeground || '#ffffff',
    destructiveHover: colors.destructiveHover || '#dc2626',
    
    // Border & Input
    border: colors.border || '#e2e8f0',
    input: colors.input || '#e2e8f0',
    ring: colors.ring || '#4E8EE1',
    focusRing: colors.focusRing || '#4E8EE1',
    
    // Chart Colors
    chart1: colors.chart1 || '#3b82f6',
    chart2: colors.chart2 || '#10b981',
    chart3: colors.chart3 || '#f59e0b',
    chart4: colors.chart4 || '#ef4444',
    chart5: colors.chart5 || '#8b5cf6',
    chart6: colors.chart6 || '#ec4899',
    chart7: colors.chart7 || '#f87171',
    chart8: colors.chart8 || '#c4b5fd',
    
    // Chart Color Groups - Simplified (recommended)
    chartPrimary: colors.chartPrimary || colors.chart6 || '#ec4899',
    chartSecondary: colors.chartSecondary || colors.chart8 || '#c4b5fd',
    chartBackground: colors.chartBackground || '#c9c7c7',
    
    // Sidebar Colors
    sidebar: colors.sidebar || '#f8fafc',
    sidebarForeground: colors.sidebarForeground || '#0f172a',
    sidebarPrimary: colors.sidebarPrimary || '#1e293b',
    sidebarPrimaryForeground: colors.sidebarPrimaryForeground || '#f8fafc',
    sidebarBorder: colors.sidebarBorder || '#e2e8f0',
    sidebarRing: colors.sidebarRing || '#4E8EE1',
    sidebarItemText: colors.sidebarItemText || '#0f172a',
    sidebarItemTextActive: colors.sidebarItemTextActive || '#f8fafc',
    sidebarHover: colors.sidebarHover || '#f1f5f9',
    
    // Header Colors
    header: colors.header || '#ffffff',
    headerForeground: colors.headerForeground || '#0f172a',
    headerBorder: colors.headerBorder || '#e2e8f0',
    
    // Text Colors
    textPrimary: colors.textPrimary || '#0f172a',
    textSecondary: colors.textSecondary || '#64748b',
    textMuted: colors.textMuted || '#94a3b8',
    textDisabled: colors.textDisabled || '#cbd5e1',
    
    // Background Variants
    bgPrimary: colors.bgPrimary || '#ffffff',
    bgSecondary: colors.bgSecondary || '#f8fafc',
    bgTertiary: colors.bgTertiary || '#f1f5f9',
    bgHover: colors.bgHover || '#f1f5f9',
    bgActive: colors.bgActive || '#e2e8f0',
    
    // Component Specific Colors
    buttonPrimary: colors.buttonPrimary || colors.primary || '#4E8EE1',
    buttonPrimaryHover: colors.buttonPrimaryHover || colors.primaryHover || '#3d7bc9',
    buttonSecondary: colors.buttonSecondary || '#64748b',
    buttonSecondaryHover: colors.buttonSecondaryHover || '#475569',
    
    inputBg: colors.inputBg || '#ffffff',
    inputBorder: colors.inputBorder || '#e2e8f0',
    inputFocus: colors.inputFocus || '#4E8EE1',
    
    cardBg: colors.cardBg || '#ffffff',
    cardBorder: colors.cardBorder || '#e2e8f0',
    cardShadow: colors.cardShadow || '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    
    // Badge Colors (for Notification Page unread counts)
    badgeBg: colors.badgeBg || '#ef4444',
    badgeText: colors.badgeText || '#ffffff',
    badgeActiveBg: colors.badgeActiveBg || '#ffffff',
    badgeActiveText: colors.badgeActiveText || '#ef4444',
    
    // Notification Page Colors - Event Type
    notificationEventBg: colors.notificationEventBg || '#fef3c7',
    notificationEventIcon: colors.notificationEventIcon || '#d97706',
    notificationEventBorder: colors.notificationEventBorder || '#d97706',
    
    // Notification Page Colors - Tuition Type
    notificationTuitionBg: colors.notificationTuitionBg || '#fef3c7',
    notificationTuitionIcon: colors.notificationTuitionIcon || '#f59e0b',
    notificationTuitionBorder: colors.notificationTuitionBorder || '#f59e0b',
    
    // Notification Page Colors - Schedule Type
    notificationScheduleBg: colors.notificationScheduleBg || '#dbeafe',
    notificationScheduleIcon: colors.notificationScheduleIcon || '#3b82f6',
    notificationScheduleBorder: colors.notificationScheduleBorder || '#3b82f6',
    
    // Notification Page Colors - Important Type
    notificationImportantBg: colors.notificationImportantBg || '#fee2e2',
    notificationImportantIcon: colors.notificationImportantIcon || '#ef4444',
    notificationImportantBorder: colors.notificationImportantBorder || '#ef4444',
    
    // Dashboard Event Card Colors
    eventBorder: colors.eventBorder || '#2563eb',
    eventDotBorder: colors.eventDotBorder || 'rgba(30, 58, 138, 0.9)',
    eventTitle: colors.eventTitle || 'rgba(30, 58, 138, 0.9)',
    eventContent: colors.eventContent || '#9ca3af',
    eventMeta: colors.eventMeta || '#1f2937',
    eventTimeline: colors.eventTimeline || '#9ca3af',
    
    // Dashboard ClassList Card Colors
    classlistBorder: colors.classlistBorder || '#1d4ed8',
    classlistTitle: colors.classlistTitle || 'rgba(30, 58, 138, 0.9)',
    classlistBadgeBg: colors.classlistBadgeBg || '#f3f4f6',
    classlistBadgeText: colors.classlistBadgeText || '#6b7280',
    classlistText: colors.classlistText || '#4b5563',
    classlistIcon: colors.classlistIcon || '#9ca3af',
    classlistEmptyBorder: colors.classlistEmptyBorder || '#d1d5db',
    classlistEmptyBg: colors.classlistEmptyBg || '#f9fafb',
    classlistEmptyText: colors.classlistEmptyText || '#6b7280',
    classlistEmptyIcon: colors.classlistEmptyIcon || '#9ca3af',
    
    // Schedule Page Colors - Weekly View
    scheduleHeaderBg: colors.scheduleHeaderBg || '#4E8EE1',
    scheduleHeaderText: colors.scheduleHeaderText || '#ffffff',
    scheduleTheoryBg: colors.scheduleTheoryBg || '#dbeafe',
    scheduleTheoryBgHover: colors.scheduleTheoryBgHover || '#3b82f6',
    scheduleTheoryBorder: colors.scheduleTheoryBorder || '#4E8EE1',
    schedulePracticeBg: colors.schedulePracticeBg || '#fee2e2',
    schedulePracticeBgHover: colors.schedulePracticeBgHover || '#ef4444',
    schedulePracticeBorder: colors.schedulePracticeBorder || '#ef4444',
    scheduleCellText: colors.scheduleCellText || '#1f2937',
    schedulePrintBg: colors.schedulePrintBg || '#4E8EE1',
    schedulePrintBgHover: colors.schedulePrintBgHover || '#3d7bc9',
    schedulePrintText: colors.schedulePrintText || '#ffffff',
    scheduleEmptyBg: colors.scheduleEmptyBg || '#f9fafb',
    scheduleEmptyBorder: colors.scheduleEmptyBorder || '#e5e7eb',
    
    // Grades Page Colors - Overview Cards
    gradeCardGpaBg: colors.gradeCardGpaBg || 'linear-gradient(to bottom right, #ffedd5, #fed7aa)',
    gradeCardGpaBorder: colors.gradeCardGpaBorder || '#fdba74',
    gradeCardCreditBg: colors.gradeCardCreditBg || 'linear-gradient(to bottom right, #fce7f3, #fbcfe8)',
    gradeCardCreditBorder: colors.gradeCardCreditBorder || '#f9a8d4',
    gradeCardCourseBg: colors.gradeCardCourseBg || 'linear-gradient(to bottom right, #ccfbf1, #99f6e4)',
    gradeCardCourseBorder: colors.gradeCardCourseBorder || '#5eead4',
    
    // Grades Page Colors - Filter & Export
    gradeFilterSelectBg: colors.gradeFilterSelectBg || '#0053AD',
    gradeFilterSelectHover: colors.gradeFilterSelectHover || '#003d82',
    gradeFilterCheckboxBg: colors.gradeFilterCheckboxBg || '#0053AD',
    gradeFilterCheckboxBorder: colors.gradeFilterCheckboxBorder || '#0053AD',
    gradeExportBg: colors.gradeExportBg || '#0053AD',
    gradeExportHover: colors.gradeExportHover || '#003d82',
    
    // Grades Page Colors - Table
    gradeSemesterHeaderBg: colors.gradeSemesterHeaderBg || '#ADD8E6',
    gradeTableHeaderBg: colors.gradeTableHeaderBg || '#0053AD',
    gradeTableHeaderText: colors.gradeTableHeaderText || '#ffffff',
    gradePassText: colors.gradePassText || '#16a34a',
    gradeFailText: colors.gradeFailText || '#dc2626',
    
    // Grades Page Colors - Summary
    gradeSummaryBg: colors.gradeSummaryBg || '#E8E8E8',
    gradeSummaryHighlight: colors.gradeSummaryHighlight || '#4196F0',
    gradeClassExcellentBg: colors.gradeClassExcellentBg || '#facc15',
    gradeClassGoodBg: colors.gradeClassGoodBg || '#22c55e',
    gradeClassFairBg: colors.gradeClassFairBg || '#3b82f6',
    gradeClassAverageBg: colors.gradeClassAverageBg || '#f97316',
    gradeClassWeakBg: colors.gradeClassWeakBg || '#ef4444',
    
    // Grades Page Colors - Modal
    gradeModalHeaderBg: colors.gradeModalHeaderBg || 'linear-gradient(to right, #0053AD, #003d82)',
    gradeModalCloseBtn: colors.gradeModalCloseBtn || '#0053AD',
    gradeModalCloseBtnHover: colors.gradeModalCloseBtnHover || '#003d82',
  };
  
  return completeColors;
}

