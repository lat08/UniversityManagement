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

  // Load active theme from backend on mount
  useEffect(() => {
    const loadActiveTheme = async () => {
      try {
        const response = await themeApi.getActive('global');
        if (response.data) {
          setCurrentTheme(response.data);
        }
      } catch (error) {
        // Continue with default theme from store
      }
    };
    
    loadActiveTheme();
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
