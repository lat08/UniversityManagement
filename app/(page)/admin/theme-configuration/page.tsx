"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useThemeStore } from '@/app/(page)/admin/theme-configuration/lib/store/themeStore';
import { themeApi, type ThemeConfig, type CreateThemeRequest } from './lib';
import { getAllPages, getCompleteThemeColors, type PageThemeConfig } from './lib';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PageThemeEditor } from './components/PageThemeEditor';

type ViewMode = 'pages' | 'themes';

export default function ThemeConfigurationPage() {
  const { 
    currentTheme, 
    updateThemeColors, 
    toggleDarkMode,
    isDarkMode
  } = useTheme();
  
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('pages');
  const [selectedPage, setSelectedPage] = useState<PageThemeConfig | null>(null);
  const [editingColors, setEditingColors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeDescription, setNewThemeDescription] = useState('');

  const allPages = getAllPages();

  // Fetch themes from API
  const { data: themesData, isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: () => themeApi.getList({ pageSize: 100 }),
  });

  // Create theme mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateThemeRequest) => themeApi.create(data),
    onSuccess: () => {
      toast.success('Tạo theme thành công!');
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      setIsCreating(false);
      setNewThemeName('');
      setNewThemeDescription('');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Lỗi khi tạo theme');
    },
  });

  // Apply theme mutation
  const applyMutation = useMutation({
    mutationFn: (themeConfigId: string) => 
      themeApi.apply({ themeConfigId, changeReason: 'Applied from admin panel' }),
    onSuccess: () => {
      toast.success('Áp dụng theme thành công! Theme đã được broadcast real-time.');
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Lỗi khi áp dụng theme');
    },
  });

  const pageUpdateMutation = useMutation({
    mutationFn: async (colors: Record<string, string>) => {
      const activeThemeResponse = await themeApi.getActive('global');
      const activeTheme = activeThemeResponse.data;
      
      if (!activeTheme?.themeConfigId) {
        throw new Error('No active theme found');
      }
      
      // Update theme - backend will merge colors automatically
      await themeApi.update(activeTheme.themeConfigId, { colors });
      
      // Apply theme to broadcast changes
      await themeApi.apply({ 
        themeConfigId: activeTheme.themeConfigId, 
        changeReason: 'Theme colors updated' 
      });
      
      return colors;
    },
    onSuccess: () => {
      toast.success('Cập nhật màu sắc thành công!');
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật màu sắc');
    },
  });

  const themes = themesData?.data?.data || [];

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) {
      toast.error('Vui lòng nhập tên theme');
      return;
    }

    const baseColors = getCompleteThemeColors(isDarkMode);
    
    const completeColors = { ...baseColors };
    if (currentTheme?.colors) {
      Object.keys(currentTheme.colors).forEach((key) => {
        const value = currentTheme.colors[key as keyof typeof currentTheme.colors];
        if (value !== null && value !== undefined && value !== '') {
          completeColors[key as keyof typeof completeColors] = value;
        }
      });
    }

    createMutation.mutate({
      themeName: newThemeName,
      description: newThemeDescription,
      scopeType: 'global',
      colors: completeColors,
    });
  };

  const handleApplyTheme = (themeConfigId: string) => {
    applyMutation.mutate(themeConfigId);
  };

  const handlePageColorChange = (key: string, value: string) => {
    setEditingColors(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Live preview
    document.documentElement.style.setProperty(
      `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, 
      value
    );
  };

  const handlePageSave = () => {
    if (!selectedPage) return;
    
    // Get only the colors that belong to this page
    const pageColors: Record<string, string> = {};
    selectedPage.sections.forEach(section => {
      section.colors.forEach(colorDef => {
        const value = editingColors[colorDef.key];
        if (value) {
          pageColors[colorDef.key] = value;
        }
      });
    });
    
    pageUpdateMutation.mutate(pageColors);
  };

  const handlePageReset = () => {
    if (currentTheme?.colors) {
      const colors = currentTheme.colors as unknown as Record<string, string>;
      Object.entries(colors).forEach(([key, value]) => {
        const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        document.documentElement.style.setProperty(cssVarName, value);
      });
      
      setEditingColors(colors);
      toast.success('Đã reset về màu gốc');
    }
  };

  useEffect(() => {
    if (currentTheme?.colors) {
      setEditingColors(currentTheme.colors as unknown as Record<string, string>);
    }
  }, [currentTheme]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🎨 Theme Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý và cấu hình theme cho hệ thống - Real-time updates!
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={toggleDarkMode}
            variant="outline"
            size="sm"
          >
            {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Button>
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            variant={isCreating ? "destructive" : "default"}
            size="sm"
          >
            {isCreating ? 'Hủy' : '➕ Tạo Theme Mới'}
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setViewMode('pages')}
              variant={viewMode === 'pages' ? 'default' : 'outline'}
              className="flex-1 sm:flex-none"
            >
              📄 Edit by Pages
            </Button>
            <Button
              onClick={() => setViewMode('themes')}
              variant={viewMode === 'themes' ? 'default' : 'outline'}
              className="flex-1 sm:flex-none"
            >
              🎭 Manage Themes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Theme Form */}
      {isCreating && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Tạo Theme Mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tên Theme *
                </label>
                <Input
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="VD: Blue Theme"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Mô Tả
                </label>
                <Input
                  value={newThemeDescription}
                  onChange={(e) => setNewThemeDescription(e.target.value)}
                  placeholder="Mô tả ngắn gọn về theme"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateTheme}
                  disabled={createMutation.isPending || !newThemeName.trim()}
                >
                  {createMutation.isPending ? 'Đang tạo...' : '💾 Lưu Theme'}
                </Button>
                <Button 
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Active Theme Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Active Theme</p>
              <p className="text-xl font-bold">{currentTheme?.themeName || 'Default Theme'}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on view mode */}
      {viewMode === 'pages' && (
        <div className="space-y-6">
          {/* Page Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn Trang để Chỉnh Sửa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {allPages.map((page) => (
                  <button
                    key={page.pageId}
                    onClick={() => setSelectedPage(page)}
                    className={`p-4 border-2 rounded-lg transition-all hover:shadow-lg ${
                      selectedPage?.pageId === page.pageId
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{page.pageIcon}</div>
                    <div className="font-semibold text-sm">{page.pageName}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {page.sections.length} sections
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Page Editor */}
          {selectedPage && (
            <PageThemeEditor
              page={selectedPage}
              currentColors={editingColors}
              isDarkMode={isDarkMode}
              onColorChange={handlePageColorChange}
              onSave={handlePageSave}
              onReset={handlePageReset}
              isSaving={pageUpdateMutation.isPending}
            />
          )}
        </div>
      )}

      {viewMode === 'themes' && (
        <Card>
          <CardHeader>
            <CardTitle>
              Tất Cả Themes ({themes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme: ThemeConfig) => (
                <div
                  key={theme.themeConfigId}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    theme.isActive 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{theme.themeName}</h3>
                      {theme.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {theme.description}
                        </p>
                      )}
                    </div>
                    {theme.isActive && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        ✓ Active
                      </span>
                    )}
                  </div>

                  {/* Color Preview */}
                  <div className="flex gap-2 mb-3">
                    {['primary', 'success', 'warning', 'error'].map((colorKey) => (
                      <div
                        key={colorKey}
                        className="w-8 h-8 rounded border-2 border-white shadow"
                        style={{ 
                          backgroundColor: (theme.colors as unknown as Record<string, string>)?.[colorKey] || '#ccc'
                        }}
                        title={colorKey}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApplyTheme(theme.themeConfigId)}
                      disabled={theme.isActive || applyMutation.isPending}
                      className="flex-1"
                    >
                      {theme.isActive ? '✓ Đang dùng' : '🚀 Áp dụng'}
                    </Button>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    <p>Created: {new Date(theme.createdAt).toLocaleDateString('vi-VN')}</p>
                    {theme.updatedAt && (
                      <p>Updated: {new Date(theme.updatedAt).toLocaleDateString('vi-VN')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {themes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Chưa có theme nào</p>
                <p className="text-gray-400 text-sm mt-2">
                  Nhấn &quot;Tạo Theme Mới&quot; để bắt đầu
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>👁️ Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-card">
                <h4 className="font-semibold mb-2" style={{ color: 'var(--success)' }}>
                  ✅ Success Card
                </h4>
                <p className="text-sm text-muted-foreground">
                  This card uses theme colors dynamically.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <h4 className="font-semibold mb-2" style={{ color: 'var(--warning)' }}>
                  ⚠️ Warning Card
                </h4>
                <p className="text-sm text-muted-foreground">
                  Colors update in real-time when theme changes.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg border-2" style={{ 
              backgroundColor: 'var(--success-light)', 
              borderColor: 'var(--success)' 
            }}>
              <p className="font-medium" style={{ color: 'var(--success)' }}>
                ✅ Theme colors are applied instantly with real-time broadcast!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
