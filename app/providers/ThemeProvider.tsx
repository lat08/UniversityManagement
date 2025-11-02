"use client";

import React, { useEffect } from 'react';
import { useThemeStore } from '@/app/(page)/admin/theme-configuration/lib/store/themeStore';
import { useThemeSignalR } from '@/app/(page)/admin/theme-configuration/lib/hooks/useThemeSignalR';
import { themeApi } from '@/app/(page)/admin/theme-configuration/lib';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { 
    currentTheme, 
    isDarkMode, 
    applyThemeToDocument, 
    setDarkMode,
    setCurrentTheme 
  } = useThemeStore();
  
  // Initialize SignalR connection for real-time theme updates
  useThemeSignalR();

  // Load active theme from backend on mount - CRITICAL for theme sync
  useEffect(() => {
    let isMounted = true;
    
    const loadActiveTheme = async () => {
      try {
        const response = await themeApi.getActive('global');
        if (response.data && isMounted) {
          // Force update the theme from backend (overwrites persisted state)
          setCurrentTheme(response.data);
          console.log('[ThemeProvider] Loaded active theme from backend:', response.data.themeName);
        }
      } catch (error) {
        console.warn('[ThemeProvider] Failed to load active theme from backend, using persisted theme');
      }
    };
    
    loadActiveTheme();
    
    return () => {
      isMounted = false;
    };
  }, [setCurrentTheme]);

  useEffect(() => {
    applyThemeToDocument();
  }, [currentTheme, applyThemeToDocument]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set theme
      const hasManualTheme = localStorage.getItem('theme-store');
      if (!hasManualTheme) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setDarkMode]);

  return <>{children}</>;
}

// Hook for easy theme access
export function useTheme() {
  const store = useThemeStore();
  
  return {
    ...store,
    // Helper methods
    toggleDarkMode: () => store.setDarkMode(!store.isDarkMode),
    isCurrentTheme: (themeId: string) => store.currentTheme?.themeConfigId === themeId,
    getCurrentColors: () => store.currentTheme?.colors || {},
  };
}
