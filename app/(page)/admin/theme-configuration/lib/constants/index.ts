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
    chart7: colors.chart7 || '#14b8a6',
    chart8: colors.chart8 || '#f97316',
    
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
  };
  
  return completeColors;
}

