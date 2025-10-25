"use client";

import React from 'react';
import { Button } from '@/app/components/ui/button';
import type { ThemeConfig } from '../lib';

interface ThemeCardProps {
  theme: ThemeConfig;
  onApply: (themeId: string) => void;
  isApplying: boolean;
}

export function ThemeCard({ theme, onApply, isApplying }: ThemeCardProps) {
  const mainColors = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'success', label: 'Success' },
    { key: 'warning', label: 'Warning' },
    { key: 'error', label: 'Error' },
    { key: 'info', label: 'Info' },
  ];

  return (
    <div
      className={`p-5 border-2 rounded-xl transition-all duration-300 ${
        theme.isActive 
          ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl' 
          : 'border-gray-200 hover:border-primary/50 hover:shadow-lg'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-1">{theme.themeName}</h3>
          {theme.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {theme.description}
            </p>
          )}
        </div>
        {theme.isActive && (
          <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
            ✓ Active
          </span>
        )}
      </div>

      {/* Color Preview */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Color Palette</p>
        <div className="grid grid-cols-6 gap-2">
          {mainColors.map((color) => (
            <div
              key={color.key}
              className="relative group"
            >
              <div
                className="w-full aspect-square rounded-lg border-2 border-white shadow-md transition-transform group-hover:scale-110"
                style={{ 
                  backgroundColor: (theme.colors as unknown as Record<string, string>)?.[color.key] || '#ccc'
                }}
              />
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] bg-black text-white px-1 py-0.5 rounded whitespace-nowrap">
                  {color.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-4 text-xs text-gray-500 space-y-1 border-t pt-3">
        <div className="flex justify-between">
          <span>Scope:</span>
          <span className="font-medium capitalize">{theme.scopeType}</span>
        </div>
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{new Date(theme.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
        {theme.updatedAt && (
          <div className="flex justify-between">
            <span>Updated:</span>
            <span>{new Date(theme.updatedAt).toLocaleDateString('vi-VN')}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <Button
        size="sm"
        onClick={() => onApply(theme.themeConfigId)}
        disabled={theme.isActive || isApplying}
        className="w-full font-medium"
      >
        {theme.isActive ? '✓ Đang sử dụng' : isApplying ? '⏳ Đang áp dụng...' : '🚀 Áp dụng Theme'}
      </Button>
    </div>
  );
}


