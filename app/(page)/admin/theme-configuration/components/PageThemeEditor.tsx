"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { PageThemeConfig, ColorConfig } from '../lib/themeStructure';

interface PageThemeEditorProps {
  page: PageThemeConfig;
  currentColors: Record<string, string>;
  isDarkMode: boolean;
  onColorChange: (key: string, value: string) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
}

export function PageThemeEditor({
  page,
  currentColors,
  isDarkMode,
  onColorChange,
  onSave,
  onReset,
  isSaving,
}: PageThemeEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([page.sections[0]?.sectionId]));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    setExpandedSections(new Set(page.sections.map(s => s.sectionId)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{page.pageIcon}</span>
            <div>
              <CardTitle className="text-2xl">{page.pageName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {page.description}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              🔄 Reset
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving ? '⏳ Đang lưu...' : '💾 Lưu'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {page.sections.map((section) => {
            const isExpanded = expandedSections.has(section.sectionId);
            
            return (
              <div
                key={section.sectionId}
                className="border-2 rounded-lg overflow-hidden transition-all"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.sectionId)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">{section.sectionName}</h3>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {section.colors.length} màu
                  </span>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-slate-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.colors.map((color) => (
                        <ColorEditor
                          key={color.key}
                          color={color}
                          currentValue={currentColors[color.key] || (isDarkMode ? color.defaultDark : color.defaultLight)}
                          onChange={(value) => onColorChange(color.key, value)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Color Editor Component
interface ColorEditorProps {
  color: ColorConfig;
  currentValue: string;
  onChange: (value: string) => void;
}

function ColorEditor({ color, currentValue, onChange }: ColorEditorProps) {
  const handleColorChange = (value: string) => {
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    onChange(value);
  };

  // Category badge color
  const categoryColors: Record<string, string> = {
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    accent: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    status: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    text: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    background: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    component: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  };

  return (
    <div className="space-y-2 p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50 transition-all">
      {/* Label & Category */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">
          {color.label}
        </label>
        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[color.category]}`}>
          {color.category}
        </span>
      </div>

      {/* Color Preview */}
      <div 
        className="w-full h-12 rounded border-4 border-white dark:border-slate-700 shadow-md transition-colors duration-300"
        style={{ backgroundColor: currentValue }}
      />

      {/* Color Input */}
      <div className="flex gap-2">
        <input
          type="color"
          value={currentValue}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-12 h-9 rounded border-2 border-gray-300 cursor-pointer hover:border-primary transition-colors"
          title="Chọn màu"
        />
        <Input
          type="text"
          value={currentValue}
          onChange={(e) => handleColorChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-xs"
          title="Nhập mã HEX"
        />
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground">
        {color.description}
      </p>
      
      {/* CSS Variable */}
      <p className="text-xs font-mono text-muted-foreground bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
        {color.cssVar}
      </p>
    </div>
  );
}

