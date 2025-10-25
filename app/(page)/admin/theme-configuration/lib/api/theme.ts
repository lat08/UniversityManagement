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

// API Functions
export const themeApi = {
  // Get theme list
  getList: async (params?: ThemeFilterParams) => {
    const response = await apiClient.get('/v1/theme', { params });
    return response.data;
  },

  // Get theme by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/v1/theme/${id}`);
    return response.data;
  },

  // Get active theme
  getActive: async (scopeType: string = 'global', scopeTarget?: string) => {
    const response = await apiClient.get('/v1/theme/active', {
      params: { scopeType, scopeTarget }
    });
    return response.data;
  },

  // Create theme
  create: async (data: CreateThemeRequest) => {
    const response = await apiClient.post('/v1/theme', data);
    return response.data;
  },

  // Update theme
  update: async (id: string, data: UpdateThemeRequest) => {
    const response = await apiClient.put(`/v1/theme/${id}`, data);
    return response.data;
  },

  // Delete theme
  delete: async (id: string) => {
    const response = await apiClient.delete(`/v1/theme/${id}`);
    return response.data;
  },

  // Apply theme
  apply: async (data: ApplyThemeRequest) => {
    const response = await apiClient.post('/v1/theme/apply', data);
    return response.data;
  },

  // Get theme history
  getHistory: async (id: string, limit: number = 50) => {
    const response = await apiClient.get(`/v1/theme/${id}/history`, {
      params: { limit }
    });
    return response.data;
  },
};

