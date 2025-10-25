import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeColors {
  // Base Colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // Primary Colors
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  primaryLight: string;
  
  // Secondary Colors
  secondary: string;
  secondaryForeground: string;
  secondaryHover: string;
  
  // Accent Colors
  accent: string;
  accentForeground: string;
  accentHover: string;
  
  // Muted Colors
  muted: string;
  mutedForeground: string;
  mutedHover: string;
  
  // Status Colors
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
  
  // Destructive Colors
  destructive: string;
  destructiveForeground: string;
  destructiveHover: string;
  
  // Border & Input
  border: string;
  input: string;
  ring: string;
  focusRing: string;
  
  // Chart Colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
  chart7: string;
  chart8: string;
  
  // Sidebar Colors
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  sidebarItemText: string;
  sidebarItemTextActive: string;
  sidebarHover: string;
  
  // Header Colors
  header: string;
  headerForeground: string;
  headerBorder: string;
  
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  
  // Background Variants
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgHover: string;
  bgActive: string;
  
  // Component Specific Colors
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
  scopeType: 'global' | 'page' | 'component';
  scopeTarget?: string; // e.g., 'student-dashboard', 'header', 'sidebar'
  colors: ThemeColors;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ThemeState {
  // Current theme
  currentTheme: ThemeConfig | null;
  isDarkMode: boolean;
  
  // Theme configurations
  themes: ThemeConfig[];
  
  // Actions
  setCurrentTheme: (theme: ThemeConfig) => void;
  setDarkMode: (isDark: boolean) => void;
  updateThemeColors: (colors: Partial<ThemeColors>) => void;
  applyThemeToDocument: () => void;
  loadThemes: (themes: ThemeConfig[]) => void;
  addTheme: (theme: ThemeConfig) => void;
  updateTheme: (id: string, updates: Partial<ThemeConfig>) => void;
  deleteTheme: (id: string) => void;
  resetToDefault: () => void;
}

// Default theme colors (matching current globals.css)
const defaultThemeColors: ThemeColors = {
  // Base Colors
  background: 'oklch(1 0 0)',
  foreground: 'oklch(0.145 0 0)',
  card: 'oklch(1 0 0)',
  cardForeground: 'oklch(0.145 0 0)',
  popover: 'oklch(1 0 0)',
  popoverForeground: 'oklch(0.145 0 0)',
  
  // Primary Colors
  primary: '#4E8EE1',
  primaryForeground: '#ffffff',
  primaryHover: '#3d7bc9',
  primaryLight: '#e3f2fd',
  
  // Secondary Colors
  secondary: 'oklch(0.97 0 0)',
  secondaryForeground: 'oklch(0.205 0 0)',
  secondaryHover: 'oklch(0.94 0 0)',
  
  // Accent Colors
  accent: 'oklch(0.97 0 0)',
  accentForeground: 'oklch(0.205 0 0)',
  accentHover: 'oklch(0.94 0 0)',
  
  // Muted Colors
  muted: 'oklch(0.97 0 0)',
  mutedForeground: 'oklch(0.556 0 0)',
  mutedHover: 'oklch(0.94 0 0)',
  
  // Status Colors
  success: '#10b981',
  successForeground: '#ffffff',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorForeground: '#ffffff',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoForeground: '#ffffff',
  infoLight: '#dbeafe',
  
  // Destructive Colors
  destructive: 'oklch(0.577 0.245 27.325)',
  destructiveForeground: 'oklch(0.577 0.245 27.325)',
  destructiveHover: 'oklch(0.5 0.2 25)',
  
  // Border & Input
  border: 'oklch(0.922 0 0)',
  input: 'oklch(0.922 0 0)',
  ring: 'oklch(0.708 0 0)',
  focusRing: '#4E8EE1',
  
  // Chart Colors
  chart1: 'oklch(0.646 0.222 41.116)',
  chart2: 'oklch(0.6 0.118 184.704)',
  chart3: 'oklch(0.398 0.07 227.392)',
  chart4: 'oklch(0.828 0.189 84.429)',
  chart5: 'oklch(0.769 0.188 70.08)',
  chart6: '#8B5CF6',
  chart7: '#F87171',
  chart8: '#C4B5FD',
  
  // Sidebar Colors
  sidebar: 'oklch(0.985 0 0)',
  sidebarForeground: 'oklch(0.145 0 0)',
  sidebarPrimary: 'oklch(0.205 0 0)',
  sidebarPrimaryForeground: 'oklch(0.985 0 0)',
  sidebarBorder: 'oklch(0.922 0 0)',
  sidebarRing: 'oklch(0.708 0 0)',
  sidebarItemText: 'oklch(0.145 0 0)',
  sidebarItemTextActive: 'oklch(0.985 0 0)',
  sidebarHover: 'oklch(0.97 0 0)',
  
  // Header Colors
  header: 'oklch(1 0 0)',
  headerForeground: 'oklch(0.145 0 0)',
  headerBorder: 'oklch(0.922 0 0)',
  
  // Text Colors
  textPrimary: 'oklch(0.145 0 0)',
  textSecondary: 'oklch(0.556 0 0)',
  textMuted: 'oklch(0.708 0 0)',
  textDisabled: 'oklch(0.8 0 0)',
  
  // Background Variants
  bgPrimary: 'oklch(1 0 0)',
  bgSecondary: 'oklch(0.97 0 0)',
  bgTertiary: 'oklch(0.94 0 0)',
  bgHover: 'oklch(0.97 0 0)',
  bgActive: 'oklch(0.94 0 0)',
  
  // Component Specific Colors
  buttonPrimary: '#4E8EE1',
  buttonPrimaryHover: '#3d7bc9',
  buttonSecondary: 'oklch(0.97 0 0)',
  buttonSecondaryHover: 'oklch(0.94 0 0)',
  
  inputBg: 'oklch(1 0 0)',
  inputBorder: 'oklch(0.922 0 0)',
  inputFocus: '#4E8EE1',
  
  cardBg: 'oklch(1 0 0)',
  cardBorder: 'oklch(0.922 0 0)',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
};

const defaultTheme: ThemeConfig = {
  themeConfigId: 'default',
  themeName: 'Default Theme',
  description: 'Default theme for the application',
  scopeType: 'global',
  colors: defaultThemeColors,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTheme: defaultTheme,
      isDarkMode: false,
      themes: [defaultTheme],
      
      // Actions
      setCurrentTheme: (theme: ThemeConfig) => {
        set({ currentTheme: theme });
        get().applyThemeToDocument();
      },
      
      setDarkMode: (isDark: boolean) => {
        set({ isDarkMode: isDark });
        // Apply dark mode class to document
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      updateThemeColors: (colors: Partial<ThemeColors>) => {
        const { currentTheme } = get();
        if (currentTheme) {
          const updatedTheme = {
            ...currentTheme,
            colors: { ...currentTheme.colors, ...colors },
            updatedAt: new Date().toISOString(),
          };
          set({ currentTheme: updatedTheme });
          get().applyThemeToDocument();
        }
      },
      
      applyThemeToDocument: () => {
        const { currentTheme } = get();
        if (currentTheme && typeof document !== 'undefined') {
          const root = document.documentElement;
          const colors = currentTheme.colors;
          
          // Apply all color variables to CSS custom properties
          Object.entries(colors).forEach(([key, value]) => {
            const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVarName, value);
          });
        }
      },
      
      loadThemes: (themes: ThemeConfig[]) => {
        set({ themes });
        // Set the first active theme as current
        const activeTheme = themes.find(theme => theme.isActive);
        if (activeTheme) {
          get().setCurrentTheme(activeTheme);
        }
      },
      
      addTheme: (theme: ThemeConfig) => {
        const { themes } = get();
        set({ themes: [...themes, theme] });
      },
      
      updateTheme: (id: string, updates: Partial<ThemeConfig>) => {
        const { themes } = get();
        const updatedThemes = themes.map(theme =>
          theme.themeConfigId === id ? { ...theme, ...updates, updatedAt: new Date().toISOString() } : theme
        );
        set({ themes: updatedThemes });
        
        // If this is the current theme, update it
        const { currentTheme } = get();
        if (currentTheme?.themeConfigId === id) {
          const updatedCurrentTheme = updatedThemes.find(theme => theme.themeConfigId === id);
          if (updatedCurrentTheme) {
            get().setCurrentTheme(updatedCurrentTheme);
          }
        }
      },
      
      deleteTheme: (id: string) => {
        const { themes, currentTheme } = get();
        const updatedThemes = themes.filter(theme => theme.themeConfigId !== id);
        set({ themes: updatedThemes });
        
        // If deleted theme was current, switch to default
        if (currentTheme?.themeConfigId === id) {
          const defaultTheme = updatedThemes.find(theme => theme.themeConfigId === 'default') || updatedThemes[0];
          if (defaultTheme) {
            get().setCurrentTheme(defaultTheme);
          }
        }
      },
      
      resetToDefault: () => {
        get().setCurrentTheme(defaultTheme);
        get().setDarkMode(false);
      },
    }),
    {
      name: 'theme-store',
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        isDarkMode: state.isDarkMode,
        themes: state.themes,
      }),
    }
  )
);

// Utility functions for theme management
export const themeUtils = {
  // Convert theme colors to CSS variables format
  colorsToCSSVars: (colors: ThemeColors): Record<string, string> => {
    const cssVars: Record<string, string> = {};
    Object.entries(colors).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      cssVars[cssVarName] = value;
    });
    return cssVars;
  },
  
  // Generate theme preview
  generateThemePreview: (colors: ThemeColors) => {
    return {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      foreground: colors.foreground,
    };
  },
  
  // Validate color format
  isValidColor: (color: string): boolean => {
    // Check for hex, rgb, rgba, hsl, hsla, oklch formats
    const colorRegex = /^(#([0-9a-fA-F]{3}){1,2}|rgb\(|rgba\(|hsl\(|hsla\(|oklch\(|var\(--[a-zA-Z-]+\)\))$/;
    return colorRegex.test(color);
  },
};

