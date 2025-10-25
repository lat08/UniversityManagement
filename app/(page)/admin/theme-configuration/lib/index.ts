// API exports
export { themeApi } from './api/theme';
export type {
  ThemeColors,
  ThemeConfig,
  CreateThemeRequest,
  UpdateThemeRequest,
  ApplyThemeRequest,
  ThemeFilterParams,
} from './api/theme';

// Hooks exports
export { useThemeSignalR } from './hooks/useThemeSignalR';

// Store exports
export { useThemeStore, themeUtils } from './store/themeStore';
export type { ThemeState } from './store/themeStore';

// Types exports
export type { ColorConfig, PageThemeConfig, ThemeSection } from './types';

// Constants/Utils exports
export {
  studentPagesTheme,
  globalThemeConfig,
  getAllPages,
  getPageById,
  getAllColorKeys,
  getColorConfigByKey,
} from './constants';

